use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Validation schema structure
#[derive(Debug, Deserialize, Serialize)]
pub struct ValidationSchema {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub body: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub query: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub params: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub iteration: Option<Value>,
}

/// OpenAPI documentation
#[derive(Debug, Deserialize, Serialize)]
pub struct OpenApiDocs {
    pub summary: String,
    pub description: String,
    #[serde(flatten)]
    pub additional_fields: HashMap<String, Value>,
}

/// Handler schema
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct HandlerSchema {
    pub path: String,
    pub httpMethod: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub validation: Option<ValidationSchema>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub openapi: Option<OpenApiDocs>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom: Option<HashMap<String, Value>>,
}

/// Controller schema
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct ControllerSchema {
    pub controllerName: String,
    pub originalControllerName: String,
    pub prefix: String,
    pub handlers: HashMap<String, HandlerSchema>,
}

/// Main schema structure
#[derive(Debug, Deserialize, Serialize)]
#[allow(non_snake_case)]
pub struct VovkSchema {
    pub emitSchema: bool,
    pub segmentName: String,
    pub controllers: HashMap<String, ControllerSchema>,
}

/// Reads a Vovk schema from a JSON file
pub fn read_full_schema<P: AsRef<Path>>(path: P) -> Result<VovkSchema, Box<dyn std::error::Error>> {
    // Open the file
    let file = File::open(path)?;
    let reader = BufReader::new(file);
    
    // Parse the JSON
    let config: VovkSchema = serde_json::from_reader(reader)?;
    
    Ok(config)
}

/* 
/// Example usage
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = read_vovk_config("vovk_config.json")?;
    
    println!("Segment name: {}", config.segmentName);
    println!("Emit schema: {}", config.emitSchema);
    
    // Access controller info
    for (name, controller) in &config.controllers {
        println!("\nController: {} ({})", name, controller.originalControllerName);
        println!("Prefix: {}", controller.prefix);
        
        // Access handler info
        for (handler_name, handler) in &controller.handlers {
            println!("\n  Handler: {}", handler_name);
            println!("  Path: {}", handler.path);
            println!("  HTTP Method: {}", handler.httpMethod);
            
            if let Some(openapi) = &handler.openapi {
                println!("  Summary: {}", openapi.summary);
                println!("  Description: {}", openapi.description);
            }
            
            // You can access validation and custom fields as needed
            if let Some(custom) = &handler.custom {
                for (key, value) in custom {
                    println!("  Custom {}: {}", key, value);
                }
            }
        }
    }
    
    Ok(())
}*/