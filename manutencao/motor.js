<script id="motor-js">
(() => {
'use strict';
const W = 1920, H = 1080, NS = 'http://www.w3.org/2000/svg';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const palco = $('#palco');
const TEXTO = 'h1,h2,h3,h4,h5,p,li,blockquote,figcaption,td,th,.selo,.rotulo,.numero b,.numero span,.aviso';
const FORA_TEXTO = '.livre,.caminho,.mini,[data-motor],.paleta,.campo';
let slides = [], atual = null, trilha = [], escala = 1, sujo = false, apresentando = false;
let pop = null, popInicio = 0, duplicados = [];
let sel = new Set(), selLiga = null, modo = null, clip = null, mapaVista = null, arrastando = false, arquivo = null;
const desfazerP = [], refazerP = [];

const ic = d => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  esq: ic('<path d="M10 3L5 8l5 5"/>'), dir: ic('<path d="M6 3l5 5-5 5"/>'),
  slides: ic('<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M5.5 2.5v11"/>'),
  mapa: ic('<circle cx="3.5" cy="8" r="2"/><circle cx="12.5" cy="3.5" r="2"/><circle cx="12.5" cy="12.5" r="2"/><path d="M5.4 7.1l5.2-2.6M5.4 8.9l5.2 2.6"/>'),
  apres: ic('<rect x="1.5" y="2.5" width="13" height="8.5" rx="1"/><path d="M8 11v3M5 14h6"/>'),
  mais: ic('<path d="M8 3v10M3 8h10"/>'),
  pdf: ic('<path d="M4 1.5h5l3 3v10H4z"/><path d="M9 1.5v3h3M6 9.5h4M6 12h4"/>'),
  modo: ic('<circle cx="8" cy="8" r="6.2"/><path d="M8 1.8a6.2 6.2 0 0 0 0 12.4z" fill="currentColor"/>'),
  ajuda: ic('<circle cx="8" cy="8" r="6.2"/><path d="M6.3 6.3a1.8 1.8 0 1 1 2.5 1.7c-.6.3-.8.7-.8 1.3M8 11.4v.1"/>'),
  tela: ic('<path d="M2 5.5V2h3.5M14 5.5V2h-3.5M2 10.5V14h3.5M14 10.5V14h-3.5"/>'),
  fechar: ic('<path d="M4 4l8 8M12 4l-8 8"/>'),
  salvar: ic('<path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 13.5h11"/>'),
  triangulo: ic('<path d="M8 2.2L14 13.5H2z"/>'),
  linha: ic('<path d="M2.5 13.5L13.5 2.5"/>'),
  dupla: ic('<path d="M3 13L13 3M3 13v-4.5M3 13h4.5M13 3v4.5M13 3H8.5"/>'),
  tracejado: ic('<path d="M2 8h2.5M6.75 8h2.5M11.5 8H14"/>'),
  tabela: ic('<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M1.5 6.5h13M1.5 10h13M6 2.5v11M10.5 2.5v11"/>'),
  escala: ic('<rect x="1.5" y="5" width="3.5" height="6" rx="1"/><rect x="6.25" y="5" width="3.5" height="6" rx="1" fill="currentColor"/><rect x="11" y="5" width="3.5" height="6" rx="1"/>'),
  imagem: ic('<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><circle cx="5.5" cy="6.5" r="1.3"/><path d="M14.5 11l-4-4-7 6.5"/>'),
  novo: ic('<rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M8 5.8v4.4M5.8 8h4.4"/>'),
  cursor: ic('<path d="M3 2l9.5 5.2-4.3 1.1-1.9 4.2z"/>'),
  ret: ic('<rect x="2" y="3.5" width="12" height="9" rx="1.5"/>'),
  losango: ic('<path d="M8 1.8L14.2 8 8 14.2 1.8 8z"/>'),
  elipse: ic('<ellipse cx="8" cy="8" rx="6.2" ry="5"/>'),
  seta: ic('<path d="M2.5 13.5L13 3M7 3h6v6"/>'),
  texto: ic('<path d="M3 3.5h10M8 3.5v10M6 13.5h4"/>'),
  postit: ic('<path d="M2.5 2.5h11v7l-4 4h-7z"/><path d="M13.5 9.5h-4v4"/>'),
  lapis: ic('<path d="M2.5 13.5c2-1 3-4.5 5-6s4-2 6-5"/>'),
  dup: ic('<rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M2 11V3.5A1.5 1.5 0 0 1 3.5 2H11"/>'),
  lixo: ic('<path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9"/>'),
  frente: ic('<rect x="5" y="5" width="9" height="9" rx="1" fill="currentColor"/><path d="M2 10V2h8"/>'),
  tras: ic('<rect x="2" y="2" width="9" height="9" rx="1" fill="currentColor"/><path d="M14 6v8H6"/>')
};

/* ── utilitários ── */
function el(tag, attrs = {}, html = '') {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  if (html) e.innerHTML = html;
  return e;
}
const ui = (tag, attrs = {}, html = '') => el(tag, { ...attrs, 'data-motor': '', class: ('ui ' + (attrs.class || '')).trim() }, html);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ramo = s => s.hasAttribute('data-ramo');
const lineares = () => slides.filter(s => !ramo(s));
const porId = id => slides.find(s => s.id === id);
const titulo = s => s.dataset.titulo || s.querySelector('h1,h2,h3')?.textContent.trim() || s.id;
const digitando = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
function idUnico(base) { let id = base, n = 2; while (document.getElementById(id)) id = base + '-' + n++; return id; }
function saidas(s) {
  return $$('a[href^="#"]', s).filter(a => !a.closest('aside.notas') && a.getAttribute('href').length > 1)
    .map(a => ({ a, para: decodeURIComponent(a.getAttribute('href').slice(1)), rotulo: (a.querySelector('strong')?.textContent || a.textContent).replace(/⇢.*$/, '').trim() }));
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }
function marcarSujo() { sujo = true; $('#btn-salvar').hidden = false; }
function coletar() {
  slides = $$('#palco > section.slide');
  const vistos = new Set(); duplicados = [];
  slides.forEach((s, i) => {
    if (s.id && vistos.has(s.id)) duplicados.push(s.id);
    if (!s.id || vistos.has(s.id)) s.id = idUnico('slide-' + (i + 1));
    vistos.add(s.id);
  });
}
function ajustar() {
  const lat = lateral && lateral.classList.contains('aberto') ? lateral.offsetWidth : 0;
  const w = innerWidth - lat, h = innerHeight;
  escala = Math.min(w / W, h / H);
  palco.style.transform = `translate(${lat + (w - W * escala) / 2}px,${(h - H * escala) / 2}px) scale(${escala})`;
  posicionarBarraSel();
}

/* ── navegação ── */
/* Ciclo de vida (encaixes neutros para cada apresentação animar do seu jeito):
   .ativo no slide atual · .saindo no anterior por ~1,2 s · #palco[data-direcao="frente|tras"]
   eventos (bubbles): slide:entrou {slide, anterior, direcao} · slide:saiu {slide, proximo, direcao} · slide:passo {slide, passo, total}
   [data-passo] revela por clique: recebe .visto; mesmo número = aparecem juntos; vazio = ordem do arquivo. */
function gruposPasso(s) {
  const ps = $$('[data-passo]', s);
  const chave = (n, i) => n.dataset.passo === '' ? 1e4 + i : +n.dataset.passo;
  const ks = [...new Set(ps.map(chave))].sort((a, b) => a - b);
  return { ps, idx: ps.map((n, i) => ks.indexOf(chave(n, i))), total: ks.length };
}
function aplicarPassos(s) { const g = gruposPasso(s); g.ps.forEach((n, i) => n.classList.toggle('visto', g.idx[i] < (s._passo || 0))); return g.total; }
function mostrar(s, dir = 'frente') {
  if (!s) return;
  limparSel();
  const ant = atual;
  if (ant && ant !== s) {
    ant.classList.remove('ativo'); ant.classList.add('saindo'); clearTimeout(ant._t); ant._t = setTimeout(() => ant.classList.remove('saindo'), 1200);
    ant.dispatchEvent(new CustomEvent('slide:saiu', { bubbles: true, detail: { slide: ant, proximo: s, direcao: dir } }));
  }
  atual = s; palco.dataset.direcao = dir;
  s._passo = dir === 'tras' ? gruposPasso(s).total : 0; aplicarPassos(s);
  s.classList.remove('saindo'); s.classList.add('ativo');
  if (ant !== s) s.dispatchEvent(new CustomEvent('slide:entrou', { bubbles: true, detail: { slide: s, anterior: ant, direcao: dir } }));
  try { history.replaceState(null, '', '#' + s.id); } catch (e) {}
  atualizarUI(); sincronizarApresentador();
}
function passo(d) {
  const total = gruposPasso(atual).total, n = (atual._passo || 0) + d;
  if (!total || n < 0 || n > total) return false;
  atual._passo = n; aplicarPassos(atual);
  atual.dispatchEvent(new CustomEvent('slide:passo', { bubbles: true, detail: { slide: atual, passo: n, total } }));
  sincronizarApresentador(); return true;
}
function ir(id, origem = 'salto', dir = 'frente') {
  const s = porId(id);
  if (!s) { toast('Slide não encontrado: #' + id); return; }
  if (origem === 'link' || origem === 'seta') { if (ramo(s)) trilha.push(s.id); else trilha = [s.id]; }
  else trilha = [s.id];
  mostrar(s, dir);
}
function proximoDe(s) {
  if (!s) return null;
  if (ramo(s)) { const sa = saidas(s); return sa.length === 1 ? porId(sa[0].para) : null; }
  const L = lineares(), i = L.indexOf(s); return L[i + 1] || null;
}
function avancar() {
  if (!atual) return;
  if (passo(1)) return;
  if (ramo(atual) && saidas(atual).length > 1) {
    const c = $('.caminhos', atual); if (c) { c.classList.remove('pulsar'); void c.offsetWidth; c.classList.add('pulsar'); }
    toast('Escolha um dos caminhos'); return;
  }
  const p = proximoDe(atual); if (p) ir(p.id, 'seta');
}
function voltar() {
  if (passo(-1)) return;
  if (trilha.length > 1) { trilha.pop(); mostrar(porId(trilha[trilha.length - 1]), 'tras'); return; }
  const i = slides.indexOf(atual);
  for (let j = i - 1; j >= 0; j--) if (!ramo(slides[j])) return ir(slides[j].id, 'seta', 'tras');
}

/* ── texto editável direto (fora da tela cheia) ── */
function ligarTexto(raiz = palco) {
  $$(TEXTO, raiz).forEach(n => { if (n.closest(FORA_TEXTO) || n.parentElement.closest('[contenteditable="true"]:not(.slide)')) return; n.contentEditable = 'true'; n.spellcheck = false; });
}
function desligarTexto() {
  document.activeElement?.blur?.();
  $$('[contenteditable]', palco).forEach(n => { if (!n.classList.contains('campo')) n.removeAttribute('contenteditable'); });
}

/* ── preparar slide (idempotente: pode rodar quantas vezes quiser) ── */
function garantirLinhas(c) {
  if (c.querySelector(':scope > svg.linhas')) return;
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'linhas'); svg.setAttribute('data-motor', ''); c.prepend(svg);
}
function prepararSlide(s) {
  garantirLinhas(s);
  $$('.forma', s).forEach(decorarForma);
  $$('.escala', s).forEach(e => e.querySelector('.niveis')?.setAttribute('contenteditable', 'false'));
  $$('a.caminho', s).forEach(a => { if (!a.querySelector(':scope > .chip-destino')) a.append(el('span', { class: 'chip-destino', 'data-motor': '', title: 'Editar este botão' }, '⇢ editar')); });
  $$('.campo', s).forEach(c => { c.contentEditable = 'true'; c.spellcheck = false; });
  if (!apresentando) ligarTexto(s);
  desenharLinhas(s);
}
const POLIGONOS = { losango: '50,1 99,50 50,99 1,50', triangulo: '50,2 98,98 2,98' };
function decorarForma(f) {
  const pts = POLIGONOS[f.dataset?.forma]; if (!pts || f.querySelector(':scope > .fundo-forma')) return;
  f.insertAdjacentHTML('afterbegin', `<svg class="fundo-forma" data-motor contenteditable="false" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${pts}"/></svg>`);
}

