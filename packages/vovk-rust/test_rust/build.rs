// the README samples of the generated crates, a module each, for tests/readme_samples.rs
use std::{env, fs, path::Path};

const CRATES: [&str; 3] = ["generated_rust_client", "generated_shapes_client", "generated_readonly_client"];

fn main() {
    let mut code = String::new();
    let mut samples = Vec::new();
    for name in CRATES {
        let readme_path = format!("../{name}/README.md");
        println!("cargo:rerun-if-changed={readme_path}");
        let readme = fs::read_to_string(&readme_path).unwrap_or_else(|e| panic!("{readme_path}: {e}"));
        let mut heading = "";
        let mut lines = readme.lines();
        while let Some(line) = lines.next() {
            if let Some(text) = line.strip_prefix("### ") {
                heading = text;
            } else if line == "```rust" {
                let sample: Vec<&str> = lines.by_ref().take_while(|line| *line != "```").collect();
                let module = format!("sample_{}", samples.len());
                // binary_data is the placeholder the samples leave to the reader
                code += &format!(
                    "#[allow(unused, non_upper_case_globals)]\nmod {module} {{\nstatic binary_data: &[u8] = b\"binary data\";\npub fn run() {{ main() }}\n{}\n}}\n",
                    sample.join("\n")
                );
                samples.push(format!("({:?}, {module}::run as fn())", format!("{name} {heading}")));
            }
        }
    }
    code += &format!("const SAMPLES: &[(&str, fn())] = &[\n{}\n];\n", samples.join(",\n"));
    fs::write(Path::new(&env::var("OUT_DIR").unwrap()).join("readme_samples.rs"), code).unwrap();
}
