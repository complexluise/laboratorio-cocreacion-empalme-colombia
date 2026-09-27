export const meta = {
  name: 'rebuild-ctei-claude',
  description: 'Reconstruye el dataset CTeI (politicas + instrumentos bipartito) con Claude, leyendo los informes de empalme. Sin Gemini.',
  phases: [
    { title: 'Descubrir', detail: 'lista las politicas publicas de ambos informes' },
    { title: 'Extraer', detail: 'un agente Sonnet por politica: instrumentos con evidencia, modo de cambio y narrativa' },
    { title: 'Consolidar', detail: 'resolucion de entidades entre politicas/gobiernos (muchos-a-muchos)' },
    { title: 'Relaciones', detail: 'aristas instrumento-instrumento (financia/habilita/depende/encadena)' },
  ],
}

const MD_2018 = 'markdown/2018-2022/Ciencia_Tecnologia_e_Innovacion/Ministerio_De_Ciencia_Tecnologia_E_Innovacion/2022-06-17-_Informe_de_Empalme_V5_OAPII.pdf.md'
const MD_2022 = 'markdown/2022-2026/Ciencia_y_Tecnologia/Ministerio_De_Ciencia_Tecnologia_E_Innovacion/Informe_Empalme_MinCiencias.pdf.md'
const ANEXOS = 'Anexos (xlsx->md) bajo markdown/2018-2022/Ciencia_Tecnologia_e_Innovacion/** y markdown/2022-2026/Ciencia_y_Tecnologia/** — usa Grep por nombre/alias para cifras.'

const NATO = ['nodalidad', 'autoridad', 'tesoro', 'organizacion']
const CAMBIO = ['continuidad-estable', 'conversion', 'estratificacion', 'terminacion', 'reversion', 'deriva']
const PRESM = ['propuesto', 'logrado', 'pendiente']
const REL = ['habilita', 'financia', 'depende-de', 'encadena']

function slug(s) {
  const map = { 'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u','ñ':'n','Á':'a','É':'e','Í':'i','Ó':'o','Ú':'u','Ñ':'n' }
  return (s || '').replace(/[áéíóúüñÁÉÍÓÚÑ]/g, c => map[c] || c)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x'
}

// ---------- schemas ----------
const POLS = { type: 'object', properties: { politicas: { type: 'array', items: {
  type: 'object', properties: { nombre: { type: 'string' }, objetivo: { type: 'string' } }, required: ['nombre'] } } }, required: ['politicas'] }

const EVID = { type: 'object', properties: {
  vigencia: { type: 'string', enum: ['2018-2022', '2022-2026'] },
  paginas: { type: 'array', items: { type: 'integer' } },
  cifras: { type: 'array', items: { type: 'object', properties: { texto: { type: 'string' }, metrica: { type: 'string' }, valor: { type: 'number' }, unidad: { type: 'string' } }, required: ['texto'] } },
}, required: ['vigencia'] }

const EXTRACT = { type: 'object', properties: {
  politica_id: { type: 'string' },
  instrumentos: { type: 'array', items: { type: 'object', properties: {
    nombre: { type: 'string' },
    es_objetivo: { type: 'boolean' },
    tipo_nato: { type: 'string', enum: NATO },
    presencia_2018: { type: 'string', enum: PRESM, description: 'modo en 2018-2022; vacio si ausente ese gobierno' },
    presencia_2022: { type: 'string', enum: PRESM, description: 'modo en 2022-2026; vacio si ausente ese gobierno' },
    modo_cambio: { type: 'string', enum: CAMBIO },
    alias: { type: 'array', items: { type: 'string' } },
    entidades: { type: 'array', items: { type: 'string' } },
    tambien_sirve_a: { type: 'array', items: { type: 'string' }, description: 'nombres de OTRAS politicas a las que este instrumento tambien sirve (muchos-a-muchos)' },
    evidencia: { type: 'array', items: EVID },
    confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
    narrativa: { type: 'object', properties: { g2018: { type: 'string' }, g2022: { type: 'string' }, cambio: { type: 'string' } } },
  }, required: ['nombre', 'es_objetivo', 'modo_cambio'] } },
}, required: ['politica_id', 'instrumentos'] }

