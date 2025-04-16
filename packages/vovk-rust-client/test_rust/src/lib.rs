use generated_rust_client::WithZodClientControllerRPC;

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
        let data: WithZodClientControllerRPC::HandleAllOutput = WithZodClientControllerRPC::handle_all(
            WithZodClientControllerRPC::HandleAllInput {
                body: Some(serde_json::json!({"hello": "world"})),
                query: Some(serde_json::json!({"search": "value"})),
                params: Some(serde_json::json!({"foo": "foo", "bar": "bar"})),
            }
        ).unwrap();
        
        // Check types
        let body: WithZodClientControllerRPC::HandleAllBody = data.body;
        let query: WithZodClientControllerRPC::HandleAllQuery = data.query;
        let params: WithZodClientControllerRPC::HandleAllParams = data.params;
        let vovk_params: WithZodClientControllerRPC::HandleAllParams = data.vovkParams;
                
        // Check that the response matches the expected value
        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({
            "body": {"hello": "world"},
            "query": {"search": "value"},
            "params": {"bar": "bar", "foo": "foo"},
            "vovkParams": {"bar": "bar", "foo": "foo"}
        }));
    }
}