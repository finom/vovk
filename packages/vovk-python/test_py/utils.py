
from typing import Any, Dict, Union

def noop(*args: Any) -> None: # type: ignore
    pass

def get_constraining_object(key: Union[str, None]) -> Dict[str, Any]:
    # Object that satisfies all validation requirements
    without_violations: Dict[str, Any] = {
        "enum_value": "a",
        # Number validations
        "num_minimum": 10,  # Valid: >= 0
        "num_maximum": 50,  # Valid: <= 100
        "num_exclusiveMinimum": 10,  # Valid: > 0
        "num_exclusiveMaximum": 50,  # Valid: < 100
        "num_multipleOf": 15,  # Valid: multiple of 5
        "num_int": 42,  # Valid: integer
        "num_int32": 42,  # Valid: 32-bit integer

        # String validations
        "str_minLength": "hello",  # Valid: length >= 3
        "str_maxLength": "not too long",  # Valid: length <= 50
        "str_pattern": "Hello",  # Valid: matches /^[A-Z][a-z]*$/
        "str_email": "example@example.com",  # Valid: email format
        "str_url": "https://example.com",  # Valid: URL format
        "str_uuid": "123e4567-e89b-12d3-a456-426614174000",  # Valid: UUID format
        "str_datetime": "2023-01-01T12:00:00Z",  # Valid: ISO datetime

        # Array validations
        "arr_minItems": ["item1", "item2"],  # Valid: at least 1 item
        "arr_maxItems": ["item1", "item2", "item3"],  # Valid: max 10 items

        # Object validations
        "obj_required": {
            "requiredField": "present",
            "optionalField": 123,
        },
        "obj_strict": {
            "knownField": "known value",
        }, 

        # Logical compositions
        "logical_anyOf": "str",  # Valid: one of string, number, boolean
        "logical_allOf": {"a": "string value", "b": 42},  # Valid: has both a and b
    }

    if key is None:
        # If key is null, return the object without any violations
        return without_violations

    # Object that violates every validation requirement
    with_violations: Dict[str, Any] = {
        "enum_value": "invalid",  # Invalid: not in ['a', 'b', 'c']
        # Number validations
        "num_minimum": -10,  # Invalid: < 0
        "num_maximum": 200,  # Invalid: > 100
        "num_exclusiveMinimum": 0,  # Invalid: = 0 (not > 0)
        "num_exclusiveMaximum": 100,  # Invalid: = 100 (not < 100)
        "num_multipleOf": 12,  # Invalid: not a multiple of 5
        "num_int": 42.5,  # Invalid: not an integer
        "num_int32": 4294967296,  # Invalid: not a 32-bit integer (too large)

        # String validations
        "str_minLength": "hi",  # Invalid: length < 3
        "str_maxLength": "this is a very long string that exceeds the maximum length requirement of fifty characters",  # Invalid: length > 50
        "str_pattern": "hello",  # Invalid: doesn't match /^[A-Z][a-z]*$/
        "str_email": "not-an-email",  # Invalid: not an email
        "str_url": "not-a-url",  # Invalid: not a URL
        "str_uuid": "not-a-uuid",  # Invalid: not a UUID
        "str_datetime": "not-a-datetime",  # Invalid: not an ISO datetime

        # Array validations
        "arr_minItems": [],  # Invalid: less than 1 item
        "arr_maxItems": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],  # Invalid: more than 10 items

        # Object validations
        "obj_required": {
            # Invalid: missing requiredField
            "optionalField": 456,
        },
        "obj_strict": {
            "knownField": "known value",
            "unknownField": "unknown value",  # Invalid: additional property not allowed
        },

        # Logical compositions
        "logical_anyOf": "wrong_length",  # Invalid: not a string of length <= 5, number, or boolean
        "logical_allOf": {"a": "string value"},  # Invalid: missing b property
    }

    # Return an object with all properties from without_violations except for the specified key,
    # which comes from with_violations
    result = without_violations.copy()
    result[key] = with_violations[key]  # type: ignore
    return result