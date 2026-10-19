// The code theme of the site: paper and ink with vermilion keywords, warm tones for the rest. Shiki takes these as
// TextMate themes; next.config.mjs hands them to Nextra. Every color keeps 4.5:1 on the code block's panel color.

const theme = (name, type, c) => ({
  name,
  type,
  colors: { 'editor.background': c.bg, 'editor.foreground': c.text },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
    {
      scope: [
        'keyword',
        'storage',
        'storage.type',
        'storage.modifier',
        'keyword.operator.new',
        'keyword.operator.expression',
        'keyword.control',
        'variable.language',
        'entity.name.command',
        'support.function.builtin.shell',
        'meta.decorator punctuation.decorator',
        'meta.decorator entity.name.function',
        'entity.name.tag',
      ],
      settings: { foreground: c.keyword },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call entity.name.function',
        'constant.other.option',
        'entity.other.attribute-name',
        'support.type.property-name',
        'meta.object-literal.key',
      ],
      settings: { foreground: c.fn },
    },
    {
      scope: ['string', 'punctuation.definition.string', 'string.unquoted.argument', 'markup.inline.raw'],
      settings: { foreground: c.string },
    },
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character',
        'support.constant',
        'variable.other.constant',
      ],
      settings: { foreground: c.number },
    },
    {
      scope: [
        'entity.name.type',
        'support.type',
        'support.class',
        'entity.name.class',
        'entity.other.inherited-class',
        'entity.name.namespace',
      ],
      settings: { foreground: c.type },
    },
    { scope: ['markup.heading', 'markup.bold'], settings: { foreground: c.keyword, fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['markup.inserted'], settings: { foreground: c.fn } },
    { scope: ['markup.deleted'], settings: { foreground: c.keyword } },
  ],
});

export const vovkPaper = theme('vovk-paper', 'light', {
  bg: '#FAF9F6',
  text: '#111111',
  keyword: '#B62000',
  fn: '#9A3412',
  string: '#6E5310',
  number: '#8A4B08',
  type: '#7B3F61',
  comment: '#6F6A62',
});

export const vovkInk = theme('vovk-ink', 'dark', {
  bg: '#1B1B19',
  text: '#D6D2C9',
  keyword: '#E5795E',
  fn: '#D69A5E',
  string: '#BFA26A',
  number: '#CDAE7A',
  type: '#C69AAE',
  comment: '#8A857C',
});
