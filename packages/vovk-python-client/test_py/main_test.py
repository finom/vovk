import unittest
from generated_test_python_client import ClientControllerRPC, WithZodClientControllerRPC

# OK, nothing, body, query, params, output, stream, all

class TestAPIClient(unittest.TestCase):
    def test_get_data(self):
        # Create an instance of the API client with the back-end URL
        data = ClientControllerRPC.getHelloWorldObjectLiteral()
        
        # Check that the response matches the expected value
        self.assertEqual(data, {"hello": "world"})

    def test_get_data2(self):
        # Create an instance of the API client with the back-end URL
        data = WithZodClientControllerRPC.handleAll(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )

        # x = data['body']['hello']

        print(type(data),  data['body'])
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })

if __name__ == "__main__":
    unittest.main()

