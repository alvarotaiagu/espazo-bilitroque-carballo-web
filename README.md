# Espazo Bilitroque · Carballo

Web nova para **Espazo Bilitroque · Espazo de formación** (Rúa Perú, 14, baixo,
15100 Carballo, A Coruña), en substitución da web de Webnode
(`espazo-bilitroque.webnode.es`).

Escríbese **en galego por defecto**, que é a voz real do centro, cunha versión
en castelán en `/es/` co mesmo contido e `hreflang` recíproco.

- Galego: `https://alvarotaiagu.github.io/espazo-bilitroque-carballo-web/`
- Castelán: `https://alvarotaiagu.github.io/espazo-bilitroque-carballo-web/es/`

---

## Concepto: «Burbullas»

O logo do centro son círculos de cor que se superpoñen, con iconas garabateadas
dentro. A web é iso levado a estrutura:

- **Hero**: oito círculos entran flotando desde os bordos a velocidades
  distintas, superpóñense en `mix-blend-mode: multiply` sobre branco e forman a
  coroa arredor do wordmark «Bilitroque», que se acende letra a letra coas cores
  do logo. Dentro dos círculos, as iconas debúxanse en trazo.
- **Áreas**: sticky-stack de seis tarxetas; detrás, unha burbulla grande que
  **só cambia de cor** entre tarxetas (crossfade de cor, non de forma).
- **Prezos**: oito burbullas coa cifra enorme e contador.
- **Separadores**: unha fila de círculos pequenos de cores.

Modo claro sempre. Sen degradados, sen fondo escuro, sen canvas, sen filtros
SVG de gooey. `mix-blend-mode: multiply` úsase só sobre branco sólido (as
seccións grises non mesturan).

**Paleta por área**: informática laranxa `#F28C28`, robótica verde `#2FA84F`,
programación azul `#2F80ED`, impresión 3D morado `#7B4FBF`, reforzo amarelo
`#F7D33D`, adultos vermello `#E0463C`, Campus turquesa `#3BB8A9`, extras rosa
`#F48FB1`. Base branco `#FFFFFF`, bloques `#F2F4F7`, texto `#1E2A44`.

**Tipografía**: Fredoka (titulares, redondeada e grosa, próxima ás letras do
logo) e Nunito (corpo). Cada titular en dúas cores, nunca máis.

---

## Que hai dentro

```
index.html            galego (raíz)
es/index.html         castelán · XÉRASE con scripts/build_es.py, non se edita a man
css/style.css
js/main.js            movemento e utilidades (as dúas versións comparten ficheiro)
404.html  manifest.json  robots.txt  sitemap.xml
assets/img/brand/     logo real do centro + marca SVG + iconas de aplicación
assets/img/photos/    fotografía de arquivo de Pexels, gradada
assets/img/ilustracion/  ilustración plana de personaxes (propia)
scripts/              follas de contacto, proceso de fotos, xerador do castelán,
                      capturas e comprobacións con Playwright
```

### Editar contido

O galego é o orixinal. Despois de tocar `index.html`:

```bash
python scripts/build_es.py        # rexenera es/index.html
```

Se cambia unha frase en galego que estaba no dicionario, o guión **para** e di
cal: iso é a propósito, para que a versión castelá non quede vella en silencio.

### Comprobar

```bash
python -m http.server 8731 --bind 127.0.0.1
NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js /index.html
NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js /es/index.html
NODE_PATH=/c/Users/alvar/node_modules node scripts/shot.js /index.html 1440 d
```

`verify.js` comproba, nas dúas linguas e en tres escenarios (normal, movemento
reducido e CDN caído): que o botón do aviso de cookies pecha de verdade, que o
mapa non contacta con Google ata que se preme, que as burbullas quedan
colocadas e as iconas debuxadas, que os contadores paran no valor real, que non
hai canvas nin gooey, que multiply só cae sobre branco, e que non hai
desprazamento horizontal de 1440 a 360 px.

---

## De onde vén cada dato

### Confirmado (do centro, da súa web ou da súa ficha de Google)

