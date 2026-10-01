import type { ReactNode } from 'react';

interface Props {
  className?: string;
  title?: string;
  description?: ReactNode;
  children: ReactNode;
}

const Example = ({ className, title, description, children }: Props) => {
  return (
    <>
      {title && <h1 className="text-center">{title}</h1>}
      {description && (
        <p className="text-center max-w-[800px] m-auto [&_code]:bg-slate-700 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm">
          {description}
        </p>
      )}
      <div className={`rounded-lg example ${className ?? ''}`}>{children}</div>
    </>
  );
};

export default Example;
