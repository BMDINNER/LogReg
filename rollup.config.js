import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
<<<<<<< HEAD
=======
import json from '@rollup/plugin-json';
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a

export default {
  input: 'src/index.ts',
  output: [
    {
<<<<<<< HEAD
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
=======
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
<<<<<<< HEAD
      exports: 'named'
=======
      exports: 'named',
      inlineDynamicImports: true
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a
    }
  ],
  plugins: [
    peerDepsExternal(),
<<<<<<< HEAD
    resolve({
      browser: true,
=======
    json(),
    resolve({
      browser: true,
      preferBuiltins: false,
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    commonjs({
      include: /node_modules/,
<<<<<<< HEAD
      transformMixedEsModules: true
=======
      transformMixedEsModules: true,
      ignore: ['util'] // Ignore util module
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a
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
<<<<<<< HEAD
          targets: { 
            browsers: ['>0.25%', 'not dead', 'not op_mini all']
          },
          modules: false
        }],
        ['@babel/preset-react', { runtime: 'automatic' }],
=======
          targets: { browsers: 'last 2 versions' },
          modules: false 
        }],
        '@babel/preset-react',
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a
        '@babel/preset-typescript'
      ]
    }),
    terser({
      format: {
        comments: false
<<<<<<< HEAD
      }
    })
  ],
  external: ['react', 'react-dom', 'axios']
=======
      },
      compress: {
        drop_console: true,
        pure_funcs: ['console.log']
      }
    })
  ],
  external: ['react', 'react-dom', 'axios'] 
>>>>>>> 008b41051c32968b7337140be5e50f7b5ce2247a
};