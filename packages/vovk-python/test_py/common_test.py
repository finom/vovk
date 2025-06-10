import unittest
from generated_python_client.src.test_generated_python_client import CommonControllerRPC


class TestCommon(unittest.TestCase):
    def test_headers(self) -> None:
        data = CommonControllerRPC.get_hello_world_headers(
            headers={ 'x-test': 'world' }
        )
        
        self.assertEqual(data, { 'hello': 'world' })
if __name__ == "__main__":
    unittest.main()

