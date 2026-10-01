#[cfg(test)]
pub mod test_requests {
    use generated_rust_client::{client_sweep_rpc, mixin_rpc, rust_sweep_rpc, with_validation_rpc};
    use serde_json::json;

    fn port() -> String {
        std::env::var("PORT").unwrap_or_else(|_| "3210".to_string())
    }

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

    // a text body goes out with the content type the handler declares
    #[tokio::test]
    async fn test_text_content_type() {
        let data = rust_sweep_rpc::post_csv("a,b\n1,2".to_string(), (), (), None, None, false).await.unwrap();

        assert_eq!(data, json!({"contentType": "text/csv", "body": "a,b\n1,2"}));
    }

    // a handler that takes urlencoded forms only gets its body struct as one
    #[tokio::test]
    async fn test_urlencoded_body() {
        use with_validation_rpc::handle_url_encoded_data_::{body as Body, query as Query};

        let data = with_validation_rpc::handle_url_encoded_data(
            Body { hello: "world".to_string() },
            Query { search: "value".to_string() },
            (),
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!((data.hello.as_str(), data.search.as_str()), ("world", "value"));

        // the struct is validated on the client, the server validates the form it reads
        for (disable_client_validation, status) in [(false, "[Status: 0]"), (true, "[Status: 400]")] {
            let error = with_validation_rpc::handle_url_encoded_data(
                Body { hello: "wrong_length".to_string() },
                Query { search: "value".to_string() },
                (),
                None,
                None,
                disable_client_validation,
            ).await.unwrap_err();

            assert!(error.to_string().starts_with(status), "{}", error);
        }

        // an array repeats its key
        use client_sweep_rpc::post_url_encoded_::{body as SweepBody, body_::tags as Tags};
        let data = client_sweep_rpc::post_url_encoded(
            SweepBody { hello: "world".to_string(), tags: Tags::Variant0(vec!["a".to_string(), "b".to_string()]) },
            (),
            (),
            None,
            Some(&format!("http://localhost:{}/api", port())),
            false,
        ).await.unwrap();

        assert_eq!(
            data,
            json!({"body": {"hello": "world", "tags": ["a", "b"]}, "contentType": "application/x-www-form-urlencoded"})
        );
    }

    // a success that is not JSON: an empty body is null, a text body is a string
    #[tokio::test]
    async fn test_success_without_json() {
        let data = rust_sweep_rpc::get_no_content((), (), (), None, None, false).await.unwrap();
        assert_eq!(data, serde_json::Value::Null);

        let data = rust_sweep_rpc::get_text((), (), (), None, None, false).await.unwrap();
        assert_eq!(data, json!("hello"));
    }

    // a handler without an iteration schema reads a JSON Lines response as an array of its items
    #[tokio::test]
    async fn test_json_lines_without_iteration_schema() {
        let data = with_validation_rpc::handle_stream_no_iteration_validation(
            (),
            with_validation_rpc::handle_stream_no_iteration_validation_::query {
                values: vec!["a".to_string(), "b".to_string()],
            },
            (),
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!(data, json!([{"value": "a"}, {"value": "b"}]));

        // an error line fails the call
        let api_root = format!("http://localhost:{}/api", port());
        let error = client_sweep_rpc::get_error_line_with_status((), (), (), None, Some(&api_root), false)
            .await
            .unwrap_err();

        assert_eq!(error.to_string(), "[Status: 403] Forbidden");
    }

    // only an error status makes an error, a 2xx object may have an isError key
    #[tokio::test]
    async fn test_is_error_key_in_data() {
        let data = rust_sweep_rpc::get_is_error_data((), (), (), None, None, false).await.unwrap();

        assert_eq!(data, json!({"isError": false, "data": 1}));
    }

    // a null item takes no index: the server reads indexes with a gap as an object
    #[tokio::test]
    async fn test_query_array_without_gaps() {
        let data = rust_sweep_rpc::get_query_array(
            (),
            rust_sweep_rpc::get_query_array_::query {
                items: vec![Some("a".to_string()), None, Some("b".to_string())],
            },
            (),
            None,
            None,
            false,
        ).await.unwrap();

        assert_eq!(data, json!({"items": ["a", "b"]}));
    }

    // calls share a connection: a client per call would open one per call
    #[tokio::test]
    async fn test_connection_reuse() {
        use std::sync::atomic::{AtomicUsize, Ordering};
        use std::sync::Arc;
        use tokio::io::{AsyncReadExt, AsyncWriteExt};

        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let api_root = format!("http://{}/api", listener.local_addr().unwrap());
        let connections = Arc::new(AtomicUsize::new(0));
        let accepted = connections.clone();

        tokio::spawn(async move {
            while let Ok((mut socket, _)) = listener.accept().await {
                accepted.fetch_add(1, Ordering::SeqCst);
                tokio::spawn(async move {
                    let mut pending = Vec::new();
                    let mut buffer = [0; 1024];
                    while let Ok(read @ 1..) = socket.read(&mut buffer).await {
                        pending.extend_from_slice(&buffer[..read]);
                        // a GET has no body, so a blank line ends each request
                        while let Some(end) = pending.windows(4).position(|window| window == b"\r\n\r\n") {
                            pending.drain(..end + 4);
                            let response = "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: 2\r\n\r\n{}";
                            if socket.write_all(response.as_bytes()).await.is_err() {
                                return;
                            }
                        }
                    }
                });
            }
        });

        for _ in 0..3 {
            let data = rust_sweep_rpc::get_is_error_data((), (), (), None, Some(&api_root), false).await.unwrap();
            assert_eq!(data, json!({}));
        }

        assert_eq!(connections.load(Ordering::SeqCst), 1);
    }
}
