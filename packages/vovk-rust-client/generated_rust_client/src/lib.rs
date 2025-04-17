
// auto-generated 2025-04-17T16:41:31.611Z
mod http_request;
mod read_full_schema;




pub mod no_validation_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // NoValidationControllerOnlyEntityRPC.get_no_validation_controller_only_entities GET http://localhost:3000/api/generated/no-validation-controller-only-entities/

    /** 
        No summary
    */
    pub fn get_no_validation_controller_only_entities( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // NoValidationControllerOnlyEntityRPC.update_no_validation_controller_only_entity PUT http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn update_no_validation_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // NoValidationControllerOnlyEntityRPC.create_no_validation_controller_only_entity POST http://localhost:3000/api/generated/no-validation-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_no_validation_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // NoValidationControllerOnlyEntityRPC.delete_no_validation_controller_only_entity DELETE http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_no_validation_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod no_validation_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // NoValidationControllerAndServiceEntityRPC.get_no_validation_controller_and_service_entities GET http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn get_no_validation_controller_and_service_entities( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // NoValidationControllerAndServiceEntityRPC.update_no_validation_controller_and_service_entity PUT http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn update_no_validation_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // NoValidationControllerAndServiceEntityRPC.create_no_validation_controller_and_service_entity POST http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_no_validation_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // NoValidationControllerAndServiceEntityRPC.delete_no_validation_controller_and_service_entity DELETE http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_no_validation_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod zod_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // ZodControllerOnlyEntityRPC.get_zod_controller_only_entities GET http://localhost:3000/api/generated/zod-controller-only-entities/
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct GetZodControllerOnlyEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_zod_controller_only_entities( 
        body: (),
        query: GetZodControllerOnlyEntitiesQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ZodControllerOnlyEntityRPC.update_zod_controller_only_entity PUT http://localhost:3000/api/generated/zod-controller-only-entities/:id
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerOnlyEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerOnlyEntityQuery {
        pub q: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            disable_client_validation,
        );

        result
    }
        
    // ZodControllerOnlyEntityRPC.create_zod_controller_only_entity POST http://localhost:3000/api/generated/zod-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_zod_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ZodControllerOnlyEntityRPC.delete_zod_controller_only_entity DELETE http://localhost:3000/api/generated/zod-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_zod_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod zod_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // ZodControllerAndServiceEntityRPC.get_zod_controller_and_service_entities GET http://localhost:3000/api/generated/zod-controller-and-service-entities/
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct GetZodControllerAndServiceEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_zod_controller_and_service_entities( 
        body: (),
        query: GetZodControllerAndServiceEntitiesQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ZodControllerAndServiceEntityRPC.update_zod_controller_and_service_entity PUT http://localhost:3000/api/generated/zod-controller-and-service-entities/:id
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerAndServiceEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateZodControllerAndServiceEntityQuery {
        pub q: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            disable_client_validation,
        );

        result
    }
        
    // ZodControllerAndServiceEntityRPC.create_zod_controller_and_service_entity POST http://localhost:3000/api/generated/zod-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_zod_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ZodControllerAndServiceEntityRPC.delete_zod_controller_and_service_entity DELETE http://localhost:3000/api/generated/zod-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_zod_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod yup_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // YupControllerOnlyEntityRPC.get_yup_controller_only_entities GET http://localhost:3000/api/generated/yup-controller-only-entities/
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct GetYupControllerOnlyEntitiesQuery {
        pub search: Option<String>,
    }
    /** 
        No summary
    */
    pub fn get_yup_controller_only_entities( 
        body: (),
        query: GetYupControllerOnlyEntitiesQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // YupControllerOnlyEntityRPC.update_yup_controller_only_entity PUT http://localhost:3000/api/generated/yup-controller-only-entities/:id
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateYupControllerOnlyEntityBody {
        pub foo: UpdateYupControllerOnlyEntityBodyFoo,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_camel_case_types)]
    pub enum UpdateYupControllerOnlyEntityBodyFoo {
        bar,
        baz,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // YupControllerOnlyEntityRPC.create_yup_controller_only_entity POST http://localhost:3000/api/generated/yup-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_yup_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // YupControllerOnlyEntityRPC.delete_yup_controller_only_entity DELETE http://localhost:3000/api/generated/yup-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_yup_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod yup_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // YupControllerAndServiceEntityRPC.get_yup_controller_and_service_entities GET http://localhost:3000/api/generated/yup-controller-and-service-entities/
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct GetYupControllerAndServiceEntitiesQuery {
        pub search: Option<String>,
    }
    /** 
        No summary
    */
    pub fn get_yup_controller_and_service_entities( 
        body: (),
        query: GetYupControllerAndServiceEntitiesQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // YupControllerAndServiceEntityRPC.update_yup_controller_and_service_entity PUT http://localhost:3000/api/generated/yup-controller-and-service-entities/:id
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateYupControllerAndServiceEntityBody {
        pub foo: UpdateYupControllerAndServiceEntityBodyFoo,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_camel_case_types)]
    pub enum UpdateYupControllerAndServiceEntityBodyFoo {
        bar,
        baz,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // YupControllerAndServiceEntityRPC.create_yup_controller_and_service_entity POST http://localhost:3000/api/generated/yup-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_yup_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // YupControllerAndServiceEntityRPC.delete_yup_controller_and_service_entity DELETE http://localhost:3000/api/generated/yup-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_yup_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod dto_controller_only_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // DtoControllerOnlyEntityRPC.get_dto_controller_only_entities GET http://localhost:3000/api/generated/dto-controller-only-entities/
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct GetDtoControllerOnlyEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_dto_controller_only_entities( 
        body: (),
        query: GetDtoControllerOnlyEntitiesQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // DtoControllerOnlyEntityRPC.update_dto_controller_only_entity PUT http://localhost:3000/api/generated/dto-controller-only-entities/:id
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateDtoControllerOnlyEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // DtoControllerOnlyEntityRPC.create_dto_controller_only_entity POST http://localhost:3000/api/generated/dto-controller-only-entities/

    /** 
        No summary
    */
    pub fn create_dto_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // DtoControllerOnlyEntityRPC.delete_dto_controller_only_entity DELETE http://localhost:3000/api/generated/dto-controller-only-entities/:id

    /** 
        No summary
    */
    pub fn delete_dto_controller_only_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod dto_controller_and_service_entity_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // DtoControllerAndServiceEntityRPC.get_dto_controller_and_service_entities GET http://localhost:3000/api/generated/dto-controller-and-service-entities/
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct GetDtoControllerAndServiceEntitiesQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn get_dto_controller_and_service_entities( 
        body: (),
        query: GetDtoControllerAndServiceEntitiesQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // DtoControllerAndServiceEntityRPC.update_dto_controller_and_service_entity PUT http://localhost:3000/api/generated/dto-controller-and-service-entities/:id
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct UpdateDtoControllerAndServiceEntityBody {
        pub foo: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // DtoControllerAndServiceEntityRPC.create_dto_controller_and_service_entity POST http://localhost:3000/api/generated/dto-controller-and-service-entities/

    /** 
        No summary
    */
    pub fn create_dto_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // DtoControllerAndServiceEntityRPC.delete_dto_controller_and_service_entity DELETE http://localhost:3000/api/generated/dto-controller-and-service-entities/:id

    /** 
        No summary
    */
    pub fn delete_dto_controller_and_service_entity( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    


pub mod client_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // ClientControllerRPC.get_hello_world_response_object GET http://localhost:3000/api/foo/client/client/get-hello-world-response-object

    /** 
        No summary
    */
    pub fn get_hello_world_response_object( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_object_literal GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal

    /** 
        No summary
    */
    pub fn get_hello_world_object_literal( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_next_response_object_promise GET http://localhost:3000/api/foo/client/client/get-hello-world-next-response-object-promise

    /** 
        No summary
    */
    pub fn get_hello_world_next_response_object_promise( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_raw_response_object_promise GET http://localhost:3000/api/foo/client/client/get-hello-world-raw-response-object-promise

    /** 
        No summary
    */
    pub fn get_hello_world_raw_response_object_promise( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_object_literal_promise GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal-promise

    /** 
        No summary
    */
    pub fn get_hello_world_object_literal_promise( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_headers GET http://localhost:3000/api/foo/client/client/get-hello-world-headers

    /** 
        No summary
    */
    pub fn get_hello_world_headers( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_array GET http://localhost:3000/api/foo/client/client/get-hello-world-array

    /** 
        No summary
    */
    pub fn get_hello_world_array( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_hello_world_and_empty_generic GET http://localhost:3000/api/foo/client/client/get-hello-world-and-empty-generic

    /** 
        No summary
    */
    pub fn get_hello_world_and_empty_generic( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_with_params GET http://localhost:3000/api/foo/client/client/with-params/:hello

    /** 
        No summary
    */
    pub fn get_with_params( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.post_with_all POST http://localhost:3000/api/foo/client/client/with-all/:hello

    /** 
        No summary
    */
    pub fn post_with_all( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.post_with_body_and_query_using_req_vovk POST http://localhost:3000/api/foo/client/client/with-all-using-req-vovk

    /** 
        No summary
    */
    pub fn post_with_body_and_query_using_req_vovk( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_nested_query GET http://localhost:3000/api/foo/client/client/nested-query

    /** 
        No summary
    */
    pub fn get_nested_query( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.post_with_form_data_using_req_vovk POST http://localhost:3000/api/foo/client/client/form-data

    /** 
        No summary
    */
    pub fn post_with_form_data_using_req_vovk( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_error_response GET http://localhost:3000/api/foo/client/client/error

    /** 
        No summary
    */
    pub fn get_error_response( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_json_text_response GET http://localhost:3000/api/foo/client/client/json-text

    /** 
        No summary
    */
    pub fn get_json_text_response( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_jsonl_response GET http://localhost:3000/api/foo/client/client/jsonl

    /** 
        No summary
    */
    pub fn get_jsonl_response( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // ClientControllerRPC.get_jsonl_text_response GET http://localhost:3000/api/foo/client/client/jsonl-text

    /** 
        No summary
    */
    pub fn get_jsonl_text_response( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod streaming_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // StreamingControllerRPC.post_with_streaming POST http://localhost:3000/api/foo/client/streaming/post-with-streaming

    /** 
        No summary
    */
    pub fn post_with_streaming( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingControllerRPC.post_with_streaming_and_immediate_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-immediate-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_immediate_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingControllerRPC.post_with_streaming_and_delayed_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingControllerRPC.post_with_streaming_and_delayed_custom_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-custom-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_custom_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingControllerRPC.post_with_streaming_and_delayed_unhandled_error POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-unhandled-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_unhandled_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod streaming_generator_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // StreamingGeneratorControllerRPC.get_with_streaming GET http://localhost:3000/api/foo/client/streaming-generator/get-with-streaming

    /** 
        No summary
    */
    pub fn get_with_streaming( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingGeneratorControllerRPC.post_with_async_streaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-async-streaming

    /** 
        No summary
    */
    pub fn post_with_async_streaming( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming

    /** 
        No summary
    */
    pub fn post_with_streaming( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_immediate_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-immediate-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_immediate_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_delayed_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_delayed_custom_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-custom-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_custom_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // StreamingGeneratorControllerRPC.post_with_streaming_and_delayed_unhandled_error POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-unhandled-error

    /** 
        No summary
    */
    pub fn post_with_streaming_and_delayed_unhandled_error( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod custom_schema_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // CustomSchemaControllerRPC.get_with_custom_schema GET http://localhost:3000/api/foo/client//get-with-custom-schema

    /** 
        No summary
    */
    pub fn get_with_custom_schema( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod with_zod_client_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // WithZodClientControllerRPC.handle_all POST http://localhost:3000/api/foo/client/with-zod/all/:foo/:bar
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllQuery {
        pub search: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllParams {
        pub foo: String,
        pub bar: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutput {
        pub body: HandleAllOutputBody,
        pub query: HandleAllOutputQuery,
        pub params: HandleAllOutputParams,
        pub vovkParams: HandleAllOutputVovkParams,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputBody {
        pub hello: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputQuery {
        pub search: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputParams {
        pub foo: String,
        pub bar: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        disable_client_validation: bool,
    ) -> Result<HandleAllOutput, Box<dyn serde::ser::StdError>>{
        
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
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_query GET http://localhost:3000/api/foo/client/with-zod/handle-query
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleQueryQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_query( 
        body: (),
        query: HandleQueryQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_body POST http://localhost:3000/api/foo/client/with-zod/handle-body
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleBodyBody {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_body( 
        body: HandleBodyBody,
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_params PUT http://localhost:3000/api/foo/client/with-zod/x/:foo/:bar/y
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleParamsParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        No summary
    */
    pub fn handle_params( 
        body: (),
        query: (),
        params: HandleParamsParams,

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_nested_query GET http://localhost:3000/api/foo/client/with-zod/handle-nested-query
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQuery {
        pub x: String,
        pub y: Vec<String>,
        pub z: HandleNestedQueryQueryZ,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZ {
        pub f: String,
        pub u: Vec<String>,
        pub d: HandleNestedQueryQueryZD,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZD {
        pub x: String,
        pub arrOfObjects: Vec<HandleNestedQueryQueryZDArrOfObjects>,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjects {
        pub foo: String,
        pub nestedArr: Option<Vec<String>>,
        pub nestedObj: Option<HandleNestedQueryQueryZDArrOfObjectsNestedObj>,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjectsNestedObj {
        pub deepKey: String,
    }
    /** 
        No summary
    */
    pub fn handle_nested_query( 
        body: (),
        query: HandleNestedQueryQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_output GET http://localhost:3000/api/foo/client/with-zod/handle-output
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleOutputQuery {
        pub helloOutput: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleOutputOutput {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_output( 
        body: (),
        query: HandleOutputQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<HandleOutputOutput, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_stream GET http://localhost:3000/api/foo/client/with-zod/handle-stream
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleStreamQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleStreamIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn handle_stream( 
        body: (),
        query: HandleStreamQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Box<dyn Iterator<Item = HandleStreamIteration>>{
        
        let result = http_request_stream::<
                        HandleStreamIteration,
            (),
            HandleStreamQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "handleStream",
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_nothitng POST http://localhost:3000/api/foo/client/with-zod/handle-nothitng

    /** 
        No summary
    */
    pub fn handle_nothitng( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.handle_form_data POST http://localhost:3000/api/foo/client/with-zod/handle-form-data
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleFormDataQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_form_data( 
        body: (),
        query: HandleFormDataQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.disable_server_side_validation_bool POST http://localhost:3000/api/foo/client/with-zod/disable-server-side-validation-bool
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.disable_server_side_validation_strings POST http://localhost:3000/api/foo/client/with-zod/disable-server-side-validation-strings
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.skip_schema_emission_bool POST http://localhost:3000/api/foo/client/with-zod/skip-schema-emission-bool

    /** 
        No summary
    */
    pub fn skip_schema_emission_bool( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.skip_schema_emission_strings POST http://localhost:3000/api/foo/client/with-zod/skip-schema-emission-strings
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct SkipSchemaEmissionStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn skip_schema_emission_strings( 
        body: (),
        query: SkipSchemaEmissionStringsQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithZodClientControllerRPC.validate_every_iteration POST http://localhost:3000/api/foo/client/with-zod/validate-every-iteration
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn validate_every_iteration( 
        body: (),
        query: ValidateEveryIterationQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Box<dyn Iterator<Item = ValidateEveryIterationIteration>>{
        
        let result = http_request_stream::<
                        ValidateEveryIterationIteration,
            (),
            ValidateEveryIterationQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithZodClientControllerRPC",
            "validateEveryIteration",
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod with_yup_client_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // WithYupClientControllerRPC.handle_all POST http://localhost:3000/api/foo/client/with-yup/all/:foo/:bar
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllQuery {
        pub search: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllParams {
        pub foo: String,
        pub bar: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutput {
        pub body: HandleAllOutputBody,
        pub query: HandleAllOutputQuery,
        pub params: HandleAllOutputParams,
        pub vovkParams: HandleAllOutputVovkParams,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputBody {
        pub hello: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputQuery {
        pub search: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllOutputParams {
        pub foo: String,
        pub bar: String,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        disable_client_validation: bool,
    ) -> Result<HandleAllOutput, Box<dyn serde::ser::StdError>>{
        
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
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_query GET http://localhost:3000/api/foo/client/with-yup/handle-query
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleQueryQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_query( 
        body: (),
        query: HandleQueryQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_body POST http://localhost:3000/api/foo/client/with-yup/handle-body
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleBodyBody {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_body( 
        body: HandleBodyBody,
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_params PUT http://localhost:3000/api/foo/client/with-yup/x/:foo/:bar/y
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleParamsParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        No summary
    */
    pub fn handle_params( 
        body: (),
        query: (),
        params: HandleParamsParams,

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_nested_query GET http://localhost:3000/api/foo/client/with-yup/handle-nested-query
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQuery {
        pub x: String,
        pub y: Vec<String>,
        pub z: HandleNestedQueryQueryZ,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZ {
        pub f: String,
        pub u: Vec<String>,
        pub d: HandleNestedQueryQueryZD,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZD {
        pub x: String,
        pub arrOfObjects: Vec<HandleNestedQueryQueryZDArrOfObjects>,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjects {
        pub foo: String,
        pub nestedArr: Option<Vec<String>>,
        pub nestedObj: Option<HandleNestedQueryQueryZDArrOfObjectsNestedObj>,
    }

    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleNestedQueryQueryZDArrOfObjectsNestedObj {
        pub deepKey: Option<String>,
    }
    /** 
        No summary
    */
    pub fn handle_nested_query( 
        body: (),
        query: HandleNestedQueryQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_output GET http://localhost:3000/api/foo/client/with-yup/handle-output
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleOutputQuery {
        pub helloOutput: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleOutputOutput {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_output( 
        body: (),
        query: HandleOutputQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<HandleOutputOutput, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_stream GET http://localhost:3000/api/foo/client/with-yup/handle-stream
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleStreamQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleStreamIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn handle_stream( 
        body: (),
        query: HandleStreamQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Box<dyn Iterator<Item = HandleStreamIteration>>{
        
        let result = http_request_stream::<
                        HandleStreamIteration,
            (),
            HandleStreamQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "handleStream",
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_nothitng POST http://localhost:3000/api/foo/client/with-yup/handle-nothitng

    /** 
        No summary
    */
    pub fn handle_nothitng( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.handle_form_data POST http://localhost:3000/api/foo/client/with-yup/handle-form-data
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleFormDataQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_form_data( 
        body: (),
        query: HandleFormDataQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.disable_server_side_validation_bool POST http://localhost:3000/api/foo/client/with-yup/disable-server-side-validation-bool
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.disable_server_side_validation_strings POST http://localhost:3000/api/foo/client/with-yup/disable-server-side-validation-strings
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.skip_schema_emission_bool POST http://localhost:3000/api/foo/client/with-yup/skip-schema-emission-bool

    /** 
        No summary
    */
    pub fn skip_schema_emission_bool( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.skip_schema_emission_strings POST http://localhost:3000/api/foo/client/with-yup/skip-schema-emission-strings
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct SkipSchemaEmissionStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn skip_schema_emission_strings( 
        body: (),
        query: SkipSchemaEmissionStringsQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithYupClientControllerRPC.validate_every_iteration POST http://localhost:3000/api/foo/client/with-yup/validate-every-iteration
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn validate_every_iteration( 
        body: (),
        query: ValidateEveryIterationQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Box<dyn Iterator<Item = ValidateEveryIterationIteration>>{
        
        let result = http_request_stream::<
                        ValidateEveryIterationIteration,
            (),
            ValidateEveryIterationQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithYupClientControllerRPC",
            "validateEveryIteration",
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod with_dto_client_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // WithDtoClientControllerRPC.handle_all POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllQuery {
        pub search: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleAllParams {
        pub foo: String,
        pub bar: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        disable_client_validation: bool,
    ) -> Result<HandleAllOutput, Box<dyn serde::ser::StdError>>{
        
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
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_all_client POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar/client

    /** 
        No summary
    */
    pub fn handle_all_client( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_query GET http://localhost:3000/api/foo/client/with-dto/handle-query
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleQueryQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_query( 
        body: (),
        query: HandleQueryQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_query_client GET http://localhost:3000/api/foo/client/with-dto/handle-query-client

    /** 
        No summary
    */
    pub fn handle_query_client( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_body POST http://localhost:3000/api/foo/client/with-dto/handle-body
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleBodyBody {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_body( 
        body: HandleBodyBody,
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_body_client POST http://localhost:3000/api/foo/client/with-dto/handle-body-client

    /** 
        No summary
    */
    pub fn handle_body_client( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_params PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleParamsParams {
        pub foo: String,
        pub bar: String,
    }
    /** 
        No summary
    */
    pub fn handle_params( 
        body: (),
        query: (),
        params: HandleParamsParams,

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_params_client PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y/client

    /** 
        No summary
    */
    pub fn handle_params_client( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_nested_query GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        body: (),
        query: HandleNestedQueryQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_nested_query_client GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query-client

    /** 
        No summary
    */
    pub fn handle_nested_query_client( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_output GET http://localhost:3000/api/foo/client/with-dto/handle-output
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleOutputQuery {
        pub helloOutput: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleOutputOutput {
        pub hello: String,
    }
    /** 
        No summary
    */
    pub fn handle_output( 
        body: (),
        query: HandleOutputQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<HandleOutputOutput, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_output_client GET http://localhost:3000/api/foo/client/with-dto/handle-output-client

    /** 
        No summary
    */
    pub fn handle_output_client( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_stream GET http://localhost:3000/api/foo/client/with-dto/handle-stream
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleStreamQuery {
        pub values: Vec<String>,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleStreamIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn handle_stream( 
        body: (),
        query: HandleStreamQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Box<dyn Iterator<Item = HandleStreamIteration>>{
        
        let result = http_request_stream::<
                        HandleStreamIteration,
            (),
            HandleStreamQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "handleStream",
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_nothitng POST http://localhost:3000/api/foo/client/with-dto/handle-nothitng

    /** 
        No summary
    */
    pub fn handle_nothitng( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.handle_form_data POST http://localhost:3000/api/foo/client/with-dto/handle-form-data
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct HandleFormDataQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn handle_form_data( 
        body: (),
        query: HandleFormDataQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.disable_server_side_validation_bool POST http://localhost:3000/api/foo/client/with-dto/disable-server-side-validation-bool
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationBoolBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.disable_server_side_validation_strings POST http://localhost:3000/api/foo/client/with-dto/disable-server-side-validation-strings
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct DisableServerSideValidationStringsBody {
        pub hello: String,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
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
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.skip_schema_emission_bool POST http://localhost:3000/api/foo/client/with-dto/skip-schema-emission-bool

    /** 
        No summary
    */
    pub fn skip_schema_emission_bool( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.skip_schema_emission_strings POST http://localhost:3000/api/foo/client/with-dto/skip-schema-emission-strings
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct SkipSchemaEmissionStringsQuery {
        pub search: String,
    }
    /** 
        No summary
    */
    pub fn skip_schema_emission_strings( 
        body: (),
        query: SkipSchemaEmissionStringsQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
    // WithDtoClientControllerRPC.validate_every_iteration POST http://localhost:3000/api/foo/client/with-dto/validate-every-iteration
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationQuery {
        pub values: Vec<()>,
    }
    #[derive(Debug, Serialize, Deserialize, Clone)]
    #[allow(non_snake_case)]
    pub struct ValidateEveryIterationIteration {
        pub value: String,
    }
    /** 
        No summary
    */
    pub fn validate_every_iteration( 
        body: (),
        query: ValidateEveryIterationQuery,
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Box<dyn Iterator<Item = ValidateEveryIterationIteration>>{
        
        let result = http_request_stream::<
                        ValidateEveryIterationIteration,
            (),
            ValidateEveryIterationQuery,
            ()
        >(
            "http://localhost:3000/api",
            "foo/client",
            "WithDtoClientControllerRPC",
            "validateEveryIteration",
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    
pub mod open_api_controller_rpc {
    pub use crate::http_request::{http_request, http_request_stream};
    pub use serde::{Deserialize, Serialize};

    // OpenApiControllerRPC.get_from_schema GET http://localhost:3000/api/foo/client/openapi/

    /** 
        Hello, World!
    */
    pub fn get_from_schema( 
        body: (),
        query: (),
        params: (),

        api_root: Option<&str>,
        disable_client_validation: bool,
    ) -> Result<serde_json::Value, Box<dyn serde::ser::StdError>>{
        
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
            Some(&body),
            Some(&query),
            Some(&params),

            api_root,
            disable_client_validation,
        );

        result
    }
        
}
    



