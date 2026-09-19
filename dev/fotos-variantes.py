#!/usr/bin/env python3
"""Variantes reducidas de las fotos de los locales, para servir cada una al
tamaño al que se ve (srcset en src/html/galeria.mjs). Se generan UNA vez y se
guardan en el repo: el build de Cloudflare no tiene herramientas de imagen.
Al añadir fotos nuevas, volver a ejecutar:

    python3 dev/fotos-variantes.py        (necesita Pillow: pip3 install pillow)

Solo crea las que faltan o están más viejas que su original. Con Pillow y no
con sips: el codificador JPEG de sips pesa el doble a igual calidad.
"""
import os, sys
from PIL import Image

CARPETAS = ["img/chamberi", "img/espacio"]
ANCHOS = [480, 800]
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
nuevas = 0
for carpeta in CARPETAS:
    for nombre in sorted(os.listdir(carpeta)):
        if not nombre.endswith(".jpg") or nombre[-8:-4] in ("-480", "-800"):
            continue
        origen = os.path.join(carpeta, nombre)
        for w in ANCHOS:
            destino = origen[:-4] + f"-{w}.jpg"
            if os.path.exists(destino) and os.path.getmtime(destino) >= os.path.getmtime(origen):
                continue
            im = Image.open(origen).convert("RGB")
            im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(destino, "JPEG", quality=80, optimize=True, progressive=True, subsampling=2)
            print(destino, os.path.getsize(destino) // 1024, "KB")
            nuevas += 1
print(f"{nuevas} variantes nuevas")
