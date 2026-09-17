# -*- coding: utf-8 -*-
"""Xera es/index.html a partir de index.html.

A web escríbese en galego, que é a voz real do centro. O castelán é
unha tradución da MESMA páxina: mesma estrutura, mesmos ocos de dato
pendente, mesmos anchors. Por iso non se mantén unha segunda páxina a
man (divergirían á primeira corrección) senón que se xera con este
dicionario.

Regras:
· Cada entrada ten que aparecer polo menos unha vez no orixinal. Se
  algunha non aparece, o guión para: significa que se cambiou o galego
  e a tradución quedou vella.
· Aplícanse de máis longa a máis curta, para que «Prezos claros, sen
  letra pequena» non se rompa en anacos antes de tempo.
· «Espazo Bilitroque», «espazobilitroque@gmail.com» e o nome do
  repositorio NON se tocan: o nome propio do centro é en galego.

Uso:  python scripts/build_es.py
"""
import io
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ----------------------------------------------------------------------
# 1. Cabeceira do documento: idioma, canónicas e rutas relativas
# ----------------------------------------------------------------------
CABECEIRA = [
    ('<html lang="gl">', '<html lang="es">'),

    ('<title>Espazo Bilitroque · Espazo de formación tecnolóxica en Carballo</title>',
     '<title>Espazo Bilitroque · Espacio de formación tecnológica en Carballo</title>'),

    ('content="Espazo de formación en Carballo: informática, robótica, programación, '
     'impresión 3D, reforzo escolar e clases particulares para nenas e nenos de 4 a 15 anos, '
     'e informática para adultos. Rúa Perú, 14. 5,0 ★ en Google."',
     'content="Espacio de formación en Carballo: informática, robótica, programación, '
     'impresión 3D, refuerzo escolar y clases particulares para niñas y niños de 4 a 15 años, '
     'e informática para adultos. Rúa Perú, 14. 5,0 ★ en Google."'),

    ('<link rel="canonical" href="https://alvarotaiagu.github.io/espazo-bilitroque-carballo-web/">',
     '<link rel="canonical" href="https://alvarotaiagu.github.io/espazo-bilitroque-carballo-web/es/">'),

    ('<meta property="og:locale" content="gl_ES">\n<meta property="og:locale:alternate" content="es_ES">',
     '<meta property="og:locale" content="es_ES">\n<meta property="og:locale:alternate" content="gl_ES">'),

    ('<meta property="og:title" content="Espazo Bilitroque · Espazo de formación tecnolóxica en Carballo">',
     '<meta property="og:title" content="Espazo Bilitroque · Espacio de formación tecnológica en Carballo">'),

    ('<meta property="og:description" content="Informática, robótica, programación, impresión 3D, '
     'reforzo escolar e clases para adultos. Rúa Perú, 14, Carballo. Luns a venres, 16–20 h.">',
     '<meta property="og:description" content="Informática, robótica, programación, impresión 3D, '
     'refuerzo escolar y clases para adultos. Rúa Perú, 14, Carballo. Lunes a viernes, 16–20 h.">'),

    ('<meta property="og:url" content="https://alvarotaiagu.github.io/espazo-bilitroque-carballo-web/">',
     '<meta property="og:url" content="https://alvarotaiagu.github.io/espazo-bilitroque-carballo-web/es/">'),

    # datos estruturados
    ('"description": "Centro de formación en Carballo especializado en informática, robótica, '
     'programación e impresión 3D, con reforzo escolar, clases particulares e informática para adultos.",',
     '"description": "Centro de formación en Carballo especializado en informática, robótica, '
     'programación e impresión 3D, con refuerzo escolar, clases particulares e informática para adultos.",'),
    ('"inLanguage": "gl",\n      "address"', '"inLanguage": "es",\n      "address"'),
    ('"inLanguage": "gl",\n      "publisher"', '"inLanguage": "es",\n      "publisher"'),
    ('"name": "Clases particulares (dúas sesións semanais)"',
     '"name": "Clases particulares (dos sesiones semanales)"'),
    ('"name": "Iniciación á programación"', '"name": "Iniciación a la programación"'),
    ('"name": "Introdución á impresión 3D"', '"name": "Introducción a la impresión 3D"'),
    ('"name": "Talleres prácticos de impresión 3D"', '"name": "Talleres prácticos de impresión 3D"'),
    ('"description": "Ao mes"', '"description": "Al mes"'),
    ('"description": "Por hora"', '"description": "Por hora"'),
]

