// @ts-check
/** @type {(fromPath: string, toPath: string) => string} */
function getReturnPath(fromPath, toPath) {
  // Split the paths into components
  const fromParts = fromPath.replace(/^\.?\/|\/$/g, '').split('/');
  const toParts = toPath.replace(/^\.?\/|\/$/g, '').split('/');

  // Find the common base path length
  const length = Math.min(fromParts.length, toParts.length);
  let commonBaseLength = 0;
  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) break;
    commonBaseLength++;
  }

  // Calculate steps up to the common base
  const stepsUp = '../'.repeat(fromParts.length - commonBaseLength);

  // Calculate steps down to the target path
  const stepsDown = toParts.slice(commonBaseLength).join('/');

  // Combine steps up and steps down
  const result = stepsUp + stepsDown;

  return result;
}

module.exports = getReturnPath;
