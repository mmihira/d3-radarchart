// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
      extend: true,
      file: "dist/bundle.js",
      format: "umd",
      indent: false,
      name: "RadarChart",
      sourceMap: 'inline',
      format: 'umd',
      globals: {
        d3: 'd3'
      }
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    })
  ],
};
