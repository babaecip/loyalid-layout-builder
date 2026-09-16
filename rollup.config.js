import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'LoyalidLayout',
      exports: 'named'
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'LoyalidLayout',
      exports: 'named',
      plugins: [terser()]
    }
  ]
};