/* ── interface ── */
let barra, trilhaUI, lateral, mapa, ajuda, menuIns, popCam, popCor, barraSel, ocultarT, inputImg;
function montarUI() {
  const b = (icone, txt, fn, extra = {}) => ui('button', { title: extra.title || txt, onclick: fn, class: extra.class || '', ...(extra.id ? { id: extra.id } : {}) }, icone + (txt ? `<span class="txt">${txt}</span>` : ''));
  barra = ui('div', { id: 'barra' });
  barra.append(
    b(I.esq, '', voltar, { title: 'Voltar (←)' }), ui('span', { id: 'contador' }), b(I.dir, '', avancar, { title: 'Avançar (→)' }),
    ui('span', { class: 'sep' }),
    b(I.slides, 'Slides', () => alternar('lateral'), { title: 'Slides (S)' }),
    b(I.mapa, 'Mapa', () => alternar('mapa'), { title: 'Mapa dos caminhos (M)' }),
    ui('span', { class: 'sep' }),
    b(I.apres, 'Apresentador', abrirApresentador, { title: 'Modo apresentador (P)' }),
    b(I.mais, 'Inserir', () => alternar('inserir'), { title: 'Inserir elementos (I)', id: 'btn-inserir' }),
    b(I.pdf, 'PDF', pdf, { title: 'Salvar como PDF' }),
    b(I.modo, '', alternarModo, { title: 'Modo claro / escuro (T)' }),
    b(I.ajuda, '', () => alternar('ajuda'), { title: 'Atalhos (?)' }),
    b(I.salvar, 'Salvar', () => salvar(), { title: 'Salvar alterações neste arquivo (Ctrl+S)', id: 'btn-salvar', class: 'salvar' }),
    b(I.tela, 'Apresentar', telaCheia, { class: 'primario', title: 'Tela cheia (F)' })
  );
  trilhaUI = ui('div', { id: 'trilha', hidden: '' });
  lateral = ui('nav', { id: 'lateral' });
  mapa = ui('div', { id: 'mapa', hidden: '' });
  ajuda = ui('div', { id: 'ajuda', class: 'painel', hidden: '' }, `
    <div class="cab">Atalhos<button onclick="this.closest('.painel').hidden=true">${I.fechar}</button></div>
    <table>
      <tr><td><kbd>→</kbd> <kbd>espaço</kbd> / <kbd>←</kbd></td><td>Avança / volta pelo caminho que você fez.</td></tr>
      <tr><td><kbd>F</kbd></td><td>Apresentar em tela cheia. Em tela cheia o texto fica travado, mas os objetos continuam se movendo.</td></tr>
      <tr><td><kbd>P</kbd></td><td>Apresentador: atual, próximo, notas editáveis e cronômetro.</td></tr>
      <tr><td><kbd>S</kbd> / <kbd>M</kbd></td><td>Lista de slides / mapa dos caminhos (arraste para mover, roda do mouse para zoom).</td></tr>
      <tr><td>Texto</td><td>Clique em qualquer texto e escreva. Nos botões de caminho, use o "⇢ editar".</td></tr>
      <tr><td><kbd>I</kbd></td><td>Inserir formas, conexões, post-it, tabela, escala, imagem, desenho e slides.</td></tr>
      <tr><td>Objetos</td><td>Clique para selecionar, arraste para mover, puxe o canto para redimensionar, duplo clique edita. <kbd>Shift</kbd>+clique ou arrastar no fundo do slide seleciona vários.</td></tr>
      <tr><td>Conexões</td><td>Escolha seta ou linha no Inserir e arraste de um ponto a outro. Começando ou terminando em cima de um objeto, ela gruda nele. Selecione a seta para mover as pontas.</td></tr>
      <tr><td><kbd>Delete</kbd> <kbd>Ctrl</kbd>+<kbd>D</kbd></td><td>Apaga / duplica o selecionado. <kbd>Ctrl</kbd>+<kbd>C</kbd> <kbd>V</kbd> copia e cola (cola imagem também).</td></tr>
      <tr><td><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Y</kbd></td><td>Desfaz / refaz.</td></tr>
      <tr><td><kbd>Ctrl</kbd>+<kbd>S</kbd></td><td>Salva neste mesmo arquivo. Na primeira vez o navegador pergunta onde: escolha o próprio arquivo.</td></tr>
      <tr><td><kbd>T</kbd></td><td>Modo claro / escuro.</td></tr>
    </table>
    <p>Cada slide tem endereço próprio: copie o link do navegador para mandar alguém direto para um passo.</p>`);
  menuIns = ui('div', { id: 'menu-inserir', class: 'menu', hidden: '' });
  const tile = (icone, nome, fn) => ui('button', { class: 'tile', title: nome, onclick: () => { menuIns.hidden = true; fn(); } }, icone + `<span>${nome}</span>`);
  const grupo = (rot, itens) => { menuIns.append(el('div', { class: 'menu-rot' }, rot)); const g = el('div', { class: 'tiles' }); itens.forEach(i => g.append(i)); menuIns.append(g); };
  grupo('Formas', [tile(I.ret, 'Retângulo', () => inserir('ret')), tile(I.losango, 'Losango', () => inserir('losango')), tile(I.elipse, 'Círculo', () => inserir('elipse')), tile(I.triangulo, 'Triângulo', () => inserir('triangulo'))]);
  grupo('Conexões', [tile(I.seta, 'Seta', () => entrarModo('seta')), tile(I.linha, 'Linha', () => entrarModo('linha')), tile(I.dupla, 'Seta dupla', () => entrarModo('dupla'))]);
  grupo('Elementos', [tile(I.texto, 'Texto', () => inserir('texto')), tile('<i class="amostra-postit"></i>', 'Post-it', () => inserir('postit')), tile(I.tabela, 'Tabela', () => inserir('tabela')),
    tile(I.escala, 'Escala', () => inserir('escala')), tile(I.imagem, 'Imagem', () => inputImg.click()), tile(I.lapis, 'Desenho', () => entrarModo('lapis'))]);
  grupo('Slides', [tile(I.novo, 'Novo', novoSlide), tile(I.dup, 'Duplicar', duplicarSlide), tile(I.lixo, 'Excluir', excluirSlide)]);
  popCam = ui('div', { id: 'pop-caminho', class: 'menu', hidden: '' });
  popCor = ui('div', { id: 'pop-cor', class: 'menu', hidden: '' });
  barraSel = ui('div', { id: 'barra-sel', hidden: '' });
  inputImg = ui('input', { type: 'file', accept: 'image/*', hidden: '' });
  inputImg.onchange = () => { if (inputImg.files[0]) inserirImagem(inputImg.files[0]); inputImg.value = ''; };
  document.body.append(trilhaUI, barra, lateral, mapa, ajuda, menuIns, popCam, popCor, barraSel, inputImg, ui('div', { id: 'toast' }));
  $('#btn-salvar').hidden = true;
}
function atualizarUI() {
  const L = lineares(), i = L.indexOf(atual);
  $('#contador').textContent = ramo(atual) ? 'passo' : `${i + 1} / ${L.length}`;
  if (trilha.length > 1 || ramo(atual)) {
    trilhaUI.hidden = false; trilhaUI.innerHTML = '';
    trilhaUI.append(ui('button', { onclick: voltar, title: 'Voltar (←)' }, I.esq + '<span>Voltar</span>'));
    trilha.forEach((id, k) => {
      const s = porId(id); if (!s) return;
      if (k) trilhaUI.append(el('span', { class: 'seta-t' }, '›'));
      const ult = k === trilha.length - 1;
      const p = el('span', { class: 'passo-t' + (ult ? ' agora' : '') }); p.textContent = titulo(s);
      if (!ult) p.onclick = () => { trilha = trilha.slice(0, k + 1); mostrar(s); };
      trilhaUI.append(p);
    });
  } else trilhaUI.hidden = true;
  if (lateral.classList.contains('aberto')) montarLateral();
  if (!mapa.hidden) montarMapa();
}
function mostrarBarra() {
  barra.classList.remove('oculta'); document.documentElement.classList.remove('parado');
  clearTimeout(ocultarT);
  ocultarT = setTimeout(() => {
    if (barra.matches(':hover') || !mapa.hidden || !menuIns.hidden || lateral.classList.contains('aberto')) return;
    barra.classList.add('oculta'); document.documentElement.classList.add('parado');
  }, 2600);
}
function alternar(qual) {
  if (qual === 'lateral') { const ab = !lateral.classList.contains('aberto'); lateral.classList.toggle('aberto', ab); if (ab) montarLateral(); ajustar(); }
  if (qual === 'mapa') { mapa.hidden = !mapa.hidden; if (!mapa.hidden) { mapaVista = null; montarMapa(); } }
  if (qual === 'ajuda') ajuda.hidden = !ajuda.hidden;
  if (qual === 'inserir') {
    menuIns.hidden = !menuIns.hidden;
    if (!menuIns.hidden) { const r = $('#btn-inserir').getBoundingClientRect(); menuIns.style.left = Math.max(8, Math.min(r.left - 40, innerWidth - menuIns.offsetWidth - 8)) + 'px'; menuIns.style.bottom = (innerHeight - r.top + 8) + 'px'; }
  }
}
function fecharPaineis() {
  if (lateral.classList.contains('aberto')) { lateral.classList.remove('aberto'); ajustar(); }
  mapa.hidden = true; ajuda.hidden = true; menuIns.hidden = true; popCam.hidden = true; popCor.hidden = true;
}

