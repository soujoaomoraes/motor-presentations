const fs = require('fs'), { minify } = require('terser'), csso = require('csso');
const P = process.argv[2];
(async () => {
  const css = fs.readFileSync(P + '/motor.css', 'utf8'), js = fs.readFileSync(P + '/motor.js', 'utf8');
  const marca = css.match(/<!--[^\n]*MOTOR[^\n]*-->/)[0];
  const cssIn = css.match(/<style id="motor-css">([\s\S]*?)<\/style>/)[1];
  const jsIn = js.match(/<script id="motor-js">([\s\S]*?)<\/script>/)[1];
  const cssMin = csso.minify(cssIn, { restructure: false }).css;
  const jsMin = (await minify(jsIn, { compress: { passes: 2 }, mangle: true, format: { comments: false } })).code;
  const legivel = css.trimStart() + js;
  const min = `${marca.replace('NÃO EDITAR DAQUI PARA BAIXO', 'NÃO EDITAR DAQUI PARA BAIXO (compactado; versão legível na skill)')}\n<style id="motor-css">${cssMin}</style>\n<script id="motor-js">${jsMin}</script>\n</body>\n</html>\n`;
  fs.writeFileSync(P + '/dist/motor.legivel.html', legivel);
  fs.writeFileSync(P + '/dist/motor.min.html', min);
  fs.writeFileSync(P + '/dist/modelo.html', fs.readFileSync(P + '/conteudo.html', 'utf8') + min);
  fs.writeFileSync(P + '/dist/modelo.legivel.html', fs.readFileSync(P + '/conteudo.html', 'utf8') + '\n' + legivel);
  console.log('legível', legivel.length, 'compacto', min.length, 'final', fs.statSync(P + '/dist/modelo.html').size);
})();
