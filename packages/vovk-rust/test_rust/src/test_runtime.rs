#[cfg(test)]
pub mod test_runtime {
    use generated_rust_client::{client_runtime_rpc, client_sweep_rpc};
    use std::collections::HashMap;

    fn api_root() -> String {
        format!(
            "http://localhost:{}/api",
            std::env::var("PORT").unwrap_or_else(|_| "3210".to_string())
        )
    }

    // a token read from a file keeps its line break: the call must not go out without the header
    #[tokio::test]
    async fn test_header_value_with_a_line_break() {
        let mut headers = HashMap::new();
        headers.insert("authorization".to_string(), "Bearer token\n".to_string());

        let result = client_runtime_rpc::get_request_headers(
            (),
            (),
            (),
            Some(&headers),
            Some(&api_root()),
            false,
        )
        .await;

        // the client may refuse the value, or send it trimmed as fetch does
        if let Ok(data) = result {
            assert_eq!(data["authorization"], "Bearer token");
        }
    }

    // a call that gets no response says why: refused, no such host or an untrusted certificate
    #[tokio::test]
    async fn test_network_error_keeps_its_reason() {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let api_root = format!("http://{}/api", listener.local_addr().unwrap());
        drop(listener);

        let error = client_sweep_rpc::get_content_type((), (), (), None, Some(&api_root), false)
            .await
            .unwrap_err();

        let mut text = error.to_string();
        let mut source = std::error::Error::source(&error);
        while let Some(cause) = source {
            text += &format!(": {}", cause);
            source = cause.source();
        }
        assert_eq!(error.status_code(), 0);
        assert!(text.to_lowercase().contains("refused"), "{}", text);
    }
}