const CONS = { type: 'object', properties: {
  politicas: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, nombre: { type: 'string' }, objetivo: { type: 'string' } }, required: ['id', 'nombre'] } },
  grupos: { type: 'array', description: 'cada grupo son las refs que son el MISMO instrumento', items: {
    type: 'object', properties: {
      nombre: { type: 'string' },
      refs: { type: 'array', items: { type: 'string' } },
      politicas: { type: 'array', items: { type: 'string' }, description: 'ids de TODAS las politicas a las que sirve' },
    }, required: ['nombre', 'refs', 'politicas'] } },
}, required: ['politicas', 'grupos'] }

const RELS = { type: 'object', properties: { relaciones: { type: 'array', items: {
  type: 'object', properties: { source: { type: 'string' }, target: { type: 'string' }, tipo: { type: 'string', enum: REL }, nota: { type: 'string' } },
  required: ['source', 'target', 'tipo'] } } }, required: ['relaciones'] }

// ---------- prompts ----------
const FUENTES = `FUENTES (leelas con Read/Grep):\n- Informe 2018-2022 (Duque): ${MD_2018}\n- Informe 2022-2026 (Petro): ${MD_2022}\n- ${ANEXOS}`

function extractPrompt(pol, todas) {
  return `Eres analista de politica publica colombiana (sector CTeI). Extrae los INSTRUMENTOS de la politica
"${pol.nombre}"${pol.objetivo ? ' (objetivo: ' + pol.objetivo + ')' : ''} a lo largo de DOS gobiernos, leyendo los informes.
${FUENTES}

Un INSTRUMENTO es el medio concreto con que el Estado actua: programa, norma, fondo/fuente de financiacion,
convocatoria, sistema. Un OBJETIVO de politica (es_objetivo=true) es una apuesta/finalidad (no lleva tipo_nato).

Para CADA instrumento de esta politica:
- tipo_nato (recurso, Hood): nodalidad=informacion, autoridad=norma/obligacion, tesoro=dinero, organizacion=capacidad estatal.
- presencia_2018 / presencia_2022 (modo: ${PRESM.join('/')}). Deja vacio el gobierno donde el instrumento NO existe.
- modo_cambio GUIADO POR EVIDENCIA (compara nombres, logica y CIFRAS entre gobiernos; no por defecto):
  continuidad-estable (mismo instrumento, misma logica y escala) · conversion (se redespliega/cambia de logica o fin) ·
  reversion (invierte el rumbo) · deriva (sigue formal pero su efecto cambia) · terminacion (solo 2018-2022) ·
  estratificacion (solo 2022-2026).
- evidencia: por vigencia, paginas (## Pagina N) y cifras (texto tal cual + metrica/valor/unidad si se puede). No inventes.
- entidades responsables y alias (solo variantes del MISMO instrumento).
- tambien_sirve_a: nombres de OTRAS politicas a las que ESTE instrumento tambien sirve. IMPORTANTE: los fondos
  (SGR/Asignacion CTeI, Fondo Francisco Jose de Caldas) y los sistemas transversales (ScienTI, SIGP, Publindex,
  indices/gestion) sirven a VARIAS politicas: listalas todas. Politicas disponibles: ${JSON.stringify(todas.map(p => p.nombre))}.
- narrativa: g2018 (que fue bajo Duque), g2022 (que fue bajo Petro), cambio (1-2 frases).

Extrae solo instrumentos de PRIMER NIVEL con identidad propia. Exhaustivo pero sin redundancia.`
}

