'use client';
import { Tabs } from 'nextra/components';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const DynamicItem = ({ rootCommand, command, comment }: { rootCommand: string; command: string; comment?: string }) => (
  <div className="nextra-code x:relative x:not-first:mt-6">
    <pre className="x:group x:focus-visible:nextra-focus x:overflow-x-auto x:subpixel-antialiased x:text-[.9em] x:bg-white x:dark:bg-black x:py-4 x:ring-1 x:ring-inset x:ring-gray-300 x:dark:ring-neutral-700 x:contrast-more:ring-gray-900 x:contrast-more:dark:ring-gray-50 x:contrast-more:contrast-150 x:rounded-md not-prose ">
      <code className="nextra-code" dir="ltr">
        <span>
          <span style={{ '--shiki-light': '#6F42C1', '--shiki-dark': '#B392F0' } as object}>{rootCommand}</span>
          <span style={{ '--shiki-light': '#032F62', '--shiki-dark': '#9ECBFF' } as object}> {command}</span>
          {comment && (
            <span style={{ '--shiki-light': '#6A737D', '--shiki-dark': '#6A737D' } as object}> # {comment}</span>
          )}
        </span>
      </code>
    </pre>
  </div>
);

export const VovkNewDynamic = () => {
  const [entityName, setEntityName] = useState('user');
  const [segmentName, setSegmentName] = useState('admin');
  const [withService, setWithService] = useState(false);
  const [shortenSyntax, setShortenSyntax] = useState(false);
  const command = `vovk ${!shortenSyntax ? 'new controller' : 'n c'} ${withService ? (!shortenSyntax ? 'service ' : 's ') : ''}${segmentName ? `${segmentName}/` : ''}${entityName || 'thing'}`;

  const comment = `Create a new controller ${withService ? 'and service ' : ''}${segmentName ? `for the "${segmentName}" segment` : 'for the root segment'}`;
  return (
    <>
      <div className="mt-4 border p-3 rounded-md">
        <div className="flex flex-row gap-4">
          <div>
            <Label htmlFor="entityName" className="mb-2">
              Entity name
            </Label>
            <Input
              required
              type="text"
              value={entityName}
              id="entityName"
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="thing"
            />
          </div>
          <div>
            <Label htmlFor="segmentName" className="mb-2">
              Segment name
            </Label>
            <Input
              type="text"
              value={segmentName}
              id="segmentName"
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="foo/bar/baz"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Checkbox id="withService" checked={withService} onClick={() => setWithService((v) => !v)} />
            <Label htmlFor="withService">With service</Label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Checkbox id="shortenSyntax" checked={shortenSyntax} onClick={() => setShortenSyntax((v) => !v)} />
            <Label htmlFor="shortenSyntax">Shorten syntax</Label>
          </div>
        </div>
      </div>
      <Tabs items={['npm', 'pnpm', 'yarn', 'bun']} className="mb-4">
        <Tabs.Tab>
          <DynamicItem rootCommand="npx" command={command} comment={comment} />
        </Tabs.Tab>
        <Tabs.Tab>
          <DynamicItem rootCommand="pnpm dlx" command={command} comment={comment} />
        </Tabs.Tab>
        <Tabs.Tab>
          <DynamicItem rootCommand="yarn dlx" command={command} comment={comment} />
        </Tabs.Tab>
        <Tabs.Tab>
          <DynamicItem rootCommand="bun x" command={command} comment={comment} />
        </Tabs.Tab>
      </Tabs>
    </>
  );
};
