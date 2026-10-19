// what a JSON Lines stream yields: its items as they come, and how an error ends it, as in the TypeScript client
#[cfg(test)]
pub mod test_streams {
    use crate::test_requests::test_requests::serve;
    use futures_util::StreamExt;
    use generated_rust_client::{client_runtime_rpc, client_sweep_rpc, with_validation_rpc, HttpException};
    use serde_json::json;
    use std::time::Duration;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::sync::oneshot;

    fn api_root() -> String {
        format!("http://localhost:{}/api", std::env::var("PORT").unwrap_or_else(|_| "3210".to_string()))
    }

    // each item as a value or as the error's status and message, up to the end of the stream
    async fn stream_items(api_root: &str) -> Vec<Result<String, (i32, String)>> {
        let query = with_validation_rpc::handle_stream_::query { values: vec!["a".to_string()] };
        let stream = with_validation_rpc::handle_stream((), query, (), None, Some(api_root), false).await.unwrap();
        stream
            .map(|item| item.map(|item| item.value).map_err(|e: HttpException| (e.status_code(), e.message().to_string())))
            .collect()
            .await
    }

    // a server that sends the first line, then the second only once the client has the first or after 3 s, and
    // returns whether the client had it: a client that waits for the whole body gets the first line after those 3 s
    async fn serve_in_two_parts(chunked: bool) -> (String, oneshot::Sender<()>, tokio::task::JoinHandle<bool>) {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let api_root = format!("http://{}/api", listener.local_addr().unwrap());
        let (taken, wait_for_client) = oneshot::channel();
        let server = tokio::spawn(async move {
            let (mut socket, _) = listener.accept().await.unwrap();
            let mut request = Vec::new();
            let mut buffer = [0; 4096];
            while !request.windows(4).any(|window| window == b"\r\n\r\n") {
                let Ok(read @ 1..) = socket.read(&mut buffer).await else { return false };
                request.extend_from_slice(&buffer[..read]);
            }
            let line = |text: &str| if chunked { format!("{:x}\r\n{}\r\n", text.len(), text) } else { text.to_string() };
            let framing = if chunked { "transfer-encoding: chunked" } else { "connection: close" };
            let head = format!("HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\n{}\r\n\r\n", framing);
            socket.write_all((head + &line("{\"value\":\"1\"}\n")).as_bytes()).await.unwrap();
            socket.flush().await.unwrap();

            let had_it = tokio::time::timeout(Duration::from_secs(3), wait_for_client).await.is_ok();
            let end = if chunked { "0\r\n\r\n" } else { "" };
            socket.write_all((line("{\"value\":\"2\"}\n") + end).as_bytes()).await.unwrap();
            socket.shutdown().await.unwrap();
            had_it
        });
        (api_root, taken, server)
    }

    // an item is read as it comes, before the rest of the body is sent, with chunked encoding or without
    #[tokio::test]
    async fn test_items_come_as_they_are_sent() {
        for chunked in [true, false] {
            let (api_root, taken, server) = serve_in_two_parts(chunked).await;
            let query = client_runtime_rpc::get_slow_items_::query { count: "2".to_string(), pause: "0".to_string() };
            let mut stream =
                client_runtime_rpc::get_slow_items((), query, (), None, Some(&api_root), false).await.unwrap();

            let first = stream.next().await.unwrap().unwrap();
            // the server stops waiting after 3 s, then nothing takes the signal
            let _ = taken.send(());
            let rest: Vec<String> = stream.map(|item| item.unwrap().value).collect().await;

            assert_eq!((first.value.as_str(), rest), ("1", vec!["2".to_string()]), "chunked: {}", chunked);
            assert!(server.await.unwrap(), "the first item came only with the end of the body, chunked: {}", chunked);
        }
    }

    // an item has no length limit
    #[tokio::test]
    async fn test_large_item() {
        let size = 8 * 1024 * 1024;
        let query = client_runtime_rpc::get_big_item_::query { size: size.to_string() };
        let stream = client_runtime_rpc::get_big_item((), query, (), None, Some(&api_root()), false).await.unwrap();
        let lengths: Vec<usize> = stream.map(|item| item.unwrap().value.len()).collect().await;

        assert_eq!(lengths, vec![size]);
    }

