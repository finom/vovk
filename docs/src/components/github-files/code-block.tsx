import { Code } from 'bright';

interface Props {
  lineNumbers?: boolean;
  className?: string;
  children: string;
  highlightLines?: number[];
  cutLines?: (number | [number, number])[];
}

Code.theme = {
  dark: 'github-dark',
  light: 'github-light',
};

const highlight = {
  name: 'highlight',
  MultilineAnnotation: ({ children }: { children: React.ReactNode }) => {
    return <span className="block dark:bg-[#d1edff33] bg-[#d1edff80]">{children}</span>;
  },
};

const cutLinesByRanges = (code: string, cutLines: (number | [number, number])[]): string => {
  const lines = code.split('\n');
  const linesToCut = new Set<number>();

  cutLines.forEach((item) => {
    if (typeof item === 'number') {
      linesToCut.add(item);
    } else {
      const [start, end] = item;
      for (let i = start; i <= end; i++) {
        linesToCut.add(i);
      }
    }
  });

  return lines.filter((_, index) => !linesToCut.has(index + 1)).join('\n');
};

const CodeBlock = ({ lineNumbers, className, children, highlightLines, cutLines }: Props) => {
  children = cutLines?.length ? cutLinesByRanges(children, cutLines) : children;
  children = highlightLines?.length ? `// highlight(${highlightLines.join(',')})\n${children}` : children;
  const lines = children.split('\n');
  const maxSpaces = lines.reduce((max, line) => {
    if (line.trim().length === 0) {
      return max;
    }
    const spaces = line.match(/^ */)?.[0].length ?? 0;
    return Math.min(max, spaces);
  }, 100);
  const newLines = lines.map((line) => line.slice(maxSpaces));

  if (newLines[0].trim().length === 0) {
    newLines.shift();
  }

  if (newLines[newLines.length - 1].trim().length === 0) {
    newLines.pop();
  }

  const code = newLines.join('\n');
  return (
    <div className="border dark:border-gray-800! text-sm">
      <div data-theme="dark" className="hidden dark:block">
        <Code lang="tsx" className={className} lineNumbers={lineNumbers} extensions={[highlight]}>
          {code}
        </Code>
      </div>{' '}
      <div data-theme="light" className="dark:hidden">
        <Code lang="tsx" className={className} lineNumbers={lineNumbers} extensions={[highlight]}>
          {code}
        </Code>
      </div>
    </div>
  );
};

export default CodeBlock;