/* ── miniaturas ── */
function mini(s, w, doc = document) {
  const box = el('div', { class: 'mini' }); box.style.width = w + 'px'; box.style.height = Math.round(w * H / W) + 'px';
  const e = el('div', { class: 'escala' }); e.style.transform = `scale(${w / W})`;
  const c = s.cloneNode(true); c.classList.add('ativo'); c.classList.remove('saindo');
  [c, ...c.querySelectorAll('[id]')].forEach(n => n.removeAttribute('id'));
  c.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
  e.append(c); box.append(e); box.inert = true; return box;
}
function montarLateral() {
  const L = lineares();
  lateral.innerHTML = '';
  const cab = el('div', { class: 'cab' }, `<span>Slides <small>${L.length} + ${slides.length - L.length} passos</small></span>`);
  cab.append(ui('button', { onclick: () => alternar('lateral') }, I.fechar)); lateral.append(cab);
  slides.forEach(s => {
    const r = ramo(s);
    const it = ui('button', { class: 'item' + (r ? ' ramo' : '') + (s === atual ? ' atual' : ''), onclick: () => ir(s.id) });
    it.append(mini(s, r ? 228 : 250));
    it.append(el('span', { class: 'leg' }, `<b>${r ? '↳' : L.indexOf(s) + 1}</b>${esc(titulo(s))}${r ? '<i class="tag">passo</i>' : ''}`));
    lateral.append(it);
  });
  lateral.querySelector('.atual')?.scrollIntoView({ block: 'nearest' });
}

/* ── mapa (arrastar para mover, roda do mouse para zoom) ── */
function analisar() {
  const ids = new Set(slides.map(s => s.id)), arestas = [], problemas = [];
  duplicados.forEach(id => problemas.push({ id, txt: `id "${id}" repetido (foi renomeado)` }));
  slides.forEach(s => saidas(s).forEach(x => {
    if (!ids.has(x.para)) problemas.push({ id: s.id, txt: `"${x.rotulo}" aponta para #${x.para}, que não existe` });
    else arestas.push({ de: s.id, para: x.para, rotulo: x.rotulo, tipo: 'caminho' });
  }));
  const L = lineares();
  for (let i = 0; i < L.length - 1; i++) arestas.push({ de: L[i].id, para: L[i + 1].id, tipo: 'linear' });
  const prof = {}, adj = {};
  arestas.forEach(a => (adj[a.de] = adj[a.de] || []).push(a.para));
  const raiz = slides[0].id; prof[raiz] = 0; const fila = [raiz];
  while (fila.length) { const u = fila.shift(); (adj[u] || []).forEach(v => { if (prof[v] === undefined) { prof[v] = prof[u] + 1; fila.push(v); } }); }
  const max = Math.max(0, ...Object.values(prof));
  slides.forEach(s => {
    if (prof[s.id] === undefined) prof[s.id] = max + 1;
    const entra = arestas.some(a => a.para === s.id && a.de !== s.id), sai = arestas.some(a => a.de === s.id && a.tipo === 'caminho');
    if (ramo(s) && !entra) problemas.push({ id: s.id, txt: `"${titulo(s)}": nenhum botão leva até ele` });
    if (ramo(s) && !sai && !s.hasAttribute('data-fim')) problemas.push({ id: s.id, txt: `"${titulo(s)}" não tem botão de saída (use data-fim se for de propósito)` });
  });
  arestas.forEach(a => { if (a.tipo === 'caminho' && prof[a.para] <= prof[a.de]) a.tipo = 'retorno'; });
  return { arestas, prof, problemas };
}
function montarMapa() {
  const { arestas, prof, problemas } = analisar();
  const NW = 230, NH = Math.round(NW * H / W), LH = 34, GX = 150, GY = 40;
  const camadas = [];
  slides.forEach(s => (camadas[prof[s.id]] = camadas[prof[s.id]] || []).push(s.id));
  const linha = {};
  camadas.forEach((c, k) => {
    if (!c) return;
    if (k) {
      const peso = id => { const ps = arestas.filter(a => a.para === id && a.tipo !== 'retorno' && linha[a.de] !== undefined).map(a => linha[a.de]); return ps.length ? ps.reduce((x, y) => x + y, 0) / ps.length : 999; };
      c.sort((a, b) => peso(a) - peso(b));
    }
    c.forEach((id, i) => linha[id] = i);
  });
  const maxL = Math.max(...camadas.filter(Boolean).map(c => c.length)), pos = {};
  camadas.forEach((c, k) => c && c.forEach((id, i) => { pos[id] = { x: k * (NW + GX), y: (i + (maxL - c.length) / 2) * (NH + LH + GY) }; }));
  const larg = camadas.length * (NW + GX) - GX, alt = maxL * (NH + LH + GY) - GY + 90;
  const comProblema = new Set(problemas.map(p => p.id));
  const semRet = mapa.classList.contains('sem-retornos');
  mapa.innerHTML = '';
  const cab = el('div', { class: 'cab' }, `<span>Mapa dos caminhos <small>arraste para mover · roda do mouse para zoom · clique num slide para ir</small></span>`);
  const leg = el('div', { class: 'legenda' }, `<span><i></i>botão</span><span><i class="l"></i>setas</span>`);
  const chk = el('label', {}, `<input type="checkbox" ${semRet ? '' : 'checked'}> <i class="r"></i>retornos`);
  chk.querySelector('input').onchange = e => mapa.classList.toggle('sem-retornos', !e.target.checked);
  leg.append(chk);
  if (problemas.length) leg.append(el('span', { class: 'avisos', title: problemas.map(p => '• ' + p.txt).join('\n') }, `${problemas.length} aviso${problemas.length > 1 ? 's' : ''}`));
  const zoom = el('span', { class: 'zoom' });
  zoom.append(ui('button', { onclick: () => zoomMapa(1 / 1.2) }, '−'), ui('button', { onclick: () => { mapaVista = null; aplicar(); } }, 'ajustar'), ui('button', { onclick: () => zoomMapa(1.2) }, '+'));
  leg.append(zoom);
  cab.append(leg, ui('button', { onclick: () => alternar('mapa'), title: 'Fechar (Esc)' }, I.fechar));
  const corpo = el('div', { class: 'corpo' }), tela = el('div', { class: 'tela' });
  tela.style.width = larg + 'px'; tela.style.height = alt + 'px';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'arestas'); svg.setAttribute('width', larg); svg.setAttribute('height', alt);
  let h = '<defs>' + ['c', 'l', 'r'].map(k => `<marker id="mk-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z"/></marker>`).join('') + '</defs>';
  arestas.forEach(a => {
    const p1 = pos[a.de], p2 = pos[a.para]; if (!p1 || !p2) return;
    let d, lx, ly;
    if (a.tipo === 'retorno') {
      const x1 = p1.x + NW / 2, y1 = p1.y + NH + LH, x2 = p2.x + NW / 2, y2 = p2.y + NH + LH, baixo = Math.max(y1, y2) + 60;
      d = `M${x1},${y1} C${x1},${baixo} ${x2},${baixo} ${x2},${y2 + 4}`; lx = (x1 + x2) / 2; ly = baixo - 14;
    } else {
      const x1 = p1.x + NW, y1 = p1.y + NH / 2, x2 = p2.x - 4, y2 = p2.y + NH / 2, dx = (x2 - x1) / 2;
      d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`; lx = (x1 + x2) / 2; ly = (y1 + y2) / 2 - 6;
    }
    const cls = { caminho: 'caminho-a', linear: 'linear-a', retorno: 'retorno-a' }[a.tipo], mk = { caminho: 'c', linear: 'l', retorno: 'r' }[a.tipo];
    h += `<path class="a ${cls}" data-de="${esc(a.de)}" data-para="${esc(a.para)}" d="${d}" marker-end="url(#mk-${mk})"/>`;
    if (a.rotulo && a.tipo === 'caminho') h += `<text data-de="${esc(a.de)}" data-para="${esc(a.para)}" x="${lx}" y="${ly}" text-anchor="middle">${esc(a.rotulo.length > 24 ? a.rotulo.slice(0, 23) + '…' : a.rotulo)}</text>`;
  });
  svg.innerHTML = h; tela.append(svg);
  let moveu = false;
  slides.forEach(s => {
    const p = pos[s.id];
    const no = el('div', { class: 'no' + (s === atual ? ' atual' : '') + (comProblema.has(s.id) ? ' problema' : '') });
    no.style.left = p.x + 'px'; no.style.top = p.y + 'px'; no.style.width = NW + 'px';
    no.append(mini(s, NW), el('span', { class: 'nome' }, `${esc(titulo(s))} <code>#${esc(s.id)}</code>`));
    no.onclick = () => { if (moveu) return; mapa.hidden = true; ir(s.id); };
    no.onmouseenter = () => { svg.classList.add('foco'); $$(`[data-de="${CSS.escape(s.id)}"],[data-para="${CSS.escape(s.id)}"]`, svg).forEach(n => n.classList.add('f')); };
    no.onmouseleave = () => { svg.classList.remove('foco'); $$('.f', svg).forEach(n => n.classList.remove('f')); };
    tela.append(no);
  });
  corpo.append(tela); mapa.append(cab, corpo);
  function aplicar() {
    if (!mapaVista) {
      const cw = corpo.clientWidth, ch = corpo.clientHeight, z = Math.max(.25, Math.min(1, (cw - 80) / larg, (ch - 80) / alt));
      mapaVista = { z, tx: (cw - larg * z) / 2, ty: (ch - alt * z) / 2 };
    }
    tela.style.transform = `translate(${mapaVista.tx}px,${mapaVista.ty}px) scale(${mapaVista.z})`;
  }
  function zoomEm(cx, cy, f) {
    const v = mapaVista, z = Math.max(.15, Math.min(2.5, v.z * f));
    v.tx = cx - (cx - v.tx) * z / v.z; v.ty = cy - (cy - v.ty) * z / v.z; v.z = z; aplicar();
  }
  zoomMapa = f => zoomEm(corpo.clientWidth / 2, corpo.clientHeight / 2, f);
  corpo.addEventListener('wheel', e => { e.preventDefault(); const r = corpo.getBoundingClientRect(); zoomEm(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015))); }, { passive: false });
  corpo.addEventListener('contextmenu', e => e.preventDefault());
  corpo.addEventListener('pointerdown', e => {
    moveu = false; const x0 = e.clientX, y0 = e.clientY, t0 = { ...mapaVista };
    corpo.setPointerCapture(e.pointerId); corpo.classList.add('movendo');
    const mv = ev => { const dx = ev.clientX - x0, dy = ev.clientY - y0; if (Math.hypot(dx, dy) > 4) moveu = true; if (!moveu) return; mapaVista.tx = t0.tx + dx; mapaVista.ty = t0.ty + dy; aplicar(); };
    const up = () => { corpo.removeEventListener('pointermove', mv); corpo.removeEventListener('pointerup', up); corpo.classList.remove('movendo'); setTimeout(() => moveu = false, 0); };
    corpo.addEventListener('pointermove', mv); corpo.addEventListener('pointerup', up);
  });
  requestAnimationFrame(aplicar);
}
let zoomMapa = () => {};

