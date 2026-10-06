import fs from 'node:fs/promises';
import { createRequire, isBuiltin } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import TOML from '@iarna/toml';
import ejs from 'ejs';
import _ from 'lodash';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { PackageJson } from 'type-fest';
import type { VovkSchema } from 'vovk';
import {
  createCodeSamples,
  reattachMixinDefs,
  toUnderscoredPackageName,
  type VovkPackageJson,
  type VovkReadmeConfig,
  type VovkSamplesConfig,
  VovkSchemaIdEnum,
  type VovkStrictConfig,
} from 'vovk/internal';
import * as YAML from 'yaml';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/write-one-segment-schema-file.mjs';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { compileJSONSchemaToTypeScriptType } from '../utils/compile-json-schema-to-typescript-type.mjs';
import { GENERATED_BANNER_PREFIX, hasGeneratedBanner } from '../utils/generated-banner.mjs';
import { getJSONImportAttributes } from '../utils/get-ts-import-options.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { prettify, warnIfPrettierMissing } from '../utils/prettify.mjs';
import { toImportPath, toPosixPath } from '../utils/to-import-path.mjs';
import type { ClientTemplateFile } from './get-client-template-files.mjs';
import { getTemplateClientImports } from './get-template-client-imports.mjs';

// a module a template names in its front matter comes from the project, a global or npx vovk-cli can't reach it;
// vovk itself stays the CLI's own, which the built-in templates expect
async function importTemplateModule(specifier: string, cwd: string): Promise<unknown> {
  let resolved: string | undefined;
  if (!isBuiltin(specifier) && !/^vovk(\/|$)/.test(specifier)) {
    try {
      resolved = createRequire(path.join(cwd, 'package.json')).resolve(specifier);
    } catch {
      // not in the project
    }
  }
  return import(resolved ? pathToFileURL(resolved).href : specifier);
}

// a template's own client options extend the root ones
export function getOutputConfigs(
  config: VovkStrictConfig,
  templateDef: VovkStrictConfig['clientTemplateDefs'][string],
  configKey: 'composedClient' | 'segmentedClient'
) {
  return [
    config[configKey].outputConfig ?? {},
    templateDef[configKey]?.outputConfig ?? {},
    templateDef.outputConfig ?? {},
  ];
}

// a template is warned about once per process, as vovk dev generates again and again
const templatesWithoutOrigin = new Set<string>();

const getUnderscoredPackageName = (packageJson: VovkPackageJson, packageNameKey?: 'py_name' | 'rs_name') =>
  (packageNameKey && packageJson[packageNameKey]) || toUnderscoredPackageName(packageJson.name);

export function normalizeOutTemplatePath(
  out: string,
  packageJson: VovkPackageJson,
  packageNameKey?: 'py_name' | 'rs_name'
): string {
  return out.replace('[package_name]', getUnderscoredPackageName(packageJson, packageNameKey));
}

