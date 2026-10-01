interface YoutubeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  minWidth?: string;
  maxWidth?: string;
}

export const Youtube = ({ children, src, minWidth = '600px', maxWidth = '1000px', ...otherProps }: YoutubeProps) => {
  return (
    <section style={{ width: '100%', minWidth: minWidth, maxWidth: maxWidth }} aria-label="YouTube video">
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          paddingTop: '56.25%',
        }}
      >
        <div>
          <iframe
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            width="560"
            height="315"
            src={src}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            {...otherProps}
          >
            {children}
          </iframe>
        </div>
      </div>
    </section>
  );
};
