import unittest
from http.cookiejar import DefaultCookiePolicy
from generated_python_client.src.test_generated_python_client import ClientRuntimeRPC, client


class TestSession(unittest.TestCase):
    # the docs authenticate with a header on the session: it goes with every call, and a header given for a call wins
    def test_session_headers_go_with_every_call(self) -> None:
        client.session.headers['Authorization'] = 'Bearer from-session'
        try:
            data = ClientRuntimeRPC.get_request_headers()
            given = ClientRuntimeRPC.get_request_headers(headers={'authorization': 'Bearer per-call'})
        finally:
            del client.session.headers['Authorization']
        self.assertEqual(data, {'cookie': None, 'authorization': 'Bearer from-session'})
        self.assertEqual(given, {'cookie': None, 'authorization': 'Bearer per-call'})

    # the docs' way to keep the cookies that responses set
    def test_cookie_policy_that_keeps_response_cookies(self) -> None:
        client.session.cookies.set_policy(DefaultCookiePolicy())
        try:
            ClientRuntimeRPC.get_set_cookie()
            data = ClientRuntimeRPC.get_request_headers()
        finally:
            client.session.cookies.set_policy(DefaultCookiePolicy(allowed_domains=[]))
            client.session.cookies.clear()
        self.assertEqual(data, {'cookie': 'session=user-a', 'authorization': None})


if __name__ == "__main__":
    unittest.main()
