#[cfg(test)]
pub mod test_zod {
    use generated_rust_client::with_zod_client_controller_rpc;
     
    // #[ignore = "needs external database"] | #[should_panic(expected = "Invalid input")]
    #[test]
    fn test_ok() {
        let data:with_zod_client_controller_rpc::handle_all_::output = with_zod_client_controller_rpc::handle_all(
            with_zod_client_controller_rpc::handle_all_::body {
                hello: "world".to_string(),
            },
            with_zod_client_controller_rpc::handle_all_::query {
                search: "value".to_string(),
            },
            with_zod_client_controller_rpc::handle_all_::params {
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
        let _body: generated_rust_client::with_zod_client_controller_rpc::handle_all_::output_::body = data.body;

        #[allow(unused_variables)]
        let _query: generated_rust_client::with_zod_client_controller_rpc::handle_all_::output_::query = data.query;

        #[allow(unused_variables)]
        let _params:generated_rust_client::with_zod_client_controller_rpc::handle_all_::output_::params = data.params;

        #[allow(unused_variables)]
        let _vovk_params:  generated_rust_client::with_zod_client_controller_rpc::handle_all_::output_::vovkParams = data.vovkParams;
    }
    
    // test body validation
    #[test]
    fn test_body() {
        // Test successful body validation
        let data = with_zod_client_controller_rpc::handle_body(
            with_zod_client_controller_rpc::handle_body_::body {
                hello: "world".to_string(),
            },
            (),
            (),
            None,
            false,
        ).unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"hello": "world"}));

        // Test client-side validation error
        let result = with_zod_client_controller_rpc::handle_body(
            serde_json::from_value(serde_json::json!({"hello": "wrong_length"})).unwrap(),
            (),
            (),
            None,
            false,
        );
        
        assert!(result.is_err());
        let err = result.err().unwrap().to_string();
        assert!(err.contains("\"wrong_length\" is longer than 5 characters"));
        
        let result = with_zod_client_controller_rpc::handle_body(
            serde_json::from_value(serde_json::json!({"hello": "wrong_length"})).unwrap(),
            (),
            (),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Zod validation failed"));
    }
    