/* ── apresentador ── */
function abrirApresentador() {
  if (pop && !pop.closed) { pop.focus(); return; }
  pop = window.open('', 'apresentador', 'width=1280,height=760');
  if (!pop) { toast('O navegador bloqueou a janela. Permita pop-ups para este arquivo.'); return; }
  const css = $$('style').map(s => s.textContent).join('\n');
  const d = pop.document;
  let fonte = 18;
  try { fonte = +localStorage.getItem('ap-fonte') || 18; } catch (e) {}
  d.open();
  d.write(`<!doctype html><html data-modo="${esc(document.documentElement.dataset.modo || '')}"><head><meta charset="utf-8"><title>Apresentador · ${esc(document.title)}</title><style>${css}</style></head><body class="ap ui">
    <div class="ap-topo"><span class="ap-tempo" id="t">00:00</span><button id="zerar">Zerar</button><span class="ap-pos" id="pos"></span><span class="ap-hora" id="hora"></span></div>
    <div class="ap-grade">
      <div class="ap-esq" id="esq"><div class="ap-rot">Agora</div><div class="ap-moldura" id="agora"></div>
        <div class="ap-rot ap-rot-prox">Próximo</div><div class="ap-prox-linha"><div class="ap-moldura" id="prox"></div><div class="ap-lado"><div class="ap-pe"><button id="ant">◀ Voltar</button><button id="seg">Avançar ▶</button></div><div class="ap-cams" id="cams"></div></div></div></div>
      <div class="ap-dir" id="dir">
        <div class="ap-notas-cab"><span class="ap-rot">Notas <small>clique e escreva</small></span><span class="ap-fonte"><button id="fmenos" title="Diminuir fonte">A−</button><span id="ftam"></span><button id="fmais" title="Aumentar fonte">A+</button></span></div>
        <div class="ap-notas" id="notas" contenteditable="true" spellcheck="false"></div></div>
    </div>
    </body></html>`);
  d.close();
  popInicio = Date.now();
  const notas = d.getElementById('notas');
  const aplicarFonte = () => { notas.style.fontSize = fonte + 'px'; d.getElementById('ftam').textContent = fonte; try { localStorage.setItem('ap-fonte', fonte); } catch (e) {} };
  d.getElementById('fmenos').onclick = () => { fonte = Math.max(12, fonte - 2); aplicarFonte(); };
  d.getElementById('fmais').onclick = () => { fonte = Math.min(48, fonte + 2); aplicarFonte(); };
  d.getElementById('zerar').onclick = () => { popInicio = Date.now(); };
  d.getElementById('ant').onclick = voltar; d.getElementById('seg').onclick = avancar;
  notas.addEventListener('input', () => {
    if (!atual) return;
    let a = atual.querySelector(':scope > aside.notas'); if (!a) { a = el('aside', { class: 'notas' }); atual.append(a); }
    a.innerHTML = notas.innerHTML; marcarSujo();
  });
  d.addEventListener('keydown', e => {
    if (digitando(e.target)) { if (e.key === 'Escape') e.target.blur(); return; }
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); avancar(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); voltar(); }
  });
  const tick = () => {
    if (!pop || pop.closed) return;
    const s = Math.floor((Date.now() - popInicio) / 1000);
    d.getElementById('t').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    d.getElementById('hora').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  pop.setInterval(tick, 1000); tick();
  pop.addEventListener('resize', () => sincronizarApresentador(true));
  aplicarFonte();
  setTimeout(() => sincronizarApresentador(), 60);
}
function sincronizarApresentador(soMolduras) {
  if (!pop || pop.closed || !atual) return;
  const d = pop.document;
  d.documentElement.dataset.modo = document.documentElement.dataset.modo || '';
  if (!soMolduras) {
    const cams = d.getElementById('cams'); cams.innerHTML = '';
    const sa = saidas(atual);
    if (sa.length > 1) sa.forEach(x => { const bt = d.createElement('button'); bt.textContent = '→ ' + x.rotulo; bt.onclick = () => ir(x.para, 'link'); cams.append(bt); });
    const L = lineares();
    const tp = gruposPasso(atual).total;
    d.getElementById('pos').textContent = (ramo(atual) ? 'passo · ' + titulo(atual) : `slide ${L.indexOf(atual) + 1} de ${L.length} · ${titulo(atual)}`) + (tp ? ` · revelado ${atual._passo || 0} de ${tp}` : '');
    const n = atual.querySelector(':scope > aside.notas'), notas = d.getElementById('notas');
    if (d.activeElement !== notas) { notas.innerHTML = n ? n.innerHTML : ''; notas.scrollTop = 0; }
    notas.dataset.dica = 'Sem notas neste slide. Clique e escreva o que você quer falar.';
  }
  const esq = d.getElementById('esq'), dir = d.getElementById('dir'), grade = esq.parentElement;
  const vazio = txt => `<div class="ap-vazio">${txt}</div>`;
  // coluna esquerda: atual grande em cima, próximo menor embaixo; coluna direita: só notas, altura toda
  const rot = 27, folga = 14, livre = Math.max(200, grade.clientHeight - 2 * rot - folga);
  const hA = Math.max(120, Math.min(grade.clientWidth * 0.66 * H / W, livre * 0.74)), wA = Math.round(hA * W / H);
  esq.style.width = wA + 'px';
  const ag = d.getElementById('agora'); ag.innerHTML = '';
  ag.append(d.adoptNode(mini(atual, wA)));
  const wP = Math.max(120, Math.round(Math.min(wA * 0.5, (livre - hA) * W / H)));
  const pr = d.getElementById('prox'); pr.innerHTML = ''; pr.style.width = wP + 'px';
  const p = proximoDe(atual);
  if (p) pr.append(d.adoptNode(mini(p, wP)));
  else pr.innerHTML = vazio(ramo(atual) ? 'Escolha um caminho abaixo' : 'Fim da apresentação');
  dir.style.height = esq.offsetHeight + 'px'; // notas terminam junto com o próximo slide
}

/* ── tela cheia, PDF, modo ── */
function telaCheia() {
  if (!document.fullscreenElement) (document.documentElement.requestFullscreen?.() || Promise.reject()).catch(() => toast('Tela cheia indisponível aqui. Abra o arquivo direto no navegador.'));
  else document.exitFullscreen();
}
function pdf() { fecharPaineis(); limparSel(); toast('Na janela de impressão, escolha "Salvar como PDF".'); setTimeout(() => print(), 500); }
function alternarModo() {
  const h = document.documentElement; h.dataset.modo = h.dataset.modo === 'claro' ? 'escuro' : 'claro';
  sincronizarApresentador(); toast('Modo ' + h.dataset.modo); if (!mapa.hidden) montarMapa();
}

/* ── desfazer / refazer ── */
function limpo(c) {
  const k = c.cloneNode(true);
  k.querySelectorAll('[data-motor]').forEach(n => n.remove());
  k.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
  k.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
  return k.innerHTML;
}
function registrar(c) { desfazerP.push({ c, html: limpo(c) }); if (desfazerP.length > 80) desfazerP.shift(); refazerP.length = 0; }
function restaurar(de, para) {
  const r = de.pop(); if (!r) { toast(de === desfazerP ? 'Nada para desfazer' : 'Nada para refazer'); return; }
  if (!r.c.isConnected) return restaurar(de, para);
  para.push({ c: r.c, html: limpo(r.c) });
  limparSel(); r.c.innerHTML = r.html; prepararSlide(r.c); marcarSujo();
}

/* ── objetos livres (filhos diretos do slide) ── */
const TIPOS = ['postit', 'carta', 'faixa', 'texto', 'forma', 'desenho', 'imagem', 'tabela', 'escala', 'etiqueta'];
const tipoDe = o => TIPOS.find(t => o.classList.contains(t)) || 'texto';
const SO_LARGURA = o => o.matches('.texto,.faixa,.imagem,.etiqueta,.tabela,.escala');
const SEM_COR = o => o.matches('.imagem,.tabela,.escala,.etiqueta');
function pontoEm(c, e) { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) / escala, y: (e.clientY - r.top) / escala }; }
function novoId(c) { const ids = $$(':scope > [data-id]', c).map(p => parseInt((p.dataset.id || '').replace(/\D/g, '')) || 0); return 'o' + (Math.max(0, ...ids) + 1); }
const objetos = c => $$(':scope > .livre', c);
function objetoEm(c, p, exceto) {
  return objetos(c).reverse().find(o => o !== exceto && p.x >= o.offsetLeft - 12 && p.x <= o.offsetLeft + o.offsetWidth + 12 && p.y >= o.offsetTop - 12 && p.y <= o.offsetTop + o.offsetHeight + 12);
}
function niveisHTML(min, max) { let h = ''; for (let i = min; i <= max; i++) h += `<span class="nivel">${i}</span>`; return h; }
function criarObjeto(c, tipo, x, y, extra = {}) {
  const def = {
    postit: ['postit', 'Nova ideia'], texto: ['texto', 'Texto'],
    ret: ['forma', 'Forma', 'ret'], losango: ['forma', 'Decisão', 'losango'], elipse: ['forma', 'Forma', 'elipse'], triangulo: ['forma', 'Forma', 'triangulo'],
    tabela: ['tabela', '<table><tr><th>Coluna 1</th><th>Coluna 2</th><th>Coluna 3</th></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>'],
    escala: ['escala', `<span class="escala-rot">Como você avalia?</span><div class="niveis" contenteditable="false">${niveisHTML(0, 10)}</div>`]
  }[tipo] || ['texto', 'Texto'];
  const o = el('div', { class: 'livre ' + def[0], 'data-id': novoId(c) }, extra.html ?? def[1]);
  if (def[2]) o.dataset.forma = def[2];
  if (tipo === 'escala') { o.dataset.min = 0; o.dataset.max = 10; }
  if (extra.cor) o.dataset.cor = extra.cor;
  o.style.left = Math.round(Math.max(0, x)) + 'px'; o.style.top = Math.round(Math.max(0, y)) + 'px';
  if (extra.w) o.style.width = extra.w + 'px'; if (extra.h) o.style.height = extra.h + 'px';
  c.append(o); decorarForma(o); marcarSujo(); return o;
}