function consPrompt(items, pols) {
  const compact = items.map(it => ({ ref: it._ref, nombre: it.nombre, tipo_nato: it.tipo_nato, alias: it.alias, politica: it._pol, tambien: it.tambien_sirve_a }))
  return `Consolida instrumentos de CTeI extraidos politica por politica de dos gobiernos. Cada item tiene 'ref',
'nombre', 'politica' (a la que lo asigno su agente) y 'tambien' (otras politicas que sirve).

1) RESOLUCION DE ENTIDADES (balanceada): agrupa en 'grupos' las 'refs' que son el MISMO instrumento concreto
   (mismo fondo/programa/norma/sistema), aunque cambie el nombre entre gobiernos o lo liste mas de una politica.
   - SI fusiona: el mismo fondo (SGR/Asignacion CTeI; Fondo Francisco Jose de Caldas) listado por varias politicas
     es UN grupo; un sistema transversal (ScienTI, SIGP) listado por varias es UN grupo; un programa insignia
     renombrado entre gobiernos es UN grupo.
   - NO fusiones instrumentos distintos que comparten tema/palabras (una convocatoria de un fondo NO es un programa
     de becas), ni una convocatoria puntual con un programa permanente, ni un programa que un gobierno reemplazo por
     otro de modelo distinto.
2) Por cada grupo: 'nombre' canonico, 'refs' (usa SOLO refs de la lista), y 'politicas' = ids de TODAS las politicas
   a las que sirve (union de la politica de cada ref + sus 'tambien', mapeados a ids). Un fondo/sistema compartido
   debe quedar con VARIAS politicas (esto conecta la red).
3) 'politicas' (raiz): catalogo unificado con id (slug), nombre y objetivo; deduplica equivalentes entre gobiernos.

Politicas: ${JSON.stringify(pols)}
Instrumentos: ${JSON.stringify(compact)}`
}

function relPrompt(cat) {
  return `Instrumentos de CTeI (dos gobiernos). Identifica RELACIONES dirigidas entre instrumentos DISTINTOS (nunca
uno consigo mismo). Tipos: habilita (una norma da soporte legal a otro), financia (un fondo costea otro),
depende-de (precedencia/condicion), encadena (sinergia). Usa SOLO ids del catalogo. Apunta a las sustantivas
(p. ej. SGR/FFJC financian programas; Ley/CONPES habilitan sistemas). ${FUENTES}

CATALOGO: ${JSON.stringify(cat)}`
}

// ---------- orquestacion ----------
phase('Descubrir')
const disc = await agent(
  `Lista las POLITICAS PUBLICAS del sector CTeI presentes en los informes (objetivo + conjunto de instrumentos).
Incluye las Misiones (PIIOM y las 5 misiones), formacion/capacidades, apropiacion social, internacionalizacion,
modernizacion/gobernanza, sofisticacion productiva, IA, beneficios tributarios, bioeconomia. Da nombre y objetivo.
${FUENTES}`,
  { label: 'descubrir', phase: 'Descubrir', model: 'sonnet', agentType: 'Explore', schema: POLS, effort: 'high' })
let politicas = ((disc && disc.politicas) || []).map(p => ({ id: slug(p.nombre), nombre: p.nombre, objetivo: p.objetivo || '' }))
// dedup por id
const seen = {}; politicas = politicas.filter(p => (seen[p.id] ? false : (seen[p.id] = true)))
log(`Politicas descubiertas: ${politicas.length}`)

phase('Extraer')
const extraidas = await pipeline(
  politicas,
  (pol) => agent(extractPrompt(pol, politicas), { label: `ext:${pol.id}`, phase: 'Extraer', model: 'sonnet', agentType: 'Explore', schema: EXTRACT, effort: 'high' })
)

// aplanar items con refs estables
const items = []
extraidas.filter(Boolean).forEach((ex, pi) => {
  const polid = ex.politica_id && slug(ex.politica_id) || politicas[pi].id
  ;(ex.instrumentos || []).forEach((it, i) => {
    it._ref = `${politicas[pi].id}#${i}`
    it._pol = politicas[pi].nombre
    items.push(it)
  })
})
log(`Instrumentos extraidos: ${items.length}`)

phase('Consolidar')
const cons = await agent(consPrompt(items, politicas), { label: 'consolidar', phase: 'Consolidar', model: 'sonnet', effort: 'high', schema: CONS })
const polFinal = (cons && cons.politicas && cons.politicas.length) ? cons.politicas.map(p => ({ id: slug(p.id || p.nombre), nombre: p.nombre, objetivo: p.objetivo || '' })) : politicas
const polIds = new Set(polFinal.map(p => p.id))
const byRef = {}; items.forEach(it => { byRef[it._ref] = it })

