import { type VovkRequest } from 'vovk';
import { ComplainingDto, HandleAllBodyDto, HandleAllOutputDto, HandleAllParamsDto, HandleAllQueryDto, HandleBodyBodyDto, HandleNestedQueryDto, HandleOutputOutputDto, HandleOutputQueryDto, HandleParamsDto, HandleQueryQueryDto, HandleStreamQueryDto, IterationDto, QueryValuesDto } from './WithDtoClientController.dto';
export default class WithDtoClientController {
    static handleAll: ((req: VovkRequest<HandleAllBodyDto, HandleAllQueryDto, HandleAllParamsDto>, params: HandleAllParamsDto) => Promise<{
        body: HandleAllBodyDto;
        query: HandleAllQueryDto;
        params: HandleAllParamsDto;
        vovkParams: HandleAllParamsDto;
    }>) & {
        __output: HandleAllOutputDto;
        __iteration: any;
    };
    static handleNestedQuery: ((req: VovkRequest<any, HandleNestedQueryDto, any>) => HandleNestedQueryDto) & {
        __output: any;
        __iteration: any;
    };
    static handleNestedQueryClient: (req: VovkRequest<never, HandleNestedQueryDto>) => Promise<any>;
    static handleOutput: ((req: VovkRequest<any, HandleOutputQueryDto, any>) => Promise<{
        hello: "world";
    }>) & {
        __output: HandleOutputOutputDto;
        __iteration: any;
    };
    static handleOutputClient: (req: VovkRequest<never, HandleOutputQueryDto>) => Promise<any>;
    static handleStream: ((req: VovkRequest<any, HandleStreamQueryDto, any>) => AsyncGenerator<{
        value: string;
    }, void, unknown>) & {
        __output: any;
        __iteration: IterationDto;
    };
    static handleSchemaComplaints: ((req: VovkRequest<ComplainingDto, any, any>) => Promise<ComplainingDto>) & {
        __output: any;
        __iteration: any;
    };
    static handleNothitng: (() => Promise<{
        readonly nothing: "here";
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleFormData: ((req: VovkRequest<FormData, HandleQueryQueryDto, any>) => Promise<{
        formData: {
            hello: "world";
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static disableServerSideValidationBool: ((req: VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
        body: HandleBodyBodyDto;
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static disableServerSideValidationStrings: ((req: VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
        body: HandleBodyBodyDto;
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static skipSchemaEmissionBool: ((req: VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
        body: HandleBodyBodyDto;
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static skipSchemaEmissionStrings: ((req: VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
        body: HandleBodyBodyDto;
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static validateEachIteration: ((req: VovkRequest<any, QueryValuesDto, any>) => AsyncGenerator<{
        value: string;
    }, void, unknown>) & {
        __output: any;
        __iteration: IterationDto;
    };
    static handleAllClient: (req: VovkRequest<HandleAllBodyDto, HandleAllQueryDto>, params: HandleAllParamsDto) => Promise<HandleAllOutputDto>;
    static handleQuery: ((req: VovkRequest<any, HandleQueryQueryDto, any>) => HandleQueryQueryDto) & {
        __output: any;
        __iteration: any;
    };
    static handleQueryClient: (req: VovkRequest<never, HandleQueryQueryDto>) => Promise<any>;
    static handleBody: ((req: VovkRequest<HandleBodyBodyDto, any, any>) => Promise<HandleBodyBodyDto>) & {
        __output: any;
        __iteration: any;
    };
    static handleBodyClient: (req: VovkRequest<HandleBodyBodyDto>) => Promise<any>;
    static handleParams: ((req: VovkRequest<any, any, HandleParamsDto>) => Promise<HandleParamsDto>) & {
        __output: any;
        __iteration: any;
    };
    static handleParamsClient: (_req: VovkRequest, params: HandleParamsDto) => Promise<any>;
}