    // an error line is the error, with the status it names, else the response's; the stream ends with it
    #[tokio::test]
    async fn test_error_line_ends_the_stream() {
        let lines = "{\"value\":\"a\"}\n{\"isError\":true,\"reason\":\"Forbidden\",\"statusCode\":403}\n{\"value\":\"c\"}\n";
        let api_root = serve("200 OK", &[("content-type", "application/jsonl")], lines).await;
        assert_eq!(stream_items(&api_root).await, [Ok("a".to_string()), Err((403, "Forbidden".to_string()))]);

        let lines = "{\"value\":\"a\"}\n{\"isError\":true,\"reason\":\"boom\"}\n{\"value\":\"c\"}\n";
        let api_root = serve("200 OK", &[("content-type", "application/jsonl")], lines).await;
        assert_eq!(stream_items(&api_root).await, [Ok("a".to_string()), Err((200, "boom".to_string()))]);
    }

    // a line that isn't JSON fails the stream there, as an item that isn't the item type does
    #[tokio::test]
    async fn test_malformed_line_ends_the_stream() {
        let lines = "{\"value\":\"a\"}\nnot json\n{\"value\":\"b\"}\n";
        let api_root = serve("200 OK", &[("content-type", "application/jsonl")], lines).await;
        let items = stream_items(&api_root).await;
        assert_eq!(items.len(), 2, "{:?}", items);
        assert_eq!(items[0], Ok("a".to_string()));
        assert!(matches!(&items[1], Err((200, message)) if message.contains("expected")), "{:?}", items);

        let lines = "{\"value\":\"a\"}\n{\"value\":1}\n{\"value\":\"b\"}\n";
        let api_root = serve("200 OK", &[("content-type", "application/jsonl")], lines).await;
        let items = stream_items(&api_root).await;
        assert_eq!(items.len(), 2, "{:?}", items);
        assert!(matches!(&items[1], Err((200, message)) if message.contains("invalid type")), "{:?}", items);
    }

    // a stream that fails on the server after some items yields them, then the error line
    #[tokio::test]
    async fn test_stream_that_fails_after_items() {
        let values: Vec<String> = ["a", "toolongvalue", "b"].iter().map(|value| value.to_string()).collect();
        let query = with_validation_rpc::validate_each_iteration_::query { values: values.clone() };
        let stream = with_validation_rpc::validate_each_iteration((), query, (), None, None, false).await.unwrap();
        let items: Vec<_> = stream.map(|item| item.map(|item| item.value)).collect().await;
        assert_eq!(items.len(), 2, "{:?}", items);
        assert_eq!(items[0].as_ref().unwrap(), "a");
        let error = items[1].as_ref().unwrap_err();
        // the test app runs as a production build, which hides the message of an error that isn't an HttpException
        assert_eq!((error.status_code(), error.message()), (200, "Internal server error"));

        // the same through a JSONLinesResponder
        let query = with_validation_rpc::validate_each_responder_iteration_::query { values };
        let stream =
            with_validation_rpc::validate_each_responder_iteration((), query, (), None, None, false).await.unwrap();
        let items: Vec<_> = stream.map(|item| item.map(|item| item.value)).collect().await;
        assert_eq!(items.len(), 2, "{:?}", items);
        assert_eq!(items[0].as_ref().unwrap(), "a");
        let error = items[1].as_ref().unwrap_err();
        assert_eq!((error.status_code(), error.message()), (200, "Internal server error"));
    }

    // only the envelope a responder writes is an error line: an item with more keys is data
    #[tokio::test]
    async fn test_items_that_look_like_the_error_line() {
        let data = client_sweep_rpc::get_error_like_items((), (), (), None, Some(&api_root()), false).await.unwrap();

        assert_eq!(
            data,
            json!([{"isError": false, "reason": "not an error"}, {"isError": true, "reason": "not an error either", "extra": 1}])
        );
    }
}