// ensamblar objetos canonicos (union determinista por grupo)
function fuerte(ms) { const o = ['logrado', 'propuesto', 'pendiente']; const c = ms.filter(m => o.includes(m)); return c.length ? c.sort((a, b) => o.indexOf(a) - o.indexOf(b))[0] : null }
function mergeEvid(list) {
  const idx = {}
  list.forEach(ev => { const v = ev.vigencia; const cur = idx[v] || (idx[v] = { vigencia: v, paginas: [], cifras: [] }); cur.paginas = Array.from(new Set(cur.paginas.concat(ev.paginas || []))); cur.cifras = cur.cifras.concat(ev.cifras || []) })
  return Object.values(idx).map(ev => { const r = { vigencia: ev.vigencia }; if (ev.paginas.length) r.paginas = ev.paginas.sort((a, b) => a - b); if (ev.cifras.length) r.cifras = ev.cifras; return r })
}
const usedIds = {}
const objetos = (cons && cons.grupos || []).map(g => {
  const miembros = (g.refs || []).map(r => byRef[r]).filter(Boolean)
  if (!miembros.length) return null
  let id = slug(g.nombre); while (usedIds[id]) id += '-x'; usedIds[id] = true
  const pres = {}
  const m2018 = fuerte(miembros.map(m => m.presencia_2018).filter(Boolean))
  const m2022 = fuerte(miembros.map(m => m.presencia_2022).filter(Boolean))
  if (m2018) pres['2018-2022'] = { activo: true, modo: m2018 }
  if (m2022) pres['2022-2026'] = { activo: true, modo: m2022 }
  if (!Object.keys(pres).length) pres['2018-2022'] = { activo: true }
  // modo_cambio: determinista por presencia; si ambas, usa el de los miembros (no terminal)
  let modo
  const nvig = Object.keys(pres).length
  if (nvig === 1) modo = pres['2018-2022'] ? 'terminacion' : 'estratificacion'
  else { const cand = miembros.map(m => m.modo_cambio).filter(m => ['continuidad-estable', 'conversion', 'reversion', 'deriva'].includes(m)); modo = cand[0] || 'conversion' }
  const esObj = miembros.some(m => m.es_objetivo) && !miembros.some(m => m.tipo_nato)
  const pols = Array.from(new Set((g.politicas || []).map(slug).filter(p => polIds.has(p))))
  const alias = Array.from(new Set([].concat(...miembros.map(m => (m.alias || []).concat(m.nombre !== g.nombre ? [m.nombre] : [])))))
  const ent = Array.from(new Set([].concat(...miembros.map(m => m.entidades || []))))
  const narr = miembros.map(m => m.narrativa).find(n => n && (n.g2018 || n.g2022 || n.cambio))
  const evid = mergeEvid([].concat(...miembros.map(m => m.evidencia || [])))
  const o = { id, nombre: g.nombre, es_objetivo: esObj, politicas: pols, alias, presencia: pres, modo_cambio: modo, entidades: ent, evidencia: evid.length ? evid : [{ vigencia: Object.keys(pres)[0] }] }
  if (!esObj) { const tn = miembros.map(m => m.tipo_nato).find(Boolean); if (tn) o.tipo_nato = tn }
  const conf = miembros.map(m => m.confianza).find(Boolean); if (conf) o.confianza = conf
  if (narr) o.narrativa = { ...(narr.g2018 && { g2018: narr.g2018 }), ...(narr.g2022 && { g2022: narr.g2022 }), ...(narr.cambio && { cambio: narr.cambio }) }
  return o
}).filter(Boolean)
log(`Objetos canonicos: ${objetos.length} | puentes (>1 politica): ${objetos.filter(o => o.politicas.length > 1).length}`)

phase('Relaciones')
const cat = objetos.map(o => ({ id: o.id, nombre: o.nombre, es_objetivo: o.es_objetivo, tipo_nato: o.tipo_nato, politicas: o.politicas, vigencias: Object.keys(o.presencia) }))
const relDoc = await agent(relPrompt(cat), { label: 'relaciones', phase: 'Relaciones', model: 'sonnet', agentType: 'Explore', schema: RELS, effort: 'high' })
const oids = new Set(objetos.map(o => o.id))
const relaciones = ((relDoc && relDoc.relaciones) || []).filter(r => oids.has(r.source) && oids.has(r.target) && r.source !== r.target)

return { sector: 'ciencia-tecnologia', politicas: polFinal, objetos, relaciones,
  _stats: { politicas: polFinal.length, objetos: objetos.length, puentes: objetos.filter(o => o.politicas.length > 1).length, relaciones: relaciones.length } }
