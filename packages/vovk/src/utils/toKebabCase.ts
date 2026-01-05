export const toKebabCase = (str: string) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // Add hyphen between lowercase/digit and uppercase
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2') // Add hyphen between uppercase letters if the second one is followed by a lowercase
    .toLowerCase()
    .replace(/^-/, ''); // Remove leading hyphen
