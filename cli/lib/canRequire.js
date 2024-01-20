// @ts-check
function canRequire(moduleName) {
  try {
    require.resolve(moduleName);
    return true; // The module exists and can be required
  } catch (e) {
    return false; // The module does not exist
  }
}

module.exports = canRequire;
