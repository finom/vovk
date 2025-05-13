// auto-generated 2025-05-13T08:57:21.085Z
/* eslint-disable */
import config from './../.vovk-schema/config.json' with { type: "json" };

import segment0 from './../.vovk-schema/segments/foo/client.json' with { type: "json" };

import segment1 from './../.vovk-schema/segments/generated.json' with { type: "json" };

const segments = {
  'foo/client': segment0,
  'generated': segment1,
};

export const fullSchema = {
  $schema: 'https://vovk.dev/api/schema/v3/full.json',
  config,
  segments,
};