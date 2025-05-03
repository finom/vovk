import unittest
from typing import Any, Generator
from jsonschema import ValidationError
from generated_test_python_client.src.generated_python_client import HttpException, WithZodClientControllerRPC

def noop(*args: Any) -> None: # type: ignore
    pass

class TestZod(unittest.TestCase):
    def test_ok(self) -> None:
        # Create an instance of the API client with the back-end URL
        data: WithZodClientControllerRPC.HandleAllOutput = WithZodClientControllerRPC.handle_all(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )
        
        # Check types
        body: WithZodClientControllerRPC.HandleAllBody = data['body']
        query: WithZodClientControllerRPC.HandleAllQuery = data['query']
        params: WithZodClientControllerRPC.HandleAllParams = data['params']
        vovkParams: WithZodClientControllerRPC.HandleAllParams = data['vovkParams']
        noop(body, query, params, vovkParams)
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })
    def test_body(self) -> None:
        data: WithZodClientControllerRPC.HandleBodyBody = WithZodClientControllerRPC.handle_body(
            body={"hello": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(ValidationError) as context:
            WithZodClientControllerRPC.handle_body(
                body={"hello": "wrong_length"}
            )
            self.assertIn("'wrong_length' is too long", str(context.exception).lower())


        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_body(
                body={"hello": "wrong_length"}, 
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Zod validation failed\. Invalid body on server for http://\S+\. At \"hello\":.*")
    
    def test_query(self) -> None:
        data: WithZodClientControllerRPC.HandleQueryQuery = WithZodClientControllerRPC.handle_query(
            query={"search": "value"}
        )
        self.assertEqual(data, {'search': 'value'})

        with self.assertRaises(ValidationError) as context:
            WithZodClientControllerRPC.handle_query(
                query={"search": "wrong_length"} 
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_query(
                query={"search": "wrong_length"},  
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Zod validation failed\. Invalid query on server for http://\S+\. At \"search\":.*")
    
    def test_params(self) -> None:
        data: WithZodClientControllerRPC.HandleParamsParams = WithZodClientControllerRPC.handle_params(
            params={"foo": "foo", "bar": "bar"}
        )
        self.assertEqual(data, {'bar': 'bar', 'foo': 'foo'})

        with self.assertRaises(ValidationError) as context:
            WithZodClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Zod validation failed\. Invalid params on server for http://\S+\. At \"bar\":.*")

    def test_output(self) -> None:
        data: WithZodClientControllerRPC.HandleOutputOutput = WithZodClientControllerRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithZodClientControllerRPC.handle_output(
                query={"helloOutput": "wrong_length"},
            )
        self.assertRegex(str(context.exception), r"Zod validation failed\. Invalid output on server for http://\S+\. At \"hello\":.*")

    def test_stream(self) -> None: ## TODO: StreamException????
        iterator: Generator[WithZodClientControllerRPC.HandleStreamIteration, None, None] = WithZodClientControllerRPC.handle_stream(
            query={ "values": ['a', 'b', 'c', 'd'] }
        )

        for i, data in enumerate(iterator):
            self.assertEqual(data, {'value': ['a', 'b', 'c', 'd'][i]})

        iterator = WithZodClientControllerRPC.handle_stream(
            query={ "values": ['wrong_length', 'f', 'g', 'h'] }
        )

        with self.assertRaises(Exception) as context:
            for data in iterator:
                print(data)
                pass
        self.assertRegex(str(context.exception), r"Zod validation failed\. Invalid iteration #0 on server for http://\S+\. At \"value\".*")


if __name__ == "__main__":
    unittest.main()