// a segmented client puts a package into each segment folder, so each one needs a name of its own;
// a name set in the segment's own config is used as is
export function withSegmentPackageName<T extends VovkPackageJson>(
  packageJson: T,
  segmentName: string,
  segmentPackageJson: VovkPackageJson = {}
): T {
  const suffix = (segmentName || ROOT_SEGMENT_FILE_NAME).replace(/\//g, '-');
  const result = { ...packageJson };
  if (packageJson.name && !segmentPackageJson.name) result.name = `${packageJson.name}-${suffix}`;
  for (const key of ['py_name', 'rs_name'] as const) {
    const name = packageJson[key];
    if (name && !segmentPackageJson[key]) result[key] = toUnderscoredPackageName(`${name}-${suffix}`);
  }
  return result;
}

export interface ClientFile {
  templateName: string;
  outPath: string;
  content: string;
  // null when there is no file yet
  existingContent: string | null;
  needsWriting: boolean;
}

// renders a file without writing it, writeClientFiles writes them all once none would replace a file vovk-cli didn't write
export async function renderOneClientFile({
  cwd,
  projectInfo,
  clientTemplateFile,
  fullSchema,
  prettifyClient,
  segmentName,
  templateContent,
  matterResult: { data, content },
  openAPIObject,
  package: packageJson,
  readme,
  samples,
  reExports,
  isEnsuringClient,
  outCwdRelativeDir,
  templateDef,
  locatedSegments,
  isNodeNextResolution,
  tsExtension,
  tsModule,
  hasMixins,
  isVovkProject,
  vovkCliPackage,
  isBundle,
  origin,
  configKey,
  cliSchemaPath,
  projectConfig,
}: {
  cwd: string;
  projectInfo: ProjectInfo;
  clientTemplateFile: ClientTemplateFile;
  fullSchema: VovkSchema;
  prettifyClient: boolean;
  segmentName: string | null; // null for composed client
  templateContent: string;
  matterResult: {
    data: {
      imports?: string[];
    };
    content: string;
  };
  openAPIObject: OpenAPIObject;
  package: VovkPackageJson;
  readme: VovkReadmeConfig;
  samples: VovkSamplesConfig;
  reExports: VovkStrictConfig['outputConfig']['reExports'];
  isEnsuringClient: boolean;
  outCwdRelativeDir: string;
  templateDef: VovkStrictConfig['clientTemplateDefs'][string];
  locatedSegments: Segment[];
  isNodeNextResolution: boolean;
  tsExtension: string;
  tsModule: string | undefined;
  hasMixins: boolean;
  isVovkProject: boolean;
  vovkCliPackage: PackageJson;
  isBundle: boolean;
  origin: string | null;
  configKey: 'composedClient' | 'segmentedClient';
  cliSchemaPath: string | null;
  projectConfig: VovkStrictConfig;
}) {
  const { config, log } = projectInfo;

  const { templateName, templateFilePath, relativeDir, packageNameKey } = clientTemplateFile;
  const locatedSegmentsByName = _.keyBy(locatedSegments, 'segmentName');
  // a segmented client renders a whole client into each segment folder, required templates included
  const segmentDir = typeof segmentName === 'string' ? segmentName || ROOT_SEGMENT_FILE_NAME : '';
  const outDir = path.resolve(
    cwd,
    normalizeOutTemplatePath(path.join(outCwdRelativeDir, segmentDir, relativeDir), packageJson, packageNameKey)
  );
  const outPath = path.join(outDir, path.basename(templateFilePath).replace('.ejs', ''));

  let placeholder = templateFilePath.endsWith('.json.ejs')
    ? ''
    : `// This is a temporary placeholder to avoid compilation errors if client is imported before it's generated.
// If you still see this text, the client is not generated yet because of an unknown problem.
// Feel free to report an issue at https://github.com/finom/vovk/issues`;

  placeholder = outPath.endsWith('.py') ? placeholder.replace(/\/\//g, '#') : placeholder;

  const getFirstLineBanner = (type: 'html' | 'sh' | 'c' = 'c') => {
    // no timestamp: regenerating unchanged sources must not change committed files
    const text = `${GENERATED_BANNER_PREFIX} v${vovkCliPackage.version}`;
    switch (type) {
      case 'html':
        return `<!-- ${text} -->`;
      case 'sh':
        return `# ${text}`;
      case 'c':
        return `// ${text}`;
    }
  };

  reExports = _.mapValues(reExports ?? {}, (p) =>
    p.startsWith('.') ? toImportPath(path.relative(outDir, path.resolve(cwd, p))) : p
  );

  // Data for the EJS templates:
  const t = {
    _,
    hasMixins,
    isVovkProject,
    package: packageJson,
    underscoredPackageName: getUnderscoredPackageName(packageJson, packageNameKey),
    readme,
    samples,
    reExports,
    openapi: openAPIObject,
    ROOT_SEGMENT_FILE_NAME,
    apiRoot: origin ? `${origin}/${config.rootEntry}` : undefined,
    imports: {} as Record<string, unknown>,
    schema: fullSchema,
    config: projectConfig,
    VovkSchemaIdEnum,
    createCodeSamples,
    compileJSONSchemaToTypeScriptType,
    reattachMixinDefs,
    YAML,
    TOML,
    getFirstLineBanner,
    nodeNextResolutionExt: {
      ts: isNodeNextResolution ? tsExtension : '',
      js: isNodeNextResolution ? '.js' : '',
      mjs: isNodeNextResolution ? '.mjs' : '',
    },
    jsonImportAttributes: await getJSONImportAttributes(tsModule, outPath),
    schemaOutDir: toPosixPath(path.relative(outDir, path.resolve(cwd, cliSchemaPath ?? config.schemaOutDir))),
    // a segmented client sits one folder deeper, so its relative imports are resolved from there
    commonImports: (({ composedClient, segmentedClient }) =>
      typeof segmentName === 'string' ? (segmentedClient[segmentName] ?? composedClient) : composedClient)(
      getTemplateClientImports({
        config: projectConfig,
        fullSchema,
        isBundle,
        outCwdRelativeDir,
        relativeDir,
        segmentName,
        outputConfigs: getOutputConfigs(projectConfig, templateDef, configKey),
      })
    ),
    segmentImports: Object.fromEntries(
      Object.values(fullSchema.segments).map(({ segmentName: sName }) => {
        const clientImports = getTemplateClientImports({
          config: projectConfig,
          fullSchema,
          segmentName: sName,
          isBundle,
          outCwdRelativeDir,
          relativeDir,
          outputConfigs: getOutputConfigs(projectConfig, templateDef, configKey),
        });
        const imports =
          configKey === 'composedClient' ? clientImports.composedClient : clientImports.segmentedClient[sName];

        return [sName, imports];
      })
    ),
    segmentMeta: Object.fromEntries(
      Object.values(fullSchema.segments).map(({ segmentName: sName, forceApiRoot }) => {
        const { routeFilePath = null } = locatedSegmentsByName[sName] ?? {};
        const segmentImportPath = routeFilePath
          ? toImportPath(path.relative(outDir, path.resolve(cwd, routeFilePath)))
          : null;
        const segmentConfig = {
          ...config.outputConfig.segments?.[sName],
        };
        const { origin: segmentConfigOrigin, rootEntry: segmentConfigRootEntry, segmentNameOverride } = segmentConfig;

        return [
          sName,
          {
            forceApiRoot:
              forceApiRoot ??
              (segmentConfigOrigin || segmentConfigRootEntry
                ? `${segmentConfigOrigin ?? origin}/${segmentConfigRootEntry ?? config.rootEntry}`
                : null),
            routeFilePath,
            segmentImportPath,
            segmentNameOverride,
          },
        ];
      })
    ),
  };

  // a Python or Rust client sends every call to the root it's generated with, a relative one can't be sent;
  // a README imports the same package for its names but sends nothing
  const isPythonOrRust =
    /\.(py|rs)$/.test(outPath) && data.imports?.some((imp) => imp === 'vovk-python' || imp === 'vovk-rust');
  if (isPythonOrRust && !templatesWithoutOrigin.has(templateName)) {
    const hasSegmentWithoutOrigin = Object.values(fullSchema.segments).some(
      ({ segmentName: sName, segmentType, controllers }) =>
        segmentType !== 'mixin' &&
        !_.isEmpty(controllers) &&
        !/^[a-z][a-z\d+.-]*:\/\//i.test(t.segmentMeta[sName]?.forceApiRoot ?? t.apiRoot ?? '')
    );
    if (hasSegmentWithoutOrigin) {
      templatesWithoutOrigin.add(templateName);
      log.warn(
        `The "${templateName}" template writes a client without an origin, so its calls can't be sent. Set outputConfig.origin, or pass api_root to every call.`
      );
    }
  }

  if (Array.isArray(data.imports)) {
    for (const imp of data.imports) {
      t.imports[imp] = await importTemplateModule(imp, cwd);
    }
  }

  let rendered = templateFilePath.endsWith('.ejs')
    ? await ejs.render(
        content,
        { t },
        {
          filename: templateFilePath,
          async: true,
        }
      )
    : templateContent;

  if (prettifyClient) {
    await warnIfPrettierMissing(log);
    rendered = await prettify(rendered, outPath);
  }

  if (isEnsuringClient) {
    rendered = `${rendered}\n\n${placeholder}`;
  }

  const existingContent = await fs.readFile(outPath, 'utf-8').catch(() => null);

  // a placeholder never replaces a generated file
  const needsWriting = isEnsuringClient ? !existingContent : existingContent !== rendered;

  return {
    templateName: clientTemplateFile.templateName,
    outPath,
    content: rendered,
    existingContent,
    needsWriting,
  } satisfies ClientFile;
}

// the files that would replace one vovk-cli can't tell it generated: it stamps every file that can hold a comment,
// and JSON counts as generated beside a file that carried the stamp before this run
export function findForeignClientFiles(clientFiles: ClientFile[]): string[] {
  const dirsWithStampedFiles = new Set<string>();
  const dirsStampedBefore = new Set<string>();
  for (const { outPath, content, existingContent } of clientFiles) {
    if (hasGeneratedBanner(content)) dirsWithStampedFiles.add(path.dirname(outPath));
    if (existingContent && hasGeneratedBanner(existingContent)) dirsStampedBefore.add(path.dirname(outPath));
  }

  return clientFiles
    .filter(({ outPath, content, existingContent, needsWriting }) => {
      if (!needsWriting || !existingContent?.trim() || hasGeneratedBanner(existingContent)) return false;
      if (hasGeneratedBanner(content)) return true;
      // a file copied as is, or from a custom template without the stamp, leaves nothing to check
      const dir = path.dirname(outPath);
      return path.extname(outPath) === '.json' && dirsWithStampedFiles.has(dir) && !dirsStampedBefore.has(dir);
    })
    .map(({ outPath }) => outPath);
}

export async function writeClientFiles(
  clientFiles: ClientFile[],
  { cwd, log, force = false }: { cwd: string; log: ProjectInfo['log']; force?: boolean }
) {
  // two templates that write one file would overwrite each other
  const templateNames = new Map<string, string>();
  for (const { outPath, templateName } of clientFiles) {
    const otherTemplateName = templateNames.get(outPath) ?? templateName;
    if (otherTemplateName !== templateName) {
      throw new Error(
        `Templates "${otherTemplateName}" and "${templateName}" both write ${path.relative(cwd, outPath)}. Give them separate output directories.`
      );
    }
    templateNames.set(outPath, templateName);
  }

  const foreignFiles = force ? [] : findForeignClientFiles(clientFiles);

  if (foreignFiles.length) {
    const them = foreignFiles.length === 1 ? 'it' : 'them';
    throw new Error(
      `Refusing to overwrite ${foreignFiles.length === 1 ? 'a file' : 'files'} that vovk-cli did not generate: ${foreignFiles.map((file) => path.relative(cwd, file)).join(', ')}. Move or delete ${them}, or run "vovk generate --force" to replace ${them}.`
    );
  }

  await Promise.all(
    clientFiles
      .filter(({ needsWriting }) => needsWriting)
      .map(async ({ outPath, content, existingContent }) => {
        log.debug(`Writing file: ${chalkHighlightThing(outPath)} ${existingContent ? '(updated)' : '(new)'}`);
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, content, 'utf-8');
      })
  );
}
