// what the TypeScript client sends and reads, the Rust client sends and reads too
#[cfg(test)]
pub mod test_parity {
    use crate::test_requests::test_requests::{echo, serve};
    use futures_util::StreamExt;
    use generated_rust_client::{client_runtime_rpc, client_sweep_rpc, mixin_rpc, with_validation_rpc, HttpException};
    use serde_json::json;

    fn api_root() -> String {
        format!("http://localhost:{}/api", std::env::var("PORT").unwrap_or_else(|_| "3210".to_string()))
    }

    // a schema pattern is a JavaScript one: the call checks it as the TypeScript client does, and a pattern Rust's
    // regex can't read is left to the server
    #[tokio::test]
    async fn test_javascript_patterns() {
        use mixin_rpc::post_patterned_::body as Body;

        let api_root = echo().await;
        let body = |tag: &str, note: &str| Body {
            tag: tag.to_string(),
            note: note.to_string(),
            angle: "<b>".to_string(),
            counts: None,
            rule: None,
            default: None,
        };

        let data = mixin_rpc::post_patterned(body("a[1]", "ab"), (), (), None, Some(&api_root), false).await.unwrap();
        assert_eq!(data["target"], "/api/patterned");
        assert_eq!(serde_json::from_str::<serde_json::Value>(data["body"].as_str().unwrap()).unwrap()["tag"], "a[1]");
        // a key that patternProperties take, a const that holds a pattern key and a property named as a keyword
        let valid = Body {
            counts: Some(json!({"<a>": 1})),
            rule: Some(json!({"pattern": "\\<"})),
            default: Some("<".to_string()),
            ..body("a", "")
        };
        mixin_rpc::post_patterned(valid, (), (), None, Some(&api_root), false).await.unwrap();

        let invalid = [
            body("a b", "ab"),
            body("a[1]", "a<b"),
            Body { counts: Some(json!({"<a>": "1"})), ..body("a", "") },
            Body { rule: Some(json!({"pattern": "<"})), ..body("a", "") },
            Body { default: Some("a".to_string()), ..body("a", "") },
        ];
        for body in invalid {
            let error = mixin_rpc::post_patterned(body, (), (), None, Some(&api_root), false).await.unwrap_err();
            assert_eq!(error.status_code(), 0, "{}", error);
            assert!(error.message().starts_with("Body validation failed"), "{}", error);
        }

        let query = mixin_rpc::get_patterned_::query { tag: "x".to_string() };
        let data = mixin_rpc::get_patterned((), query, (), None, Some(&api_root), false).await.unwrap();
        assert_eq!(data["target"], "/api/patterned?tag=x");
    }

    // /slash/ and /slash are different paths: a mixin keeps the trailing slash its document declares
    #[tokio::test]
    async fn test_trailing_slash_of_a_mixin_path() {
        let api_root = echo().await;

        let data = mixin_rpc::get_root((), (), (), None, Some(&api_root), false).await.unwrap();
        assert_eq!(data["target"], "/api/");
        let data = mixin_rpc::get_slash((), (), (), None, Some(&api_root), false).await.unwrap();
        assert_eq!(data["target"], "/api/slash/");
        let params = mixin_rpc::get_slash_item_::params { id: 7 };
        let data = mixin_rpc::get_slash_item((), (), params, None, Some(&api_root), false).await.unwrap();
        assert_eq!(data["target"], "/api/slash/7/");
        // a path without one stays without one
        let query = mixin_rpc::get_patterned_::query { tag: "x".to_string() };
        let data = mixin_rpc::get_patterned((), query, (), None, Some(&api_root), true).await.unwrap();
        assert_eq!(data["target"], "/api/patterned?tag=x");
    }

    // a server that answers with a chunked JSON Lines head and these chunks, then drops the connection
    async fn stream_chunks(chunks: &'static [u8]) -> String {
        use tokio::io::{AsyncReadExt, AsyncWriteExt};

        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let api_root = format!("http://{}/api", listener.local_addr().unwrap());
        tokio::spawn(async move {
            let (mut socket, _) = listener.accept().await.unwrap();
            let _ = socket.read(&mut [0; 4096]).await;
            let head = b"HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\ntransfer-encoding: chunked\r\n\r\n";
            let _ = socket.write_all(&[&head[..], chunks].concat()).await;
            let _ = socket.flush().await;
        });
        api_root
    }

