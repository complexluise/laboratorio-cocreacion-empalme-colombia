# Sesión 2: analizar la red

En esta sesión analizamos la red de Ciencia, Tecnología e Innovación (CTeI): qué instrumentos sirven
a qué políticas, cuáles están más conectados y qué grupos forman. Trabajamos en Google Colab, que abre
el cuaderno en el navegador, sin instalar nada.

| Cuaderno | Para quién | Abrir |
|---|---|---|
| `sesion2-ejercicio.ipynb` | Los grupos: tiene espacios en blanco para completar | [![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/complexluise/laboratorio-cocreacion-empalme-colombia/blob/main/analisis_de_datos/sesion2-ejercicio.ipynb) |
| `sesion2-solucion.ipynb` | Quien facilita, y todos al final: está resuelto | [![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/complexluise/laboratorio-cocreacion-empalme-colombia/blob/main/analisis_de_datos/sesion2-solucion.ipynb) |

## Cómo se trabaja

1. Abrimos el ejercicio en Colab. Para guardar nuestros cambios: *Archivo → Guardar una copia en Drive*.
2. Corremos la primera celda y subimos `red-ciencia-tecnologia.xlsx`. Si no lo tenemos, pulsamos
   *Cancelar* y el cuaderno lo descarga del [sitio](https://complexluise.github.io/laboratorio-cocreacion-empalme-colombia/).
3. Avanzamos sección por sección. Donde aparece `____` con un `# TODO`, lo completamos juntos. La
   celda siguiente lo comprueba: ✅ o una pista.
4. Las preguntas *Para pensar* se responden en la celda *Tu respuesta*.
5. Al final, la última celda descarga las figuras y los archivos de la red en un `.zip`.

| Sección | Qué completamos |
|---|---|
| 2. Red bipartita | Unir cada instrumento con sus políticas; la densidad |
| 3. Distribución | Contar los instrumentos por modo de cambio |
| 4. Grado de las políticas | Cuántos instrumentos sirven a cada política |
| 6. Instrumentos más conectados | Qué instrumentos comparten políticas y cuáles hacen de puente |
| 7. Pares | Ordenar los pares por políticas compartidas |
| 8. Comunidades | El método de Louvain |
| 9. Red de políticas | La proyección sobre las políticas |

> La red la hizo la IA y nadie la ha revisado completa. Los resultados describen la red, no a
> los gobiernos.

## Para el equipo

Los `.py` (formato *percent* de jupytext) son la fuente; los `.ipynb` se generan a partir de ellos:

```bash
uv run --with jupytext --with nbconvert --with ipykernel bash -c '
  jupytext --to ipynb --update-metadata "{\"kernelspec\":{\"name\":\"python3\",\"display_name\":\"Python 3\",\"language\":\"python\"}}" \
    analisis_de_datos/sesion2-ejercicio.py analisis_de_datos/sesion2-solucion.py &&
  cd analisis_de_datos && jupyter nbconvert --to notebook --execute --inplace sesion2-solucion.ipynb'
```

El ejercicio se publica sin resultados; la solución, con resultados. Si se cambia la solución, hay
que llevar el cambio a mano al ejercicio. Los botones de Colab apuntan a `main`: funcionan cuando
el cambio llega allí.
