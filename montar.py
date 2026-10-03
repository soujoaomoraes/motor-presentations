import pathlib, re, sys
# uso: python3 montar.py PASTA_DO_MOTOR saida.html   (lê slides.html e, se existirem, estilo.css, efeitos.js, tema.css, titulo.txt)
m, saida = pathlib.Path(sys.argv[1]), sys.argv[2]
base, motor = (m/'base.html').read_text(), (m/'motor.min.html').read_text()
ler = lambda n: pathlib.Path(n).read_text() if pathlib.Path(n).exists() else None
base = base.replace('<!-- SLIDES AQUI -->', ler('slides.html'))
for arq, bloco in [('estilo.css', 'style id="estilo"'), ('efeitos.js', 'script id="efeitos"'), ('tema.css', 'style id="tema"')]:
    t = ler(arq)
    if t is not None:
        tag = bloco.split()[0]
        base = re.sub(r'(?m)^(<%s>)[\s\S]*?(</%s>)' % (re.escape(bloco), tag), lambda x: x.group(1) + '\n' + t.strip() + '\n' + x.group(2), base, count=1)
if ler('titulo.txt'): base = base.replace('TÍTULO DA APRESENTAÇÃO', ler('titulo.txt').strip())
pathlib.Path(saida).write_text(base + motor)
print('ok', saida, len(base + motor), 'bytes')
