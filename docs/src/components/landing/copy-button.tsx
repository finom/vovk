'use client';
import { useEffect, useRef, useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      aria-label={`Copy the command ${text}`}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? 'Copied' : 'Copy'}
      <span className="vk-sr" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}

// A shell command with its Copy button. `variant` picks the hero box, the larger agent box or the plain init box.
export function Command({ text, variant }: { text: string; variant: 'hero' | 'large' | 'plain' }) {
  const box = (
    <>
      <code>
        <span aria-hidden="true">$</span>
        <span>{text}</span>
      </code>
      <CopyButton text={text} />
    </>
  );
  if (variant === 'plain') return <div>{box}</div>;
  return <div className={variant === 'large' ? 'vk-cmd vk-cmd-lg' : 'vk-cmd'}>{box}</div>;
}
