
// auto-generated 2025-04-16T10:37:20.164Z
mod http_request;
mod read_full_schema;




pub mod no_validation_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // NoValidationControllerOnlyEntityRPC.get_no_validation_controller_only_entities GET http://localhost:3000/api/generated/no-validation-controller-only-entities/

    /** 
        No summary
    */
    pub fn get_no_validation_controller_only_entities( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerOnlyEntityRPC",
            "getNoValidationControllerOnlyEntities",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // NoValidationControllerOnlyEntityRPC.update_no_validation_controller_only_entity PUT http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn update_no_validation_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerOnlyEntityRPC",
            "updateNoValidationControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // NoValidationControllerOnlyEntityRPC.create_no_validation_controller_only_entity POST http://localhost:3000/api/generated/no-validation-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_no_validation_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerOnlyEntityRPC",
            "createNoValidationControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // NoValidationControllerOnlyEntityRPC.delete_no_validation_controller_only_entity DELETE http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_no_validation_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerOnlyEntityRPC",
            "deleteNoValidationControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod no_validation_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // NoValidationControllerAndServiceEntityRPC.get_no_validation_controller_and_service_entities GET http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn get_no_validation_controller_and_service_entities( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerAndServiceEntityRPC",
            "getNoValidationControllerAndServiceEntities",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // NoValidationControllerAndServiceEntityRPC.update_no_validation_controller_and_service_entity PUT http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn update_no_validation_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerAndServiceEntityRPC",
            "updateNoValidationControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // NoValidationControllerAndServiceEntityRPC.create_no_validation_controller_and_service_entity POST http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_no_validation_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerAndServiceEntityRPC",
            "createNoValidationControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // NoValidationControllerAndServiceEntityRPC.delete_no_validation_controller_and_service_entity DELETE http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_no_validation_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "NoValidationControllerAndServiceEntityRPC",
            "deleteNoValidationControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod zod_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // ZodControllerOnlyEntityRPC.get_zod_controller_only_entities GET http://localhost:3000/api/generated/zod-controller-only-entities/
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct GetZodControllerOnlyEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_zod_controller_only_entities( 
        query: GetZodControllerOnlyEntitiesQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            GetZodControllerOnlyEntitiesQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerOnlyEntityRPC",
            "getZodControllerOnlyEntities",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ZodControllerOnlyEntityRPC.update_zod_controller_only_entity PUT http://localhost:3000/api/generated/zod-controller-only-entities/:id
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerOnlyEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerOnlyEntityQuery {
        pub q: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerOnlyEntityParams {
        pub id: String,
    }
    /** 
        No summary
    */
    pub fn update_zod_controller_only_entity( 
        body: UpdateZodControllerOnlyEntityBody,
        query: UpdateZodControllerOnlyEntityQuery,
        params: UpdateZodControllerOnlyEntityParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            UpdateZodControllerOnlyEntityBody,
            UpdateZodControllerOnlyEntityQuery,
            UpdateZodControllerOnlyEntityParams
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerOnlyEntityRPC",
            "updateZodControllerOnlyEntity",
            Some(&body),
            Some(&query),
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ZodControllerOnlyEntityRPC.create_zod_controller_only_entity POST http://localhost:3000/api/generated/zod-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_zod_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerOnlyEntityRPC",
            "createZodControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ZodControllerOnlyEntityRPC.delete_zod_controller_only_entity DELETE http://localhost:3000/api/generated/zod-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_zod_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerOnlyEntityRPC",
            "deleteZodControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod zod_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // ZodControllerAndServiceEntityRPC.get_zod_controller_and_service_entities GET http://localhost:3000/api/generated/zod-controller-and-service-entities/
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct GetZodControllerAndServiceEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_zod_controller_and_service_entities( 
        query: GetZodControllerAndServiceEntitiesQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            GetZodControllerAndServiceEntitiesQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerAndServiceEntityRPC",
            "getZodControllerAndServiceEntities",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ZodControllerAndServiceEntityRPC.update_zod_controller_and_service_entity PUT http://localhost:3000/api/generated/zod-controller-and-service-entities/:id
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerAndServiceEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerAndServiceEntityQuery {
        pub q: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerAndServiceEntityParams {
        pub id: String,
    }
    /** 
        No summary
    */
    pub fn update_zod_controller_and_service_entity( 
        body: UpdateZodControllerAndServiceEntityBody,
        query: UpdateZodControllerAndServiceEntityQuery,
        params: UpdateZodControllerAndServiceEntityParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            UpdateZodControllerAndServiceEntityBody,
            UpdateZodControllerAndServiceEntityQuery,
            UpdateZodControllerAndServiceEntityParams
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerAndServiceEntityRPC",
            "updateZodControllerAndServiceEntity",
            Some(&body),
            Some(&query),
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ZodControllerAndServiceEntityRPC.create_zod_controller_and_service_entity POST http://localhost:3000/api/generated/zod-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_zod_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerAndServiceEntityRPC",
            "createZodControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ZodControllerAndServiceEntityRPC.delete_zod_controller_and_service_entity DELETE http://localhost:3000/api/generated/zod-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_zod_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "ZodControllerAndServiceEntityRPC",
            "deleteZodControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod yup_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // YupControllerOnlyEntityRPC.get_yup_controller_only_entities GET http://localhost:3000/api/generated/yup-controller-only-entities/
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct GetYupControllerOnlyEntitiesQuery {
        pub search: Option<String>,
    }
    /** 
        No summary
    */
    pub fn get_yup_controller_only_entities( 
        query: GetYupControllerOnlyEntitiesQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            GetYupControllerOnlyEntitiesQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerOnlyEntityRPC",
            "getYupControllerOnlyEntities",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // YupControllerOnlyEntityRPC.update_yup_controller_only_entity PUT http://localhost:3000/api/generated/yup-controller-only-entities/:id
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateYupControllerOnlyEntityBody {
        pub foo: UpdateYupControllerOnlyEntityBodyFoo,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_camel_case_types)]
    pub enum UpdateYupControllerOnlyEntityBodyFoo {
        bar,
        baz,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateYupControllerOnlyEntityQuery {
        pub q: Option<String>,
    }
    /** 
        No summary
    */
    pub fn update_yup_controller_only_entity( 
        body: UpdateYupControllerOnlyEntityBody,
        query: UpdateYupControllerOnlyEntityQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            UpdateYupControllerOnlyEntityBody,
            UpdateYupControllerOnlyEntityQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerOnlyEntityRPC",
            "updateYupControllerOnlyEntity",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // YupControllerOnlyEntityRPC.create_yup_controller_only_entity POST http://localhost:3000/api/generated/yup-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_yup_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerOnlyEntityRPC",
            "createYupControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // YupControllerOnlyEntityRPC.delete_yup_controller_only_entity DELETE http://localhost:3000/api/generated/yup-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_yup_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerOnlyEntityRPC",
            "deleteYupControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod yup_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // YupControllerAndServiceEntityRPC.get_yup_controller_and_service_entities GET http://localhost:3000/api/generated/yup-controller-and-service-entities/
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct GetYupControllerAndServiceEntitiesQuery {
        pub search: Option<String>,
    }
    /** 
        No summary
    */
    pub fn get_yup_controller_and_service_entities( 
        query: GetYupControllerAndServiceEntitiesQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            GetYupControllerAndServiceEntitiesQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerAndServiceEntityRPC",
            "getYupControllerAndServiceEntities",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // YupControllerAndServiceEntityRPC.update_yup_controller_and_service_entity PUT http://localhost:3000/api/generated/yup-controller-and-service-entities/:id
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateYupControllerAndServiceEntityBody {
        pub foo: UpdateYupControllerAndServiceEntityBodyFoo,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_camel_case_types)]
    pub enum UpdateYupControllerAndServiceEntityBodyFoo {
        bar,
        baz,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateYupControllerAndServiceEntityQuery {
        pub q: Option<String>,
    }
    /** 
        No summary
    */
    pub fn update_yup_controller_and_service_entity( 
        body: UpdateYupControllerAndServiceEntityBody,
        query: UpdateYupControllerAndServiceEntityQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            UpdateYupControllerAndServiceEntityBody,
            UpdateYupControllerAndServiceEntityQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerAndServiceEntityRPC",
            "updateYupControllerAndServiceEntity",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // YupControllerAndServiceEntityRPC.create_yup_controller_and_service_entity POST http://localhost:3000/api/generated/yup-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_yup_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerAndServiceEntityRPC",
            "createYupControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // YupControllerAndServiceEntityRPC.delete_yup_controller_and_service_entity DELETE http://localhost:3000/api/generated/yup-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_yup_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "YupControllerAndServiceEntityRPC",
            "deleteYupControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod dto_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // DtoControllerOnlyEntityRPC.get_dto_controller_only_entities GET http://localhost:3000/api/generated/dto-controller-only-entities/
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct GetDtoControllerOnlyEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_dto_controller_only_entities( 
        query: GetDtoControllerOnlyEntitiesQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            GetDtoControllerOnlyEntitiesQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerOnlyEntityRPC",
            "getDtoControllerOnlyEntities",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // DtoControllerOnlyEntityRPC.update_dto_controller_only_entity PUT http://localhost:3000/api/generated/dto-controller-only-entities/:id
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateDtoControllerOnlyEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateDtoControllerOnlyEntityQuery {
        pub q: String,
    }
    /** 
        No summary
    */
    pub fn update_dto_controller_only_entity( 
        body: UpdateDtoControllerOnlyEntityBody,
        query: UpdateDtoControllerOnlyEntityQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            UpdateDtoControllerOnlyEntityBody,
            UpdateDtoControllerOnlyEntityQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerOnlyEntityRPC",
            "updateDtoControllerOnlyEntity",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // DtoControllerOnlyEntityRPC.create_dto_controller_only_entity POST http://localhost:3000/api/generated/dto-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_dto_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerOnlyEntityRPC",
            "createDtoControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // DtoControllerOnlyEntityRPC.delete_dto_controller_only_entity DELETE http://localhost:3000/api/generated/dto-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_dto_controller_only_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerOnlyEntityRPC",
            "deleteDtoControllerOnlyEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod dto_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // DtoControllerAndServiceEntityRPC.get_dto_controller_and_service_entities GET http://localhost:3000/api/generated/dto-controller-and-service-entities/
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct GetDtoControllerAndServiceEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_dto_controller_and_service_entities( 
        query: GetDtoControllerAndServiceEntitiesQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            GetDtoControllerAndServiceEntitiesQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerAndServiceEntityRPC",
            "getDtoControllerAndServiceEntities",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // DtoControllerAndServiceEntityRPC.update_dto_controller_and_service_entity PUT http://localhost:3000/api/generated/dto-controller-and-service-entities/:id
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateDtoControllerAndServiceEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct UpdateDtoControllerAndServiceEntityQuery {
        pub q: String,
    }
    /** 
        No summary
    */
    pub fn update_dto_controller_and_service_entity( 
        body: UpdateDtoControllerAndServiceEntityBody,
        query: UpdateDtoControllerAndServiceEntityQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            UpdateDtoControllerAndServiceEntityBody,
            UpdateDtoControllerAndServiceEntityQuery,
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerAndServiceEntityRPC",
            "updateDtoControllerAndServiceEntity",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // DtoControllerAndServiceEntityRPC.create_dto_controller_and_service_entity POST http://localhost:3000/api/generated/dto-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_dto_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerAndServiceEntityRPC",
            "createDtoControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // DtoControllerAndServiceEntityRPC.delete_dto_controller_and_service_entity DELETE http://localhost:3000/api/generated/dto-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_dto_controller_and_service_entity( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "generated",
            "DtoControllerAndServiceEntityRPC",
            "deleteDtoControllerAndServiceEntity",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    


pub mod client_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // ClientControllerRPC.get_hello_world_response_object GET http://localhost:3000/api/foo/client/client/get-hello-world-response-object

    /** 
        No summary
    */
    pub fn get_hello_world_response_object( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldResponseObject",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_object_literal GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal

    /** 
        No summary
    */
    pub fn get_hello_world_object_literal( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldObjectLiteral",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_next_response_object_promise GET http://localhost:3000/api/foo/client/client/get-hello-world-next-response-object-promise

    /** 
        No summary
    */
    pub fn get_hello_world_next_response_object_promise( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldNextResponseObjectPromise",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_raw_response_object_promise GET http://localhost:3000/api/foo/client/client/get-hello-world-raw-response-object-promise

    /** 
        No summary
    */
    pub fn get_hello_world_raw_response_object_promise( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldRawResponseObjectPromise",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_object_literal_promise GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal-promise

    /** 
        No summary
    */
    pub fn get_hello_world_object_literal_promise( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldObjectLiteralPromise",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_headers GET http://localhost:3000/api/foo/client/client/get-hello-world-headers

    /** 
        No summary
    */
    pub fn get_hello_world_headers( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldHeaders",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_array GET http://localhost:3000/api/foo/client/client/get-hello-world-array

    /** 
        No summary
    */
    pub fn get_hello_world_array( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldArray",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_hello_world_and_empty_generic GET http://localhost:3000/api/foo/client/client/get-hello-world-and-empty-generic

    /** 
        No summary
    */
    pub fn get_hello_world_and_empty_generic( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getHelloWorldAndEmptyGeneric",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_with_params GET http://localhost:3000/api/foo/client/client/with-params/:hello

    /** 
        No summary
    */
    pub fn get_with_params( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getWithParams",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.post_with_all POST http://localhost:3000/api/foo/client/client/with-all/:hello

    /** 
        No summary
    */
    pub fn post_with_all( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "postWithAll",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.post_with_body_and_query_using_req_vovk POST http://localhost:3000/api/foo/client/client/with-all-using-req-vovk

    /** 
        No summary
    */
    pub fn post_with_body_and_query_using_req_vovk( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "postWithBodyAndQueryUsingReqVovk",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_nested_query GET http://localhost:3000/api/foo/client/client/nested-query

    /** 
        No summary
    */
    pub fn get_nested_query( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getNestedQuery",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.post_with_form_data_using_req_vovk POST http://localhost:3000/api/foo/client/client/form-data

    /** 
        No summary
    */
    pub fn post_with_form_data_using_req_vovk( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "postWithFormDataUsingReqVovk",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_error_response GET http://localhost:3000/api/foo/client/client/error

    /** 
        No summary
    */
    pub fn get_error_response( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getErrorResponse",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_json_text_response GET http://localhost:3000/api/foo/client/client/json-text

    /** 
        No summary
    */
    pub fn get_json_text_response( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getJsonTextResponse",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_jsonl_response GET http://localhost:3000/api/foo/client/client/jsonl

    /** 
        No summary
    */
    pub fn get_jsonl_response( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getJsonlResponse",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // ClientControllerRPC.get_jsonl_text_response GET http://localhost:3000/api/foo/client/client/jsonl-text

    /** 
        No summary
    */
    pub fn get_jsonl_text_response( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "ClientControllerRPC",
            "getJsonlTextResponse",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod streaming_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // StreamingControllerRPC.post_with_streaming POST http://localhost:3000/api/foo/client/streaming/post-with-streaming

    /** 
        No summary
    */
    pub fn post_with_streaming( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingControllerRPC",
            "postWithStreaming",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingControllerRPC.post_with_streaming_and_immediate_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-immediate-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_immediate_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingControllerRPC",
            "postWithStreamingAndImmediateError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingControllerRPC.post_with_streaming_and_delayed_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingControllerRPC",
            "postWithStreamingAndDelayedError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingControllerRPC.post_with_streaming_and_delayed_custom_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-custom-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_custom_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingControllerRPC",
            "postWithStreamingAndDelayedCustomError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingControllerRPC.post_with_streaming_and_delayed_unhandled_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-unhandled-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_unhandled_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingControllerRPC",
            "postWithStreamingAndDelayedUnhandledError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod streaming_generator_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // StreamingGeneratorControllerRPC.get_with_streaming GET http://localhost:3000/api/foo/client/streaming-generator/get-with-streaming

    /** 
        No summary
    */
    pub fn get_with_streaming( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "getWithStreaming",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingGeneratorControllerRPC.post_with_async_streaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-async-streaming

    /** 
        No summary
    */
    pub fn post_with_async_streaming( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "postWithAsyncStreaming",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming

    /** 
        No summary
    */
    pub fn post_with_streaming( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "postWithStreaming",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_immediate_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-immediate-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_immediate_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "postWithStreamingAndImmediateError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_delayed_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "postWithStreamingAndDelayedError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_delayed_custom_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-custom-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_custom_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "postWithStreamingAndDelayedCustomError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_delayed_unhandled_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-unhandled-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_unhandled_error( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "StreamingGeneratorControllerRPC",
            "postWithStreamingAndDelayedUnhandledError",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod custom_schema_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // CustomSchemaControllerRPC.get_with_custom_schema GET http://localhost:3000/api/foo/client//get-with-custom-schema

    /** 
        No summary
    */
    pub fn get_with_custom_schema( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "CustomSchemaControllerRPC",
            "getWithCustomSchema",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    
pub mod with_zod_client_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // WithZodClientControllerRPC.handle_all POST http://localhost:3000/api/foo/client/with-zod/all/:foo/:bar
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllQuery {
        pub search: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllParams {
        pub foo: String,
        pub bar: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutput {
        pub body: HandleAllOutputBody,
        pub query: HandleAllOutputQuery,
        pub params: HandleAllOutputParams,
        pub vovkParams: HandleAllOutputVovkParams,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputBody {
        pub hello: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputQuery {
        pub search: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputParams {
        pub foo: String,
        pub bar: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputVovkParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        This is a summary
    */
    pub fn handle_all( 
        body: HandleAllBody,
        query: HandleAllQuery,
        params: HandleAllParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<HandleAllOutput>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        HandleAllOutput,
            HandleAllBody,
            HandleAllQuery,
            HandleAllParams
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleAll",
            Some(&body),
            Some(&query),
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_query GET http://localhost:3000/api/foo/client/with-zod/handle-query
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleQueryQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_query( 
        query: HandleQueryQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleQueryQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleQuery",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_body POST http://localhost:3000/api/foo/client/with-zod/handle-body
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleBodyBody {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_body( 
        body: HandleBodyBody,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            HandleBodyBody,
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleBody",
            Some(&body),
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_params PUT http://localhost:3000/api/foo/client/with-zod/x/:foo/:bar/y
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleParamsParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        No summary
    */
    pub fn handle_params( 
        params: HandleParamsParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            HandleParamsParams
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleParams",
            None,
            None,
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_nested_query GET http://localhost:3000/api/foo/client/with-zod/handle-nested-query
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQuery {
        pub x: String,
        pub y: Vec<String>,
        pub z: HandleNestedQueryQueryZ,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZ {
        pub f: String,
        pub u: Vec<String>,
        pub d: HandleNestedQueryQueryZD,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZD {
        pub x: String,
        pub arrOfObjects: Vec<HandleNestedQueryQueryZDArrOfObjects>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjects {
        pub foo: String,
        pub nestedArr: Option<Vec<String>>,
        pub nestedObj: Option<HandleNestedQueryQueryZDArrOfObjectsNestedObj>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjectsNestedObj {
        pub deepKey: String,
    }
    /** 
        No summary
    */
    pub fn handle_nested_query( 
        query: HandleNestedQueryQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleNestedQueryQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleNestedQuery",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_output GET http://localhost:3000/api/foo/client/with-zod/handle-output
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleOutputQuery {
        pub helloOutput: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleOutputOutput {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_output( 
        query: HandleOutputQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<HandleOutputOutput>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        HandleOutputOutput,
            (),
            HandleOutputQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleOutput",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_stream GET http://localhost:3000/api/foo/client/with-zod/handle-stream
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleStreamQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleStreamIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn handle_stream( 
        query: HandleStreamQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Box<dyn Iterator<Item = HandleStreamIteration>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleStreamQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleStream",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
        match result {
            Ok(ApiResponse::Stream(stream)) => {
                // Map the stream of Results to HandleStreamIteration objects
                Box::new(stream.filter_map(|item| {
                    match item {
                        Ok(value) => {
                            match serde_json::from_value::<HandleStreamIteration>(value) {
                                Ok(iteration) => Some(iteration),
                                Err(_) => None,
                            }
                        },
                        Err(_) => None,
                    }
                }))
            },
            // In case of single response or error, return empty iterator
            _ => Box::new(std::iter::empty())
        }
        
    }
        
    // WithZodClientControllerRPC.handle_nothitng POST http://localhost:3000/api/foo/client/with-zod/handle-nothitng

    /** 
        No summary
    */
    pub fn handle_nothitng( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleNothitng",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.handle_form_data POST http://localhost:3000/api/foo/client/with-zod/handle-form-data
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleFormDataQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_form_data( 
        query: HandleFormDataQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleFormDataQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleFormData",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.disable_server_side_validation_bool POST http://localhost:3000/api/foo/client/with-zod/disable-server-side-validation-bool
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn disable_server_side_validation_bool( 
        body: DisableServerSideValidationBoolBody,
        query: DisableServerSideValidationBoolQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            DisableServerSideValidationBoolBody,
            DisableServerSideValidationBoolQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "disableServerSideValidationBool",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.disable_server_side_validation_strings POST http://localhost:3000/api/foo/client/with-zod/disable-server-side-validation-strings
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn disable_server_side_validation_strings( 
        body: DisableServerSideValidationStringsBody,
        query: DisableServerSideValidationStringsQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            DisableServerSideValidationStringsBody,
            DisableServerSideValidationStringsQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "disableServerSideValidationStrings",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.skip_schema_emission_bool POST http://localhost:3000/api/foo/client/with-zod/skip-schema-emission-bool

    /** 
        No summary
    */
    pub fn skip_schema_emission_bool( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "skipSchemaEmissionBool",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.skip_schema_emission_strings POST http://localhost:3000/api/foo/client/with-zod/skip-schema-emission-strings
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct SkipSchemaEmissionStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn skip_schema_emission_strings( 
        query: SkipSchemaEmissionStringsQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            SkipSchemaEmissionStringsQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "skipSchemaEmissionStrings",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithZodClientControllerRPC.validate_every_iteration POST http://localhost:3000/api/foo/client/with-zod/validate-every-iteration
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn validate_every_iteration( 
        query: ValidateEveryIterationQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Box<dyn Iterator<Item = ValidateEveryIterationIteration>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            ValidateEveryIterationQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "validateEveryIteration",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
        match result {
            Ok(ApiResponse::Stream(stream)) => {
                // Map the stream of Results to ValidateEveryIterationIteration objects
                Box::new(stream.filter_map(|item| {
                    match item {
                        Ok(value) => {
                            match serde_json::from_value::<ValidateEveryIterationIteration>(value) {
                                Ok(iteration) => Some(iteration),
                                Err(_) => None,
                            }
                        },
                        Err(_) => None,
                    }
                }))
            },
            // In case of single response or error, return empty iterator
            _ => Box::new(std::iter::empty())
        }
        
    }
        
}
    
pub mod with_yup_client_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // WithYupClientControllerRPC.handle_all POST http://localhost:3000/api/foo/client/with-yup/all/:foo/:bar
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllQuery {
        pub search: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllParams {
        pub foo: String,
        pub bar: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutput {
        pub body: HandleAllOutputBody,
        pub query: HandleAllOutputQuery,
        pub params: HandleAllOutputParams,
        pub vovkParams: HandleAllOutputVovkParams,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputBody {
        pub hello: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputQuery {
        pub search: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputParams {
        pub foo: String,
        pub bar: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputVovkParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        This is a summary
    */
    pub fn handle_all( 
        body: HandleAllBody,
        query: HandleAllQuery,
        params: HandleAllParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<HandleAllOutput>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        HandleAllOutput,
            HandleAllBody,
            HandleAllQuery,
            HandleAllParams
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleAll",
            Some(&body),
            Some(&query),
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_query GET http://localhost:3000/api/foo/client/with-yup/handle-query
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleQueryQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_query( 
        query: HandleQueryQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleQueryQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleQuery",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_body POST http://localhost:3000/api/foo/client/with-yup/handle-body
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleBodyBody {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_body( 
        body: HandleBodyBody,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            HandleBodyBody,
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleBody",
            Some(&body),
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_params PUT http://localhost:3000/api/foo/client/with-yup/x/:foo/:bar/y
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleParamsParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        No summary
    */
    pub fn handle_params( 
        params: HandleParamsParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            HandleParamsParams
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleParams",
            None,
            None,
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_nested_query GET http://localhost:3000/api/foo/client/with-yup/handle-nested-query
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQuery {
        pub x: String,
        pub y: Vec<String>,
        pub z: HandleNestedQueryQueryZ,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZ {
        pub f: String,
        pub u: Vec<String>,
        pub d: HandleNestedQueryQueryZD,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZD {
        pub x: String,
        pub arrOfObjects: Vec<HandleNestedQueryQueryZDArrOfObjects>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjects {
        pub foo: String,
        pub nestedArr: Option<Vec<String>>,
        pub nestedObj: Option<HandleNestedQueryQueryZDArrOfObjectsNestedObj>,
    }

    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjectsNestedObj {
        pub deepKey: Option<String>,
    }
    /** 
        No summary
    */
    pub fn handle_nested_query( 
        query: HandleNestedQueryQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleNestedQueryQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleNestedQuery",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_output GET http://localhost:3000/api/foo/client/with-yup/handle-output
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleOutputQuery {
        pub helloOutput: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleOutputOutput {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_output( 
        query: HandleOutputQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<HandleOutputOutput>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        HandleOutputOutput,
            (),
            HandleOutputQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleOutput",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_stream GET http://localhost:3000/api/foo/client/with-yup/handle-stream
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleStreamQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleStreamIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn handle_stream( 
        query: HandleStreamQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Box<dyn Iterator<Item = HandleStreamIteration>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleStreamQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleStream",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
        match result {
            Ok(ApiResponse::Stream(stream)) => {
                // Map the stream of Results to HandleStreamIteration objects
                Box::new(stream.filter_map(|item| {
                    match item {
                        Ok(value) => {
                            match serde_json::from_value::<HandleStreamIteration>(value) {
                                Ok(iteration) => Some(iteration),
                                Err(_) => None,
                            }
                        },
                        Err(_) => None,
                    }
                }))
            },
            // In case of single response or error, return empty iterator
            _ => Box::new(std::iter::empty())
        }
        
    }
        
    // WithYupClientControllerRPC.handle_nothitng POST http://localhost:3000/api/foo/client/with-yup/handle-nothitng

    /** 
        No summary
    */
    pub fn handle_nothitng( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleNothitng",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.handle_form_data POST http://localhost:3000/api/foo/client/with-yup/handle-form-data
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleFormDataQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_form_data( 
        query: HandleFormDataQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleFormDataQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleFormData",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.disable_server_side_validation_bool POST http://localhost:3000/api/foo/client/with-yup/disable-server-side-validation-bool
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn disable_server_side_validation_bool( 
        body: DisableServerSideValidationBoolBody,
        query: DisableServerSideValidationBoolQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            DisableServerSideValidationBoolBody,
            DisableServerSideValidationBoolQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "disableServerSideValidationBool",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.disable_server_side_validation_strings POST http://localhost:3000/api/foo/client/with-yup/disable-server-side-validation-strings
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn disable_server_side_validation_strings( 
        body: DisableServerSideValidationStringsBody,
        query: DisableServerSideValidationStringsQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            DisableServerSideValidationStringsBody,
            DisableServerSideValidationStringsQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "disableServerSideValidationStrings",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.skip_schema_emission_bool POST http://localhost:3000/api/foo/client/with-yup/skip-schema-emission-bool

    /** 
        No summary
    */
    pub fn skip_schema_emission_bool( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "skipSchemaEmissionBool",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.skip_schema_emission_strings POST http://localhost:3000/api/foo/client/with-yup/skip-schema-emission-strings
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct SkipSchemaEmissionStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn skip_schema_emission_strings( 
        query: SkipSchemaEmissionStringsQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            SkipSchemaEmissionStringsQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "skipSchemaEmissionStrings",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithYupClientControllerRPC.validate_every_iteration POST http://localhost:3000/api/foo/client/with-yup/validate-every-iteration
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn validate_every_iteration( 
        query: ValidateEveryIterationQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Box<dyn Iterator<Item = ValidateEveryIterationIteration>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            ValidateEveryIterationQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "validateEveryIteration",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
        match result {
            Ok(ApiResponse::Stream(stream)) => {
                // Map the stream of Results to ValidateEveryIterationIteration objects
                Box::new(stream.filter_map(|item| {
                    match item {
                        Ok(value) => {
                            match serde_json::from_value::<ValidateEveryIterationIteration>(value) {
                                Ok(iteration) => Some(iteration),
                                Err(_) => None,
                            }
                        },
                        Err(_) => None,
                    }
                }))
            },
            // In case of single response or error, return empty iterator
            _ => Box::new(std::iter::empty())
        }
        
    }
        
}
    
pub mod with_dto_client_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // WithDtoClientControllerRPC.handle_all POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllQuery {
        pub search: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllParams {
        pub foo: String,
        pub bar: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutput {
        pub body: (),
        pub query: (),
        pub params: (),
        pub vovkParams: (),
    }
    /** 
        This is a summary
    */
    pub fn handle_all( 
        body: HandleAllBody,
        query: HandleAllQuery,
        params: HandleAllParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<HandleAllOutput>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        HandleAllOutput,
            HandleAllBody,
            HandleAllQuery,
            HandleAllParams
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleAll",
            Some(&body),
            Some(&query),
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_all_client POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar/client

    /** 
        No summary
    */
    pub fn handle_all_client( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleAllClient",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_query GET http://localhost:3000/api/foo/client/with-dto/handle-query
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleQueryQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_query( 
        query: HandleQueryQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleQueryQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleQuery",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_query_client GET http://localhost:3000/api/foo/client/with-dto/handle-query-client

    /** 
        No summary
    */
    pub fn handle_query_client( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleQueryClient",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_body POST http://localhost:3000/api/foo/client/with-dto/handle-body
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleBodyBody {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_body( 
        body: HandleBodyBody,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            HandleBodyBody,
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleBody",
            Some(&body),
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_body_client POST http://localhost:3000/api/foo/client/with-dto/handle-body-client

    /** 
        No summary
    */
    pub fn handle_body_client( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleBodyClient",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_params PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleParamsParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        No summary
    */
    pub fn handle_params( 
        params: HandleParamsParams,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            HandleParamsParams
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleParams",
            None,
            None,
            Some(&params),
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_params_client PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y/client

    /** 
        No summary
    */
    pub fn handle_params_client( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleParamsClient",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_nested_query GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQuery {
        pub x: String,
        pub y: Vec<String>,
        pub z: (),
    }
    /** 
        No summary
    */
    pub fn handle_nested_query( 
        query: HandleNestedQueryQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleNestedQueryQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleNestedQuery",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_nested_query_client GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query-client

    /** 
        No summary
    */
    pub fn handle_nested_query_client( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleNestedQueryClient",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_output GET http://localhost:3000/api/foo/client/with-dto/handle-output
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleOutputQuery {
        pub helloOutput: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleOutputOutput {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_output( 
        query: HandleOutputQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<HandleOutputOutput>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        HandleOutputOutput,
            (),
            HandleOutputQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleOutput",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_output_client GET http://localhost:3000/api/foo/client/with-dto/handle-output-client

    /** 
        No summary
    */
    pub fn handle_output_client( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleOutputClient",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_stream GET http://localhost:3000/api/foo/client/with-dto/handle-stream
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleStreamQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleStreamIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn handle_stream( 
        query: HandleStreamQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Box<dyn Iterator<Item = HandleStreamIteration>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleStreamQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleStream",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
        match result {
            Ok(ApiResponse::Stream(stream)) => {
                // Map the stream of Results to HandleStreamIteration objects
                Box::new(stream.filter_map(|item| {
                    match item {
                        Ok(value) => {
                            match serde_json::from_value::<HandleStreamIteration>(value) {
                                Ok(iteration) => Some(iteration),
                                Err(_) => None,
                            }
                        },
                        Err(_) => None,
                    }
                }))
            },
            // In case of single response or error, return empty iterator
            _ => Box::new(std::iter::empty())
        }
        
    }
        
    // WithDtoClientControllerRPC.handle_nothitng POST http://localhost:3000/api/foo/client/with-dto/handle-nothitng

    /** 
        No summary
    */
    pub fn handle_nothitng( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleNothitng",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.handle_form_data POST http://localhost:3000/api/foo/client/with-dto/handle-form-data
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct HandleFormDataQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_form_data( 
        query: HandleFormDataQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            HandleFormDataQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleFormData",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.disable_server_side_validation_bool POST http://localhost:3000/api/foo/client/with-dto/disable-server-side-validation-bool
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn disable_server_side_validation_bool( 
        body: DisableServerSideValidationBoolBody,
        query: DisableServerSideValidationBoolQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            DisableServerSideValidationBoolBody,
            DisableServerSideValidationBoolQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "disableServerSideValidationBool",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.disable_server_side_validation_strings POST http://localhost:3000/api/foo/client/with-dto/disable-server-side-validation-strings
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn disable_server_side_validation_strings( 
        body: DisableServerSideValidationStringsBody,
        query: DisableServerSideValidationStringsQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            DisableServerSideValidationStringsBody,
            DisableServerSideValidationStringsQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "disableServerSideValidationStrings",
            Some(&body),
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.skip_schema_emission_bool POST http://localhost:3000/api/foo/client/with-dto/skip-schema-emission-bool

    /** 
        No summary
    */
    pub fn skip_schema_emission_bool( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "skipSchemaEmissionBool",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.skip_schema_emission_strings POST http://localhost:3000/api/foo/client/with-dto/skip-schema-emission-strings
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct SkipSchemaEmissionStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn skip_schema_emission_strings( 
        query: SkipSchemaEmissionStringsQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            SkipSchemaEmissionStringsQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "skipSchemaEmissionStrings",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
    // WithDtoClientControllerRPC.validate_every_iteration POST http://localhost:3000/api/foo/client/with-dto/validate-every-iteration
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationQuery {
        pub values: Vec<()>,
    }
    #[derive(Debug, Serialize, Deserialize)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn validate_every_iteration( 
        query: ValidateEveryIterationQuery,
        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Box<dyn Iterator<Item = ValidateEveryIterationIteration>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            ValidateEveryIterationQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "validateEveryIteration",
            None,
            Some(&query),
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
        match result {
            Ok(ApiResponse::Stream(stream)) => {
                // Map the stream of Results to ValidateEveryIterationIteration objects
                Box::new(stream.filter_map(|item| {
                    match item {
                        Ok(value) => {
                            match serde_json::from_value::<ValidateEveryIterationIteration>(value) {
                                Ok(iteration) => Some(iteration),
                                Err(_) => None,
                            }
                        },
                        Err(_) => None,
                    }
                }))
            },
            // In case of single response or error, return empty iterator
            _ => Box::new(std::iter::empty())
        }
        
    }
        
}
    
pub mod open_api_controller_rpc {
    pub use crate::http_request::{http_request, ApiResponse};
    pub use serde::{Deserialize, Serialize};

    // OpenApiControllerRPC.get_from_schema GET http://localhost:3000/api/foo/client/openapi/

    /** 
        Hello, World!
    */
    pub fn get_from_schema( 

        api_root: Option<&str>,
        disable_client_validation: Option<bool>,
    ) -> Result<ApiResponse<serde_json::Value>, Box<dyn serde::ser::StdError>>{
        
        let result = http_request::<
                        serde_json::Value,
            (),
            (),
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "OpenApiControllerRPC",
            "getFromSchema",
            None,
            None,
            None,
            api_root,
            disable_client_validation.unwrap_or(false),
        );

        
            result
        
    }
        
}
    


/*
// Placeholder for the client module
mod client {
    use super::*;
    use super::ZodControllerOnlyEntityRPC::*;
    
    pub fn request<B, Q, P>(
        segment_name: &str,
        controller_name: &str,
        handler_name: &str,
        body: B,
        query: Q,
        params: P,
        api_root: Option<String>,
        disable_client_validation: bool,
    ) -> UpdateZodControllerOnlyEntityResponse {
        // Create a specific mock response instead of using Default
        UpdateZodControllerOnlyEntityResponse {
            id: "123".to_string(),
            foo: FooOption::bar,  // Using a specific value instead of default
            updated_at: "2025-03-31T16:56:29Z".to_string(),
            success: true,
        }
    }
}


use serde::{Deserialize, Serialize};

// Define types in a module
pub mod ZodControllerOnlyEntityRPC {
    use super::*;

    // Enum with lowercase variants
   
   /*// Input type definitions
    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateZodControllerOnlyEntityBody {
        pub foo: UpdateZodControllerOnlyEntityBodyFoo,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateZodControllerOnlyEntityQuery {
        pub q: String,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateZodControllerOnlyEntityParams {
        pub id: String,
    }*/

    // Return type definition

    
Write me a function called convertJSONSchemaToRustType(jsonSchema) in TypeScript that accepts JSON schema and returns Rust type definition.
The function should take a schema object as input and return a string representing the Rust type definition.
The function should handle different types of JSON schema, including nested objects and arrays.
The function should also handle optional properties and default values.
The function should be able to convert JSON schema to Rust types, including structs, enums, and primitive types.
Nested structures should be converted to Rust structs, and named after the JSON schema property names and the root type name.
consider that nested structures are prefixed with the root type name, deeply nested structures are prefixed with the root type name and the parent type name, and so on.

interface ConvertOptions {
  schema: JSONSchema;
  structName: string;
  pad: number; // number of spaces to pad the output
}

export function convertJSONSchemaToPythonType(options: ConvertOptions): string {
  const { schema, structName } = options; // structName is the name of the struct to be generated

  if (!schema) return '';

  // ...
}

const types = convertJSONSchemaToPythonType({ schema: validation.body, structName: 'UpdateZodControllerOnlyEntityResponse', pad: 4 }),


    
    

    #[derive(Debug, Serialize, Deserialize)]
    pub enum UpdateZodControllerOnlyEntityResponseFoo {
        bar,
        baz,
    }

    #[derive(Debug, Serialize, Deserialize)]
    pub struct UpdateZodControllerOnlyEntityResponse {
        pub id: String,
        pub foo: UpdateZodControllerOnlyEntityResponseFoo,
        pub updated_at: String,
        pub success: bool,
    }

    /// No summary
    pub fn update_zod_controller_only_entity(
        body: UpdateZodControllerOnlyEntityBody,
        query: UpdateZodControllerOnlyEntityQuery,
        params: UpdateZodControllerOnlyEntityParams,
        api_root: Option<String>,
        disable_client_validation: bool,
    ) -> UpdateZodControllerOnlyEntityResponse {
        // In a real implementation, you would call a client library
        request(
            "generated",
            "ZodControllerOnlyEntityRPC",
            "updateZodControllerOnlyEntity",
            body,
            query,
            params,
            api_root,
            disable_client_validation,
        )
    }
}

// Placeholder for the client module
mod client {
    use super::*;
    use super::ZodControllerOnlyEntityRPC::*;
    
    pub fn request<B, Q, P>(
        segment_name: &str,
        controller_name: &str,
        handler_name: &str,
        body: B,
        query: Q,
        params: P,
        api_root: Option<String>,
        disable_client_validation: bool,
    ) -> UpdateZodControllerOnlyEntityResponse {
        // Create a specific mock response instead of using Default
        UpdateZodControllerOnlyEntityResponse {
            id: "123".to_string(),
            foo: FooOption::bar,  // Using a specific value instead of default
            updated_at: "2025-03-31T16:56:29Z".to_string(),
            success: true,
        }
    }
}

// Example of usage
fn example_usage() {
    use ZodControllerOnlyEntityRPC::*;
    
    let body = UpdateZodControllerOnlyEntityBody {
        foo: FooOption::bar,
    };
    
    let query = UpdateZodControllerOnlyEntityQuery {
        q: "search term".to_string(),
    };
    
    let params = UpdateZodControllerOnlyEntityParams {
        id: "123".to_string(),
    };
    
    let response = update_zod_controller_only_entity(
        body,
        query,
        params,
        Some("http://localhost:3000/api".to_string()),
        false
    );
    
    println!("Updated entity with id: {}", response.id);
}
// use serde::{Serialize, Deserialize};
/ *
convertJSONSchemaToRustType({ schema: validation.body, namespace: controllerName, structName: 'UpdateZodControllerOnlyEntityResponse', pad: 4 }),

    #[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Hash)]
    pub enum UpdateZodControllerOnlyEntityResponseFoo {
        bar,
        baz,
    }

    // Nested structure definition
    #[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Hash)]
    pub struct UpdateZodControllerOnlyEntityResponseNested {
        pub field1: String,
        pub field2: i32,
        pub enabled: bool,
    }

    #[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Hash)]
    pub struct UpdateZodControllerOnlyEntityResponse {
        pub id: String,
        pub foo: UpdateZodControllerOnlyEntityResponseFoo,
        pub nested: UpdateZodControllerOnlyEntityResponseNested,
        pub updated_at: String,
        pub success: bool,
    }

*/