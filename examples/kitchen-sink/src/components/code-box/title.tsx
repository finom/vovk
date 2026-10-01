import Link from 'next/link.js';

interface Props {
  href?: string;
  children: string;
}

const Title = ({ href, children }: Props) => {
  const content = (
    <>
      {' '}
      <div className="flex gap-[4px] ml-[8px] py-1">
        <div className="rounded-full h-[0.7rem] w-[0.7rem] bg-[#EB6B5E] dark:bg-white/20" />
        <div className="rounded-full h-[0.7rem] w-[0.7rem] bg-[#F3BD50] dark:bg-white/20" />
        <div className="rounded-full h-[0.7rem] w-[0.7rem] bg-[#62C454] dark:bg-white/20" />
      </div>
      <span className="opacity-80 text-center inline-block">{children}</span>
      <div className="w-[45px]" />
    </>
  );

  const className = `
      bg-linear-to-br from-[#f2f2fd] to-[#f7f7ff]
      dark:bg-gray-950 dark:text-white dark:[background-image:none]
      p-[3px] flex items-center justify-between w-full py-1`;
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
};

export default Title;