    // every item of the stream, up to its end
    async fn slow_items(api_root: &str) -> Vec<Result<String, HttpException>> {
        let query = client_runtime_rpc::get_slow_items_::query { count: "2".to_string(), pause: "0".to_string() };
        let stream = client_runtime_rpc::get_slow_items((), query, (), None, Some(api_root), false).await.unwrap();
        stream.map(|item| item.map(|item| item.value)).collect().await
    }

    // a stream that breaks off has reqwest's error as source(), without the URL, as any other call
    #[tokio::test]
    async fn test_broken_stream_keeps_the_reqwest_error() {
        // one item, then half of the next and no last chunk
        let api_root = stream_chunks(b"e\r\n{\"value\":\"a\"}\n\r\n20\r\n{\"value\":").await;
        let items = slow_items(&api_root).await;
        assert_eq!(items.len(), 2);
        assert_eq!(items[0].as_ref().unwrap(), "a");

        let error = items[1].as_ref().unwrap_err();
        assert_eq!(error.status_code(), 200);
        let source = std::error::Error::source(error);
        let source = source.and_then(|source| source.downcast_ref::<reqwest::Error>()).unwrap_or_else(|| {
            panic!("source() is not a reqwest::Error: {:?}", source);
        });
        assert!(source.is_body() || source.is_decode(), "{:?}", source);
        assert!(source.url().is_none());
        assert!(!error.message().contains(&api_root), "{}", error);

        // a line that isn't UTF-8 is not reqwest's error: it keeps its own
        let items = slow_items(&stream_chunks(b"2\r\n\xff\n\r\n0\r\n\r\n").await).await;
        let error = items[0].as_ref().unwrap_err();
        let source = std::error::Error::source(error).expect("a source");
        assert_eq!(error.status_code(), 200);
        assert!(source.downcast_ref::<reqwest::Error>().is_none(), "{:?}", source);
        assert!(error.message().contains("UTF8"), "{}", error);
    }

    // bytes to a procedure that takes any type go out as application/octet-stream: */* is a range, not a type
    #[tokio::test]
    async fn test_untyped_bytes_to_any_type() {
        let output = with_validation_rpc::handle_wildcard_content_type(b"blob data".to_vec(), (), (), None, None, false)
            .await
            .unwrap();
        assert_eq!((output.size, output.type_.as_str()), (9.0, "application/octet-stream"));

        // a wildcard other than */* is the type the procedure takes
        let output =
            with_validation_rpc::handle_image_wildcard(b"x".to_vec(), (), (), None, None, false).await.unwrap();
        assert_eq!((output.size, output.type_.as_str()), (1.0, "image/*"));
    }

    // the branches of a JSON-or-file body without a file go out as JSON, by the function with _json
    #[tokio::test]
    async fn test_json_branch_of_a_json_or_file_body() {
        use client_sweep_rpc::post_json_or_form_json_::{body as Body, body_::nested as Nested};

        let body = Body { n: 1.0, tags: vec!["a".to_string()], nested: Nested { a: true } };
        let data =
            client_sweep_rpc::post_json_or_form_json(body, (), (), None, Some(&api_root()), false).await.unwrap();
        let body = json!({"n": 1, "tags": ["a"], "nested": {"a": true}});
        assert_eq!(data, json!({"body": body, "contentType": "application/json"}));
    }

    // the crate's own reqwest, for a form a procedure takes, whatever reqwest the app has
    #[tokio::test]
    async fn test_reexported_reqwest_builds_a_form() {
        use generated_rust_client::reqwest::multipart::{Form, Part};

        let form = Form::new().text("n", "0").part("f", Part::bytes(b"x".to_vec()).file_name("a.txt"));
        let data = client_sweep_rpc::post_form_entries(form, (), (), None, Some(&api_root()), false).await.unwrap();
        assert_eq!(data, json!([["n", "0"], ["f", "file:a.txt"]]));
    }

    // UserRPC and UserRpc are alike in snake_case and HttpRequest is the crate's own module: each gets a module
    #[tokio::test]
    async fn test_module_names_that_collide() {
        use generated_shapes_client::{http_request_2, petstore_api, user_rpc, user_rpc_2};

        let api_root = serve("200 OK", &[("content-type", "application/json")], r#"["a"]"#).await;
        let things = [
            user_rpc::list_things((), (), (), None, Some(&api_root), false).await.unwrap(),
            user_rpc_2::list_things((), (), (), None, Some(&api_root), false).await.unwrap(),
            http_request_2::list_things((), (), (), None, Some(&api_root), false).await.unwrap(),
        ];
        assert_eq!(things, [vec!["a".to_string()], vec!["a".to_string()], vec!["a".to_string()]]);
        // a module after them keeps its name
        let _ = petstore_api::list_pets;
    }
}
