// errors without a JSON body, and a body sent again after a redirect, as the TypeScript client reads and sends them
#[cfg(test)]
pub mod test_errors {
    use crate::test_requests::test_requests::serve;
    use generated_rust_client::{client_sweep_rpc, with_validation_rpc};
    use serde_json::json;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};

    fn api_root() -> String {
        format!("http://localhost:{}/api", std::env::var("PORT").unwrap_or_else(|_| "3210".to_string()))
    }

    // a proxy's text or HTML page is the message; an empty body gives the status's reason phrase
    #[tokio::test]
    async fn test_error_body_that_is_not_json() {
        let root = api_root();
        let error = client_sweep_rpc::get_text_error((), (), (), None, Some(&root), false).await.unwrap_err();
        assert_eq!((error.status_code(), error.message(), error.cause()), (401, "Unauthorized", None));
        let error = client_sweep_rpc::get_html_error((), (), (), None, Some(&root), false).await.unwrap_err();
        assert_eq!((error.status_code(), error.message(), error.cause()), (502, "<html>502 Bad Gateway</html>", None));
        let error = client_sweep_rpc::get_empty_error((), (), (), None, Some(&root), false).await.unwrap_err();
        assert_eq!((error.status_code(), error.message(), error.cause()), (500, "Internal Server Error", None));

        // the same for a stream call
        for (status, content_type, body, message) in [
            ("502 Bad Gateway", "text/html", "<html>proxy</html>", "<html>proxy</html>"),
            ("503 Service Unavailable", "text/plain", "", "Service Unavailable"),
        ] {
            let api_root = serve(status, &[("content-type", content_type)], body).await;
            let query = with_validation_rpc::handle_stream_::query { values: vec!["a".to_string()] };
            let error = with_validation_rpc::handle_stream((), query, (), None, Some(&api_root), false)
                .await
                .err()
                .expect("an error status fails the stream call");
            let status_code: i32 = status[..3].parse().unwrap();
            assert_eq!((error.status_code(), error.message(), error.cause()), (status_code, message, None));
        }
    }

    // a server that answers a request to /api/redirected with its method and the size and type of its body, and any
    // other request with this redirect to /api/redirected
    async fn redirect_once(status: &'static str) -> String {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let api_root = format!("http://{}/api", listener.local_addr().unwrap());
        tokio::spawn(async move {
            while let Ok((mut socket, _)) = listener.accept().await {
                tokio::spawn(async move {
                    let mut request = Vec::new();
                    let mut buffer = [0; 65536];
                    let (head, body_size) = loop {
                        let Ok(read @ 1..) = socket.read(&mut buffer).await else { return };
                        request.extend_from_slice(&buffer[..read]);
                        let Some(end) = request.windows(4).position(|window| window == b"\r\n\r\n") else { continue };
                        let head = String::from_utf8_lossy(&request[..end]).to_ascii_lowercase();
                        let length = head
                            .lines()
                            .find_map(|line| line.strip_prefix("content-length:"))
                            .map_or(0, |value| value.trim().parse().unwrap_or(0));
                        if request.len() >= end + 4 + length {
                            break (head, request.len() - end - 4);
                        }
                    };
                    let mut words = head.split(' ');
                    let (method, target) = (words.next().unwrap_or(""), words.next().unwrap_or(""));
                    let response = if target == "/api/redirected" {
                        let content_type = head.lines().find_map(|line| line.strip_prefix("content-type:"));
                        let answer = json!({ "method": method, "size": body_size, "contentType": content_type.map(str::trim) });
                        let answer = answer.to_string();
                        format!(
                            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{}",
                            answer.len(),
                            answer
                        )
                    } else {
                        format!("HTTP/1.1 {}\r\nlocation: /api/redirected\r\ncontent-length: 0\r\nconnection: close\r\n\r\n", status)
                    };
                    let _ = socket.write_all(response.as_bytes()).await;
                    let _ = socket.shutdown().await;
                });
            }
        });
        api_root
    }

    // reqwest follows a 307 or 308 with the same method and body, as fetch does; a multipart body it can't send
    // again is the redirect it returns (test_unfollowed_redirect)
    #[tokio::test]
    async fn test_redirect_sends_the_body_again() {
        for status in ["307 Temporary Redirect", "308 Permanent Redirect"] {
            let api_root = redirect_once(status).await;

            let data = client_sweep_rpc::post_octet(vec![b'x'; 1 << 20], (), (), None, Some(&api_root), false)
                .await
                .unwrap();
            assert_eq!(data, json!({"method": "post", "size": 1 << 20, "contentType": "application/octet-stream"}), "{}", status);

            let body = with_validation_rpc::handle_body_::body { hello: "world".to_string() };
            let data = with_validation_rpc::handle_body(body, (), (), None, Some(&api_root), false).await.unwrap();
            assert_eq!(data, json!({"method": "post", "size": 17, "contentType": "application/json"}), "{}", status);
        }
    }
}