# rutas: a páxina castelá vive un nivel máis abaixo
RUTAS = [
    ('href="css/style.css"', 'href="../css/style.css"'),
    ('src="js/main.js"', 'src="../js/main.js"'),
    ('href="manifest.json"', 'href="../manifest.json"'),
    ('href="assets/', 'href="../assets/'),
    ('src="assets/', 'src="../assets/'),
    # selector de idioma e pé
    ('<a href="./" aria-current="true" lang="gl" hreflang="gl">GL</a>\n      <a href="es/" lang="es" hreflang="es">ES</a>',
     '<a href="../" lang="gl" hreflang="gl">GL</a>\n      <a href="./" aria-current="true" lang="es" hreflang="es">ES</a>'),
    ('<li><a href="./" hreflang="gl">Galego</a></li>\n          <li><a href="es/" hreflang="es">Castelán</a></li>',
     '<li><a href="../" hreflang="gl">Galego</a></li>\n          <li><a href="./" hreflang="es">Castellano</a></li>'),
]

# ----------------------------------------------------------------------
# 2. Contido. De máis longo a máis curto (ordénase só máis abaixo).
# ----------------------------------------------------------------------
TEXTOS = [
    # --- hero e navegación ---
    ('Ir ao contido', 'Ir al contenido'),
    ('aria-label="Espazo Bilitroque, inicio"', 'aria-label="Espazo Bilitroque, inicio"'),
    ('aria-label="Abrir o menú"', 'aria-label="Abrir el menú"'),
    ('<span class="marca-sub">Espazo de formación</span>',
     '<span class="marca-sub">Espacio de formación</span>'),
    ('<span class="wordmark-sup">Espazo</span>', '<span class="wordmark-sup">Espacio</span>'),
    ('<span class="wordmark-sub">De formación</span>', '<span class="wordmark-sub">De formación</span>'),
    ('Que facemos', 'Qué hacemos'),
    ('Reserva praza', 'Reserva plaza'),
    ('Espazo Bilitroque · espazo de formación tecnolóxica en Carballo',
     'Espazo Bilitroque · espacio de formación tecnológica en Carballo'),
    ('Espazo de formación · <b>Carballo</b> · de 4 a 15 anos e adultos',
     'Espacio de formación · <b>Carballo</b> · de 4 a 15 años y adultos'),
    ('reseñas en Google', 'reseñas en Google'),
    ('Luns a venres, 16–20&nbsp;h', 'Lunes a viernes, 16–20&nbsp;h'),
    ('Ver prezos', 'Ver precios'),
    ('Baixa e mira', 'Baja y mira'),

    # --- que facemos ---
    ('<span class="ct-tinta" data-split-char>Aprende e crea</span> <span class="ct-laranxa" data-split-char>tecnoloxía</span>',
     '<span class="ct-tinta" data-split-char>Aprende y crea</span> <span class="ct-laranxa" data-split-char>tecnología</span>'),
    ('Un espazo dinámico e moderno onde aprender de forma práctica e amena, para potenciar as '
     'habilidades e os coñecementos dos nosos alumnos. Cada área, a súa burbulla de cor.',
     'Un espacio dinámico y moderno donde aprender de forma práctica y amena, para potenciar las '
     'habilidades y los conocimientos de nuestros alumnos. Cada área, su burbuja de color.'),

    ('O manexo do ordenador como ferramenta: o sistema, os arquivos, internet con cabeza e as '
     'aplicacións que se usan a diario. A base sobre a que despois se constrúe todo o demais.',
     'El manejo del ordenador como herramienta: el sistema, los archivos, internet con cabeza y las '
     'aplicaciones que se usan a diario. La base sobre la que después se construye todo lo demás.'),
    ('Os cursos de robótica son unha excelente oportunidade para desenvolver habilidades tecnolóxicas '
     'e creativas: montar, programar, probar e volver empezar ata que a cousa se move.',
     'Los cursos de robótica son una excelente oportunidad para desarrollar habilidades tecnológicas '
     'y creativas: montar, programar, probar y volver a empezar hasta que la cosa se mueve.'),
    ('As clases de programación son unha ferramenta fundamental para aprender a desenvolver '
     'aplicacións e sistemas de maneira eficiente e efectiva. Empézase por onde toque segundo a idade.',
     'Las clases de programación son una herramienta fundamental para aprender a desarrollar '
     'aplicaciones y sistemas de manera eficiente y efectiva. Se empieza por donde toque según la edad.'),
    ('Da idea á peza que se pode coller coa man: deseñar en tres dimensións, preparar o arquivo e ver '
     'como a impresora o vai levantando capa a capa. Tamén en formato de taller solto.',
     'De la idea a la pieza que se puede coger con la mano: diseñar en tres dimensiones, preparar el '
     'archivo y ver cómo la impresora lo va levantando capa a capa. También en formato de taller suelto.'),
    ('Apoio para o alumnado de primaria e clases particulares en grupos pequenos, co material do '
     'propio colexio. Dúas sesións á semana.',
     'Apoyo para el alumnado de primaria y clases particulares en grupos pequeños, con el material del '
     'propio colegio. Dos sesiones a la semana.'),
    ('Clases de informática para persoas adultas, por horas e sen matrícula de curso: vense as dúbidas '
     'que un trae de casa e vaise ao ritmo de cada quen.',
     'Clases de informática para personas adultas, por horas y sin matrícula de curso: se ven las dudas '
     'que uno trae de casa y se va al ritmo de cada cual.'),

    ('<h3 class="area-nome">Iniciación á programación</h3>', '<h3 class="area-nome">Iniciación a la programación</h3>'),
    ('<h3 class="area-nome">Reforzo escolar e clases particulares</h3>',
     '<h3 class="area-nome">Refuerzo escolar y clases particulares</h3>'),
    ('Nenas e nenos', 'Niñas y niños'),
    ('Horario por grupo pendente', 'Horario por grupo pendiente'),
    ('Linguaxes e niveis pendentes', 'Lenguajes y niveles pendientes'),
    ('Duración do taller pendente', 'Duración del taller pendiente'),
    ('Taller solto: 20&nbsp;€', 'Taller suelto: 20&nbsp;€'),
    ('Dúas sesións semanais', 'Dos sesiones semanales'),
    ('Materias pendentes', 'Materias pendientes'),
    ('Contidos e niveis pendentes', 'Contenidos y niveles pendientes'),
    ('Grupos e horarios pendentes', 'Grupos y horarios pendientes'),
    ('O reparto de grupos por idade e a hora exacta de cada clase aínda non están confirmados polo '
     'centro. O horario de apertura si: de luns a venres, de 16:00 a 20:00.',
     'El reparto de grupos por edad y la hora exacta de cada clase todavía no están confirmados por el '
     'centro. El horario de apertura sí: de lunes a viernes, de 16:00 a 20:00.'),

    # --- marquee ---
    ('>Reforzo escolar<', '>Refuerzo escolar<'),
    ('>Clases particulares<', '>Clases particulares<'),

    # --- prezos ---
    ('<span class="ct-tinta" data-split-char>Prezos claros,</span> <span class="ct-verde" data-split-char>sen letra pequena</span>',
     '<span class="ct-tinta" data-split-char>Precios claros,</span> <span class="ct-verde" data-split-char>sin letra pequeña</span>'),
    ('Estes son os prezos publicados polo centro. Se algo cambiou, mándanos aviso e corríxese.',
     'Estos son los precios publicados por el centro. Si algo ha cambiado, mándanos aviso y se corrige.'),
    ('<span class="prezo-nome">Iniciación á programación</span>',
     '<span class="prezo-nome">Iniciación a la programación</span>'),
    ('<span class="prezo-nome">Introdución á impresión 3D</span>',
     '<span class="prezo-nome">Introducción a la impresión 3D</span>'),
    ('<span class="prezo-nome">Impresión 3D baixo demanda</span>',
     '<span class="prezo-nome">Impresión 3D bajo demanda</span>'),
    ('<span class="prezo-unidade">ao mes</span>', '<span class="prezo-unidade">al mes</span>'),
    ('<span class="prezo-unidade">por taller</span>', '<span class="prezo-unidade">por taller</span>'),
    ('<span class="prezo-unidade">segundo a peza</span>', '<span class="prezo-unidade">según la pieza</span>'),
    ('<span class="prezo-nota">Dúas sesións semanais</span>', '<span class="prezo-nota">Dos sesiones semanales</span>'),
    ('Prezos vixentes na súa web — confirmar', 'Precios vigentes en su web — confirmar'),
    ('Tomados da páxina de prezos do propio centro. Non consta se hai matrícula, material aparte ou '
     'desconto por irmáns:', 'Tomados de la página de precios del propio centro. No consta si hay '
     'matrícula, material aparte o descuento por hermanos:'),
    ('matrícula pendente', 'matrícula pendiente'),

    # --- campus ---
    ('Credencial', 'Credencial'),
    ('<span class="ct-tinta" data-split-char>Impartimos o</span> <span class="ct-turquesa" data-split-char>Campus Futuro 2026</span>',
     '<span class="ct-tinta" data-split-char>Impartimos el</span> <span class="ct-turquesa" data-split-char>Campus Futuro 2026</span>'),
    ('O Concello de Carballo organizou os campamentos tecnolóxicos do verán de 2026 na Aula CeMIT, '
     'financiados pola Unión Europea. A formación impartímola nós.',
     'El Concello de Carballo organizó los campamentos tecnológicos del verano de 2026 en el Aula CeMIT, '
     'financiados por la Unión Europea. La formación la impartimos nosotros.'),
    ('Edición xa rematada · do 6 de xullo ao 28 de agosto de 2026',
     'Edición ya terminada · del 6 de julio al 28 de agosto de 2026'),
    ('Catro grupos por idade, de 7 a 14 anos. Non é unha oferta aberta: figura aquí como experiencia do '
     'centro. A marca gráfica do Campus e a organización son do Concello de Carballo e da Aula CeMIT.',
     'Cuatro grupos por edad, de 7 a 14 años. No es una oferta abierta: figura aquí como experiencia del '
     'centro. La marca gráfica del Campus y la organización son del Concello de Carballo y del Aula CeMIT.'),
    ('alt="Ilustración: unha rapaza cun robot"', 'alt="Ilustración: una chica con un robot"'),
    ('alt="Ilustración: un rapaz cun portátil"', 'alt="Ilustración: un chico con un portátil"'),
    ('alt="Ilustración: unha rapaza cunha peza impresa en 3D"',
     'alt="Ilustración: una chica con una pieza impresa en 3D"'),
    ('alt="Ilustración: un rapaz cunha cámara"', 'alt="Ilustración: un chico con una cámara"'),
    ('<h3>Pequenos exploradores</h3>', '<h3>Pequeños exploradores</h3>'),
    ('Robótica básica e historias dixitais.', 'Robótica básica e historias digitales.'),
    ('Crea os teus propios videoxogos con Scratch.', 'Crea tus propios videojuegos con Scratch.'),
    ('Deseño 3D e intelixencia artificial.', 'Diseño 3D e inteligencia artificial.'),
    ('Edición de vídeo, ciberseguridade e web.', 'Edición de vídeo, ciberseguridad y web.'),
    ('<strong>Onde foi:</strong> Aula CeMIT do Concello de Carballo (Fórum Carballo). '
     '<strong>Quen organiza:</strong> Concello de Carballo, financiado pola Unión Europea. '
     '<strong>Quen imparte:</strong> Espazo Bilitroque.',
     '<strong>Dónde fue:</strong> Aula CeMIT del Concello de Carballo (Fórum Carballo). '
     '<strong>Quién organiza:</strong> Concello de Carballo, financiado por la Unión Europea. '
     '<strong>Quién imparte:</strong> Espazo Bilitroque.'),
    ('Próxima edición pendente', 'Próxima edición pendiente'),
    ('Non hai confirmación de que vaia repetirse nin en que datas.',
     'No hay confirmación de que vaya a repetirse ni en qué fechas.'),

    # --- impresión 3D baixo demanda ---
    ('Baixo demanda', 'Bajo demanda'),
    ('<span class="ct-tinta" data-split-char>Tráenos</span> <span class="ct-morado" data-split-char>a túa peza</span>',
     '<span class="ct-tinta" data-split-char>Tráenos</span> <span class="ct-morado" data-split-char>tu pieza</span>'),
    ('Grazas á impresión 3D personalizada pódese crear unha peza única e exclusiva que se adapte '
     'perfectamente ás necesidades e aos gustos de cada quen. Non hai que ser alumno para encargala.',
     'Gracias a la impresión 3D personalizada se puede crear una pieza única y exclusiva que se adapte '
     'perfectamente a las necesidades y a los gustos de cada cual. No hay que ser alumno para encargarla.'),
    ('Cóntanos que precisas: un arquivo, un debuxo ou a peza rota que queres substituír.',
     'Cuéntanos qué necesitas: un archivo, un dibujo o la pieza rota que quieres sustituir.'),
    ('Miramos se é imprimible e con que material.', 'Miramos si es imprimible y con qué material.'),
    ('Dámosche o prezo antes de poñer a impresora en marcha.',
     'Te damos el precio antes de poner la impresora en marcha.'),
    ('Prazos e materiais pendentes', 'Plazos y materiales pendientes'),
    ('Pedir prezo por correo', 'Pedir precio por correo'),
    ('alt="Unha impresora 3D levantando unha peza capa a capa"',
     'alt="Una impresora 3D levantando una pieza capa a capa"'),
    ('Imaxe de arquivo, non do local', 'Imagen de archivo, no del local'),

    # --- adultos ---
    ('<span class="ct-tinta" data-split-char>Informática</span> <span class="ct-vermello" data-split-char>para adultos</span>',
     '<span class="ct-tinta" data-split-char>Informática</span> <span class="ct-vermello" data-split-char>para adultos</span>'),
    ('Ofrecemos clases particulares e cursos para todas as idades en Carballo. Para as persoas adultas, '
     'a fórmula é por horas: págase o que se usa.',
     'Ofrecemos clases particulares y cursos para todas las edades en Carballo. Para las personas adultas, '
     'la fórmula es por horas: se paga lo que se usa.'),
    ('Clases de informática para adultos, no mesmo local da Rúa Perú, 14.',
     'Clases de informática para adultos, en el mismo local de la Rúa Perú, 14.'),
    ('Tarifa por hora, sen curso completo por diante.', 'Tarifa por hora, sin curso completo por delante.'),
    ('Horario dentro da apertura do centro: de luns a venres, de 16:00 a 20:00.',
     'Horario dentro de la apertura del centro: de lunes a viernes, de 16:00 a 20:00.'),
    ('Contidos, niveis e grupos pendentes', 'Contenidos, niveles y grupos pendientes'),
    ('Preguntar por unha hora', 'Preguntar por una hora'),
    ('<span class="t">por hora</span>', '<span class="t">por hora</span>'),

    # --- o espazo ---
    ('<span class="antetitulo">O espazo</span>', '<span class="antetitulo">El espacio</span>'),
    ('<span class="ct-tinta" data-split-char>Un baixo pequeno</span> <span class="ct-azul" data-split-char>e con luz de tarde</span>',
     '<span class="ct-tinta" data-split-char>Un bajo pequeño</span> <span class="ct-azul" data-split-char>y con luz de tarde</span>'),
    ('Estas imaxes son de arquivo e serven para ensinar de que se fala: robots, teclados e pezas. As '
     'fotos reais do local e das clases están pendentes.',
     'Estas imágenes son de archivo y sirven para enseñar de qué se habla: robots, teclados y piezas. Las '
     'fotos reales del local y de las clases están pendientes.'),
    ('alt="Rodas e motores de robótica educativa sobre unha táboa"',
     'alt="Ruedas y motores de robótica educativa sobre una tabla"'),
    ('alt="Mans sobre un teclado diante dun editor por bloques"',
     'alt="Manos sobre un teclado delante de un editor por bloques"'),
    ('alt="Pezas de cores impresas en 3D"', 'alt="Piezas de colores impresas en 3D"'),
    ('>Imaxe de arquivo<', '>Imagen de archivo<'),
    ('Foto real — require consentimento', 'Foto real — requiere consentimiento'),
    ('Fotos do local e das clases. Se aparecen menores, fai falta consentimento escrito das familias.',
     'Fotos del local y de las clases. Si aparecen menores, hace falta consentimiento escrito de las familias.'),

    # --- reseñas ---
    ('<span class="ct-tinta" data-split-char>Cinco reseñas,</span> <span class="ct-amarelo" data-split-char>cinco estrelas</span>',
     '<span class="ct-tinta" data-split-char>Cinco reseñas,</span> <span class="ct-amarelo" data-split-char>cinco estrellas</span>'),
    ('Texto de reseña pendente', 'Texto de reseña pendiente'),
    ('Hai cinco reseñas reais en Google, pero aínda non temos os textos para reproducilos aquí.',
     'Hay cinco reseñas reales en Google, pero todavía no tenemos los textos para reproducirlos aquí.'),
    ('Cando o centro pase as capturas, colócanse aquí tal cal, coa data e o nome que aparezan en Google.',
     'Cuando el centro pase las capturas, se colocan aquí tal cual, con la fecha y el nombre que aparezcan en Google.'),
    ('O que si é dato confirmado é a valoración: 5,0 sobre 5 con 5 reseñas.',
     'Lo que sí es dato confirmado es la valoración: 5,0 sobre 5 con 5 reseñas.'),
    ('Reseña de Google', 'Reseña de Google'),

    # --- contacto ---
    ('<span class="ct-tinta" data-split-char>Pásate polo</span> <span class="ct-azul" data-split-char>local da Rúa Perú</span>',
     '<span class="ct-tinta" data-split-char>Pásate por el</span> <span class="ct-azul" data-split-char>local de la Rúa Perú</span>'),
    ('<span class="k">Enderezo</span>', '<span class="k">Dirección</span>'),
    ('<span class="k">Correo</span>', '<span class="k">Correo</span>'),
    ('aria-label="Horario de apertura"', 'aria-label="Horario de apertura"'),
    ('<span class="d">Luns</span>', '<span class="d">Lunes</span>'),
    ('<span class="d">Martes</span>', '<span class="d">Martes</span>'),
    ('<span class="d">Mércores</span>', '<span class="d">Miércoles</span>'),
    ('<span class="d">Xoves</span>', '<span class="d">Jueves</span>'),
    ('<span class="d">Venres</span>', '<span class="d">Viernes</span>'),
    ('<span class="d">Sábado</span>', '<span class="d">Sábado</span>'),
    ('<span class="d">Domingo</span>', '<span class="d">Domingo</span>'),
    ('<span class="h">Pechado</span>', '<span class="h">Cerrado</span>'),
    ('<b>Ver o mapa</b>', '<b>Ver el mapa</b>'),
    ('O mapa cárgase de Google só se premes aquí. Mentres tanto, esta web non contacta con ninguén.',
     'El mapa se carga de Google solo si pulsas aquí. Mientras tanto, esta web no contacta con nadie.'),

    # --- formulario ---
    ('Enche os datos e ábrese o teu correo cunha mensaxe xa redactada para o centro.',
     'Rellena los datos y se abre tu correo con un mensaje ya redactado para el centro.'),
    ('<label for="f-nome">Nome e apelidos</label>', '<label for="f-nome">Nombre y apellidos</label>'),
    ('<label for="f-idade">Idade do alumno ou alumna</label>',
     '<label for="f-idade">Edad del alumno o alumna</label>'),
    ('<label for="f-tel">Teléfono</label>', '<label for="f-tel">Teléfono</label>'),
    ('<label for="f-area">Área de interese</label>', '<label for="f-area">Área de interés</label>'),
    ('<label for="f-msx">Algo máis (opcional)</label>', '<label for="f-msx">Algo más (opcional)</label>'),
    ('<option value="Iniciación á programación">Iniciación á programación</option>',
     '<option value="Iniciación a la programación">Iniciación a la programación</option>'),
    ('<option value="Reforzo escolar / clases particulares">Reforzo escolar / clases particulares</option>',
     '<option value="Refuerzo escolar / clases particulares">Refuerzo escolar / clases particulares</option>'),
    ('<option value="Impresión 3D baixo demanda">Impresión 3D baixo demanda</option>',
     '<option value="Impresión 3D bajo demanda">Impresión 3D bajo demanda</option>'),
    ('Acepto que estes datos se usen só para responder a esta consulta.',
     'Acepto que estos datos se usen solo para responder a esta consulta.'),
    ('Enviar a solicitude', 'Enviar la solicitud'),
    ('Formulario sen servidor', 'Formulario sin servidor'),
    ('Esta web é estática: o botón abre o teu programa de correo cunha mensaxe preparada para '
     'espazobilitroque@gmail.com. Se preferides que chegue soa a unha bandexa de entrada, hai que '
     'conectala a un servizo de formularios.',
     'Esta web es estática: el botón abre tu programa de correo con un mensaje preparado para '
     'espazobilitroque@gmail.com. Si preferís que llegue sola a una bandeja de entrada, hay que '
     'conectarla a un servicio de formularios.'),

    # --- pé ---
    ('alt="Logo de Espazo Bilitroque"', 'alt="Logo de Espazo Bilitroque"'),
    ('Espazo de formación en informática, robótica, programación e impresión 3D en Carballo. De 4 a 15 anos',
     'Espacio de formación en informática, robótica, programación e impresión 3D en Carballo. De 4 a 15 años'),
    ('confirmar idades', 'confirmar edades'),
    ('e clases para adultos.', 'y clases para adultos.'),
    ('<h4>Formación</h4>', '<h4>Formación</h4>'),
    ('<h4>Idioma</h4>', '<h4>Idioma</h4>'),
    ('<li><a href="#tres-d">Impresión 3D baixo demanda</a></li>',
     '<li><a href="#tres-d">Impresión 3D bajo demanda</a></li>'),
    ('<li>Luns a venres, 16–20 h</li>', '<li>Lunes a viernes, 16–20 h</li>'),
    ('Esta web non usa cookies de terceiros nin analítica. Só se garda no teu navegador que xa viches '
     'este aviso, e o mapa de Google non se carga ata que o pidas.',
     'Esta web no usa cookies de terceros ni analítica. Solo se guarda en tu navegador que ya has visto '
     'este aviso, y el mapa de Google no se carga hasta que lo pidas.'),
    ('<span>Esta web non usa cookies de terceiros nin analítica.</span>',
     '<span>Esta web no usa cookies de terceros ni analítica.</span>'),
    ('Fotografía de arquivo (Pexels). Ilustración propia.',
     'Fotografía de archivo (Pexels). Ilustración propia.'),
    ('>\n  Chamar\n', '>\n  Llamar\n'),
    ('Entendido', 'Entendido'),

    # --- nav (curtos, ao final) ---
    ('>Prezos</a>', '>Precios</a>'),
    ('<span class="antetitulo">Prezos</span>', '<span class="antetitulo">Precios</span>'),
    ('id="prezos"', 'id="prezos"'),
]


