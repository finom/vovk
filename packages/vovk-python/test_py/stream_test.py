import socket
import threading
import time
import unittest
from typing import Any, List
from unittest import mock
import requests
from generated_python_client.src.test_generated_python_client import (
    ClientRuntimeRPC,
    ClientSweepRPC,
    HttpException,
    WithValidationRPC,
    client,
)
from runtime_test import raw_server, read_head
from utils import fake_transport

FAKE_ROOT = 'http://fake.test/api'
JSONL_HEADERS = {'Content-Type': 'application/jsonl; charset=utf-8'}
# a chunked JSON Lines answer and its first chunk, one item
FIRST_CHUNK = (
    b'HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\ntransfer-encoding: chunked\r\nconnection: close\r\n\r\n'
    b'8\r\n{"i":1}\n\r\n'
)


class TestStreamErrorLine(unittest.TestCase):
    # the line a responder writes for an HttpException: the items before it, then the exception with its status
    def test_error_line_with_a_status(self) -> None:
        items: List[Any] = []
        with self.assertRaises(HttpException) as context:
            for item in ClientSweepRPC.get_error_line_with_status():
                items.append(item)
        self.assertEqual(items, [{'n': 1}])
        self.assertEqual((context.exception.status_code, context.exception.message), (403, 'Forbidden'))

    # a line without a status, after the valid items: a plain exception with the reason the server wrote
    def test_error_line_without_a_status_after_items(self) -> None:
        for call in (WithValidationRPC.validate_each_iteration, WithValidationRPC.validate_each_responder_iteration):
            with self.subTest(call.__name__):
                items: List[Any] = []
                with self.assertRaises(Exception) as context:
                    for item in call(query={'values': ['a', 'toolongvalue', 'b']}):
                        items.append(item)
                self.assertNotIsInstance(context.exception, HttpException)
                self.assertEqual((items, str(context.exception)), ([{'value': 'a'}], 'Internal server error'))

    # only the envelope ends the stream, as in the TypeScript client: an item with another key, or isError false, is data
    def test_items_that_look_like_an_error_line(self) -> None:
        self.assertEqual(
            list(ClientSweepRPC.get_error_like_items()),
            [{'isError': False, 'reason': 'not an error'}, {'isError': True, 'reason': 'not an error either', 'extra': 1}],
        )


class TestStreamTransport(unittest.TestCase):
    # one decoder for the whole stream: a character split between two chunks is not replaced with U+FFFD
    def test_character_split_between_chunks(self) -> None:
        chunks = [b'{"s":"\xf0\x9f', b'\x98\x80"}\n']
        with fake_transport(lambda request: (200, JSONL_HEADERS, chunks)):
            self.assertEqual(list(ClientSweepRPC.get_falsy_items(api_root=FAKE_ROOT)), [{'s': '\U0001f600'}])

    # closing early closes the response at once, not when the garbage collector frees it, and reads no more items
    def test_stream_closed_early(self) -> None:
        closed: List[requests.Response] = []
        close = requests.Response.close

        def spy(response: requests.Response) -> None:
            closed.append(response)
            close(response)

        with mock.patch.object(requests.Response, 'close', spy):
            # 50 items, one every 100 ms
            items = ClientRuntimeRPC.get_slow_items(query={'count': '50', 'pause': '100'})
            self.assertEqual(next(items), {'value': '0'})
            self.assertEqual(closed, [])
            started = time.monotonic()
            items.close()
            elapsed = time.monotonic() - started
        self.assertEqual(len(closed), 1)
        self.assertLess(elapsed, 1)

    # the errors requests' iter_content raises, also where the client reads with read1 (urllib3 2.2 and later)
    def test_stream_cut_off(self) -> None:
        def handle(conn: socket.socket) -> None:
            read_head(conn)
            # the second chunk announces 0x20 bytes, and the connection closes after 6
            conn.sendall(FIRST_CHUNK + b'20\r\n{"i":2')

        items: List[Any] = []
        with raw_server(handle) as api_root, self.assertRaises(requests.exceptions.ChunkedEncodingError):
            for item in ClientSweepRPC.get_falsy_items(api_root=api_root):
                items.append(item)
        self.assertEqual(items, [{'i': 1}])

    def test_stream_read_timeout(self) -> None:
        answered = threading.Event()

        def handle(conn: socket.socket) -> None:
            read_head(conn)
            conn.sendall(FIRST_CHUNK)
            answered.wait(5)

        items: List[Any] = []
        default = client.timeout
        client.timeout = (2, 0.5)
        try:
            with raw_server(handle) as api_root:
                with self.assertRaises(requests.exceptions.ConnectionError):
                    for item in ClientSweepRPC.get_falsy_items(api_root=api_root):
                        items.append(item)
                answered.set()
        finally:
            client.timeout = default
        self.assertEqual(items, [{'i': 1}])


if __name__ == "__main__":
    unittest.main()
