// a process of its own: the factory applies to every call after it is set
use generated_rust_client::{rust_sweep_rpc, set_client_factory};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

// a server that answers each request with its head, as a JSON string
async fn echo_head() -> String {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let api_root = format!("http://{}/api", listener.local_addr().unwrap());
    tokio::spawn(async move {
        while let Ok((mut socket, _)) = listener.accept().await {
            tokio::spawn(async move {
                let mut request = Vec::new();
                let mut buffer = [0; 4096];
                while !request.windows(4).any(|window| window == b"\r\n\r\n") {
                    let Ok(read @ 1..) = socket.read(&mut buffer).await else { return };
                    request.extend_from_slice(&buffer[..read]);
                }
                let answer = serde_json::Value::String(String::from_utf8_lossy(&request).to_ascii_lowercase()).to_string();
                let response = format!(
                    "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{}",
                    answer.len(),
                    answer
                );
                let _ = socket.write_all(response.as_bytes()).await;
                let _ = socket.shutdown().await;
            });
        }
    });
    api_root
}

#[tokio::test]
async fn test_calls_use_the_client_the_factory_builds() {
    let api_root = echo_head().await;
    let head = rust_sweep_rpc::get_is_error_data((), (), (), None, Some(&api_root), false).await.unwrap();
    assert!(!head.as_str().unwrap().contains("x-from-factory"), "{}", head);

    let built = Arc::new(AtomicUsize::new(0));
    let counter = built.clone();
    set_client_factory(move || {
        counter.fetch_add(1, Ordering::SeqCst);
        let headers = reqwest::header::HeaderMap::from_iter([(
            reqwest::header::HeaderName::from_static("x-from-factory"),
            reqwest::header::HeaderValue::from_static("yes"),
        )]);
        reqwest::Client::builder().default_headers(headers).build().unwrap()
    });

    for _ in 0..2 {
        let head = rust_sweep_rpc::get_is_error_data((), (), (), None, Some(&api_root), false).await.unwrap();
        assert!(head.as_str().unwrap().contains("x-from-factory: yes"), "{}", head);
    }
    // the thread keeps the client for its runtime
    assert_eq!(built.load(Ordering::SeqCst), 1);
}
