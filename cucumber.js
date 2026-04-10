module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    paths: ['tests/features/**/*.feature'],
    require: ['tests/steps/**/*.ts'],
    format: ['progress-bar', 'html:tests/report.html'],
    formatOptions: { snippetInterface: 'async-await' },
  }
};