def main():
    orixe = os.path.join(RAIZ, 'index.html')
    destino_dir = os.path.join(RAIZ, 'es')
    os.makedirs(destino_dir, exist_ok=True)
    s = io.open(orixe, encoding='utf-8').read()

    faltan = []
    # de máis longo a máis curto, para non romper frases longas por anacos
    pares = CABECEIRA + RUTAS + sorted(TEXTOS, key=lambda p: -len(p[0]))
    for gl, es in pares:
        if gl not in s:
            faltan.append(gl[:90])
            continue
        s = s.replace(gl, es)

    if faltan:
        print('PARAR: estas entradas xa non aparecen no galego (cambiou o orixinal?):')
        for f in faltan:
            print('   · ' + f)
        return 1

    io.open(os.path.join(destino_dir, 'index.html'), 'w', encoding='utf-8').write(s)
    print('es/index.html escrito (%d caracteres)' % len(s))

    # rede de seguridade: buscar galego que quedase sen traducir
    PISTAS = ['praza', 'prezo', 'facemos', 'reforzo', 'anos e', 'aínda', 'unha ', ' e a ',
              'súa', 'polo centro', 'pendente', 'imaxe', 'mais ', 'grazas', 'luns', 'venres',
              'xoves', 'mércores', 'espazo de', 'nenos', 'idade', 'peza', 'deseñ', 'coñece']
    corpo = s[s.index('<body'):]
    corpo = re.sub(r'<(script|style).*?</>', ' ', corpo, flags=re.S | re.I)
    corpo = re.sub(r'<[^>]+>', ' ', corpo)        # só texto visible
    sos = []
    for p in PISTAS:
        for m in re.finditer(re.escape(p), corpo, re.I):
            frag = corpo[max(0, m.start() - 45):m.start() + 55].replace('\n', ' ')
            sos.append('%-14s … %s …' % (p, frag.strip()))
    if sos:
        print('\nRevisar a man (%d posibles restos de galego):' % len(sos))
        for x in sos[:40]:
            print('   ' + x)
    else:
        print('sen restos de galego detectados')
    return 0


if __name__ == '__main__':
    sys.exit(main())
