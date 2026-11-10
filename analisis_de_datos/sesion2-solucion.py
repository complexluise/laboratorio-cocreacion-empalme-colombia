# -*- coding: utf-8 -*-
# %% [markdown]
# # Análisis de redes: instrumentos y políticas de CTeI
#
# Este cuaderno analiza la red del laboratorio de cocreación (empalme 2018–2022 ↔ 2022–2026).
# Hay dos niveles de análisis:
#
# 1. **Red bipartita** instrumentos–políticas, con 93 instrumentos y 14 políticas.
# 2. **Redes de coocurrencia** derivadas de la bipartita: una entre instrumentos, para ver cuáles están más conectados, y otra entre políticas.
#
# Advertencia: la red se generó con IA y no está revisada al 100 %. Las interpretaciones de la última sección son inferencias.

# %% [markdown]
# ## 1. Configuración y carga de datos
#
# Se usa la hoja `Instrumentos` del archivo original. Cada instrumento se conecta a las políticas de la columna "Políticas a las que sirve".

# %%
from pathlib import Path

import numpy as np
import pandas as pd
import openpyxl
import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from networkx.algorithms import bipartite as bp

RUTA = Path(".\\analisis_de_datos\\red-ciencia-tecnologia.xlsx")
SALIDA = Path(".\\analisis_de_datos\\salidas")
SALIDA.mkdir(exist_ok=True)
SEED = 42

# Estilo tipo artículo: serif, fondo blanco, sin marco superior ni derecho, ejes sobrios.
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["DejaVu Serif", "Times New Roman", "Liberation Serif"],
    "font.size": 9,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.linewidth": 0.6,
    "axes.titlesize": 10,
    "axes.titleweight": "normal",
    "axes.labelsize": 9,
    "xtick.labelsize": 8,
    "ytick.labelsize": 8,
    "legend.frameon": False,
    "figure.dpi": 120,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})
PALETA = ["#4C6A92", "#B5651D", "#5B7F4F", "#8E5572", "#A69A3A"]


def corto(texto, n=44):
    """Etiqueta corta para las figuras."""
    t = texto.split(" (")[0].split(" - ")[0].strip()
    return t if len(t) <= n else t[: n - 1] + "…"


# %%
wb = openpyxl.load_workbook(RUTA, read_only=True, data_only=True)
filas = [r for r in list(wb["Instrumentos"].iter_rows(values_only=True))[1:] if r[0]]

insts = pd.DataFrame([
    {
        "instrumento": r[0].strip(),
        "nato": r[1],
        "modo": r[2],
        "pres_1822": r[3],
        "pres_2226": r[4],
        "politicas": [p.strip() for p in (r[5] or "").split(";") if p.strip()],
    }
    for r in filas
])
print(f"{len(insts)} instrumentos cargados")
insts.head(3)

# %% [markdown]
# ## 2. Construcción de la red bipartita
#
# Los nodos de un lado son instrumentos y los del otro, políticas. Una arista indica que el instrumento sirve a esa política. No hay aristas dentro de un mismo tipo de nodo.

# %%
B = nx.Graph()
for _, row in insts.iterrows():
    B.add_node(row.instrumento, bipartite=0, nato=row.nato, modo=row.modo)
    for p in set(row.politicas):
        B.add_node(p, bipartite=1)
        B.add_edge(row.instrumento, p)

INST = set(insts.instrumento)
POL = set(p for ps in insts.politicas for p in ps)

resumen = pd.Series({
    "instrumentos": len(INST),
    "políticas": len(POL),
    "aristas": B.number_of_edges(),
    "densidad (inst × pol)": round(bp.density(B, INST), 3),
    "componentes conexas": nx.number_connected_components(B),
    "instrumentos sin política": sum(1 for n in INST if B.degree(n) == 0),
})
resumen

# %% [markdown]
# ## 3. Distribución de instrumentos
#
# Antes de la red conviene ver la composición del archivo: el modo de cambio y el tipo NATO de cada instrumento.

