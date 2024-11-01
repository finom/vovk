chmod +x ../packages/vovk-cli/dist/index.mjs;
../packages/vovk-cli/dist/index.mjs n segment generated -o;
# No validation
../packages/vovk-cli/dist/index.mjs n c generated/noValidationControllerOnlyEntity -o --template ../packages/vovk-cli/templates/controller.ejs;
../packages/vovk-cli/dist/index.mjs n c s w generated/noValidationControllerServiceAndWorkerEntity -o --templates ../packages/vovk-cli/templates/controller.ejs ../packages/vovk-cli/templates/service.ejs ../packages/vovk-cli/templates/worker.ejs;
# Zod
../packages/vovk-cli/dist/index.mjs n c generated/zodControllerOnlyEntity -o --templates ../packages/vovk-zod/templates/controller.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/zodControllerAndServiceEntity -o --templates ../packages/vovk-zod/templates/controller.ejs ../packages/vovk-cli/templates/service.ejs;
# Yup
../packages/vovk-cli/dist/index.mjs n c generated/yupControllerOnlyEntity -o --templates ../packages/vovk-yup/templates/controller.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/yupControllerAndServiceEntity -o --templates ../packages/vovk-yup/templates/controller.ejs ../packages/vovk-cli/templates/service.ejs;
# DTO
../packages/vovk-cli/dist/index.mjs n c generated/dtoControllerOnlyEntity -o --templates ../packages/vovk-dto/templates/controller.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/dtoControllerAndServiceEntity -o --templates ../packages/vovk-dto/templates/controller.ejs ../packages/vovk-cli/templates/service.ejs;
