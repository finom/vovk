import fs from 'node:fs/promises';
import path from 'node:path';
import TOML from '@iarna/toml';
import ejs from 'ejs';
import _ from 'lodash';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { PackageJson } from 'type-fest';
import type { VovkSchema } from 'vovk';
import {
  createCodeSamples,
  reattachMixinDefs,
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
import { GENERATED_BANNER_PREFIX } from '../utils/generated-banner.mjs';
import type { Segment } from '../utils/locate-segments.mjs';
import { prettify, warnIfPrettierMissing } from '../utils/prettify.mjs';
import { toImportPath, toPosixPath } from '../utils/to-import-path.mjs';
import type { ClientTemplateFile } from './get-client-template-files.mjs';
import { getTemplateClientImports } from './get-template-client-imports.mjs';

// Python and Rust keywords, neither language takes one as a module or package name
const KEYWORDS = new Set(
  `False None True and as assert async await break class continue def del elif else except finally for from global if
  import in is lambda nonlocal not or pass raise return try while with yield abstract become box const crate do dyn
  enum extern false final fn gen impl let loop macro match mod move mut override priv pub ref self Self static struct
  super trait true type typeof unsafe unsized use virtual where`.split(/\s+/)
);

// a valid Python import name and Cargo package name: "@acme/web-app" becomes "acme_web_app"
export function toUnderscoredPackageName(name: string | undefined): string {
  const underscored = name?.replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '_') || 'my_package_name';
  if (/^\d/.test(underscored)) return `pkg_${underscored}`;
  return KEYWORDS.has(underscored) ? `${underscored}_pkg` : underscored;
}

export function normalizeOutTemplatePath(out: string, packageJson: PackageJson): string {
  return out.replace('[package_name]', toUnderscoredPackageName(packageJson.name));
}

// a segmented client puts a package into each segment folder, so each one needs a name of its own
export function withSegmentPackageName<T extends PackageJson>(packageJson: T, segmentName: string): T {
  if (!packageJson.name) return packageJson;
  return { ...packageJson, name: `${packageJson.name}-${(segmentName || ROOT_SEGMENT_FILE_NAME).replace(/\//g, '-')}` };
}

export async function writeOneClientFile({
  cwd,
  projectInfo,
  clientTemplateFile,
  fullSchema,
  prettifyClient,
  segmentName,
  // imports,
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
  // imports: ClientImports;
  templateContent: string;
  matterResult: {
    data: {
      imports?: string[];
    };
    content: string;
  };
  openAPIObject: OpenAPIObject;
  package: PackageJson;
  readme: VovkReadmeConfig;
  samples: VovkSamplesConfig;
  reExports: VovkStrictConfig['outputConfig']['reExports'];
  isEnsuringClient: boolean;
  outCwdRelativeDir: string;
  templateDef: VovkStrictConfig['clientTemplateDefs'][string];
  locatedSegments: Segment[];
  isNodeNextResolution: boolean;
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

  const { templateFilePath, relativeDir } = clientTemplateFile;
  const locatedSegmentsByName = _.keyBy(locatedSegments, 'segmentName');
  // a segmented client renders a whole client into each segment folder, required templates included
  const segmentDir = typeof segmentName === 'string' ? segmentName || ROOT_SEGMENT_FILE_NAME : '';
  const outDir = path.resolve(
    cwd,
    normalizeOutTemplatePath(path.join(outCwdRelativeDir, segmentDir, relativeDir), packageJson)
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
    _, // lodash
    hasMixins,
    isVovkProject,
    package: packageJson,
    underscoredPackageName: toUnderscoredPackageName(packageJson.name),
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
      ts: isNodeNextResolution ? '.ts' : '',
      js: isNodeNextResolution ? '.js' : '',
      mjs: isNodeNextResolution ? '.mjs' : '',
    },
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
        outputConfigs: [projectConfig[configKey].outputConfig ?? {}, templateDef.outputConfig ?? {}],
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
          outputConfigs: [projectConfig[configKey].outputConfig ?? {}, templateDef.outputConfig ?? {}],
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
          // ...templateDef.outputConfig?.segments?.[sName],
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

  if (Array.isArray(data.imports)) {
    for (const imp of data.imports) {
      t.imports[imp] = await import(imp);
    }
  }

  // Render the template
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

  // Optionally prettify
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

  if (needsWriting) {
    log.debug(`Writing file: ${chalkHighlightThing(outPath)} ${existingContent ? '(updated)' : '(new)'}`);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, rendered, 'utf-8');
  }

  return { written: needsWriting, content: rendered };
}
