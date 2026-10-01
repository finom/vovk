#[cfg(test)]
pub mod test_requests {
    use generated_rust_client::rust_sweep_rpc;
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
}