# %%
orden_modo = ["estratificación", "continuidad estable", "terminación", "conversión", "deriva", "reversión"]
orden_nato = ["tesoro", "nodalidad", "organización", "autoridad"]

modos = insts.modo.value_counts().reindex(orden_modo, fill_value=0)
cruce = pd.crosstab(insts.modo, insts.nato).reindex(index=orden_modo, columns=orden_nato, fill_value=0)

fig, ax = plt.subplots(figsize=(6.2, 2.8))
izq = np.zeros(len(orden_modo))
for tipo, color in zip(orden_nato, PALETA):
    ax.barh(orden_modo, cruce[tipo].values, left=izq, color=color, label=tipo, height=0.6)
    izq += cruce[tipo].values
for y, total in enumerate(modos.values):
    ax.text(total + 0.6, y, str(total), va="center", fontsize=8)
ax.invert_yaxis()
ax.set_xlabel("Número de instrumentos")
ax.set_title("Figura 1. Modo de cambio según tipo NATO")
ax.legend(title="Tipo NATO", title_fontsize=8, loc="lower right")
fig.savefig(SALIDA / "fig1_modo_cambio.png")
plt.show()

# %% [markdown]
# La estratificación domina con 58 de 93 instrumentos (62 %). Esto es coherente con la metodología, pero también depende de que el informe anterior no mencione un instrumento. Si un programa cambió de nombre, el extractor pudo contarlo como nuevo. Este punto se revisa en la última sección.

# %% [markdown]
# ## 4. Grado de las políticas
#
# El grado de una política es el número de instrumentos que la sirven.

# %%
grado_pol = pd.Series({p: B.degree(p) for p in POL}).sort_values()

fig, ax = plt.subplots(figsize=(6.2, 3.6))
ax.barh([corto(p) for p in grado_pol.index], grado_pol.values, color=PALETA[0], height=0.6)
for y, v in enumerate(grado_pol.values):
    ax.text(v + 0.3, y, str(v), va="center", fontsize=8)
ax.set_xlabel("Número de instrumentos que sirven a la política")
ax.set_title("Figura 2. Instrumentos por política")
fig.savefig(SALIDA / "fig2_grado_politicas.png")
plt.show()

# %% [markdown]
# Orientación estratégica concentra 27 instrumentos y funciona como paraguas. Talento, Bioeconomía, Soberanía sanitaria, DHA y Transición energética tienen entre 20 y 22. Beneficios tributarios es la política con menos instrumentos, con 5.

# %% [markdown]
# ## 5. Red bipartita
#
# En la figura, los instrumentos están a la izquierda y coloreados por tipo NATO. Las políticas están a la derecha como cuadrados. El tamaño de cada nodo es proporcional a su grado. Las aristas de los seis instrumentos con más conexiones se resaltan y el resto se dibuja tenue. Los seis instrumentos más conectados se numeran y se listan a un costado para evitar que sus nombres se encimen.

# %%
ins_ordenados = sorted(INST, key=lambda n: -B.degree(n))
pol_ordenados = sorted(POL, key=lambda n: -B.degree(n))
top6 = ins_ordenados[:6]

pos = {}
for i, n in enumerate(ins_ordenados):
    pos[n] = (0.0, -i)
paso = len(INST) / len(POL)
for j, n in enumerate(pol_ordenados):
    pos[n] = (1.0, -j * paso)

colores_nato = dict(zip(orden_nato, PALETA))

fig, ax = plt.subplots(figsize=(8.4, 8.4))

# Aristas: todas tenues, y las de los top 6 resaltadas encima
aristas_top = [(u, v) for u, v in B.edges() if u in top6]
aristas_resto = [(u, v) for u, v in B.edges() if u not in top6]
nx.draw_networkx_edges(B, pos, edgelist=aristas_resto, alpha=0.04, width=0.4,
                       edge_color="#444444", ax=ax)
