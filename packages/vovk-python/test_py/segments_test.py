import unittest
from generated_python_client.src.test_generated_python_client import (
    CommonControllerDifferentFetcherRPC,
    CommonControllerRPC,
    PetstoreAPI,
)
from utils import fake_transport, json_response


class TestSegments(unittest.TestCase):
    def test_mixin_calls_the_server_of_its_spec(self) -> None:
        with fake_transport(json_response({'name': 'Rex'})) as sent:
            data = PetstoreAPI.get_pet(params={'petId': '1'})

        self.assertEqual(data, {'name': 'Rex'})
        self.assertEqual(sent[0].request.url, 'https://petstore.test/v1/pets/1')

    def test_mixin_api_root_replaces_the_server(self) -> None:
        with fake_transport(json_response({'name': 'Rex'})) as sent:
            PetstoreAPI.get_pet(params={'petId': '1'}, api_root='http://proxy.test/petstore/')

        self.assertEqual(sent[0].request.url, 'http://proxy.test/petstore/pets/1')

    def test_mixin_path_keeps_its_trailing_slash(self) -> None:
        # /slash/ and /slash are different paths, as the TypeScript client sends them
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.get_root()
            PetstoreAPI.get_slash()
            PetstoreAPI.get_slash_item(params={'id': 7})
            PetstoreAPI.get_slash(api_root='http://proxy.test/petstore/')

        self.assertEqual(
            [item.request.url for item in sent],
            [
                'https://petstore.test/v1/',
                'https://petstore.test/v1/slash/',
                'https://petstore.test/v1/slash/7/',
                'http://proxy.test/petstore/slash/',
            ],
        )

    def test_mixin_query_and_form_styles(self) -> None:
        # as the TypeScript client sends them
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.get_styled(
                query={
                    'tags': ['a', 'b c'],
                    'ids': [1, 2],
                    'filter': {'status': 'sold', 'tag': 'x,y'},
                    'pipe': ['a', 'b'],
                    'space': ['a', 'b'],
                    'obj': {'k': 'v'},
                }
            )
            PetstoreAPI.post_styled(body={'name': 'Rex', 'metadata': {'order_id': '6735', 'nested': {'a': 1}}, 'tags': ['a', 'b']})

        self.assertEqual(
            sent[0].request.url,
            'https://petstore.test/v1/styled?tags=a&tags=b%20c&ids=1,2&filter%5Bstatus%5D=sold&filter%5Btag%5D=x%2Cy'
            '&pipe=a|b&space=a%20b&k=v',
        )
        self.assertEqual(
            sent[1].request.body,
            'name=Rex&metadata%5Border_id%5D=6735&metadata%5Bnested%5D%5Ba%5D=1&tags=a&tags=b',
        )

    def test_segment_origin_root_entry_and_name_override(self) -> None:
        with fake_transport(json_response({'hello': 'world'})) as sent:
            CommonControllerDifferentFetcherRPC.extra_cloned_controller_method()

        self.assertEqual(sent[0].request.url, 'http://segment-origin.test/v2/common2/extra-cloned-controller-method')

    def test_api_root_with_a_trailing_slash(self) -> None:
        with fake_transport(json_response({'hello': 'world'})) as sent:
            CommonControllerRPC.get_hello_world_object_literal(api_root='http://proxy.test/api/')

        self.assertEqual(sent[0].request.url, 'http://proxy.test/api/foo/client/common/get-hello-world-object-literal')


if __name__ == "__main__":
    unittest.main()
