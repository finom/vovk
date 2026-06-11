chmod +x ../packages/vovk-cli/dist/index.mjs;
../packages/vovk-cli/dist/index.mjs n segment generated -o;
# No validation
../packages/vovk-cli/dist/index.mjs n c generated/noValidationControllerOnlyEntity -o --template ../packages/vovk-cli/module-templates/type/controller.ts.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/noValidationControllerAndServiceEntity -o --templates ../packages/vovk-cli/module-templates/type/controller.ts.ejs ../packages/vovk-cli/module-templates/type/service.ts.ejs;
# Zod
../packages/vovk-cli/dist/index.mjs n c generated/zodControllerOnlyEntity -o --templates ../packages/vovk-cli/module-templates/zod/controller.ts.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/zodControllerAndServiceEntity -o --templates ../packages/vovk-cli/module-templates/zod/controller.ts.ejs ../packages/vovk-cli/module-templates/type/service.ts.ejs;
# Valibot
../packages/vovk-cli/dist/index.mjs n c generated/valibotControllerOnlyEntity -o --templates ../packages/vovk-cli/module-templates/valibot/controller.ts.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/valibotControllerAndServiceEntity -o --templates ../packages/vovk-cli/module-templates/valibot/controller.ts.ejs ../packages/vovk-cli/module-templates/type/service.ts.ejs;
# Arktype
../packages/vovk-cli/dist/index.mjs n c generated/arktypeControllerOnlyEntity -o --templates ../packages/vovk-cli/module-templates/arktype/controller.ts.ejs;
../packages/vovk-cli/dist/index.mjs n c s generated/arktypeControllerAndServiceEntity -o --templates ../packages/vovk-cli/module-templates/arktype/controller.ts.ejs ../packages/vovk-cli/module-templates/type/service.ts.ejs;

echo "Generated files from templates"