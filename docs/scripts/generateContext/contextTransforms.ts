// --- Code-block-aware processing helper ---

function processOutsideCode(content: string, fn: (text: string) => string): string {
  const parts: string[] = [];
  const codeBlockRegex = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: intentional
  while ((match = codeBlockRegex.exec(content)) !== null) {
    parts.push(fn(content.slice(lastIndex, match.index)));
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  parts.push(fn(content.slice(lastIndex)));
  return parts.join('');
}

// --- FileTree conversion ---

function extractFileTreeName(block: string, startIndex: number): { name: string; endIndex: number } {
  const nameAttr = block.indexOf('name=', startIndex);
  if (nameAttr === -1) return { name: '???', endIndex: startIndex };

  const afterEquals = nameAttr + 5;

  if (block[afterEquals] === '"') {
    const closeQuote = block.indexOf('"', afterEquals + 1);
    return { name: block.slice(afterEquals + 1, closeQuote), endIndex: closeQuote + 1 };
  }

  if (block[afterEquals] === '{') {
    let depth = 1;
    let i = afterEquals + 1;
    while (i < block.length && depth > 0) {
      if (block[i] === '{') depth++;
      else if (block[i] === '}') depth--;
      i++;
    }
    const jsxContent = block.slice(afterEquals + 1, i - 1);
    const text = jsxContent
      .replace(/<[^>]+>/g, '')
      .replace(/\{'\s*'\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { name: text, endIndex: i };
  }

  return { name: '???', endIndex: startIndex };
}

function convertFileTreeBlock(block: string): string {
  const lines: string[] = [];
  let depth = 0;
  let pos = 0;

  while (pos < block.length) {
    const folderOpen = block.indexOf('<FileTree.Folder', pos);
    const folderClose = block.indexOf('</FileTree.Folder>', pos);
    const fileTag = block.indexOf('<FileTree.File', pos);

    const candidates = [
      folderOpen !== -1 ? { type: 'folder-open' as const, index: folderOpen } : null,
      folderClose !== -1 ? { type: 'folder-close' as const, index: folderClose } : null,
      fileTag !== -1 ? { type: 'file' as const, index: fileTag } : null,
    ]
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.index - b.index);

    if (candidates.length === 0) break;

    const next = candidates[0];

    switch (next.type) {
      case 'folder-open': {
        const { name, endIndex } = extractFileTreeName(block, next.index);
        lines.push(`${'  '.repeat(depth) + name}/`);
        depth++;
        const tagEnd = block.indexOf('>', endIndex);
        pos = tagEnd + 1;
        break;
      }
      case 'folder-close': {
        depth = Math.max(0, depth - 1);
        pos = next.index + '</FileTree.Folder>'.length;
        break;
      }
      case 'file': {
        const { name, endIndex } = extractFileTreeName(block, next.index);
        lines.push('  '.repeat(depth) + name);
        const selfClose = block.indexOf('/>', endIndex);
        pos = selfClose + 2;
        break;
      }
    }
  }

  return `\`\`\`\n${lines.join('\n')}\n\`\`\``;
}

export function convertFileTrees(content: string): string {
  return content.replace(/<FileTree>[\s\S]*?<\/FileTree>/g, (match) => convertFileTreeBlock(match));
}

// --- Image conversion ---

export function convertImages(content: string): string {
  return content.replace(/<(?:img|Image)\s+([^>]*)\/>/g, (_match, attrs: string) => {
    const srcMatch = attrs.match(/src=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/);
    const altMatch = attrs.match(/alt=(?:"([^"]*)"|'([^']*)')/);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? '';
    const alt = altMatch?.[1] ?? altMatch?.[2] ?? '';
    return `![${alt}](${src})`;
  });
}

// --- IFrame → Link conversion ---

export function convertIFrames(content: string): string {
  // Self-closing: <IFrame src="..." />
  let result = content.replace(/<IFrame\s+([^>]*)\/>/g, (_match, attrs: string) => {
    const srcMatch = attrs.match(/src=(?:"([^"]*)"|'([^']*)')/);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? '';
    return src ? `Link: ${src}` : '';
  });
  // With children: <IFrame src="...">...</IFrame>
  result = result.replace(/<IFrame\s+([^>]*)>[\s\S]*?<\/IFrame>/g, (_match, attrs: string) => {
    const srcMatch = attrs.match(/src=(?:"([^"]*)"|'([^']*)')/);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? '';
    return src ? `Link: ${src}` : '';
  });
  return result;
}

// --- Youtube → YouTube: link conversion ---

export function convertYoutube(content: string): string {
  return content.replace(/<Youtube\s+([^>]*)\/>/g, (_match, attrs: string) => {
    const srcMatch = attrs.match(/src=(?:"([^"]*)"|'([^']*)')/);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? '';
    return src ? `YouTube: ${src}` : '';
  });
}

// --- video → Video: link conversion ---

export function convertVideo(content: string): string {
  return content.replace(/<video\s+([^>]*)\/>/g, (_match, attrs: string) => {
    const srcMatch = attrs.match(/src=(?:"([^"]*)"|'([^']*)')/);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? '';
    if (!src) return '';
    return `Video: ${src.startsWith('/') ? `https://vovk.dev${src}` : src}`;
  });
}

// --- Remove JSX components entirely (tags + content) ---

const REMOVED_COMPONENTS =
  'NoSSR|Asciinema|CodeOrbit|DocIndexCards|PollExample|ColdStartChart|JSONLinesExample|ProgressiveExample|AppAlike';

export function removeJsxComponents(content: string): string {
  // Self-closing: <Component ... />
  let result = content.replace(new RegExp(`<(?:${REMOVED_COMPONENTS})\\s[^>]*/>`, 'g'), '');
  // With children: <Component ...>...</Component>
  result = result.replace(
    new RegExp(`<(?:${REMOVED_COMPONENTS})(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:${REMOVED_COMPONENTS})>`, 'g'),
    ''
  );
  return result;
}

// --- JSX component unwrapping (remove tags, keep content) ---

export function unwrapJsxComponents(content: string): string {
  return content.replace(/<\/?(?:Steps|Tabs|Tabs\.Tab|Callout)(?:\s[^>]*)?>/g, '');
}

// --- Remove shield badges ---

export function removeShieldBadges(content: string): string {
  // Standalone badge lines: ![alt](https://img.shields.io/...)
  // Also handle linked badges: [![alt](badge-url)](link-url)
  return content.replace(
    /!?\[!?\[[^\]]*\]\(https:\/\/img\.shields\.io\/[^)]*\)\]\([^)]*\)|!\[[^\]]*\]\(https:\/\/img\.shields\.io\/[^)]*\)/g,
    ''
  );
}