| Dato | Orixe |
|---|---|
| Nome, categoría | Ficha de Google · «Centro educativo» |
| Rúa Perú, 14, baixo, 15100 Carballo | Dato do cliente |
| 722 482 607 | Dato do cliente |
| espazobilitroque@gmail.com | Dato do cliente |
| 5,0 ★ con 5 reseñas | Ficha de Google |
| Luns a venres 16:00–20:00; sábado e domingo pechado | Ficha de Google |
| Instagram e Facebook | Dato do cliente |
| Os 8 prezos | Páxina `/precios/` da súa web |
| Áreas (informática, robótica, programación, impresión 3D, reforzo, adultos) | A súa web |
| Textos «Aprende e crea tecnoloxía», «espazo dinámico e moderno…», «potenciar as habilidades…», os dos cursos de robótica, programación e impresión 3D | A súa web, adaptados ao galego normativo |
| Campus Futuro 2026 e os catro grupos por idade | A súa web |
| Logo | PNG real da súa web (`assets/img/brand/bilitroque-logo.png`), usado tal cal |

### Marcado como pendente na propia web

Nada disto se inventou. Aparece cun selo visible para que se vexa que falta:

- `[CONFIRMAR IDADES]` — Google di «educación preescolar», a súa web «de 4 a 15
  anos». Non cadran.
- `[HORARIO POR GRUPO PENDENTE]` — non consta que grupos hai nin a que hora.
- `[LINGUAXES E NIVEIS PENDENTES]` — programación.
- `[DURACIÓN DO TALLER PENDENTE]` — taller de impresión 3D de 20 €.
- `[MATERIAS PENDENTES]` — reforzo escolar.
- `[CONTIDOS, NIVEIS E GRUPOS PENDENTES]` — adultos.
- `[PREZOS VIXENTES NA SÚA WEB — CONFIRMAR]` e `[MATRÍCULA PENDENTE]` — non
  consta se hai matrícula, material aparte ou desconto por irmáns.
- `[PRAZOS E MATERIAIS PENDENTES]` — impresión 3D baixo demanda.
- `[PRÓXIMA EDICIÓN PENDENTE]` — Campus Futuro.
- `[TEXTO DE RESEÑA PENDENTE]` ×3 — a valoración (5,0 · 5) é real; os textos non
  os temos.
- `[FOTO REAL — REQUIRE CONSENTIMENTO]` — oco para as fotos do local e das
  clases.
- `[FORMULARIO SEN SERVIDOR]` — ver máis abaixo.

### Descartado a propósito

- **`981 709 011` e «Fórum Carballo (2º andar)»**, que aparecen na súa web: son
  do **Campus Futuro / Aula CeMIT do Concello**, non do centro. A web nova usa o
  722 482 607 e a Rúa Perú, 14.
- **`contacto@ejemplo.com`**: é o texto de exemplo que trae Webnode.
- **A marca gráfica do Campus Futuro**: organízao o Concello e finánciao a UE.
  Aquí figura como credencial («impartímolo nós»), nunca como marca propia nin
  como oferta aberta.

---

## Imaxes

**Non hai fotos reais do centro.** Todas as fotografías son de arquivo de
Pexels, recortadas e gradadas ao aire claro da marca
(`scripts/process_photos.py`, rexistro en `scripts/photos_log.txt`), e van
etiquetadas na propia páxina como «Imaxe de arquivo».

**Ningunha mostra caras de menores.** Só mans, obxectos, pantallas e salas
baleiras. Descartouse a propósito unha foto candidata (Pexels 7869045) porque o
recorte cadrado deixaba ver o queixo dun rapaz.

O alumnado represéntase con **ilustración plana propia** (catro personaxes en
`assets/img/ilustracion/`), como fan os seus propios carteis.

Cando cheguen fotos reais do local ou das clases, as das clases **requiren
consentimento escrito das familias** se aparecen menores.

---

## Cousas que faltan para poñela en produción

1. **Os datos marcados como pendentes** de máis arriba.
2. **O formulario**: a web é estática, así que «Reserva praza» abre o programa
   de correo cunha mensaxe xa redactada. Se se quere que chegue soa a unha
   bandexa de entrada, hai que conectalo a un servizo de formularios (Formspree,
   Basin, Web3Forms…) e substituír o `mailto` de `initFormulario()`.
3. **Dominio propio**: as URL canónicas, o `sitemap.xml` e os `hreflang` apuntan
   a GitHub Pages. Cámbiense todos á vez cando haxa dominio.
4. **Aviso legal e política de privacidade**: a web non usa cookies de terceiros
   nin analítica e o mapa só carga baixo demanda, pero o formulario recolle
   datos persoais de menores, así que convén unha páxina legal cando se conecte.
5. **Proporcións do logo**: o logo úsase tal cal desde o PNG da súa web. Se
   existe o orixinal vectorial, mellor substituílo.
