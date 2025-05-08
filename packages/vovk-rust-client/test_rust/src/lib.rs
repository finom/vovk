mod test_zod;
mod test_yup;
mod test_dto;

// Helper function to create objects with specific validation issues
pub fn get_complaining_object(key: Option<String>) -> serde_json::Value {        
    // Object that satisfies all validation requirements
    let mut without_violations = serde_json::json!({
        "enum_value": "a",
        // Number validations
        "num_minimum": 10,
        "num_maximum": 50,
        "num_exclusiveMinimum": 10,
        "num_exclusiveMaximum": 50,
        "num_multipleOf": 15,
        "num_int": 42,
        "num_int32": 42,
        
        // String validations
        "str_minLength": "hello",
        "str_maxLength": "not too long",
        "str_pattern": "Hello",
        "str_email": "example@example.com",
        "str_url": "https://example.com",
        "str_uuid": "123e4567-e89b-12d3-a456-426614174000",
        "str_datetime": "2023-01-01T12:00:00Z",
        
        // Array validations
        "arr_minItems": ["item1", "item2"],
        "arr_maxItems": ["item1", "item2", "item3"],
        
        // Object validations
        "obj_required": {
            "requiredField": "present",
            "optionalField": 123
        },
        "obj_strict": {
            "knownField": "known value"
        },
        
        // Logical compositions
        "logical_anyOf": "str",
        "logical_allOf": {"a": "string value", "b": 42}
    });
    
    if key.is_none() {
        // Return the object without any violations
        return without_violations;
    }
    
    // Object that violates validation requirements
    let with_violations = serde_json::json!({
        "enum_value": "invalid",
        // Number validations
        "num_minimum": -10,
        "num_maximum": 200,
        "num_exclusiveMinimum": 0,
        "num_exclusiveMaximum": 100,
        "num_int": 42.5,
        "num_int32": 4294967296_i64,
        
        // String validations
        "str_minLength": "hi",
        "str_maxLength": "this is a very long string that exceeds the maximum length requirement of fifty characters",
        "str_pattern": "hello",
        "str_email": "not-an-email",
        "str_url": "not-a-url",
        "str_uuid": "not-a-uuid",
        "str_datetime": "not-a-datetime",
        
        // Array validations
        "arr_minItems": [],
        "arr_maxItems": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
        
        // Object validations
        "obj_required": {
            "optionalField": 456
        },
        "obj_strict": {
            "knownField": "known value",
            "unknownField": "unknown value"
        },
        
        // Logical compositions
        "logical_anyOf": "wrong_length",
        "logical_allOf": {"a": "string value"}
    });
    
    // Update the specific key with a violating value
    let key_str = key.unwrap();
    if let Some(violation_value) = with_violations.get(&key_str) {
        without_violations[&key_str] = violation_value.clone();
    }
    
    without_violations
}