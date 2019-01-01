const path = require('path');

module.exports = {
  verbose: true,
  testRegex: '(/test/(unit)/.*|(\\.|/)(test|spec))\\.jsx?$',
  modulePaths: [path.resolve('./src')],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};
