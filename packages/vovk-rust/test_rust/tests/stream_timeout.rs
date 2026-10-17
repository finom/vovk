// a process of its own: the factory applies to every call after it is set
use futures_util::StreamExt;
use generated_rust_client::{client_runtime_rpc, reqwest, set_client_factory};
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

// a stream that runs past the client's timeout: its error has reqwest's as source(), so is_timeout() tells it apart
#[tokio::test]
async fn test_stream_timeout_is_a_reqwest_timeout() {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let api_root = format!("http://{}/api", listener.local_addr().unwrap());
    tokio::spawn(async move {
        let (mut socket, _) = listener.accept().await.unwrap();
        let _ = socket.read(&mut [0; 4096]).await;
        let head = "HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\ntransfer-encoding: chunked\r\n\r\n";
        let _ = socket.write_all(format!("{}e\r\n{{\"value\":\"a\"}}\n\r\n", head).as_bytes()).await;
        let _ = socket.flush().await;
        tokio::time::sleep(Duration::from_secs(5)).await;
    });

    // the crate's own reqwest builds the client, whatever reqwest the app has
    set_client_factory(|| reqwest::Client::builder().timeout(Duration::from_millis(500)).build().unwrap());

    let query = client_runtime_rpc::get_slow_items_::query { count: "2".to_string(), pause: "5000".to_string() };
    let mut stream = client_runtime_rpc::get_slow_items((), query, (), None, Some(&api_root), false).await.unwrap();
    assert_eq!(stream.next().await.unwrap().unwrap().value, "a");

    let error = stream.next().await.unwrap().unwrap_err();
    assert_eq!(error.status_code(), 200);
    let source = std::error::Error::source(&error).and_then(|source| source.downcast_ref::<reqwest::Error>());
    assert!(source.is_some_and(reqwest::Error::is_timeout), "{:?}", std::error::Error::source(&error));
}