    #[test]
    fn test_query() {
        // Test successful query validation
        let data = with_zod_client_controller_rpc::handle_query(
            (),
            with_zod_client_controller_rpc::handle_query_::query {
                search: "value".to_string(),
            },
            (),
            None,
            false,
        ).unwrap();

       assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"search": "value"}));

        // Test client-side validation error
        let result = with_zod_client_controller_rpc::handle_query(
            (),
            serde_json::from_value(serde_json::json!({"search": "wrong_length"})).unwrap(),
            (),
            None,
            false,
        );
          
        assert!(result.is_err());
        let err = result.err().unwrap().to_string();
        assert!(err.contains("\"wrong_length\" is longer than 5 characters"));
        
        let result = with_zod_client_controller_rpc::handle_query(
            (),
            serde_json::from_value(serde_json::json!({"search": "wrong_length"})).unwrap(),
            (),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Zod validation failed"));
    }

    #[test]
    fn test_nested_query() {
        use serde_json::json;
        
        // Create a complex nested query structure
        let nested_query_example = with_zod_client_controller_rpc::handle_nested_query_::query {
            x: "xx".to_string(),
            y: vec!["yy".to_string(), "uu".to_string()],
            z: serde_json::from_value(json!({
                "f": "x",
                "u": ["uu", "xx"],
                "d": {
                    "x": "ee",
                    "arrOfObjects": [
                        {
                            "foo": "bar",
                            "nestedArr": ["one", "two", "three"],
                            "nestedObj": {
                                "deepKey": "deepValue1"
                            }
                        },
                        {
                            "foo": "baz",
                            "nestedArr": ["four", "five", "six"],
                            "nestedObj": {
                                "deepKey": "deepValue2"
                            }
                        }
                    ]
                }
            })).unwrap(),
        };

        // Test successful query validation
        let data = with_zod_client_controller_rpc::handle_nested_query(
            (),
            nested_query_example.clone(),
            (),
            None,
            false,
        ).unwrap();

        // Convert both to Value for easy comparison
        let data_value = serde_json::to_value(&data).unwrap();
        let example_value = serde_json::to_value(&nested_query_example).unwrap();
        
        assert_eq!(data_value, example_value);

        // Test client-side validation error
        let mut invalid_query = nested_query_example.clone();
        invalid_query.x = "wrong_length".to_string();
        
        let result = with_zod_client_controller_rpc::handle_nested_query(
            (),
            invalid_query.clone(),
            (),
            None,
            false,
        );
        
        assert!(result.is_err());
        let err = result.err().unwrap().to_string();
        assert!(err.contains("\"wrong_length\" is longer than 5 characters"));
        
        // Test with client validation disabled (server validation error)
        let result = with_zod_client_controller_rpc::handle_nested_query(
            (),
            invalid_query,
            (),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Zod validation failed"));
    }

    #[test]
    fn test_params() {
        // Test successful params validation
        let data = with_zod_client_controller_rpc::handle_params(
            (),
            (),
            with_zod_client_controller_rpc::handle_params_::params {
                foo: "foo".to_string(),
                bar: "bar".to_string(),
            },
            None,
            false,
        ).unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"foo": "foo", "bar": "bar"}));

        // Test client-side validation error
        let result = with_zod_client_controller_rpc::handle_params(
            (),
            (),
            serde_json::from_value(serde_json::json!({"foo": "foo", "bar": "wrong_length"})).unwrap(),
            None,
            false,
        );
        
        assert!(result.is_err());
        let err = result.err().unwrap().to_string();
        assert!(err.contains("\"wrong_length\" is longer than 5 characters"));
        
        let result = with_zod_client_controller_rpc::handle_params(
            (),
            (),
            serde_json::from_value(serde_json::json!({"foo": "foo", "bar": "wrong_length"})).unwrap(),
            None,
            true,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Zod validation failed"));
    }
    
    #[test]
    fn test_output() {
        // Test successful output validation
        let data = with_zod_client_controller_rpc::handle_output(
            (),
            with_zod_client_controller_rpc::handle_output_::query {
                helloOutput: "world".to_string(),
            },
            (),
            None,
            false,
        ).unwrap();

        assert_eq!(serde_json::to_value(&data).unwrap(), serde_json::json!({"hello": "world"}));

        // Test server-side output validation error
        let result = with_zod_client_controller_rpc::handle_output(
            (),
            with_zod_client_controller_rpc::handle_output_::query {
                helloOutput: "wrong_length".to_string(),
            },
            (),
            None,
            false,
        );
        
        assert!(result.is_err());
        assert!(result.err().unwrap().to_string().contains("Zod validation failed"));
    }
    
    #[test]
    fn test_stream() {
        // Test successful streaming
        let values = vec!["a", "b", "c", "d"];
        
        let stream: Box<dyn Iterator<Item = with_zod_client_controller_rpc::handle_stream_::iteration>> = with_zod_client_controller_rpc::handle_stream(
            (),
            with_zod_client_controller_rpc::handle_stream_::query {
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
        let error_values = vec!["wrong_length", "f", "g", "h"];
        let error_stream = with_zod_client_controller_rpc::handle_stream(
            (),
            with_zod_client_controller_rpc::handle_stream_::query {
                values: error_values.iter().map(|s| s.to_string()).collect(),
            },
            (),
            None,
            false,
        );
        // Iterate through the error_stream and expect it to fail with Zod validation error
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            for (i, _) in error_stream.enumerate() {
                println!("Item {} processed", i);
            }
        }));
        
        assert!(result.is_err(), "Expected an error during stream iteration but none occurred");
    }
}