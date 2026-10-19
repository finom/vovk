// the rsSrc files as a module of another crate, as an app embeds them; rs writes the same files. A test crate uses few
// of its items: the others would be dead code and unused imports
#[allow(dead_code, unused_imports)]
#[path = "../../generated_rust_client/src/lib.rs"]
mod api;

#[tokio::test]
async fn test_embedded_client_calls_a_procedure() {
    let api_root = format!("http://localhost:{}/api", std::env::var("PORT").unwrap_or_else(|_| "3210".to_string()));
    let mut headers = std::collections::HashMap::new();
    headers.insert("authorization".to_string(), "Bearer token".to_string());

    let data = api::client_runtime_rpc::get_request_headers((), (), (), Some(&headers), Some(&api_root), false)
        .await
        .unwrap();

    assert_eq!(data["authorization"], "Bearer token");
}
