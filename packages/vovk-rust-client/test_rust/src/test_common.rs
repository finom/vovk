#[cfg(test)]
pub mod test_common {
    use std::collections::HashMap;

    use generated_rust_client::common_controller_rpc;
    #[test]
    fn test_headers() {
        // Call the function with the headers
        let data = common_controller_rpc::get_hello_world_headers(
            (),
            (),
            (),
            Some(&HashMap::from([
                (String::from("x-test"), String::from("world")),
            ])),
            None,
            false
        ).unwrap();
        
        // Assert that the returned data matches the expected value
        assert_eq!(
            serde_json::to_value(&data).unwrap(),
            serde_json::json!({"hello": "world"})
        );
    }
}