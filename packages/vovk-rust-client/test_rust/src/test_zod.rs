#[cfg(test)]
pub mod test_zod {
    use generated_rust_client::with_zod_client_controller_rpc;
    use crate::get_complaining_object;
     
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

    #[test]
    fn test_complaints() {
        // List of keys that are not supported
        let not_supported = vec![
            // JSON validator doesn't support these keys
            "num_multipleOf",

            // TODO: WARNING: Not validated by an unknown reason 
            "obj_strict",

            // unwrap errors, tested below
            "logical_allOf",
            "enum_value",
            "num_int",
            "num_int32",
            "obj_required",
        ];
        
        // Get object with no complaints
        let no_complaints: with_zod_client_controller_rpc::handle_schema_complaints_::body = 
            serde_json::from_value(get_complaining_object(None)).unwrap();
        
        // Test valid object first
        let result = with_zod_client_controller_rpc::handle_schema_complaints(
            no_complaints.clone(),
            (),
            (),
            None,
            false
        );
        assert!(result.is_ok(), "Valid object should pass validation");
        
        // Convert struct to JSON to access its keys
        let no_complaints_json = serde_json::to_value(&no_complaints).unwrap();
        if let serde_json::Value::Object(map) = no_complaints_json {
            // Test each key for complaints
            for (key, _) in map {
                if not_supported.contains(&key.as_str()) {
                    continue;
                }
            
            // Get object with specific complaint
            let complaining_object: with_zod_client_controller_rpc::handle_schema_complaints_::body = 
                serde_json::from_value(get_complaining_object(Some(key.clone()))).unwrap();
            
            // Test with client validation disabled (server-side error)
            let result_server = with_zod_client_controller_rpc::handle_schema_complaints(
                complaining_object.clone(),
                (),
                (),
                None,
                true // disable client validation
            );
            
            assert!(result_server.is_err(), "Server validation should fail for key {}", key);
            let err_msg = result_server.err().unwrap().to_string();
            assert!(
                err_msg.contains("Zod validation failed") && err_msg.contains(&key), 
                "Error message should contain 'Zod validation failed' and '{}', got: {}", key, err_msg
            );
            
            // Test with client validation enabled (client-side error)
            let result_client = with_zod_client_controller_rpc::handle_schema_complaints(
                complaining_object,
                (),
                (),
                None,
                false // enable client validation
            );
            
            assert!(result_client.is_err(), "Client validation should fail for key {}", key);
            let err_msg = result_client.err().unwrap().to_string();
            assert!(
                err_msg.contains(&key), 
                "Error message should contain '{}', got: {}", key, err_msg
            );
        }
        }
    }
    
    #[test]
    fn test_type_complaints() {
        // Keys that should cause unwrap errors during deserialization
        let should_fail_unwrap = vec![
            "logical_allOf",
            "enum_value",
            "num_int",
            "num_int32",
            "obj_required",
        ];
        
        // Get object with no complaints to extract all keys
        let no_complaints_json = get_complaining_object(None);
        
        if let serde_json::Value::Object(ref map) = no_complaints_json {
            // Test each key for unwrap behavior
            for (key, _) in map.clone() {
                // Create an object with a violation for the specific key
                let complaining_object = get_complaining_object(Some(key.clone()));
                
                // Try to deserialize (unwrap) the object
                let result = serde_json::from_value::<with_zod_client_controller_rpc::handle_schema_complaints_::body>(complaining_object);
                
                if should_fail_unwrap.contains(&key.as_str()) {
                    // These keys should cause deserialization failures
                    assert!(result.is_err(), "Key '{}' should fail to unwrap but succeeded", key);
                    println!("Key '{}' correctly failed to unwrap with error: {}", key, result.err().unwrap());
                } else {
                    // Other keys should deserialize successfully, even with validation issues
                    assert!(result.is_ok(), "Key '{}' should unwrap successfully but failed with: {:?}", 
                           key, result.err());
                }
            }
        } else {
            panic!("Expected get_complaining_object to return a JSON object");
        }

        let int32  = no_complaints_json.get("num_int32").unwrap();
        // check if the number is actually an int32
        if let serde_json::Value::Number(num) = int32 {
            assert!(num.is_i64(), "Expected num_int32 to be an i64");
            let int_value = num.as_i64().unwrap();
            assert!(int_value >= i32::MIN as i64 && int_value <= i32::MAX as i64, 
                    "num_int32 value {} is not within the i32 range", int_value);
        } else {
            panic!("Expected num_int32 to be a number");
        }
    }
}