import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const IconWrapper = ({ children, className }: Props) => {
  return (
    <span
      className={`justify-center flex items-center text-rose-600 bg-rose-500/10 p-3 rounded-full w-[44px] h-[44px] min-w-[44px] min-h-[44px] ${className ?? ''}`}
    >
      {children}
    </span>
  );
};

export default IconWrapper;
