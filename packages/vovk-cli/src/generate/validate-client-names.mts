import type { VovkSchema } from 'vovk';
import { toTypeName } from 'vovk/internal';
import { ROOT_SEGMENT_FILE_NAME } from '../dev/write-one-segment-schema-file.mjs';
import { formatLoggedSegmentName } from '../utils/format-logged-segment-name.mjs';

// a client exports a module as a const, so its name can't be a reserved word
const RESERVED_WORDS = new Set(
  `await break case catch class const continue debugger default delete do else enum export extends false finally for
  function if implements import in instanceof interface let new null package private protected public return static
  super switch this throw true try typeof var void while with yield`.split(/\s+/)
);

const isIdentifier = (name: string) => /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u.test(name) && !RESERVED_WORDS.has(name);

// a mixin can't take "root", the segmented client's folder for the root segment, or the name of a segment or another
// mixin; names compare ignoring case, as folder names do on most file systems
export function validateMixinNames(segmentNames: string[], mixinNames: string[]) {
  const owners = new Map(segmentNames.map((name) => [name.toLowerCase(), formatLoggedSegmentName(name)]));
  const namespaces = new Map<string, string>();
  for (const name of mixinNames) {
    if (!name || name.toLowerCase() === ROOT_SEGMENT_FILE_NAME) {
      throw new Error(`Mixin "${name}" needs another name, the segmented client writes the root segment to "root"`);
    }
    const owner = owners.get(name.toLowerCase());
    if (owner) throw new Error(`Mixin "${name}" needs another name, ${owner} has the same one`);
    owners.set(name.toLowerCase(), formatLoggedSegmentName(name, { segmentType: 'mixin' }));

    const namespace = toTypeName(name);
    const namespaceOwner = namespaces.get(namespace);
    if (namespaceOwner !== undefined) {
      throw new Error(`Mixins "${namespaceOwner}" and "${name}" both declare their types in Mixins.${namespace}`);
    }
    namespaces.set(namespace, name);
  }
}

// a client exports each RPC module of a mixin by its name
export function validateMixinModuleNames(mixinName: string, segment: VovkSchema['segments'][string]) {
  for (const { rpcModuleName } of Object.values(segment.controllers)) {
    if (!isIdentifier(rpcModuleName)) {
      throw new Error(`Mixin "${mixinName}" has RPC module "${rpcModuleName}", which is not a valid identifier`);
    }
  }
}

// the composed client exports every RPC module of its segments by name, so one name can't come from two segments
export function validateComposedModuleNames(fullSchema: VovkSchema, segmentNames: string[]) {
  const describeSegment = (name: string) =>
    formatLoggedSegmentName(name, {
      segmentType: fullSchema.segments[name].segmentType === 'mixin' ? 'mixin' : 'segment',
    });
  const owners = new Map<string, string>();
  for (const segmentName of segmentNames) {
    const segment = fullSchema.segments[segmentName];
    if (!segment?.emitSchema) continue;
    for (const { rpcModuleName } of Object.values(segment.controllers)) {
      const owner = owners.get(rpcModuleName);
      if (owner !== undefined) {
        throw new Error(
          `RPC module "${rpcModuleName}" is in ${describeSegment(owner)} and in ${describeSegment(segmentName)}, but the composed client exports one module per name. Rename one, or exclude a segment from the composed client.`
        );
      }
      owners.set(rpcModuleName, segmentName);
    }
  }
}
