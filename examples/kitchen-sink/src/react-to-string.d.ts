declare module 'react-to-string' {
  declare const reactToString: (
    element: React.ReactElement | React.ReactNode | string | Array<string | React.ReactElement>
  ) => string;

  export default reactToString;
}
