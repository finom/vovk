/** @type {import('vovk').VovkRc} */
const vovkConfig = {
    prefix: `http://localhost:${process.env.PORT ?? 3000}/api`,
}

module.exports = vovkConfig;