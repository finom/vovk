#[cfg(test)]
mod local_test {
  use futures_util::StreamExt;
  use std::io::{stdout, Write};
  use vovk_hello_world_local::{
    user_rpc, 
    open_api_rpc, 
    stream_rpc,
  };

  static TEST_GUARD: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

  #[tokio::test]
  async fn update_user_and_openapi_spec_work() {
    let _guard = TEST_GUARD.lock().await;
    use user_rpc::update_user_::{
      body as Body, body_::profile as Profile, params as Params, query as Query, query_::notify as Notify,
    };

    let response = user_rpc::update_user(
      Body {
        email: "john@example.com".to_string(),
        profile: Profile {
          name: "John Doe".to_string(),
          age: 25,
        },
      },
      Query { notify: Notify::email },
      Params {
        id: "123e4567-e89b-12d3-a456-426614174000".to_string(),
      },
      None,
      None,
      false,
    )
    .await
    .expect("update_user should succeed");
    println!("user_rpc.update_user response: {:?}", response);

    let openapi = open_api_rpc::get_spec((), (), (), None, None, false)
      .await
      .expect("get_spec should succeed");
    if let (Some(title), Some(version)) = (
      openapi["info"]["title"].as_str(),
      openapi["info"]["version"].as_str(),
    ) {
      println!("open_api_rpc.get_spec response: {} {}", title, version);
      assert!(!title.is_empty());
      assert!(!version.is_empty());
    } else {
      panic!("Could not extract title or version from OpenAPI spec");
    }
  }

  #[tokio::test]
  async fn stream_tokens_emits_messages() {
    let mut stream = stream_rpc::stream_tokens((), (), (), None, None, false)
      .await
      .expect("stream_tokens should succeed");

    let mut messages = Vec::new();
    let mut output = String::new();
    println!("stream_rpc.stream_tokens response:");
    while let Some(item) = stream.next().await {
      let val = item.expect("stream item should be Ok");
      let message = val.message;
      print!("{}", message.as_str());
      stdout().flush().expect("flush stdout");
      output.push_str(message.as_str());
      messages.push(message);
    }
    println!();
    assert!(!messages.is_empty(), "expected at least one streamed message");
  }
}