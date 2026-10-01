#[cfg(test)]
pub mod test_segments {
    use generated_rust_client::{mixin_rpc, with_validation_rpc};

    fn port() -> String {
        std::env::var("PORT").unwrap_or_else(|_| "3210".to_string())
    }

    // the mixin's root is its API: no segment name in the URL, no controller prefix, paths that start with a slash
    #[tokio::test]
    async fn test_mixin() {
        let data = mixin_rpc::handle_params(
            (),
            (),
            mixin_rpc::handle_params_::params {
                foo: "foo".to_string(),
                bar: "bar".to_string(),
            },
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!(data.foo, "foo");
        assert_eq!(data.bar, "bar");

        let data = mixin_rpc::handle_query(
            (),
            mixin_rpc::handle_query_::query {
                search: "value".to_string(),
            },
            (),
            None,
            Some(&format!("http://localhost:{}/api/foo/client/", port())),
            false,
        ).await.unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"search": "value"}));
    }

    // the config gives foo/client its own origin, root entry and segment name, the default origin is unreachable
    #[tokio::test]
    async fn test_segment_root() {
        let data = with_validation_rpc::handle_query(
            (),
            with_validation_rpc::handle_query_::query {
                search: "value".to_string(),
            },
            (),
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"search": "value"}));

        // an api_root replaces the origin and the root entry, the segment name override still follows it
        let data = with_validation_rpc::handle_query(
            (),
            with_validation_rpc::handle_query_::query {
                search: "value".to_string(),
            },
            (),
            None,
            Some(&format!("http://localhost:{}/api/foo/", port())),
            false,
        ).await.unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"search": "value"}));
    }
}
