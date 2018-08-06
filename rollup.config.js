// Rollup plugins
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  output: {
      extend: true,
      file: "dist/bundle.js",
      format: "umd",
      indent: false,
      name: "RadarChart",
      globals: {
        d3: 'd3'
      }
  },
  format: 'umd',
  sourceMap: 'inline',
  external: ['d3'],
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
