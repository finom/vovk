import prettier from 'prettier';

export async function prettify(code: string, absoluteFilePath: string) {
  const options = await prettier.resolveConfig(absoluteFilePath);

  const finalOptions = {
    ...options,
    filepath: absoluteFilePath, // for selecting the correct parser
  };
  const formattedCode = await prettier.format(code, finalOptions);

  return formattedCode;
}