/* seleção */
function limparSel() {
  sel.forEach(o => o.classList.remove('sel')); sel.clear();
  const tinha = selLiga; selLiga = null;
  $$('.redim', palco).forEach(n => n.remove()); barraSel.hidden = true; if (popCor) popCor.hidden = true;
  if (tinha) desenharLinhas(tinha.c);
}
function selecionar(o, somar) {
  if (!somar || (sel.size && [...sel][0].parentElement !== o.parentElement) || selLiga) limparSel();
  sel.add(o); o.classList.add('sel'); atualizarAlcas(); montarBarraSel();
}
function selecionarLiga(c, i) { limparSel(); selLiga = { c, i }; desenharLinhas(c); montarBarraSel(); }
function atualizarAlcas() {
  $$('.redim', palco).forEach(n => n.remove());
  if (sel.size === 1) { const o = [...sel][0]; if (!o.isContentEditable) o.append(el('span', { class: 'redim', 'data-motor': '', contenteditable: 'false', title: 'Redimensionar' })); }
  posicionarBarraSel();
}
function montarBarraSel() {
  barraSel.innerHTML = '';
  const bt = (html, titulo, fn, cls = '') => ui('button', { class: cls, title: titulo, onclick: fn }, html);
  if (selLiga) {
    const l = ligaSel(); if (!l) return;
    const t = l.dataset.tipo || 'seta';
    botoesCor(); barraSel.append(ui('span', { class: 'sep' }));
    barraSel.append(bt(I.seta, 'Seta', () => estiloLiga('tipo', 'seta'), t === 'seta' ? 'on' : ''), bt(I.linha, 'Linha', () => estiloLiga('tipo', 'linha'), t === 'linha' ? 'on' : ''),
      bt(I.dupla, 'Seta dupla', () => estiloLiga('tipo', 'dupla'), t === 'dupla' ? 'on' : ''), ui('span', { class: 'sep' }),
      bt(I.tracejado, 'Tracejado', () => estiloLiga('tracejado'), l.hasAttribute('data-tracejado') ? 'on' : ''), ui('span', { class: 'sep' }),
      bt(I.lixo, 'Apagar (Delete)', apagarSel));
  } else if (sel.size) {
    const objs = [...sel], um = objs.length === 1 ? objs[0] : null;
    if (objs.some(o => !SEM_COR(o))) { botoesCor(); barraSel.append(ui('span', { class: 'sep' })); }
    if (um?.matches('.tabela')) { barraSel.append(bt('+ linha', 'Adicionar linha', () => opTabela(um, '+l')), bt('+ coluna', 'Adicionar coluna', () => opTabela(um, '+c')), bt('− linha', 'Remover última linha', () => opTabela(um, '-l')), bt('− coluna', 'Remover última coluna', () => opTabela(um, '-c')), ui('span', { class: 'sep' })); }
    if (um?.matches('.escala')) { const mx = +um.dataset.max; barraSel.append(bt('0 a 10', 'Escala de 0 a 10 (NPS)', () => opEscala(um, 0, 10), mx === 10 ? 'on' : ''), bt('1 a 5', 'Escala de 1 a 5', () => opEscala(um, 1, 5), mx === 5 ? 'on' : ''), ui('span', { class: 'sep' })); }
    barraSel.append(bt(I.frente, 'Trazer para frente', () => ordem(1)), bt(I.tras, 'Enviar para trás', () => ordem(-1)), bt(I.dup, 'Duplicar (Ctrl+D)', duplicarSel), bt(I.lixo, 'Apagar (Delete)', apagarSel));
  }
  posicionarBarraSel();
}
function posicionarBarraSel() {
  if (!barraSel) return;
  if ((!sel.size && !selLiga) || arrastando || !barraSel.childElementCount) { barraSel.hidden = true; return; }
  let rs;
  if (sel.size) rs = [...sel].map(o => o.getBoundingClientRect());
  else { const t = selLiga.c.querySelector(':scope > svg.linhas .traco.sel'); if (!t) { barraSel.hidden = true; return; } rs = [t.getBoundingClientRect()]; }
  const t = Math.min(...rs.map(r => r.top)), b = Math.max(...rs.map(r => r.bottom)), l = Math.min(...rs.map(r => r.left)), rr = Math.max(...rs.map(r => r.right));
  barraSel.hidden = false;
  const bw = barraSel.offsetWidth, bh = barraSel.offsetHeight;
  barraSel.style.left = Math.max(8, Math.min(innerWidth - bw - 8, (l + rr) / 2 - bw / 2)) + 'px';
  barraSel.style.top = (t - bh - 14 > 8 ? t - bh - 14 : Math.min(innerHeight - bh - 8, b + 14)) + 'px';
}

