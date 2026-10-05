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

    // a file comes back as a base64 string, the one form a JSON value holds at about its size; text as a string
    #[tokio::test]
    async fn test_download() {
        use client_runtime_rpc::get_download_::{query as Query, query_::kind as Kind};

        let root = api_root();
        let download = |kind: Kind, size: &str| {
            client_runtime_rpc::get_download((), Query { kind, size: size.to_string() }, (), None, Some(&root), false)
        };

        // bytes 0 to 4, valid UTF-8 as they are
        assert_eq!(download(Kind::binary, "5").await.unwrap(), "AAECAwQ=");
        assert_eq!(download(Kind::binary, "1024").await.unwrap().as_str().map(str::len), Some(1368));
        assert_eq!(download(Kind::csv, "0").await.unwrap(), "name,city\nZoë,東京\n");
    }

    // a token read from a file keeps its line break: it goes out trimmed, as fetch sends it
    #[tokio::test]
    async fn test_header_value_with_a_line_break() {
        let mut headers = HashMap::new();
        headers.insert("authorization".to_string(), " Bearer token\r\n".to_string());

        let data = client_runtime_rpc::get_request_headers((), (), (), Some(&headers), Some(&api_root()), false)
            .await
            .unwrap();

        assert_eq!(data["authorization"], "Bearer token");
    }

    // a header that is still invalid fails the call before it goes out, and doesn't go out without the header
    #[tokio::test]
    async fn test_invalid_header() {
        for (name, value) in [("authorization", "Bearer\ntoken"), ("x token", "secret")] {
            let mut headers = HashMap::new();
            headers.insert(name.to_string(), value.to_string());

            let error = client_runtime_rpc::get_request_headers((), (), (), Some(&headers), Some(&api_root()), false)
                .await
                .unwrap_err();

            assert_eq!(error.status_code(), 0);
            assert!(error.message().contains(name), "{}", error);
            assert!(!error.message().contains(value), "{}", error);
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
        // a URL may hold a token in its query
        assert!(!error.message().contains(&api_root), "{}", error);
    }
}