nx.draw_networkx_edges(B, pos, edgelist=aristas_top, alpha=0.45, width=0.9,
                       edge_color=[colores_nato[B.nodes[u]["nato"]] for u, _ in aristas_top],
                       ax=ax)

nx.draw_networkx_nodes(
    B, pos, nodelist=ins_ordenados,
    node_size=[12 + 12 * B.degree(n) for n in ins_ordenados],
    node_color=[colores_nato[B.nodes[n]["nato"]] for n in ins_ordenados],
    alpha=0.85, linewidths=0, ax=ax,
)
nx.draw_networkx_nodes(
    B, pos, nodelist=pol_ordenados,
    node_size=[60 + 18 * B.degree(n) for n in pol_ordenados],
    node_color="#222222", node_shape="s", linewidths=0, ax=ax,
)

# Políticas: etiqueta a la derecha, con margen suficiente
for n in pol_ordenados:
    ax.text(1.10, pos[n][1], corto(n, 60), va="center", fontsize=7)

# Top 6 instrumentos: números sobre el nodo y lista a la izquierda con flecha
for k, n in enumerate(top6, start=1):
    ytxt = -k * 9.0
    ax.annotate(f"{k}. {corto(n, 52)}", xy=pos[n], xytext=(-0.55, ytxt),
                ha="right", va="center", fontsize=7,
                arrowprops=dict(arrowstyle="-", color="#777777", lw=0.5,
                                shrinkA=2, shrinkB=2))

ax.set_xlim(-1.35, 2.25)
ax.set_ylim(-len(INST) - 2, 2)
ax.axis("off")
leyenda = [Patch(color=c, label=t) for t, c in colores_nato.items()]
ax.legend(handles=leyenda, title="Tipo NATO (instrumentos)", title_fontsize=8,
          loc="lower left", fontsize=7)
ax.set_title("Figura 3. Red bipartita instrumentos–políticas")
fig.savefig(SALIDA / "fig3_red_bipartita.png")
plt.show()

# %% [markdown]
# La red es conexa y no tiene instrumentos aislados. Tiene 201 aristas y una densidad de 0,154. Cada instrumento sirve en promedio a unas 2,2 políticas, así que la mayoría de las conexiones son de uno o dos.

# %% [markdown]
# ## 6. Instrumentos más conectados
#
# Para responder cuáles instrumentos están más conectados, proyecto la bipartita sobre los instrumentos. Dos instrumentos quedan unidos si comparten al menos una política. El peso de la arista es el número de políticas compartidas.
#
# Calculo tres medidas por instrumento:
#
# - **Coocurrencia total** (grado ponderado): suma de los pesos de sus aristas.
# - **Intermediación** (betweenness): qué tanto sirve el nodo de puente entre otros pares.
# - **Políticas (grado)**: en cuántas políticas participa directamente.

# %%
PI = bp.weighted_projected_graph(B, INST)
wdeg = dict(PI.degree(weight="weight"))
btw = nx.betweenness_centrality(PI)  # sin peso, igual que en el análisis previo

tabla_top = pd.DataFrame({
    "instrumento": [corto(n, 60) for n in sorted(wdeg, key=wdeg.get, reverse=True)[:15]],
    "políticas": [B.degree(n) for n in sorted(wdeg, key=wdeg.get, reverse=True)[:15]],
    "coocurrencia": [wdeg[n] for n in sorted(wdeg, key=wdeg.get, reverse=True)[:15]],
    "intermediación": [round(btw[n], 3) for n in sorted(wdeg, key=wdeg.get, reverse=True)[:15]],
})
tabla_top

# %%
fig, ax = plt.subplots(figsize=(6.4, 4.4))
for n in INST:
    x, y = wdeg[n], btw[n]
    ax.scatter(x, y, s=10 + 10 * PI.degree(n) / 4, color=PALETA[0], alpha=0.5, linewidths=0)
