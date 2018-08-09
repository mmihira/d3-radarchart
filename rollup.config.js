// Rollup plugins
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';

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
        d3: 'd3',
        lodash: '_'
      }
  },
  external: ['d3', 'lodash'],
  plugins: [
    eslint({}),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify()
  ],
};
