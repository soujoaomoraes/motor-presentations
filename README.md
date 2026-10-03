# Motor de Apresentações

Base das apresentações interativas em um arquivo só (funciona offline): tela cheia, apresentador com notas,
runbook com mapa de caminhos, texto editável, objetos livres, conexões, tabela, escala, cores, PDF e salvar no próprio arquivo.

Usado pela skill `apresentacao-html-interativa`. A skill baixa os arquivos direto para o disco, sem ler o motor.

| Arquivo | Para que serve |
|---|---|
| `base.html` | Começo de toda apresentação nova: guia de edição, tema, blocos de estilo e efeitos vazios, marcador `<!-- SLIDES AQUI -->`. |
| `motor.min.html` | Motor compactado. Vai no fim de cada arquivo final. |
| `motor.legivel.html` | Mesmo motor, legível. Só para manutenção. |
| `modelo.html` | Apresentação de exemplo com todos os tipos de slide. |
| `montar.py` | Junta `slides.html`, `estilo.css`, `efeitos.js`, `tema.css` e `titulo.txt` com a base e o motor. |
| `manutencao/` | Fontes do motor (`motor.css`, `motor.js`, `conteudo.html` do exemplo) e o script que gera os arquivos acima. |

## Usar

```bash
V=v3; U=https://raw.githubusercontent.com/soujoaomoraes/motor-presentations/$V
curl -sLO $U/base.html && curl -sLO $U/motor.min.html && curl -sLO $U/montar.py
python3 montar.py . apresentacao.html
```

## Manter

Edite `manutencao/motor.css` e `manutencao/motor.js`, depois:

```bash
cd manutencao && npm install terser csso && mkdir -p dist && node build.js . && cp dist/* ..
```

Teste com `modelo.html`, faça o commit e crie uma etiqueta nova (`v4`, `v5`...). Apresentações antigas continuam funcionando com o motor que já carregam.
