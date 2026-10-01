// generated_shapes_client holds one handler per schema shape: that it compiles is the first check,
// these read and write values through the generated types
#[cfg(test)]
pub mod test_shapes {
    use generated_shapes_client::{petstore_api, shapes_rpc};
    use serde::{de::DeserializeOwned, Serialize};
    use serde_json::{json, Value};

    // reads the value into T and writes it back
    fn round_trip<T: DeserializeOwned + Serialize>(value: Value) -> Value {
        let typed: T = serde_json::from_value(value.clone()).unwrap_or_else(|e| panic!("{}: {}", value, e));
        serde_json::to_value(typed).unwrap()
    }

    fn assert_round_trip<T: DeserializeOwned + Serialize>(value: Value) {
        assert_eq!(round_trip::<T>(value.clone()), value);
    }

    #[test]
    fn test_numbers_keep_their_precision() {
        let output: shapes_rpc::floats_::output =
            serde_json::from_value(json!({"ratio": 0.1, "price": 123456789.12})).unwrap();

        assert_eq!(output.ratio, 0.1);
        assert_eq!(output.price, 123456789.12);
    }

    #[test]
    fn test_any_and_unknown_take_any_value() {
        assert_round_trip::<shapes_rpc::any_fields_::output>(json!({"meta": {"a": 1}, "extra": 5}));
        assert_round_trip::<shapes_rpc::any_body_::body>(json!([1, "two", null]));
        assert_round_trip::<shapes_rpc::unknown_output_::output>(json!({"a": [true]}));
        assert_round_trip::<shapes_rpc::empty_obj_prop_::body>(json!({"e": {}}));
        assert_round_trip::<shapes_rpc::loose_obj_prop_::body>(json!({"e": {"extra": 1}}));
    }

    #[test]
    fn test_mixed_enum_reads_each_value() {
        for value in [json!("a"), json!(1), json!(true)] {
            assert_round_trip::<shapes_rpc::mixed_literal_::output>(json!({"m": value}));
        }
        assert!(serde_json::from_value::<shapes_rpc::mixed_literal_::output>(json!({"m": "b"})).is_err());
    }

    #[test]
    fn test_tuple_is_a_tuple() {
        let body = shapes_rpc::tuple_::body { t: ("a".to_string(), 1.5) };

        assert_eq!(serde_json::to_value(&body).unwrap(), json!({"t": ["a", 1.5]}));
        assert!(serde_json::from_value::<shapes_rpc::tuple_::body>(json!({"t": ["a"]})).is_err());
    }

    #[test]
    fn test_enums_in_arrays_unions_and_nullables() {
        assert_round_trip::<shapes_rpc::arr_of_enums_::body>(json!({"a": ["x", "y"]}));
        assert_round_trip::<shapes_rpc::union_with_enum_::body>(json!({"u": "p"}));
        assert_round_trip::<shapes_rpc::union_with_enum_::body>(json!({"u": 1.5}));
        assert_round_trip::<shapes_rpc::nullable_enum_::body>(json!({"e": "b"}));
        assert_round_trip::<shapes_rpc::nullable_enum_::body>(json!({"e": null}));
        assert_round_trip::<shapes_rpc::array_output_of_enums_::output>(json!(["a", "b"]));
        assert_round_trip::<shapes_rpc::body_array_of_enums_root_::body>(json!(["b"]));
    }

    #[test]
    fn test_nested_arrays_and_unions_of_objects() {
        assert_round_trip::<shapes_rpc::nested_arr_of_obj_::body>(json!({"m": [[{"x": 1.5}], []]}));
        assert_round_trip::<shapes_rpc::nullable_array_::body>(json!({"arr": [{"x": "a"}]}));
        assert_round_trip::<shapes_rpc::nullable_array_::body>(json!({"arr": null}));
        assert_round_trip::<shapes_rpc::nullable_object_::body>(json!({"o": null}));
        assert_round_trip::<shapes_rpc::union_with_arr_of_obj_::body>(json!({"u": [{"w": "a"}]}));
        assert_round_trip::<shapes_rpc::union_with_arr_of_obj_::body>(json!({"u": "text"}));
        assert_round_trip::<shapes_rpc::intersection_of_strings_::body>(json!({"s": "a"}));
        assert_round_trip::<shapes_rpc::all_of_with_ref_::body>(json!({"s": {"name": "a", "extra": 1.5}}));
    }

