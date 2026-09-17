# -*- coding: utf-8 -*-
"""Descarga as fotos elixidas nas follas de contacto de Pexels e grádaas
ao aire de Espazo Bilitroque: branco limpo, sombras levantadas (nada de
azul noite: esta web é clara) e obxectos de cor máis saturados, que é o
que pide o concepto — unha peza laranxa, un robot vermello, unhas rodas
amarelas sobre fondo claro.

Ningunha destas imaxes é do local do centro.
Ningunha mostra caras de menores: só mans, obxectos, pantallas e salas
baleiras. As fotos reais do local e das clases quedan como oco na web.

Uso:  python scripts/process_photos.py
"""
import io
import os
import sys
import urllib.request

from PIL import Image, ImageEnhance

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'assets', 'img', 'photos')
os.makedirs(SALIDA, exist_ok=True)

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36')

# id de Pexels, nome de saida, relacion, anchos, anclaxe vertical do
# recorte (0 = arriba, 1 = abaixo) e que se ve.
#
# Descartada a proposito a 7869045 ("mans montando un robot vermello"):
# o recorte cadrado deixaba ver o queixo e a boca dun rapaz. Esta web
# non leva caras de menores, nin sequera a medias.
FOTOS = [
    ('17509941', 'impresora', (1, 1), [900, 560], 0.45,
     'unha man collendo pezas laranxas recen impresas da cama da impresora'),
    ('35673085', 'robots',    (1, 1), [700], 0.50,
     'rodas amarelas e motores de robotica educativa sobre unha taboa'),
    ('5474295',  'teclado',   (1, 1), [700], 0.45,
     'mans sobre o teclado dun portatil cun editor de codigo na pantalla'),
    ('17509938', 'pezas',     (1, 1), [700], 0.62,
     'caixon de pezas e filamentos de cores para impresion 3D'),
    ('8423423',  'aula',      (16, 9), [1600, 900], 0.5,
     'sala pequena e luminosa con mesas brancas e cadeiras vermellas'),
]


def descargar(idf):
    url = ('https://images.pexels.com/photos/%s/pexels-photo-%s.jpeg'
           '?auto=compress&cs=tinysrgb&w=1800' % (idf, idf))
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return Image.open(io.BytesIO(r.read())).convert('RGB')


def recortar(im, rel, anclaxe=0.45):
    w, h = im.size
    obxectivo = rel[0] / rel[1]
    actual = w / h
    if actual > obxectivo:
        nw = int(h * obxectivo)
        esq = (w - nw) // 2
        im = im.crop((esq, 0, esq + nw, h))
    else:
        nh = int(w / obxectivo)
        arr = int((h - nh) * anclaxe)
        im = im.crop((0, arr, w, arr + nh))
    return im


def gradar(im):
    """Branco limpo, sombras levantadas e cor de obxecto máis viva.

    Nada de virar as sombras cara a un ton frío: aquí o fondo da web é
    branco e as fotos teñen que sentar sobre el sen ensuciarse.
    """
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            lum = (r * 299 + g * 587 + b * 114) // 1000
            # sombras: levantalas cara a un gris neutro, non aplastalas
            if lum < 110:
                k = (110 - lum) / 110.0 * 0.22
                r = int(r + (96 - r) * k)
                g = int(g + (99 - g) * k)
                b = int(b + (106 - b) * k)
            # altas luces cara ao branco limpo, sen tinguidura
            if lum > 196:
                k = (lum - 196) / 59.0 * 0.45
                r = int(r + (255 - r) * k)
                g = int(g + (255 - g) * k)
                b = int(b + (255 - b) * k)
            px[x, y] = (max(0, min(255, r)), max(0, min(255, g)),
                        max(0, min(255, b)))
    im = ImageEnhance.Color(im).enhance(1.16)     # obxectos máis saturados
    im = ImageEnhance.Contrast(im).enhance(1.04)
    im = ImageEnhance.Brightness(im).enhance(1.03)
    return im


def main():
    rexistro = []
    for idf, nome, rel, anchos, anclaxe, que in FOTOS:
        try:
            im = descargar(idf)
        except Exception as e:                      # noqa: BLE001
            print('FALLO %s (%s): %s' % (nome, idf, e))
            continue
        im = recortar(im, rel, anclaxe)
        grande = max(anchos)
        im = im.resize((grande, int(grande * rel[1] / rel[0])), Image.LANCZOS)
        im = gradar(im)
        for ancho in anchos:
            copia = im if ancho == grande else im.resize(
                (ancho, int(ancho * rel[1] / rel[0])), Image.LANCZOS)
            ruta = os.path.join(SALIDA, '%s-%d.jpg' % (nome, ancho))
            copia.save(ruta, 'JPEG', quality=82, optimize=True,
                       progressive=True)
            print('OK %-22s %5d px  %6.1f KB' % (
                os.path.basename(ruta), ancho,
                os.path.getsize(ruta) / 1024))
        rexistro.append('%-10s -> pexels.com/photo/%-9s %s' % (nome, idf, que))
    with io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              'photos_log.txt'), 'w', encoding='utf-8') as f:
        f.write('Fotografia de arquivo de Pexels, gradada ao aire claro da '
                'marca.\n'
                'Ningunha e do local de Espazo Bilitroque.\n'
                'Ningunha mostra caras de menores: so mans, obxectos, '
                'pantallas e salas baleiras.\n\n')
        f.write('\n'.join(rexistro) + '\n')


if __name__ == '__main__':
    sys.exit(main())
