#[cfg(test)]
pub mod test_requests {
    use generated_rust_client::{mixin_rpc, rust_sweep_rpc, with_validation_rpc};
    use serde_json::json;

    // an unset optional field is left out: null would fail the schema on the client and on the server
    #[tokio::test]
    async fn test_optional_fields() {
        use rust_sweep_rpc::post_optional_::{body as Body, query as Query};

        for disable_client_validation in [false, true] {
            let data = rust_sweep_rpc::post_optional(
                Body { a: "a".to_string(), b: None, c: None },
                Query { q: "q".to_string(), page: None },
                (),
                None,
                None,
                disable_client_validation,
            ).await.unwrap();

            assert_eq!(data, json!({"body": {"a": "a"}, "query": {"q": "q"}}));
        }

        let data = rust_sweep_rpc::post_optional(
            Body { a: "a".to_string(), b: Some("b".to_string()), c: Some(1.5) },
            Query { q: "q".to_string(), page: Some("2".to_string()) },
            (),
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!(data, json!({"body": {"a": "a", "b": "b", "c": 1.5}, "query": {"q": "q", "page": "2"}}));
    }

    // a number or a boolean goes into the path as JavaScript prints it
    #[tokio::test]
    async fn test_number_and_boolean_params() {
        for disable_client_validation in [false, true] {
            let data = rust_sweep_rpc::get_numeric(
                (),
                (),
                rust_sweep_rpc::get_numeric_::params { id: 5.0 },
                None,
                None,
                disable_client_validation,
            ).await.unwrap();

            assert_eq!(data.id, 5.0);
        }

        let data = mixin_rpc::handle_typed_params(
            (),
            (),
            mixin_rpc::handle_typed_params_::params { n: 12, flag: true },
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!(data.foo, "12");
        assert_eq!(data.bar, "true");
    }

    // an empty param would drop its path segment and reach another route, so the call is refused before it is sent
    #[tokio::test]
    async fn test_empty_param() {
        for disable_client_validation in [false, true] {
            let error = with_validation_rpc::handle_params(
                (),
                (),
                with_validation_rpc::handle_params_::params {
                    foo: "".to_string(),
                    bar: "bar".to_string(),
                },
                None,
                None,
                disable_client_validation,
            ).await.unwrap_err();

            let message = error.to_string();
            assert!(message.starts_with("[Status: 0]") && message.contains("foo"), "{}", message);
        }
    }
}
