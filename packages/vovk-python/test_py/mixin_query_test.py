import unittest
from generated_python_client.src.test_generated_python_client import PetstoreAPI
from utils import fake_transport, json_response


class TestMixinQuery(unittest.TestCase):
    # as the TypeScript client sends them: a whole number without .0, true and false, None left out
    def test_scalar_query(self) -> None:
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.get_styled(query={'limit': 10, 'status': 'a b&c', 'vaccinated': True})
            PetstoreAPI.get_styled(
                query={'limit': 2.0, 'status': None, 'vaccinated': False},  # type: ignore[typeddict-item]
                disable_client_validation=True,
            )
        self.assertEqual(
            [request.request.url for request in sent],
            [
                'https://petstore.test/v1/styled?limit=10&status=a%20b%26c&vaccinated=true',
                'https://petstore.test/v1/styled?limit=2&vaccinated=false',
            ],
        )

    # a query that sends nothing adds no ?, as in the TypeScript client
    def test_query_of_values_that_send_nothing(self) -> None:
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.get_styled(query={'tags': []})
            PetstoreAPI.get_styled(
                query={'tags': ['x', None], 'ids': [None]},  # type: ignore[list-item]
                disable_client_validation=True,
            )
        self.assertEqual(
            [request.request.url for request in sent],
            ['https://petstore.test/v1/styled', 'https://petstore.test/v1/styled?tags=x'],
        )


if __name__ == "__main__":
    unittest.main()
