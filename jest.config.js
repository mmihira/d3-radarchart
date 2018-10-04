module.exports = {
  verbose: true,
  testRegex: '(/test/(unit)/.*|(\\.|/)(test|spec))\\.jsx?$',
  transform: { "^.+\\.js$": "babel-jest" },
  moduleDirectories: [
      "node_modules",
      "src"
    ]
};

