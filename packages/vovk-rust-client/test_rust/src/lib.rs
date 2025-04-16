use generated_rust_client::with_zod_client_controller_rpc;

fn add(a: i32, b: i32) -> i32 {
    a + b
}
fn process_input(value: i32) -> i32 {
    if value < 0 {
        panic!("Invalid input");
    }
    value
}
// In your source file (e.g., lib.rs or main.rs)
#[cfg(test)]
mod tests {
    use super::*;  // Import the parent module"s items
     
    #[test]
    fn test_simple_addition() {
        assert_eq!(add(2, 2), 4);
    }
    
    // Test that should panic
    #[test]
    #[should_panic(expected = "Invalid input")]
    fn test_invalid_input() {
        process_input(-1);
    }
    
    // Ignored test (maybe it"s slow or dependent on external resources)
    #[test]
    #[ignore = "needs external database"]
    fn test_database_connection() {
        // test code
    }

    // test OK
    #[test]
    fn test_ok() {
        // Create an instance of the API client with the back-end URL
        let data = with_zod_client_controller_rpc::handle_all(
            with_zod_client_controller_rpc::HandleAllBody {
                hello: "world".to_string(),
            },
            with_zod_client_controller_rpc::HandleAllQuery {
                search: "value".to_string(),
            },
            with_zod_client_controller_rpc::HandleAllParams {
                foo: "foo".to_string(),
                bar: "bar".to_string(),
            },
            None,
            None,
        ).unwrap();
        // print data
        // println!("data: {:?}", data);
        /* 
        // Check types
        let body: generated_rust_client::with_zod_client_controller_rpc::HandleAllBody = data.body;
        let query: generated_rust_client::with_zod_client_controller_rpc::HandleAllQuery = data.query;
        let params:generated_rust_client::with_zod_client_controller_rpc::HandleAllParams = data.params;
        let vovk_params: generated_rust_client::with_zod_client_controller_rpc::HandleAllParams = data.vovkParams;
                
        // Check that the response matches the expected value
        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({
            "body": {"hello": "world"},
            "query": {"search": "value"},
            "params": {"bar": "bar", "foo": "foo"},
            "vovkParams": {"bar": "bar", "foo": "foo"}
        })); */
    }
}