/* mover, redimensionar */
function iniciarArrasto(e) {
  const objs = [...sel]; if (!objs.length) return;
  const c = objs[0].parentElement, x0 = e.clientX, y0 = e.clientY, ini = objs.map(o => [o.offsetLeft, o.offsetTop]);
  let moveu = false;
  const mv = ev => {
    const dx = (ev.clientX - x0) / escala, dy = (ev.clientY - y0) / escala;
    if (!moveu) { if (Math.hypot(dx, dy) < 4) return; moveu = true; arrastando = true; registrar(c); objs.forEach(o => o.classList.add('arrastando')); barraSel.hidden = true; }
    objs.forEach((o, i) => {
      o.style.left = Math.round(Math.max(0, Math.min(W - o.offsetWidth, ini[i][0] + dx))) + 'px';
      o.style.top = Math.round(Math.max(0, Math.min(H - o.offsetHeight, ini[i][1] + dy))) + 'px';
    });
    desenharLinhas(c);
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); arrastando = false; objs.forEach(o => o.classList.remove('arrastando')); if (moveu) marcarSujo(); posicionarBarraSel(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function iniciarRedim(e, o) {
  e.preventDefault(); e.stopPropagation();
  const c = o.parentElement, x0 = e.clientX, y0 = e.clientY, w0 = o.offsetWidth, h0 = o.offsetHeight, so = SO_LARGURA(o);
  registrar(c); arrastando = true; barraSel.hidden = true;
  const mv = ev => {
    o.style.width = Math.round(Math.max(40, Math.min(W - o.offsetLeft, w0 + (ev.clientX - x0) / escala))) + 'px';
    if (!so) o.style.height = Math.round(Math.max(30, Math.min(H - o.offsetTop, h0 + (ev.clientY - y0) / escala))) + 'px';
    desenharLinhas(c);
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); arrastando = false; marcarSujo(); posicionarBarraSel(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function editarObjeto(o) {
  if (o.matches('.desenho,.imagem') || apresentando) return;
  limparSel();
  o.contentEditable = 'true'; o.focus();
  const alvo = o.matches('.tabela') ? (o.querySelector('th,td')) : o.matches('.escala') ? o.querySelector('.escala-rot') : o;
  const r = document.createRange(); r.selectNodeContents(alvo || o); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  o.addEventListener('blur', () => { o.removeAttribute('contenteditable'); decorarForma(o); desenharLinhas(o.parentElement); }, { once: true });
}
function apagarSel() {
  if (selLiga) { const { c } = selLiga, l = ligaSel(); registrar(c); l?.remove(); limparSel(); desenharLinhas(c); marcarSujo(); return; }
  if (!sel.size) return;
  const c = [...sel][0].parentElement; registrar(c);
  sel.forEach(o => { const id = o.dataset.id; if (id) $$(':scope > .liga', c).forEach(l => { if (l.dataset.de === id || l.dataset.para === id) l.remove(); }); o.remove(); });
  limparSel(); desenharLinhas(c); marcarSujo();
}
function copiaLimpa(o) { const k = o.cloneNode(true); k.querySelectorAll('.redim').forEach(n => n.remove()); k.classList.remove('sel'); k.removeAttribute('contenteditable'); return k; }
function colarEm(c, nodes, desloc = 30) {
  registrar(c); limparSel();
  nodes.forEach(k => {
    k.dataset.id = novoId(c);
    k.style.left = Math.min(W - 60, (parseFloat(k.style.left) || 0) + desloc) + 'px';
    k.style.top = Math.min(H - 40, (parseFloat(k.style.top) || 0) + desloc) + 'px';
    c.append(k); decorarForma(k); sel.add(k); k.classList.add('sel');
  });
  atualizarAlcas(); montarBarraSel(); desenharLinhas(c); marcarSujo();
}
function duplicarSel() { if (!sel.size) return; const c = [...sel][0].parentElement; colarEm(c, [...sel].map(copiaLimpa)); }
/* cores: 0 = sem cor, 1 a 4 = cores do tema, '#hex' = cor livre */
const PALETA = ['#e6d6a8', '#e3c4b9', '#c9d8c1', '#c5cfdc', '#d9cce3', '#f1e3c6',
  '#c9a46c', '#b5654f', '#6f8f6a', '#5a7894', '#8a6f9e', '#9a8f80',
  '#e05a4f', '#f0a43a', '#4caf6a', '#3b82c4', '#8e5bd1', '#e46aa0',
  '#ffffff', '#c8c8cc', '#8a8a90', '#4a4a50', '#26262a', '#0b0b0c'];
function textoSobre(hex) { const n = parseInt(hex.slice(1), 16), l = (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; return l > 0.6 ? '#1d1c1a' : '#ffffff'; }
function normHex(v) { v = String(v || '').trim().toLowerCase(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + [...v.slice(1)].map(c => c + c).join(''); return /^#[0-9a-f]{6}$/.test(v) ? v : null; }
function coresUsadas() {
  const n = {};
  $$('#palco .livre[data-cor="x"]').forEach(o => { const h = normHex(o.style.getPropertyValue('--cor')); if (h) n[h] = (n[h] || 0) + 1; });
  $$('#palco .liga[data-cor^="#"]').forEach(l => { const h = normHex(l.dataset.cor); if (h) n[h] = (n[h] || 0) + 1; });
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(e => e[0]);
}
function corAtual() {
  const o = selLiga ? ligaSel() : [...sel][0]; if (!o) return '';
  if (o.classList.contains('liga')) return o.dataset.cor || '';
  return o.dataset.cor === 'x' ? normHex(o.style.getPropertyValue('--cor')) : (o.dataset.cor || '');
}
function botoesCor() {
  const at = String(corAtual() || '0');
  const sw = (cor, titulo) => { const b = ui('button', { class: 'cor' + (String(cor) === at ? ' on' : ''), title: titulo, onclick: () => pintar(cor) }); if (cor === 0) b.classList.add('c0'); else b.style.background = String(cor).startsWith('#') ? cor : `var(--postit-${cor})`; return b; };
  barraSel.append(sw(0, 'Sem cor'), sw(1, 'Cor 1 do tema'), sw(2, 'Cor 2 do tema'), sw(3, 'Cor 3 do tema'), sw(4, 'Cor 4 do tema'));
  coresUsadas().slice(0, 3).forEach(h => barraSel.append(sw(h, 'Usada neste arquivo: ' + h)));
  barraSel.append(ui('button', { class: 'cor mais', title: 'Mais cores', onclick: e => abrirPopCor(e.currentTarget) }, '+'));
}
function aplicarCor(o, cor) {
  o.style.removeProperty('--cor'); o.style.removeProperty('--cor-texto');
  if (!cor) delete o.dataset.cor;
  else if (String(cor).startsWith('#')) { o.dataset.cor = 'x'; o.style.setProperty('--cor', cor); o.style.setProperty('--cor-texto', textoSobre(cor)); }
  else o.dataset.cor = cor;
}
function pintar(cor) {
  if (selLiga) { const l = ligaSel(); if (!l) return; registrar(selLiga.c); if (cor) l.dataset.cor = cor; else delete l.dataset.cor; desenharLinhas(selLiga.c); marcarSujo(); montarBarraSel(); return; }
  if (!sel.size) return; registrar([...sel][0].parentElement);
  sel.forEach(o => { if (!SEM_COR(o)) aplicarCor(o, cor); }); marcarSujo(); montarBarraSel();
}
function abrirPopCor(ancora) {
  popCor.innerHTML = '';
  popCor.append(el('div', { class: 'menu-rot' }, 'Paleta'));
  const g = el('div', { class: 'grade-cor' });
  PALETA.forEach(h => g.append(ui('button', { class: 'cor', title: h, style: `background:${h}`, onclick: () => { pintar(h); popCor.hidden = true; } })));
  popCor.append(g);
  const usadas = coresUsadas();
  if (usadas.length) { popCor.append(el('div', { class: 'menu-rot' }, 'Usadas neste arquivo')); const u = el('div', { class: 'grade-cor' }); usadas.slice(0, 12).forEach(h => u.append(ui('button', { class: 'cor', title: h, style: `background:${h}`, onclick: () => { pintar(h); popCor.hidden = true; } }))); popCor.append(u); }
  popCor.append(el('div', { class: 'menu-rot' }, 'Personalizada'));
  const at = String(corAtual()); const ini = at.startsWith('#') ? at : '#c9a46c';
  const linha = el('div', { class: 'cor-livre' });
  const pick = el('input', { type: 'color', value: ini, title: 'Escolher qualquer cor' });
  const hex = el('input', { type: 'text', value: ini, maxlength: '7', spellcheck: 'false' });
  const ok = ui('button', { class: 'primario', onclick: () => { const h = normHex(hex.value); if (!h) { toast('Cor inválida. Use o formato #RRGGBB'); return; } pintar(h); popCor.hidden = true; } }, 'Aplicar');
  pick.oninput = () => { hex.value = pick.value; pintar(pick.value); };
  hex.onkeydown = e => { if (e.key === 'Enter') ok.click(); };
  linha.append(pick, hex, ok); popCor.append(linha);
  popCor.hidden = false;
  const r = ancora.getBoundingClientRect();
  popCor.style.left = Math.max(8, Math.min(r.left - 120, innerWidth - popCor.offsetWidth - 8)) + 'px';
  popCor.style.top = (r.bottom + 8 + popCor.offsetHeight < innerHeight ? r.bottom + 8 : Math.max(8, r.top - popCor.offsetHeight - 8)) + 'px';
}
function ordem(d) {
  if (!sel.size) return; const c = [...sel][0].parentElement; registrar(c);
  sel.forEach(o => { if (d > 0) c.append(o); else { const pri = c.querySelector(':scope > .livre'); if (pri && pri !== o) c.insertBefore(o, pri); } });
  desenharLinhas(c); marcarSujo();
}
function opTabela(o, op) {
  const t = o.querySelector('table'); if (!t) return; registrar(o.parentElement);
  const linhas = [...t.rows], ncol = linhas[0]?.cells.length || 0;
  if (op === '+l') { const r = t.insertRow(); for (let i = 0; i < ncol; i++) r.insertCell(); }
  if (op === '-l' && linhas.length > 2) linhas[linhas.length - 1].remove();
  if (op === '+c') linhas.forEach((r, i) => { const c = i === 0 ? document.createElement('th') : document.createElement('td'); if (!i) c.textContent = 'Coluna ' + (ncol + 1); r.append(c); });
  if (op === '-c' && ncol > 1) linhas.forEach(r => r.cells[r.cells.length - 1].remove());
  desenharLinhas(o.parentElement); posicionarBarraSel(); marcarSujo();
}
function opEscala(o, min, max) {
  registrar(o.parentElement); o.dataset.min = min; o.dataset.max = max; delete o.dataset.valor;
  o.querySelector('.niveis').innerHTML = niveisHTML(min, max); montarBarraSel(); marcarSujo();
}
function marcarNivel(n) {
  const o = n.closest('.escala'), v = +n.textContent, min = +o.dataset.min || 0, max = +o.dataset.max || 10;
  registrar(o.parentElement);
  if (o.dataset.valor === String(v)) delete o.dataset.valor; else o.dataset.valor = v;
  const r = (v - min) / (max - min);
  o.dataset.faixa = max === 10 ? (v <= 6 ? 'baixa' : v <= 8 ? 'media' : 'alta') : (r < .4 ? 'baixa' : r < .7 ? 'media' : 'alta');
  $$('.nivel', o).forEach(x => x.classList.toggle('on', o.dataset.valor === x.textContent));
  marcarSujo();
}
function iniciarLaco(e, c) {
  const p0 = pontoEm(c, e), laco = el('div', { class: 'laco', 'data-motor': '' }); c.append(laco);
  const mv = ev => {
    const p = pontoEm(c, ev);
    Object.assign(laco.style, { left: Math.min(p0.x, p.x) + 'px', top: Math.min(p0.y, p.y) + 'px', width: Math.abs(p.x - p0.x) + 'px', height: Math.abs(p.y - p0.y) + 'px' });
  };
  const up = () => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
    const x = laco.offsetLeft, y = laco.offsetTop, w = laco.offsetWidth, h = laco.offsetHeight; laco.remove();
    if (w < 8 && h < 8) return;
    objetos(c).forEach(o => { if (o.offsetLeft < x + w && o.offsetLeft + o.offsetWidth > x && o.offsetTop < y + h && o.offsetTop + o.offsetHeight > y) { sel.add(o); o.classList.add('sel'); } });
    atualizarAlcas(); montarBarraSel();
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}

/* modos: desenhar conexão (seta, linha, dupla) ou desenho livre (lápis) */
function entrarModo(m) {
  modo = m; document.documentElement.dataset.modoFerr = m; limparSel();
  toast(m === 'lapis' ? 'Desenho livre: arraste no slide. Esc para sair.' : 'Arraste de um ponto a outro. Começar ou terminar em cima de um objeto prende a conexão nele.');
}
function sairModo() { modo = null; delete document.documentElement.dataset.modoFerr; }
function iniciarDesenho(e, c) {
  const svg = c.querySelector(':scope > svg.linhas'), pts = [pontoEm(c, e)];
  const tmp = document.createElementNS(NS, 'path'); tmp.setAttribute('class', 'traco temp lapis'); svg.append(tmp);
  const mv = ev => { pts.push(pontoEm(c, ev)); tmp.setAttribute('d', 'M' + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L')); };
  const up = () => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up); tmp.remove();
    if (pts.length < 3) return;
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y), x = Math.min(...xs) - 6, y = Math.min(...ys) - 6, w = Math.max(...xs) - x + 6, h = Math.max(...ys) - y + 6;
    registrar(c);
    const d = 'M' + pts.map(p => `${(p.x - x).toFixed(1)},${(p.y - y).toFixed(1)}`).join('L');
    const o = el('div', { class: 'livre desenho', 'data-id': novoId(c) }, `<svg viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" preserveAspectRatio="none"><path d="${d}"/></svg>`);
    Object.assign(o.style, { left: x.toFixed(0) + 'px', top: y.toFixed(0) + 'px', width: w.toFixed(0) + 'px', height: h.toFixed(0) + 'px' });
    c.append(o); marcarSujo();
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
const centroDe = o => [o.offsetLeft + o.offsetWidth / 2, o.offsetTop + o.offsetHeight / 2];
function iniciarConexao(e, c) {
  const p0 = pontoEm(c, e), A = objetoEm(c, p0), svg = c.querySelector(':scope > svg.linhas');
  const tmp = document.createElementNS(NS, 'path'); tmp.setAttribute('class', 'traco temp'); svg.append(tmp);
  const ini = A ? centroDe(A) : [p0.x, p0.y]; let p1 = null;
  const mv = ev => { p1 = pontoEm(c, ev); tmp.setAttribute('d', `M${ini[0]},${ini[1]}L${p1.x},${p1.y}`); };
  const up = () => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up); tmp.remove();
    const tipo = modo; sairModo();
    if (!p1 || Math.hypot(p1.x - p0.x, p1.y - p0.y) < 20) return;
    const B = objetoEm(c, p1, A);
    registrar(c);
    const l = el('i', { class: 'liga', 'data-tipo': tipo });
    if (A) { if (!A.dataset.id) A.dataset.id = novoId(c); l.dataset.de = A.dataset.id; } else { l.dataset.x1 = Math.round(p0.x); l.dataset.y1 = Math.round(p0.y); }
    if (B) { if (!B.dataset.id) B.dataset.id = novoId(c); l.dataset.para = B.dataset.id; } else { l.dataset.x2 = Math.round(p1.x); l.dataset.y2 = Math.round(p1.y); }
    c.append(l); marcarSujo(); selecionarLiga(c, $$(':scope > .liga', c).length - 1);
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
const ligaSel = () => selLiga ? $$(':scope > .liga', selLiga.c)[selLiga.i] : null;
function estiloLiga(k, v) {
  const l = ligaSel(); if (!l) return; registrar(selLiga.c);
  if (k === 'tipo') l.dataset.tipo = v; else l.toggleAttribute('data-tracejado');
  desenharLinhas(selLiga.c); montarBarraSel(); marcarSujo();
}
function arrastarPonta(e, c, i, qual) {   // qual: 1 = início, 2 = fim
  e.preventDefault(); e.stopPropagation();
  const l = $$(':scope > .liga', c)[i]; if (!l) return; registrar(c); arrastando = true; barraSel.hidden = true;
  const chaveObj = qual === 1 ? 'de' : 'para', outro = c.querySelector(`:scope > [data-id="${CSS.escape(l.dataset[qual === 1 ? 'para' : 'de'] || '-')}"]`);
  const mv = ev => { const p = pontoEm(c, ev); delete l.dataset[chaveObj]; l.dataset['x' + qual] = Math.round(p.x); l.dataset['y' + qual] = Math.round(p.y); desenharLinhas(c); };
  const up = ev => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up); arrastando = false;
    const p = pontoEm(c, ev), B = objetoEm(c, p, outro);
    if (B) { if (!B.dataset.id) B.dataset.id = novoId(c); l.dataset[chaveObj] = B.dataset.id; delete l.dataset['x' + qual]; delete l.dataset['y' + qual]; }
    desenharLinhas(c); posicionarBarraSel(); marcarSujo();
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function arrastarLiga(e, c, i) {
  const l = $$(':scope > .liga', c)[i]; if (!l) return;
  const x0 = e.clientX, y0 = e.clientY, v = ['x1', 'y1', 'x2', 'y2'].map(k => l.dataset[k] !== undefined ? +l.dataset[k] : null); let moveu = false;
  const mv = ev => {
    const dx = (ev.clientX - x0) / escala, dy = (ev.clientY - y0) / escala;
    if (!moveu) { if (Math.hypot(dx, dy) < 4) return; moveu = true; arrastando = true; registrar(c); barraSel.hidden = true; }
    ['x1', 'y1', 'x2', 'y2'].forEach((k, j) => { if (v[j] !== null) l.dataset[k] = Math.round(v[j] + (j % 2 ? dy : dx)); });
    desenharLinhas(c);
  };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); arrastando = false; if (moveu) marcarSujo(); posicionarBarraSel(); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function desenharLinhas(c) {
  if (!c) return; const svg = c.querySelector(':scope > svg.linhas'); if (!svg) return;
  const borda = (p, tx, ty) => {
    const [cx, cy] = centroDe(p), dx = tx - cx, dy = ty - cy;
    const k = Math.min((p.offsetWidth / 2 + 6) / Math.abs(dx || 1e-6), (p.offsetHeight / 2 + 6) / Math.abs(dy || 1e-6));
    return [cx + dx * k, cy + dy * k];
  };
  const ponta = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1), t = 16, m = 7, bx = x2 - t * Math.cos(a), by = y2 - t * Math.sin(a);
    return `M${x2},${y2}L${bx + m * Math.sin(a)},${by - m * Math.cos(a)}L${bx - m * Math.sin(a)},${by + m * Math.cos(a)}Z`; };
  let h = '', ext = '';
  $$(':scope > .liga', c).forEach((l, i) => {
    const d = l.dataset, A = d.de ? c.querySelector(`:scope > [data-id="${CSS.escape(d.de)}"]`) : null, B = d.para ? c.querySelector(`:scope > [data-id="${CSS.escape(d.para)}"]`) : null;
    if ((d.de && !A) || (d.para && !B)) return;
    const pa = A ? centroDe(A) : [+d.x1, +d.y1], pb = B ? centroDe(B) : [+d.x2, +d.y2];
    if (pa.some(isNaN) || pb.some(isNaN)) return;
    const [x1, y1] = A ? borda(A, ...pb) : pa, [x2, y2] = B ? borda(B, ...pa) : pb;
    const tipo = d.tipo || 'seta', s = selLiga && selLiga.c === c && selLiga.i === i ? ' sel' : '', tr = l.hasAttribute('data-tracejado') ? ' tracejado' : '';
    const cor = d.cor ? (d.cor.startsWith('#') ? d.cor : `var(--postit-${d.cor})`) : '', st = cor && !s ? ` style="stroke:${cor}"` : '', sf = cor && !s ? ` style="fill:${cor}"` : '';
    h += `<path class="traco${s}${tr}"${st} d="M${x1},${y1}L${x2},${y2}"/>`;
    if (tipo !== 'linha') h += `<path class="ponta${s}"${sf} d="${ponta(x1, y1, x2, y2)}"/>`;
    if (tipo === 'dupla') h += `<path class="ponta${s}"${sf} d="${ponta(x2, y2, x1, y1)}"/>`;
    h += `<path class="alvo" data-i="${i}" d="M${x1},${y1}L${x2},${y2}"/>`;
    if (s) ext = `<circle class="ext" data-i="${i}" data-q="1" cx="${x1}" cy="${y1}" r="9"/><circle class="ext" data-i="${i}" data-q="2" cx="${x2}" cy="${y2}" r="9"/>`;
  });
  svg.innerHTML = h + ext;
}

/* ── inserir ── */
function inserir(tipo) {
  const c = atual; registrar(c);
  const n = objetos(c).length % 6;
  const tam = { ret: [260, 150], losango: [260, 180], elipse: [200, 200], triangulo: [240, 200], tabela: [720], escala: [760] }[tipo] || [];
  const o = criarObjeto(c, tipo, (tipo === 'tabela' || tipo === 'escala' ? 600 : 800) + n * 30, 400 + n * 30, { w: tam[0], h: tam[1], cor: tipo === 'postit' ? '1' : undefined });
  if (['texto', 'postit', 'ret', 'losango', 'elipse', 'triangulo', 'tabela'].includes(tipo)) editarObjeto(o); else selecionar(o);
}
function inserirImagem(file, c = atual) {
  if (file.size > 4e6) toast('Imagem grande: o arquivo vai ficar pesado. Prefira imagens abaixo de 1 MB.');
  const fr = new FileReader();
  fr.onload = () => {
    registrar(c);
    const o = el('figure', { class: 'livre imagem', 'data-id': novoId(c) }); o.append(el('img', { src: fr.result, alt: '' }));
    Object.assign(o.style, { left: '660px', top: '300px', width: '600px' });
    c.append(o); marcarSujo(); selecionar(o);
  };
  fr.readAsDataURL(file);
}
function abrirPopCaminho(a) {
  const s = a.closest('.slide');
  popCam.innerHTML = '';
  const txt = el('input', { type: 'text', value: a.querySelector('strong')?.textContent || '' });
  const det = el('input', { type: 'text', value: a.querySelector('small')?.textContent || '', placeholder: 'opcional' });
  const dest = el('select');
  slides.forEach(x => { const o = el('option', { value: x.id }); o.textContent = (ramo(x) ? '↳ ' : '') + titulo(x) + '  (#' + x.id + ')'; if (a.getAttribute('href') === '#' + x.id) o.selected = true; dest.append(o); });
  const linha = (r, c) => { const l = el('label', {}, `<span>${r}</span>`); l.append(c); return l; };
  const ok = ui('button', { class: 'primario', onclick: () => {
    registrar(s);
    let st = a.querySelector('strong'); if (!st) { st = el('strong'); a.prepend(st); } st.textContent = txt.value || 'Caminho';
    let sm = a.querySelector('small'); if (det.value) { if (!sm) { sm = el('small'); st.after(sm); } sm.textContent = det.value; } else sm?.remove();
    a.setAttribute('href', '#' + dest.value); popCam.hidden = true; marcarSujo(); toast('Botão atualizado');
  } }, 'Aplicar');
  const rem = ui('button', { onclick: () => { registrar(s); const nav = a.parentElement; a.remove(); if (nav && !nav.querySelector('a')) nav.remove(); popCam.hidden = true; marcarSujo(); } }, 'Remover botão');
  popCam.append(el('div', { class: 'menu-rot' }, 'Botão de caminho'), linha('Texto', txt), linha('Detalhe', det), linha('Leva para', dest));
  const acoes = el('div', { class: 'acoes' }); acoes.append(rem, ok); popCam.append(acoes);
  const r = a.getBoundingClientRect();
  popCam.hidden = false;
  popCam.style.left = Math.max(8, Math.min(r.left, innerWidth - popCam.offsetWidth - 8)) + 'px';
  popCam.style.top = Math.max(8, Math.min(r.bottom + 8, innerHeight - popCam.offsetHeight - 8)) + 'px';
  txt.focus(); txt.select();
}
function novoSlide() {
  const s = el('section', { class: 'slide', id: idUnico('slide'), 'data-titulo': 'Novo slide' });
  s.innerHTML = `<span class="selo">Seção</span><h2>Título do slide</h2><p>Clique para escrever.</p>`;
  atual.after(s); coletar(); prepararSlide(s); marcarSujo(); ir(s.id, 'link'); toast('Slide criado');
}
function duplicarSlide() {
  const c = atual.cloneNode(true);
  c.classList.remove('ativo'); c.querySelectorAll('[data-motor]').forEach(n => n.remove()); c.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
  c.querySelectorAll('.sel').forEach(n => n.classList.remove('sel'));
  c.id = idUnico(atual.id + '-copia'); if (c.dataset.titulo) c.dataset.titulo += ' (cópia)';
  atual.after(c); coletar(); prepararSlide(c); marcarSujo(); ir(c.id); toast('Slide duplicado');
}
function excluirSlide() {
  if (slides.length < 2 || !confirm(`Excluir o slide "${titulo(atual)}"? (não dá para desfazer)`)) return;
  const i = slides.indexOf(atual), viz = slides[i - 1] || slides[i + 1];
  atual.remove(); atual = null; coletar(); marcarSujo(); ir(viz.id); toast('Slide excluído. Se algum botão apontava para ele, o mapa avisa.');
}

/* ── salvar no mesmo arquivo ── */
function gerarHTML() {
  document.activeElement?.blur?.();
  const doc = document.documentElement.cloneNode(true);
  doc.querySelectorAll('[data-motor]').forEach(n => n.remove());
  doc.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable'));
  doc.querySelectorAll('[spellcheck]').forEach(n => n.removeAttribute('spellcheck'));
  doc.querySelectorAll('.ativo,.sel,.pulsar,.arrastando,.saindo,.visto').forEach(n => n.classList.remove('ativo', 'sel', 'pulsar', 'arrastando', 'saindo', 'visto'));
  doc.querySelector('#palco')?.removeAttribute('data-direcao');
  doc.querySelectorAll('[class=""]').forEach(n => n.removeAttribute('class'));
  doc.querySelectorAll('[style=""]').forEach(n => n.removeAttribute('style'));
  doc.querySelectorAll('aside.notas').forEach(n => { if (!n.textContent.trim()) n.remove(); });
  doc.classList.remove('parado', 'apresentando'); if (!doc.className) doc.removeAttribute('class');
  doc.removeAttribute('data-modo-ferr');
  doc.querySelector('#palco')?.removeAttribute('style');
  return '<!doctype html>\n' + doc.outerHTML;
}
const nomeArquivo = () => { try { const p = decodeURIComponent(location.pathname.split('/').pop() || ''); if (/\.html?$/i.test(p)) return p; } catch (e) {} return 'apresentacao.html'; };
function idb(op, valor) {   // guarda o "endereço" do arquivo para salvar direto da próxima vez
  return new Promise(res => {
    try {
      const rq = indexedDB.open('apresentacao-html', 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('arquivos');
      rq.onsuccess = () => { try { const tx = rq.result.transaction('arquivos', op === 'ler' ? 'readonly' : 'readwrite'), st = tx.objectStore('arquivos'), k = location.pathname;
        const r = op === 'ler' ? st.get(k) : st.put(valor, k); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } };
      rq.onerror = () => res(null);
    } catch (e) { res(null); }
  });
}
async function salvar(comoNovo) {
  const html = gerarHTML();
  const feito = msg => { sujo = false; $('#btn-salvar').hidden = true; toast(msg); };
  if (window.showSaveFilePicker) {
    try {
      let h = comoNovo ? null : (arquivo || await idb('ler'));
      if (h && h.queryPermission && (await h.queryPermission({ mode: 'readwrite' })) !== 'granted' && (await h.requestPermission({ mode: 'readwrite' })) !== 'granted') h = null;
      if (!h) {
        toast('Escolha o próprio arquivo da apresentação para substituir. Depois disso, salva direto.');
        h = await showSaveFilePicker({ suggestedName: nomeArquivo(), types: [{ description: 'Apresentação HTML', accept: { 'text/html': ['.html'] } }] });
      }
      const w = await h.createWritable(); await w.write(html); await w.close();
      arquivo = h; idb('gravar', h);
      return feito('Salvo em ' + h.name);
    } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const a = el('a', { href: URL.createObjectURL(new Blob([html], { type: 'text/html' })), download: nomeArquivo() });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  feito('Este navegador não deixa salvar direto. A cópia foi para Downloads: substitua o arquivo original por ela.');
}

/* ── eventos ── */
function onDown(e) {
  if (e.button !== 0) return;
  const t = e.target, s = t.closest('#palco > .slide');
  if (!s || t.closest('.mini')) return;
  if (modo) { e.preventDefault(); if (digitando(document.activeElement)) document.activeElement.blur(); return modo === 'lapis' ? iniciarDesenho(e, s) : iniciarConexao(e, s); }
  if (t.classList.contains('redim')) return iniciarRedim(e, t.parentElement);
  if (t.classList.contains('ext')) return arrastarPonta(e, s, +t.dataset.i, +t.dataset.q);
  const alvo = t.closest('.alvo');
  if (alvo) { e.preventDefault(); selecionarLiga(s, +alvo.dataset.i); return arrastarLiga(e, s, +alvo.dataset.i); }
  const o = t.closest('.livre');
  if (o && !o.isContentEditable) {
    e.preventDefault(); if (digitando(document.activeElement)) document.activeElement.blur();
    const nv = t.closest('.nivel'); if (nv) { marcarNivel(nv); return; }
    if (e.shiftKey) { if (sel.has(o)) { o.classList.remove('sel'); sel.delete(o); atualizarAlcas(); montarBarraSel(); } else selecionar(o, true); return; }
    if (!sel.has(o)) selecionar(o);
    return iniciarArrasto(e);
  }
  if (o) return;
  limparSel();
  if (t === s || t.matches('.area,.zonas,.zona,.regua,.linhas')) { e.preventDefault(); if (digitando(document.activeElement)) document.activeElement.blur(); iniciarLaco(e, s); }
}
function onDbl(e) {
  const t = e.target; if (t.closest('.mini') || modo) return;
  const o = t.closest('.livre');
  if (o && !t.closest('.nivel')) { registrar(o.parentElement); editarObjeto(o); }
}
function proximaCelula(host, voltar) {
  const cel = getSelection().anchorNode?.parentElement?.closest?.('td,th') || getSelection().anchorNode?.closest?.('td,th'); if (!cel) return;
  const todas = $$('th,td', host); let i = todas.indexOf(cel) + (voltar ? -1 : 1);
  if (i >= todas.length) { opTabela(host, '+l'); host.contentEditable = 'true'; i = todas.length; }
  const alvo = $$('th,td', host)[Math.max(0, i)];
  const r = document.createRange(); r.selectNodeContents(alvo); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
}
function teclado(e) {
  const t = e.target, k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (mod && k === 's') { e.preventDefault(); salvar(e.shiftKey); return; }
  if (digitando(t)) {
    if (e.key === 'Escape') t.blur();
    if (e.key === 'Tab' && t.classList.contains('tabela')) { e.preventDefault(); proximaCelula(t, e.shiftKey); }
    return;
  }
  if (mod && (k === 'z' || k === 'y')) { e.preventDefault(); if (k === 'y' || e.shiftKey) restaurar(refazerP, desfazerP); else restaurar(desfazerP, refazerP); return; }
  if (mod && k === 'd') { e.preventDefault(); duplicarSel(); return; }
  if (mod && k === 'c' && sel.size) { e.preventDefault(); clip = [...sel].map(copiaLimpa); toast('Copiado'); return; }
  if (mod || e.altKey) return;
  if ((sel.size || selLiga) && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); apagarSel(); return; }
  if (sel.size && e.key.startsWith('Arrow')) {
    e.preventDefault(); const c = [...sel][0].parentElement, p = e.shiftKey ? 40 : 4; registrar(c);
    sel.forEach(o => { o.style.left = o.offsetLeft + (e.key === 'ArrowLeft' ? -p : e.key === 'ArrowRight' ? p : 0) + 'px'; o.style.top = o.offsetTop + (e.key === 'ArrowUp' ? -p : e.key === 'ArrowDown' ? p : 0) + 'px'; });
    desenharLinhas(c); posicionarBarraSel(); marcarSujo(); return;
  }
  switch (e.key) {
    case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); avancar(); break;
    case 'ArrowLeft': case 'PageUp': e.preventDefault(); voltar(); break;
    case 'Home': ir(lineares()[0].id); break;
    case 'End': { const L = lineares(); ir(L[L.length - 1].id); break; }
    case 'f': case 'F': telaCheia(); break;
    case 'p': case 'P': abrirApresentador(); break;
    case 's': case 'S': alternar('lateral'); break;
    case 'm': case 'M': alternar('mapa'); break;
    case 'i': case 'I': alternar('inserir'); break;
    case 't': case 'T': alternarModo(); break;
    case '?': alternar('ajuda'); break;
    case 'Escape':
      if (modo) { sairModo(); break; }
      if (sel.size || selLiga) { limparSel(); break; }
      fecharPaineis(); break;
  }
}
function iniciar() {
  coletar(); montarUI();
  if (!document.documentElement.dataset.modo) document.documentElement.dataset.modo = 'escuro';
  slides.forEach(prepararSlide); ajustar();
  addEventListener('resize', () => { ajustar(); slides.forEach(desenharLinhas); });
  document.addEventListener('keydown', teclado);
  document.addEventListener('mousemove', mostrarBarra);
  document.addEventListener('fullscreenchange', () => {
    apresentando = !!document.fullscreenElement; document.documentElement.classList.toggle('apresentando', apresentando);
    if (apresentando) desligarTexto(); else ligarTexto(); limparSel(); ajustar();
  });
  palco.addEventListener('pointerdown', onDown);
  palco.addEventListener('dblclick', onDbl);
  palco.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.closest('.mini')) return;
    e.preventDefault();
    if (e.target.closest('.chip-destino')) { abrirPopCaminho(a); return; }
    ir(decodeURIComponent(a.getAttribute('href').slice(1)), 'link');
  });
  palco.addEventListener('input', marcarSujo);
  document.addEventListener('paste', e => {
    if (digitando(e.target)) return;
    const f = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
    if (f) { e.preventDefault(); inserirImagem(f); return; }
    if (clip) { e.preventDefault(); colarEm(atual, clip.map(n => n.cloneNode(true))); }
  });
  document.addEventListener('pointerdown', e => {
    if (!menuIns.hidden && !e.target.closest('#menu-inserir,#btn-inserir')) menuIns.hidden = true;
    if (!popCam.hidden && !e.target.closest('#pop-caminho,.chip-destino')) popCam.hidden = true;
    if (!popCor.hidden && !e.target.closest('#pop-cor,#barra-sel')) popCor.hidden = true;
  });
  addEventListener('hashchange', () => { const id = decodeURIComponent(location.hash.slice(1)); if (atual && id && id !== atual.id) ir(id); });
  addEventListener('beforeunload', e => { if (sujo) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('pagehide', () => { if (pop && !pop.closed) pop.close(); });
  addEventListener('beforeprint', () => { limparSel(); slides.forEach(desenharLinhas); });
  let id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
  const s = porId(id) || lineares()[0] || slides[0];
  trilha = [s.id]; mostrar(s); mostrarBarra();
  window.apresentacao = { ir, avancar, voltar, analisar, salvar, inserir, entrarModo, slideAtual: () => atual };
}
iniciar();
})();
</script>
</body>
</html>