// --- Resolve relative/absolute links to full URLs ---

export function resolveLinks(content: string): string {
  const BASE_URL = 'https://vovk.dev';
  // Markdown links and images: [text](/path) or ![alt](/path)
  return content.replace(/(!?\[[^\]]*\])\(\/([^)]*)\)/g, `$1(${BASE_URL}/$2)`);
}

// --- HTML tag stripping ---

export function removeHtmlTags(text: string): string {
  return text.replace(/<\/?[a-z][a-z0-9]*(?:\s[\s\S]*?)?\/?\s*>/g, '');
}

export function stripHtmlTagsOutsideCode(content: string): string {
  const result = processOutsideCode(content, removeHtmlTags);
  return result.replace(/^[^\S\n]+$/gm, '').replace(/\n{3,}/g, '\n\n');
}

// --- Strip imports outside code blocks ---

export function stripImportsOutsideCode(content: string): string {
  return processOutsideCode(content, (text) => text.replace(/^import\s+.*$/gm, ''));
}

// --- Main transform pipeline ---

export function transformContent(content: string): string {
  let result = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  result = stripImportsOutsideCode(result);
  result = convertFileTrees(result);
  result = convertImages(result);
  result = convertIFrames(result);
  result = convertYoutube(result);
  result = convertVideo(result);
  result = removeJsxComponents(result);
  result = unwrapJsxComponents(result);
  result = removeShieldBadges(result);
  result = stripHtmlTagsOutsideCode(result);
  result = resolveLinks(result);
  return result.trim();
}
