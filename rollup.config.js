import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    json(),
    resolve({
      browser: true,
      preferBuiltins: false,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
      ignore: ['util'] // Ignore util module
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', { 
          targets: { browsers: 'last 2 versions' },
          modules: false 
        }],
        '@babel/preset-react',
        '@babel/preset-typescript'
      ]
    }),
    terser({
      format: {
        comments: false
      },
      compress: {
        drop_console: true,
        pure_funcs: ['console.log']
      }
    })
  ],
  external: ['react', 'react-dom', 'axios'] 
};