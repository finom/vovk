#[cfg(test)]
pub mod test_requests {
    use generated_rust_client::{client_sweep_rpc, mixin_rpc, rust_sweep_rpc, with_validation_rpc};
    use reqwest::multipart;
    use serde_json::json;

    fn port() -> String {
        std::env::var("PORT").unwrap_or_else(|_| "3210".to_string())
    }

    // client_sweep_rpc has no origin in the config
    fn api_root() -> String {
        format!("http://localhost:{}/api", port())
    }

    // a server that reads each request in full, then answers it with this status, these headers and this body
    async fn serve(status: &str, headers: &[(&str, &str)], body: &str) -> String {
        use tokio::io::{AsyncReadExt, AsyncWriteExt};

        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let api_root = format!("http://{}/api", listener.local_addr().unwrap());
        let mut response = format!("HTTP/1.1 {}\r\ncontent-length: {}\r\nconnection: close\r\n", status, body.len());
        for (name, value) in headers {
            response += &format!("{}: {}\r\n", name, value);
        }
        response += &format!("\r\n{}", body);

        tokio::spawn(async move {
            while let Ok((mut socket, _)) = listener.accept().await {
                let response = response.clone();
                tokio::spawn(async move {
                    let mut request = Vec::new();
                    let mut buffer = [0; 4096];
                    loop {
                        let Ok(read @ 1..) = socket.read(&mut buffer).await else { return };
                        request.extend_from_slice(&buffer[..read]);
                        let Some(end) = request.windows(4).position(|window| window == b"\r\n\r\n") else { continue };
                        let head = String::from_utf8_lossy(&request[..end]).to_ascii_lowercase();
                        let is_complete = if head.contains("transfer-encoding: chunked") {
                            request.ends_with(b"0\r\n\r\n")
                        } else {
                            let length = head
                                .lines()
                                .find_map(|line| line.strip_prefix("content-length:"))
                                .map_or(0, |value| value.trim().parse().unwrap_or(0));
                            request.len() >= end + 4 + length
                        };
                        if is_complete {
                            break;
                        }
                    }
                    let _ = socket.write_all(response.as_bytes()).await;
                    let _ = socket.shutdown().await;
                });
            }
        });

        api_root
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

    // a whole number goes into the query as JavaScript prints it, as it does into the path and a form
    #[tokio::test]
    async fn test_query_numbers() {
        let query = rust_sweep_rpc::get_numeric_query_::query { limit: 10.0 };
        let data = rust_sweep_rpc::get_numeric_query((), query, (), None, None, false).await.unwrap();

        assert_eq!(data, json!({"search": "?limit=10"}));
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

    // two current-thread runtimes used in turn on one thread: no call waits for the idle runtime
    #[test]
    fn test_runtimes_in_turn_on_one_thread() {
        use std::time::Duration;

        let first = tokio::runtime::Builder::new_current_thread().enable_all().build().unwrap();
        let second = tokio::runtime::Builder::new_current_thread().enable_all().build().unwrap();

        for (name, runtime) in [("first", &first), ("second", &second), ("first", &first)] {
            let call = rust_sweep_rpc::get_is_error_data((), (), (), None, None, false);
            // without the timeout, a call stuck on the other runtime's connection would never end
            let data = runtime
                .block_on(async { tokio::time::timeout(Duration::from_secs(5), call).await })
                .unwrap_or_else(|_| panic!("no answer on the {} runtime in 5 s", name))
                .unwrap();
            assert_eq!(data, json!({"isError": false, "data": 1}));
        }
    }

    // a form sends every value as text, so typed fields keep their types only as JSON
    #[tokio::test]
    async fn test_form_or_json_body_without_a_file() {
        use client_sweep_rpc::post_form_or_json_::body as Body;

        let data = client_sweep_rpc::post_form_or_json(
            Body { n: 5.0, flag: true, tags: vec!["a".to_string(), "b".to_string()] },
            (),
            (),
            None,
            Some(&api_root()),
            false,
        ).await.unwrap();

        assert_eq!(data, json!({"body": {"n": 5, "flag": true, "tags": ["a", "b"]}, "contentType": "application/json"}));
    }

    // a field of a branch may hold a file, so the function takes a form: the file branch goes out as one
    #[tokio::test]
    async fn test_json_or_form_body_with_a_file() {
        let form = multipart::Form::new().part("file", multipart::Part::bytes(b"x".to_vec()).file_name("a.txt"));
        let data = client_sweep_rpc::post_json_or_form(form, (), (), None, Some(&api_root()), false).await.unwrap();

        assert_eq!(data, json!({"body": {"file": "file:a.txt"}, "contentType": "multipart/form-data"}));
    }

    // the path has {id}, the procedure has no params schema
    #[tokio::test]
    async fn test_params_without_a_schema() {
        let params = serde_json::from_value(json!({"id": "42"})).unwrap();
        let data = client_sweep_rpc::get_user_posts((), (), params, None, Some(&api_root()), false).await.unwrap();

        assert_eq!(data, json!({"id": "42"}));
    }

    // reqwest can't send a multipart body again, so it doesn't follow a 307 or 308 and returns it
    #[tokio::test]
    async fn test_unfollowed_redirect() {
        for (status_code, status) in [(307, "307 Temporary Redirect"), (308, "308 Permanent Redirect")] {
            let api_root = serve(status, &[("location", "/api/client-sweep/sweep/form-entries")], "").await;
            let form = multipart::Form::new().text("a", "1");
            let error = client_sweep_rpc::post_form_entries(form, (), (), None, Some(&api_root), false)
                .await
                .unwrap_err();

            assert_eq!(error.status_code(), status_code);
            assert!(error.message().ends_with("to /api/client-sweep/sweep/form-entries was not followed"), "{}", error);
        }
    }

    // FastAPI's {"detail": ...} and an RFC 9457 problem document have no message key; the body is the cause
    #[tokio::test]
    async fn test_error_body_without_a_message() {
        let errors = [
            ("application/json", r#"{"detail":"Item not found"}"#, "Item not found"),
            (
                "application/problem+json",
                r#"{"type":"https://example.com/probs/not-found","title":"Not Found","status":404,"detail":"Pet 42 does not exist"}"#,
                "Pet 42 does not exist",
            ),
            ("application/problem+json", r#"{"title":"Not Found"}"#, "Not Found"),
        ];
        for (content_type, body, message) in errors {
            let api_root = serve("404 Not Found", &[("content-type", content_type)], body).await;
            let cause: serde_json::Value = serde_json::from_str(body).unwrap();

            let error = rust_sweep_rpc::get_is_error_data((), (), (), None, Some(&api_root), false).await.unwrap_err();
            assert_eq!((error.status_code(), error.message(), error.cause()), (404, message, Some(&cause)));

            let query = with_validation_rpc::handle_stream_::query { values: vec!["a".to_string()] };
            let error = with_validation_rpc::handle_stream((), query, (), None, Some(&api_root), false)
                .await
                .err()
                .expect("a 404 fails the stream call");
            assert_eq!((error.status_code(), error.message(), error.cause()), (404, message, Some(&cause)));
        }
    }

    // the mixin's errorMessageKey is error.reason
    #[tokio::test]
    async fn test_error_message_key_of_a_mixin() {
        let errors = [
            (r#"{"error":{"reason":"No such thing"},"message":"not this one"}"#, "No such thing"),
            (r#"{"message":"not this one","detail":"Thing 42 does not exist"}"#, "Thing 42 does not exist"),
        ];
        for (body, message) in errors {
            let api_root = serve("404 Not Found", &[("content-type", "application/json")], body).await;
            let query = mixin_rpc::handle_query_::query { search: "value".to_string() };
            let error = mixin_rpc::handle_query((), query, (), None, Some(&api_root), false).await.unwrap_err();

            assert_eq!((error.status_code(), error.message()), (404, message));
        }
    }

    // reqwest's default writes such names as name*=utf-8''..., which the server can't read
    #[tokio::test]
    async fn test_multipart_field_names() {
        let form = multipart::Form::new()
            .text("first name", "1")
            .text("имя", "2")
            .text("a/b", "3")
            .text("a%b", "4");
        let data = client_sweep_rpc::post_form_entries(form, (), (), None, Some(&api_root()), false).await.unwrap();

        assert_eq!(data, json!([["first name", "1"], ["имя", "2"], ["a/b", "3"], ["a%b", "4"]]));
    }

    // a handler without an iteration schema reads each JSON Lines media type as an array of its items
    #[tokio::test]
    async fn test_json_lines_media_types() {
        for media_type in ["application/jsonl", "application/jsonlines", "application/x-ndjson"] {
            let api_root = serve("200 OK", &[("content-type", media_type)], "{\"n\":1}\n{\"n\":2}\n").await;
            let data = rust_sweep_rpc::get_is_error_data((), (), (), None, Some(&api_root), false).await.unwrap();

            assert_eq!(data, json!([{"n": 1}, {"n": 2}]), "{}", media_type);
        }
    }
}
