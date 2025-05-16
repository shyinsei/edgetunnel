import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import swc from 'unplugin-swc'
import obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig({
  input: 'src/index.ts',
  external: ['cloudflare:sockets'],
  output: {
    file: 'dist/_worker.js',
    format: 'esm',
  },
  plugins: [
    nodeResolve(),
    swc.rollup({
      minify: true,
    }),
    obfuscator({
      options: {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
      },
    }),
  ],
})
