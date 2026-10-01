#[cfg(test)]
pub mod test_common {
    use std::collections::HashMap;
    use generated_rust_client::common_controller_rpc;

    #[tokio::test]
    async fn test_headers() {
        // Call the function with the headers
        let data = common_controller_rpc::get_hello_world_headers(
            (),
            (),
            (),
            Some(&HashMap::from([
                (String::from("x-vovk-test"), String::from("world")),
            ])),
            None,
            false
        ).await.unwrap();
        
        // Assert that the returned data matches the expected value
        assert_eq!(
            serde_json::to_value(&data).unwrap(),
            serde_json::json!({"x-vovk-test": "world"})
        );
    }

    // a caller can branch on the status code and read the cause the server sent
    #[tokio::test]
    async fn test_http_exception_fields() {
        let error = common_controller_rpc::get_error_response((), (), (), None, None, false).await.unwrap_err();

        assert_eq!(error.status_code(), 400);
        assert_eq!(error.message(), "This is an error");
        assert_eq!(error.cause(), Some(&serde_json::json!({"theCause": "This is the cause"})));
    }
}
