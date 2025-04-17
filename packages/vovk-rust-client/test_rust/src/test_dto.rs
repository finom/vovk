// In your source file (e.g., lib.rs or main.rs)
#[cfg(test)]
pub mod test_dto {
    use generated_rust_client::with_dto_client_controller_rpc;
     
    // #[ignore = "needs external database"] | #[should_panic(expected = "Invalid input")]

    // test OK
    #[test]
    fn test_ok() {
        // Create an instance of the API client with the back-end URL
        let data:with_dto_client_controller_rpc::HandleAllOutput = with_dto_client_controller_rpc::handle_all(
            with_dto_client_controller_rpc::HandleAllBody {
                hello: "world".to_string(),
            },
            with_dto_client_controller_rpc::HandleAllQuery {
                search: "value".to_string(),
            },
            with_dto_client_controller_rpc::HandleAllParams {
                foo: "foo".to_string(),
                bar: "bar".to_string(),
            },
            None,
            false,
        ).unwrap();
        // print data
        println!("data: {}", serde_json::to_string_pretty(&data).unwrap());

        // Check that the response matches the expected value
        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({
            "body": {"hello": "world"},
            "query": {"search": "value"},
            "params": {"bar": "bar", "foo": "foo"},
            "vovkParams": {"bar": "bar", "foo": "foo"}
        })); 
        
        // Check types
        #[allow(unused_variables)]
        let _body: generated_rust_client::with_dto_client_controller_rpc::HandleAllBodyDto = data.body;

        #[allow(unused_variables)]
        let _query:   generated_rust_client::with_dto_client_controller_rpc::HandleAllQueryDto = data.query;

        #[allow(unused_variables)]
        let _params:generated_rust_client::with_dto_client_controller_rpc::HandleAllParamsDto = data.params;

        #[allow(unused_variables)]
        let _vovk_params:  generated_rust_client::with_dto_client_controller_rpc::HandleAllParamsDto = data.vovkParams;
    }
    
    // test body validation
    #[test]
    fn test_body() {
        // Test successful body validation
        let data = with_dto_client_controller_rpc::handle_body(
            with_dto_client_controller_rpc::HandleBodyBody {
                hello: "world".to_string(),
            },
            (),
            (),
            None,
            false,
        ).unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"hello": "world"}));

        // Test client-side validation error
        let result = with_dto_client_controller_rpc::handle_body(
            serde_json::from_value(serde_json::json!({"hello": "worldx"})).unwrap(),
            (),
            (),
            None,
            false,
        );
        
        assert!(result.is_err());
        
        let result = with_dto_client_controller_rpc::handle_body(
            serde_json::from_value(serde_json::json!({"hello": "worldx"})).unwrap(),
            (),
            (),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Validation failed"));
    }
    
    // test query validation
    #[test]
    fn test_query() {
        // Test successful query validation
        let data = with_dto_client_controller_rpc::handle_query(
            (),
            with_dto_client_controller_rpc::HandleQueryQuery {
                search: "value".to_string(),
            },
            (),
            None,
            false,
        ).unwrap();

       assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"search": "value"}));

        // Test client-side validation error
        let result = with_dto_client_controller_rpc::handle_query(
            (),
            serde_json::from_value(serde_json::json!({"search": "valuex"})).unwrap(),
            (),
            None,
            false,
        );
          
        assert!(result.is_err());
        
        let result = with_dto_client_controller_rpc::handle_query(
            (),
            serde_json::from_value(serde_json::json!({"search": "valuex"})).unwrap(),
            (),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Validation failed"));
    }
    
    // test params validation
    #[test]
    fn test_params() {
        // Test successful params validation
        let data = with_dto_client_controller_rpc::handle_params(
            (),
            (),
            with_dto_client_controller_rpc::HandleParamsParams {
                foo: "foo".to_string(),
                bar: "bar".to_string(),
            },
            None,
            false,
        ).unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"foo": "foo", "bar": "bar"}));

        // Test client-side validation error
        let result = with_dto_client_controller_rpc::handle_params(
            (),
            (),
            serde_json::from_value(serde_json::json!({"foo": "foo", "bar": "barx"})).unwrap(),
            None,
            false,
        );
        
        assert!(result.is_err());
        
        let result = with_dto_client_controller_rpc::handle_params(
            (),
            (),
            serde_json::from_value(serde_json::json!({"foo": "foo", "bar": "barx"})).unwrap(),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Validation failed"));
    }
    
    // test output validation
    #[test]
    fn test_output() {
        // Test successful output validation
        let data = with_dto_client_controller_rpc::handle_output(
            (),
            with_dto_client_controller_rpc::HandleOutputQuery {
                helloOutput: "world".to_string(),
            },
            (),
            None,
            false,
        ).unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"hello": "world"}));

        // Test server-side output validation error
        let result = with_dto_client_controller_rpc::handle_output(
            (),
            with_dto_client_controller_rpc::HandleOutputQuery {
                helloOutput: "worldx".to_string(),
            },
            (),
            None,
            false,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Validation failed"));
    }
    
    // test streaming
    #[test]
    fn test_stream() {
        // Test successful streaming
        let values = vec!["a", "b", "c", "d"];
        
        let stream: Box<dyn Iterator<Item = with_dto_client_controller_rpc::HandleStreamIteration>> = with_dto_client_controller_rpc::handle_stream(
            (),
            with_dto_client_controller_rpc::HandleStreamQuery {
                values: values.iter().map(|s| s.to_string()).collect(),
            },
            (),
            None,
            false,
        );
        
        for (i, result) in stream.enumerate() {
            assert_eq!(
                serde_json::to_value(&result).unwrap(), 
                serde_json::json!({"value": values[i]})
            );
        }
        
        // Test streaming error
        let error_values = vec!["e", "f", "g", "h"];
        let error_stream = with_dto_client_controller_rpc::handle_stream(
            (),
            with_dto_client_controller_rpc::HandleStreamQuery {
                values: error_values.iter().map(|s| s.to_string()).collect(),
            },
            (),
            None,
            false,
        );
        // Iterate through the error_stream and expect it to fail with Validation error
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            for (i, _) in error_stream.enumerate() {
                println!("Item {} processed", i);
            }
        }));
        
        assert!(result.is_err(), "Expected an error during stream iteration but none occurred");
    }
}