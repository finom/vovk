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

    // the value read into T, after it writes back unchanged
    fn round_trip_value<T: DeserializeOwned + Serialize>(value: Value) -> T {
        assert_round_trip::<T>(value.clone());
        serde_json::from_value(value).unwrap()
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
        // a list or a map of itself, with no struct between
        assert_round_trip::<shapes_rpc::recursive_record_::body>(json!({"t": {"a": {"b": {}}}}));
        assert!(serde_json::from_value::<shapes_rpc::recursive_record_::body>(json!({"t": {"a": 1}})).is_err());
        assert_round_trip::<shapes_rpc::recursive_aliases_::output>(
            json!({"m": [[[]], []], "a": [{"x": []}, {"y": [{}]}], "n": [null, [null]], "p": ["a", [["b", []]]]}),
        );
    }

    // serde reads an untagged enum as its first variant that takes the value: a constant must refuse the others
    #[test]
    fn test_a_union_reads_the_variant_its_constant_names() {
        use shapes_rpc::discriminated_union_::{output, output_};
        let done: output = serde_json::from_value(json!({"status": "done", "result": 5.5})).unwrap();
        assert!(matches!(&done, output::Variant1(variant) if variant.result == 5.5), "{:?}", done);
        assert_round_trip::<output>(json!({"status": "done", "result": 5.5}));
        assert!(matches!(round_trip_value::<output>(json!({"status": "pending"})), output::Variant0(_)));
        assert!(serde_json::from_value::<output>(json!({"status": "other"})).is_err());
        // the types are as they were
        let _ = output::Variant1(output_::Variant1 { status: "done".to_string(), result: 1.5 });

        use shapes_rpc::boolean_discriminator_::output as with_bool;
        let failed: with_bool = serde_json::from_value(json!({"ok": false, "reason": "r"})).unwrap();
        assert!(matches!(&failed, with_bool::Variant1(variant) if variant.reason == "r"), "{:?}", failed);
        assert_round_trip::<with_bool>(json!({"ok": true, "value": 1.5}));

        use shapes_rpc::literal_union_::{output as literal, output_::l};
        assert!(matches!(round_trip_value::<literal>(json!({"l": "b"})).l, l::Variant1(_)));
        assert_round_trip::<literal>(json!({"l": "a"}));
        assert!(serde_json::from_value::<literal>(json!({"l": "zzz"})).is_err());

        use shapes_rpc::untyped_const_union_::output as untyped;
        let untyped_done: untyped = serde_json::from_value(json!({"status": "done", "result": 5.5})).unwrap();
        assert!(matches!(&untyped_done, untyped::Variant1(variant) if variant.result == 5.5), "{:?}", untyped_done);
    }

    // a constant of any type, through a named schema, in a nested struct, next to a type named Result
    #[test]
    fn test_constants_of_every_kind() {
        use shapes_rpc::const_kinds_::{output, output_::{pick, tagged}};
        let value = json!({
            "kind": "k", "small": 3, "ratio": 0.5, "maybe": null, "nested": {"tag": "t"},
            "pick": "one", "tagged": {"type": "a", "v": 1.5}, "result": {"ok": true},
        });
        assert_round_trip::<output>(value.clone());
        let wrong_values = [
            ("kind", json!("x")),
            ("small", json!(4)),
            ("ratio", json!(1.5)),
            ("maybe", json!("n")),
            ("result", json!({"ok": false})),
        ];
        for (field, wrong) in wrong_values {
            let mut changed = value.clone();
            changed[field] = wrong;
            assert!(serde_json::from_value::<output>(changed).is_err(), "{}", field);
        }
        let mut changed = value.clone();
        changed["nested"]["tag"] = json!("x");
        assert!(serde_json::from_value::<output>(changed).is_err());

        let read = |field: &str, item: Value| {
            let mut changed = value.clone();
            changed[field] = item;
            round_trip_value::<output>(changed)
        };
        assert!(matches!(read("pick", json!(1)).pick, pick::Variant0(1)));
        assert!(matches!(read("pick", json!(true)).pick, pick::Variant2(true)));
        assert!(serde_json::from_value::<pick>(json!(2)).is_err());
        assert!(matches!(read("maybe", json!("m")).maybe.as_deref(), Some("m")));
        assert!(matches!(read("tagged", json!("none")).tagged, tagged::Variant1(_)));
        assert!(serde_json::from_value::<tagged>(json!("other")).is_err());
    }

    #[test]
    fn test_an_openapi_discriminator_picks_the_variant() {
        use petstore_api::get_any_pet_::AnyPet;
        let dog: AnyPet = serde_json::from_value(json!({"name": "Rex", "petType": "Dog", "bark": true})).unwrap();
        assert!(matches!(&dog, AnyPet::Variant1(dog) if dog.bark == Some(true)), "{:?}", dog);
        assert_round_trip::<AnyPet>(json!({"name": "Rex", "petType": "Dog", "bark": true}));
        assert_round_trip::<AnyPet>(json!({"name": "Tom", "petType": "Cat", "lives": 9}));
        // a value the discriminator doesn't name is read as before, as the first variant that takes it
        assert!(matches!(round_trip_value::<AnyPet>(json!({"name": "L", "petType": "Lizard"})), AnyPet::Variant0(_)));
        let error = serde_json::from_value::<AnyPet>(json!({"x": 1})).unwrap_err();
        assert!(error.to_string().contains("did not match any variant"), "{}", error);

        use petstore_api::get_last_event_::Event;
        let deleted = json!({"type": "deleted", "at": "2026-10-17", "reason": "spam"});
        assert!(matches!(round_trip_value::<Event>(deleted.clone()), Event::Variant1(_)));
        assert_round_trip::<Event>(deleted);
    }

    // a server that answers every request with this JSON; returns its origin
    async fn serve_json(body: &'static str) -> String {
        use tokio::io::{AsyncReadExt, AsyncWriteExt};

        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let origin = format!("http://{}", listener.local_addr().unwrap());
        tokio::spawn(async move {
            while let Ok((mut socket, _)) = listener.accept().await {
                // a GET ends with its head
                let mut request = Vec::new();
                let mut buffer = [0; 4096];
                while !request.ends_with(b"\r\n\r\n") {
                    let Ok(read @ 1..) = socket.read(&mut buffer).await else { break };
                    request.extend_from_slice(&buffer[..read]);
                }
                let head = "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\nconnection: close";
                let response = format!("{}\r\ncontent-length: {}\r\n\r\n{}", head, body.len(), body);
                let _ = socket.write_all(response.as_bytes()).await;
                let _ = socket.shutdown().await;
            }
        });
        origin
    }

    #[tokio::test]
    async fn test_a_call_returns_the_variant_the_server_sent() {
        let origin = serve_json(r#"{"status": "done", "result": 5.5}"#).await;
        let done = shapes_rpc::discriminated_union((), (), (), None, Some(&origin), false).await.unwrap();
        let is_done = matches!(&done, shapes_rpc::discriminated_union_::output::Variant1(variant) if variant.result == 5.5);
        assert!(is_done, "{:?}", done);

        let origin = serve_json(r#"{"name": "Rex", "petType": "Dog", "bark": true}"#).await;
        let dog = petstore_api::get_any_pet((), (), (), None, Some(&origin), false).await.unwrap();
        let is_dog = matches!(&dog, petstore_api::get_any_pet_::AnyPet::Variant1(dog) if dog.bark == Some(true));
        assert!(is_dog, "{:?}", dog);
    }

    // zod and valibot give the unnamed recursive schemas of every slot the same names
    #[test]
    fn test_slots_with_defs_of_one_name() {
        assert_round_trip::<shapes_rpc::shared_def_name_::body>(json!({"cat": {"name": "a", "children": []}}));
        assert_round_trip::<shapes_rpc::shared_def_name_::output>(
            json!({"c": {"text": "hi", "likes": 1.5, "replies": [{"text": "b", "likes": 2.5, "replies": []}]}}),
        );
        assert_round_trip::<shapes_rpc::valibot_shared_def_name_::body>(
            json!({"cat": {"value": "a", "children": [{"value": "b", "children": []}]}}),
        );
        assert_round_trip::<shapes_rpc::valibot_shared_def_name_::output>(
            json!({"c": {"text": "a", "replies": [{"text": "b", "replies": []}]}}),
        );
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

    // a text body is a String and a binary one bytes, whatever its schema says; a body that only declares its
    // content type has no schema; an object goes out as JSON when JSON is declared
    #[test]
    fn test_body_types_follow_how_the_body_is_sent() {
        let _ = shapes_rpc::declared_text_only("a".to_string(), (), (), None, None, false);
        let _ = shapes_rpc::declared_xml_only(b"<a/>".to_vec(), (), (), None, None, false);
        let _ = shapes_rpc::declared_image_only(vec![0], (), (), None, None, false);
        let _ = shapes_rpc::text_enum("a".to_string(), (), (), None, None, false);
        let body = shapes_rpc::object_as_json_or_text_::body { a: "a".to_string() };
        let _ = shapes_rpc::object_as_json_or_text(body, (), (), None, None, false);
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

    // a schema that declares draft 7 is read as draft 7, where items is a tuple's list; read as 2020-12 it wouldn't
    // compile and the client would leave it to the server, so only the refused values show how it was read
    #[tokio::test]
    async fn test_draft7_schema() {
        let call = |t| shapes_rpc::draft_7_tuple(shapes_rpc::draft_7_tuple_::body { t }, (), (), None, None, false);

        assert!(!is_refused(call(vec![json!("a"), json!(1)])).await);
        assert!(is_refused(call(vec![json!("a"), json!(1), json!("x")])).await);
        assert!(is_refused(call(vec![json!(1), json!("a")])).await);
    }
}
