module.exports = {
  verbose: true,
  testRegex: '(/test/(unit)/.*|(\\.|/)(test|spec))\\.jsx?$',
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};
