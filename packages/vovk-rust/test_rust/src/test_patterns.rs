// the patterns and formats zod writes into a schema, which the call checks before it sends
#[cfg(test)]
pub mod test_patterns {
    use generated_rust_client::client_sweep_rpc::{self, get_by_cuid_, post_formats_, post_patterns_};
    use serde_json::json;

    fn api_root() -> String {
        format!("http://localhost:{}/api", std::env::var("PORT").unwrap_or_else(|_| "3210".to_string()))
    }

    // a validation error on the client, before the request, that names each of these fields
    fn assert_refused(error: &generated_rust_client::HttpException, label: &str, fields: &[&str]) {
        assert_eq!(error.status_code(), 0, "{}", error);
        assert!(error.message().starts_with(&format!("{} validation failed: ", label)), "{}", error);
        for field in fields {
            assert!(error.message().contains(field), "{} is not named: {}", field, error);
        }
    }

    // JavaScript patterns: Unicode properties with a lookahead (z.emoji()), a named group and a code point escape; a
    // pattern the client can't read is left to the server, so only the refusal on the client shows it was read
    #[tokio::test]
    async fn test_javascript_patterns() {
        let body = |emoji: &str, letters: &str, user: &str, smile: &str| post_patterns_::body {
            emoji: emoji.to_string(),
            letters: letters.to_string(),
            user: user.to_string(),
            smile: smile.to_string(),
        };

        let data = client_sweep_rpc::post_patterns(body("😀", "Zoë", "ab@x", "😀"), (), (), None, Some(&api_root()), false)
            .await
            .unwrap();
        assert_eq!(data, json!({"emoji": "😀", "letters": "Zoë", "user": "ab@x", "smile": "😀"}));

        let error = client_sweep_rpc::post_patterns(body("a", "Zoë1", "AB@x", "x"), (), (), None, Some(&api_root()), false)
            .await
            .unwrap_err();
        assert_refused(&error, "Body", &["/emoji", "/letters", "/user", "/smile"]);
    }

    // zod's string formats come with a pattern; a format the client doesn't know, such as jwt, is left to the server
    #[tokio::test]
    async fn test_string_formats() {
        let token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl".to_string();
        let body = |id: &str, phone: &str, color: &str| post_formats_::body {
            id: id.to_string(),
            phone: phone.to_string(),
            token: token.clone(),
            color: color.to_string(),
        };

        let data = client_sweep_rpc::post_formats(
            body("V1StGXR8_Z5jdHi6B-myT", "+15555550123", "ff00aa"),
            (),
            (),
            None,
            Some(&api_root()),
            false,
        )
        .await
        .unwrap();
        let expected =
            json!({"id": "V1StGXR8_Z5jdHi6B-myT", "phone": "+15555550123", "token": token, "color": "ff00aa"});
        assert_eq!(data, expected);

        let error = client_sweep_rpc::post_formats(body("short", "123", "xyz"), (), (), None, Some(&api_root()), false)
            .await
            .unwrap_err();
        assert_refused(&error, "Body", &["/id", "/phone", "/color"]);

        let params = |id: &str| get_by_cuid_::params { id: id.to_string() };
        let data = client_sweep_rpc::get_by_cuid((), (), params("cjld2cjxh0000qzrmn831i7rn"), None, Some(&api_root()), false)
            .await
            .unwrap();
        assert_eq!(data, json!({"id": "cjld2cjxh0000qzrmn831i7rn"}));

        let error = client_sweep_rpc::get_by_cuid((), (), params("xyz"), None, Some(&api_root()), false)
            .await
            .unwrap_err();
        assert_refused(&error, "Params", &["/id"]);
    }
}
