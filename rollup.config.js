import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import {uglify} from 'rollup-plugin-uglify';

export default [
  {
    external: ['prop-types', 'react', 'react-dom'],
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/react-idle-manager.js',
      format: 'umd',
      globals: {
        'prop-types': 'PropTypes',
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      name: 'ReactIdleManager',
      sourcemap: true,
    },
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      resolve({
        main: true,
        module: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
    ],
  },
  {
    external: ['prop-types', 'react', 'react-dom'],
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/react-idle-manager.min.js',
      format: 'umd',
      globals: {
        'prop-types': 'PropTypes',
        react: 'React',
        'react-dom': 'ReactDOM',
      },
      name: 'ReactIdleManager',
    },
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      resolve({
        main: true,
        module: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      uglify(),
    ],
  },
];