top_btw = sorted(INST, key=lambda n: -wdeg[n])[:8]
for n in top_btw:
    ax.annotate(corto(n, 34), (wdeg[n], btw[n]), xytext=(4, 3),
                textcoords="offset points", fontsize=7)
ax.set_xlabel("Coocurrencia total (grado ponderado)")
ax.set_ylabel("Intermediación")
ax.set_title("Figura 4. Conexión frente a intermediación por instrumento")
fig.savefig(SALIDA / "fig4_conexion_intermediacion.png")
plt.show()

# %% [markdown]
# El SGR y el FFJC son los instrumentos más conectados, con una coocurrencia total de 149 cada uno. El FFJC tiene además la mayor intermediación (0,129), así que es el principal puente entre políticas. Ambos tienen la etiqueta *conversión* en la hoja de instrumentos.
#
# Esto hay que tomarlo con cuidado: si el extractor vinculó un fondo general a todas las políticas que el texto menciona, el grado está inflado por la clasificación y no por el financiamiento real.

# %% [markdown]
# ## 7. Pares de instrumentos con más coocurrencia
#
# Los pares más fuertes son aquellos que comparten más políticas.

# %%
pares = sorted(PI.edges(data=True), key=lambda e: -e[2]["weight"])[:12]
pd.DataFrame(
    [{"instrumento A": corto(u, 40), "instrumento B": corto(v, 40), "políticas compartidas": d["weight"]}
     for u, v, d in pares]
)

# %% [markdown]
# ## 8. Comunidades de instrumentos
#
# Uso el método de Louvain sobre la proyección de instrumentos para encontrar grupos que comparten políticas. Las comunidades se etiquetan a mano a partir de los nombres de sus miembros, así que esa etiqueta es una inferencia.

# %% [markdown]
# La modularidad indica una estructura moderada: hay grupos reconocibles, pero se solapan bastante. El valor exacto y el tamaño de cada grupo cambian ligeramente según el orden de los nodos, así que conviene reportar el valor de la corrida.

# %%
comunidades = sorted(
    nx.community.louvain_communities(PI, weight="weight", seed=SEED),
    key=len, reverse=True,
)
modularidad = nx.community.modularity(PI, comunidades, weight="weight")
comm_id = {n: i for i, c in enumerate(comunidades) for n in c}

print(f"{len(comunidades)} comunidades, modularidad = {modularidad:.3f}")
for i, c in enumerate(comunidades):
    print(f"  C{i}: {len(c)} instrumentos")

# %% [markdown]
#


# %%
top30 = sorted(INST, key=lambda n: -wdeg[n])[:30]
H = PI.subgraph(top30).copy()
H.remove_edges_from([(u, v) for u, v, d in H.edges(data=True) if d["weight"] < 2])

pos_h = nx.spring_layout(H, weight="weight", seed=SEED, k=0.9)

fig, ax = plt.subplots(figsize=(7.0, 6.2))
pesos = [d["weight"] for _, _, d in H.edges(data=True)]
nx.draw_networkx_edges(H, pos_h, width=[0.3 + 0.5 * w / 2 for w in pesos],
                       alpha=0.35, edge_color="#666666", ax=ax)
nx.draw_networkx_nodes(
    H, pos_h,
    node_size=[40 + 4 * wdeg[n] for n in H.nodes()],
    node_color=[PALETA[comm_id[n] % len(PALETA)] for n in H.nodes()],
    alpha=0.9, linewidths=0, ax=ax,
)
etiquetas = {n: corto(n, 28) for n in H.nodes()}
nx.draw_networkx_labels(H, pos_h, labels=etiquetas, font_size=6, ax=ax)
ax.axis("off")
ax.set_title("Figura 5. Top 30 instrumentos por coocurrencia (aristas con ≥ 2 políticas)")
fig.savefig(SALIDA / "fig5_comunidades.png")
plt.show()

