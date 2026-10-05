import json
import pickle
import socket
import threading
import time
import unittest
from contextlib import contextmanager
from typing import Callable, Iterator, List, Tuple
from generated_python_client.src.test_generated_python_client import (
    ClientRuntimeRPC,
    ClientSweepRPC,
    HttpException,
    client,
)
from utils import fake_transport, json_response

FAKE_ROOT = 'http://fake.test/api'


def read_head(conn: socket.socket) -> Tuple[bytes, bytes]:
    """The request head, and the part of the body that came with it."""
    data = b''
    while b'\r\n\r\n' not in data:
        chunk = conn.recv(65536)
        if not chunk:
            break
        data += chunk
    head, _, rest = data.partition(b'\r\n\r\n')
    return head, rest


def content_length(head: bytes) -> int:
    for line in head.split(b'\r\n')[1:]:
        name, _, value = line.partition(b':')
        if name.strip().lower() == b'content-length':
            return int(value.strip())
    return 0


@contextmanager
def raw_server(handle: Callable[[socket.socket], None], connections: int = 1) -> Iterator[str]:
    """A server for one connection or more on a free port, handle writes the answer bytes itself; yields its API root."""
    listener = socket.socket()
    # a small receive buffer, so a server that reads slowly makes the client wait
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 65536)
    listener.bind(('127.0.0.1', 0))
    listener.listen(1)

    def serve() -> None:
        for _ in range(connections):
            conn, _ = listener.accept()
            with conn:
                handle(conn)

    thread = threading.Thread(target=serve, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{listener.getsockname()[1]}/api'
    finally:
        thread.join(timeout=15)
        listener.close()


class TestRuntime(unittest.TestCase):
    # the TypeScript client gives the Response, whose bytes are the file; this client gives the bytes
    def test_file_download_comes_back_as_sent(self) -> None:
        data = ClientRuntimeRPC.get_download(query={'kind': 'binary', 'size': '1024'})
        self.assertEqual(data, bytes(i % 256 for i in range(1024)))

    # toDownloadResponse with type text/csv sends no charset; the text is UTF-8 as the server wrote it
    def test_text_download_without_a_charset(self) -> None:
        data = ClientRuntimeRPC.get_download(query={'kind': 'csv', 'size': '0'})
        self.assertEqual(data, 'name,city\nZoë,東京\n')

    # one module-level client serves every call and thread, so a cookie one call got must not ride along with the next
    def test_a_cookie_from_one_call_is_not_sent_with_the_next(self) -> None:
        try:
            ClientRuntimeRPC.get_set_cookie()
            data = ClientRuntimeRPC.get_request_headers(headers={'authorization': 'Bearer another-user'})
        finally:
            client.session.cookies.clear()
        self.assertEqual(data, {'cookie': None, 'authorization': 'Bearer another-user'})

    # the TypeScript client reads a 16 MB item in well under a second
    def test_large_stream_item(self) -> None:
        size = 8 * 1024 * 1024
        started = time.monotonic()
        items = list(ClientRuntimeRPC.get_big_item(query={'size': str(size)}))
        elapsed = time.monotonic() - started
        self.assertEqual(len(items[0]['value']), size)
        self.assertLess(elapsed, 4)

    # the docs promise the connect timeout for connecting; an upload may take longer than that
    def test_upload_longer_than_the_connect_timeout(self) -> None:
        body = b'x' * (8 * 1024 * 1024)

        def handle(conn: socket.socket) -> None:
            head, rest = read_head(conn)
            received = len(rest)
            # a slow uplink: 64 KB every 40 ms
            while received < content_length(head):
                time.sleep(0.04)
                chunk = conn.recv(65536)
                if not chunk:
                    return
                received += len(chunk)
            payload = json.dumps({'size': received}).encode()
            conn.sendall(
                b'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nconnection: close\r\n'
                + b'content-length: %d\r\n\r\n' % len(payload)
                + payload
            )

        default = client.timeout
        client.timeout = (0.5, 30)
        try:
            with raw_server(handle) as api_root:
                data = ClientSweepRPC.post_octet(body=body, api_root=api_root)
        finally:
            client.timeout = default
        self.assertEqual(data, {'size': len(body)})

    # a 307 or a 308 asks for the same request at another URL: the body, sent in blocks, goes out again in full
    def test_redirect_sends_the_body_again(self) -> None:
        body = b'x' * (1024 * 1024)
        received: List[int] = []

        def handle(conn: socket.socket) -> None:
            head, rest = read_head(conn)
            size = len(rest)
            while size < content_length(head):
                chunk = conn.recv(65536)
                if not chunk:
                    return
                size += len(chunk)
            received.append(size)
            if b'/redirected' not in head.split(b'\r\n')[0]:
                conn.sendall(b'HTTP/1.1 307 X\r\nlocation: /redirected\r\ncontent-length: 0\r\nconnection: close\r\n\r\n')
                return
            payload = json.dumps({'size': size}).encode()
            conn.sendall(
                b'HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nconnection: close\r\n'
                + b'content-length: %d\r\n\r\n' % len(payload)
                + payload
            )

        default = client.timeout
        # a body that isn't sent again leaves the server waiting for it
        client.timeout = (5, 5)
        try:
            with raw_server(handle, connections=2) as api_root:
                data = ClientSweepRPC.post_octet(body=body, api_root=api_root)
        finally:
            client.timeout = default
        self.assertEqual((data, received), ({'size': len(body)}, [len(body), len(body)]))

    # a body without chunked encoding ends when the connection closes, as an HTTP/1.0 proxy sends it
    def test_stream_without_chunked_encoding_yields_each_item_as_it_comes(self) -> None:
        first_taken = threading.Event()
        second_sent = threading.Event()

        def handle(conn: socket.socket) -> None:
            read_head(conn)
            conn.sendall(
                b'HTTP/1.1 200 OK\r\ncontent-type: application/jsonl; charset=utf-8\r\nconnection: close\r\n\r\n{"i":1}\n'
            )
            first_taken.wait(3)
            second_sent.set()
            conn.sendall(b'{"i":2}\n')

        with raw_server(handle) as api_root:
            items = ClientSweepRPC.get_falsy_items(api_root=api_root)
            first = next(items)
            taken_before_the_second_was_sent = not second_sent.is_set()
            first_taken.set()
            rest = list(items)

        self.assertEqual(first, {'i': 1})
        self.assertEqual(rest, [{'i': 2}])
        self.assertTrue(taken_before_the_second_was_sent)

    # process pools, multiprocessing and task queues pickle the exception a call raised
    def test_http_exception_survives_pickling(self) -> None:
        error = {'message': 'Not found', 'statusCode': 404, 'isError': True, 'cause': {'id': 1}}
        with fake_transport(json_response(error, status=404)):
            with self.assertRaises(HttpException) as context:
                ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)

        copy = pickle.loads(pickle.dumps(context.exception))
        self.assertIsInstance(copy, HttpException)
        self.assertEqual((copy.status_code, copy.message, copy.cause), (404, 'Not found', {'id': 1}))


if __name__ == "__main__":
    unittest.main()