    #[test]
    fn test_named_types_of_any_shape() {
        assert_round_trip::<shapes_rpc::named_array_def_::body>(json!({"tags": ["a"]}));
        assert_round_trip::<shapes_rpc::named_record_def_::body>(json!({"meta": {"k": "v"}}));
        assert_round_trip::<shapes_rpc::named_nullable_def_::body>(json!({"n": null}));
        assert_round_trip::<shapes_rpc::bare_ref_array_output_::output>(json!(["a", "b"]));
        assert_round_trip::<shapes_rpc::record_output_::output>(json!({"a": 1.5}));
        assert_round_trip::<shapes_rpc::array_of_dashed_ref_output_::output>(json!([{"name": "a"}]));
        assert_round_trip::<shapes_rpc::def_named_output_::output>(json!({"x": "a"}));
        assert_round_trip::<shapes_rpc::def_named_body_::body>(json!({"x": {"y": "a"}}));

        let pets: petstore_api::list_pets_::output =
            serde_json::from_value(json!([{"id": 1, "name": "Rex", "tag": null, "category": {"id": 2}}])).unwrap();
        assert_eq!(pets[0].name, "Rex");
        assert_eq!(pets[0].category.as_ref().and_then(|category| category.id), Some(2));
    }

    #[test]
    fn test_recursive_types() {
        assert_round_trip::<shapes_rpc::recursive_json_::body>(json!({"data": {"a": [1.5, "b", null, {"c": true}]}}));
        assert_round_trip::<shapes_rpc::z_json_::body>(json!({"data": [{"a": null}]}));
        assert_round_trip::<shapes_rpc::recursive_union_::body>(
            json!({"expr": {"op": "+", "args": [1.5, {"op": "-", "args": [2.5]}]}}),
        );
        assert_round_trip::<shapes_rpc::tree_::output>(json!({"value": "a", "children": [{"value": "b", "children": []}]}));
    }

    #[test]
    fn test_names_that_rust_reserves_or_that_collide() {
        assert_round_trip::<shapes_rpc::prop_and_underscore_prop_::body>(json!({"a": {"inner": {"z": "1"}}, "a_": {"y": "2"}}));
        assert_round_trip::<shapes_rpc::prop_named_string_::body>(json!({"String": {"x": "a"}, "name": "b"}));
        assert_round_trip::<shapes_rpc::prop_named_option_::body>(json!({"Option": {"x": "a"}, "maybe": "b"}));
        assert_round_trip::<shapes_rpc::colliding_props_::body>(json!({"a-b": {"x": "1"}, "a_b": {"y": "2"}}));
        assert_round_trip::<shapes_rpc::enum_with_cr_::body>(json!({"e": "a\rb"}));
        assert_round_trip::<shapes_rpc::prop_with_cr_::body>(json!({"a\rb": "x"}));
        assert_round_trip::<shapes_rpc::bidi_::body>(json!({"e": "a\u{202e}b"}));
    }
}

// client-side validation runs before the request, which can't connect: only a refused value fails with a validation error
#[cfg(test)]
pub mod test_client_validation {
    use generated_shapes_client::{shapes_rpc, HttpException};
    use serde_json::json;

    async fn is_refused<T>(call: impl std::future::Future<Output = Result<T, HttpException>>) -> bool {
        match call.await {
            Err(error) => error.to_string().contains("validation failed"),
            Ok(_) => false,
        }
    }

    #[tokio::test]
    async fn test_schemas_are_read_as_2020_12() {
        let tuple = shapes_rpc::tuple_::body { t: ("a".to_string(), 1.5) };
        assert!(!is_refused(shapes_rpc::tuple(tuple, (), (), None, None, false)).await);

        assert!(is_refused(shapes_rpc::dependent_required(json!({"a": 1}), (), (), None, None, false)).await);
        assert!(!is_refused(shapes_rpc::dependent_required(json!({"a": 1, "b": 2}), (), (), None, None, false)).await);

        assert!(is_refused(shapes_rpc::unevaluated_properties(json!({"x": 1}), (), (), None, None, false)).await);
        assert!(!is_refused(shapes_rpc::unevaluated_properties(json!({}), (), (), None, None, false)).await);
    }
}