# %% [markdown]
# Lectura aproximada de los grupos, inferida de los nombres:
#
# - **Territorial y bioeconómica:** convenios con SINCHI, CRIC y la Mesa Permanente de Concertación.
# - **Núcleo institucional y PIIOM:** Decreto 1666, CONACTI, CODECTI y CONPES 4069.
# - **Salud y ecosistemas científicos:** convocatorias de 2022 en salud pública y salud mental.
# - **Talento y becas:** doctorados, CRIIE y el Premio Otto de Greiff.
# - **Internacional e IA:** Comité Asesor de IA, Hoja de Ruta de IA y convenios internacionales.

# %% [markdown]
# ## 9. Red de coocurrencia de políticas
#
# Proyecto la bipartita sobre las políticas. Dos políticas quedan conectadas si comparten instrumentos, y el peso es el número de instrumentos compartidos.

# %%
PP = bp.weighted_projected_graph(B, POL)
orden_pol = sorted(POL, key=lambda p: -B.degree(p))
M = nx.to_pandas_adjacency(PP, nodelist=orden_pol, dtype=float)
Mv = M.to_numpy(copy=True)  # la diagonal no se usa en el mapa de calor

fig, ax = plt.subplots(figsize=(6.8, 6.0))
im = ax.imshow(Mv, cmap="Blues", vmin=0)
ax.set_xticks(range(len(orden_pol)))
ax.set_yticks(range(len(orden_pol)))
ax.set_xticklabels([corto(p, 22) for p in orden_pol], rotation=60, ha="right", fontsize=6.5)
ax.set_yticklabels([corto(p, 30) for p in orden_pol], fontsize=6.5)
for i in range(len(orden_pol)):
    for j in range(len(orden_pol)):
        if i != j:
            ax.text(j, i, int(Mv[i, j]), ha="center", va="center", fontsize=5.5,
                    color="white" if Mv[i, j] > 7 else "#222222")
cb = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02)
cb.set_label("Instrumentos compartidos", fontsize=8)
ax.set_title("Figura 6. Coocurrencia de políticas")
fig.savefig(SALIDA / "fig6_coocurrencia_politicas.png")
plt.show()

# %% [markdown]
# La red de políticas tiene 65 aristas y una densidad de 0,714. Es muy densa, así que distingue poco entre políticas. Los pares más fuertes son DHA–Bioeconomía (11 instrumentos compartidos), Soberanía sanitaria–DHA (10) y Soberanía sanitaria–Orientación estratégica (10).

# %% [markdown]
# ## 10. Exportación
#
# Guardo la proyección de instrumentos y la bipartita en GraphML para abrirlas en Gephi o Cytoscape.

# %%
nx.write_graphml(PI, SALIDA / "proyeccion_instrumentos.graphml")
nx.write_graphml(B, SALIDA / "bipartita_instrumentos_politicas.graphml")
tabla_top.to_csv(SALIDA / "top15_instrumentos.csv", index=False)
print("Archivos guardados en", SALIDA.resolve())

# %% [markdown]
# ## 11. Conclusiones
#
# **Confirmado por los datos:**
#
# - La red bipartita es conexa, con 107 nodos, 201 aristas y ningún instrumento aislado.
# - SGR y FFJC son los instrumentos más conectados (coocurrencia 149 cada uno). FFJC tiene además la mayor intermediación (0,129).
# - Los instrumentos más conectados son casi todos de financiamiento (tesoro).
# - La red de políticas es muy densa (0,714), así que la coocurrencia entre políticas aporta poca información.
#
# **Inferencias que requieren verificación:**
#
# - Los fondos generales pueden estar sobreasignados a varias políticas por la forma en que se extrajo la columna "Políticas a las que sirve".
# - La estratificación puede estar inflada si hay instrumentos renombrados entre informes.
# - Las comunidades reflejan más un patrón territorial y de salud que uno por política declarada.
#
# Para verificar, conviene revisar los informes en las páginas citadas de los instrumentos con mayor grado y de los casos marcados como terminación.
