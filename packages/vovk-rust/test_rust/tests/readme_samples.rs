// a process of its own: the factories it sets apply to every call; build.rs writes the samples
include!(concat!(env!("OUT_DIR"), "/readme_samples.rs"));

// a proxy that takes no connection: a call fails at its request, after the sample has built its arguments
fn unreachable() -> reqwest::Client {
    reqwest::Client::builder().proxy(reqwest::Proxy::all("http://127.0.0.1:1").unwrap()).build().unwrap()
}

#[test]
fn test_readme_samples_compile_and_run_as_far_as_the_request() {
    generated_rust_client::set_client_factory(unreachable);
    generated_shapes_client::set_client_factory(unreachable);
    GeneratedReadonlyClient::set_client_factory(unreachable);
    assert!(SAMPLES.len() > 200, "{} samples", SAMPLES.len());

    let panicked: Vec<&str> = SAMPLES
        .iter()
        .filter(|(_, sample)| std::panic::catch_unwind(*sample).is_err())
        .map(|(name, _)| *name)
        .collect();
    assert!(panicked.is_empty(), "samples that panicked: {panicked:#?}");
}
