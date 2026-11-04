// 构建诊断面板：把 src 打包成 public/app.js。运行诊断台不需要这一步，构建产物已提交。
import {build} from 'esbuild';
await build({
  entryPoints:['src/main.jsx'],
  outfile:'public/app.js',
  bundle:true,
  format:'esm',
  minify:true,
  target:'es2020',
  jsx:'automatic',
  define:{'process.env.NODE_ENV':'"production"'},
  logLevel:'info',
});
