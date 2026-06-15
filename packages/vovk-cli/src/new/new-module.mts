import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import { getTsconfig } from 'get-tsconfig';
import _ from 'lodash';
import type { ProjectInfo } from '../get-project-info/index.mjs';
import { chalkHighlightThing } from '../utils/chalk-highlight-thing.mjs';
import { formatLoggedSegmentName } from '../utils/format-logged-segment-name.mjs';
import { getFileSystemEntryType } from '../utils/get-file-system-entry-type.mjs';
import { locateSegments } from '../utils/locate-segments.mjs';
import { prettify } from '../utils/prettify.mjs';
import { resolveAbsoluteModulePath } from '../utils/resolve-absolute-module-path.mjs';
import { addClassToSegmentCode } from './add-class-to-segment-code.mjs';
import { render } from './render.mjs';

function splitByLast(str: string, delimiter: string = '/'): [string, string] {
  const index = str.lastIndexOf(delimiter);

  if (index === -1) {
    // Delimiter not found; return empty string and the original string
    return ['', str];
  }

  const before = str.substring(0, index);
  const after = str.substring(index + delimiter.length);

  return [before, after];
}

export async function newModule({
  projectInfo,
  what,
  moduleNameWithOptionalSegment,
  dryRun,
  outDir: outDirFlag,
  templates: templatesFlag,
  noSegmentUpdate,
  overwrite,
  empty,
}: {
  projectInfo: ProjectInfo;
  what: string[];
  moduleNameWithOptionalSegment: string;
  dryRun?: boolean;
  outDir?: string;
  templates?: string[];
  noSegmentUpdate?: boolean;
  overwrite?: boolean;
  empty?: boolean;
}) {
  const { config, log, cwd, apiDirAbsolutePath, srcRoot } = projectInfo;
  const segments = await locateSegments({ dir: apiDirAbsolutePath, config, log });
  const isNodeNextResolution = ['node16', 'nodenext'].includes(
    (await getTsconfig(cwd)?.config?.compilerOptions?.moduleResolution?.toLowerCase()) ?? ''
  );
  let templates = config.moduleTemplates as Required<typeof config.moduleTemplates>;
  const [segmentName, moduleName] = splitByLast(moduleNameWithOptionalSegment);
  // replace c by controller, s by service, everything else keeps the same
  what = what.map((s) => {
    switch (s) {
      case 'c':
        return 'controller';
      case 's':
        return 'service';
      default:
        return s;
    }
  });

  if (templatesFlag) {
    if (templatesFlag.length > what.length) {
      throw new Error('Too many templates provided');
    }
    templates = templatesFlag.reduce(
      (acc, templatePath, index) =>
        Object.assign(acc, {
          [what[index]]: templatePath,
        }),
      templates
    );
  }

  for (const type of what) {
    if (!templates[type]) {
      throw new Error(`Template for "${type}" not found`);
    }
  }

  const segment = segments.find((s) => s.segmentName === segmentName);

  if (!segment) {
    log.error(
      `Unable to create module: ${formatLoggedSegmentName(segmentName)} not found. Run ${chalkHighlightThing(`npx vovk new segment${segmentName ? ` ${segmentName}` : ''}`)} to create it`
    );

    return process.exit(1);
  }

  for (const type of what) {
    const templatePath = templates[type];
    if (!templatePath) continue; // suppresses TypeScript error, but it shouldn't happen
    const templateAbsolutePath = resolveAbsoluteModulePath(templatePath, cwd);
    const templateCode = await fs.readFile(templateAbsolutePath, 'utf-8');

    const {
      outDir: renderedOutDir,
      fileName,
      sourceName,
      compiledName,
      code,
    } = await render(templateCode, {
      cwd,
      srcRoot,
      config,
      withService: what.includes('service'),
      segmentName,
      moduleName,
      empty,
      templateFileName: templateAbsolutePath,
      isNodeNextResolution,
    });
    const outDir = outDirFlag ?? renderedOutDir;
    if (!outDir) {
      throw new Error(`The template for "${type}" does not provide a outDir`);
    }

    if (!fileName) {
      throw new Error(`The template for "${type}" does not provide a fileName`);
    }

    const absoluteModuleDir = path.join(cwd, outDir);
    const absoluteModulePath = path.join(absoluteModuleDir, fileName);

    // Pre-kebab-case projects keep modules at e.g. userProfile/UserProfileController.ts; scaffolding
    // user-profile/user-profile-controller.ts next to it would register a duplicate class in the segment.
    const legacySuffix = type === 'controller' ? 'Controller' : type === 'service' ? 'Service' : null;
    if (!outDirFlag && legacySuffix && path.basename(absoluteModuleDir) === _.kebabCase(moduleName)) {
      const legacyModulePath = path.join(
        path.dirname(absoluteModuleDir),
        _.camelCase(moduleName),
        `${_.upperFirst(_.camelCase(moduleName))}${legacySuffix}.ts`
      );
      if (await getFileSystemEntryType(legacyModulePath)) {
        log.error(
          `Found ${chalkHighlightThing(legacyModulePath)} created with the pre-kebab-case naming convention. Rename it to ${chalkHighlightThing(absoluteModulePath)} manually or pass --out-dir to scaffold elsewhere.`
        );

        return process.exit(1);
      }
    }

    const prettiedCode = await prettify(code, absoluteModulePath);

    if (!dryRun) {
      if (!overwrite && (await getFileSystemEntryType(absoluteModulePath))) {
        log.error(
          `File ${chalkHighlightThing(absoluteModulePath)} already exists, skipping this "${chalkHighlightThing(type)}". You can use --overwrite flag to overwrite it.`
        );

        return process.exit(1);
      } else {
        await fs.mkdir(absoluteModuleDir, { recursive: true });
        await fs.writeFile(absoluteModulePath, prettiedCode);
        log.info(
          `${chalk.green('Created')}${empty ? ' empty' : ''} ${chalkHighlightThing(absoluteModulePath)} using ${chalkHighlightThing(`"${type}"`)} template for ${formatLoggedSegmentName(segmentName)}`
        );
      }
    }

    if (type === 'controller') {
      if (!sourceName) {
        throw new Error(`The template for "${type}" does not provide a sourceName`);
      }

      if (!compiledName) {
        throw new Error(`The template for "${type}" does not provide a compiledName`);
      }

      const { routeFilePath } = segment;
      const segmentSourceCode = await fs.readFile(routeFilePath, 'utf-8');
      let importPath = path.relative(`${path.dirname(routeFilePath)}/`, absoluteModulePath).replace(/\.(ts|tsx)$/, '');

      importPath += isNodeNextResolution ? '.ts' : '';

      if (!noSegmentUpdate) {
        const newSegmentCode = await prettify(
          addClassToSegmentCode(segmentSourceCode, {
            sourceName,
            compiledName,
            importPath,
          }),
          routeFilePath
        );
        if (!dryRun) {
          await fs.writeFile(routeFilePath, newSegmentCode);
        }
      }

      log.info(
        `${chalk.green('Added')} ${chalkHighlightThing(sourceName)} ${type} as ${chalkHighlightThing(compiledName)} to ${formatLoggedSegmentName(segmentName)}`
      );
    }
  }
}
