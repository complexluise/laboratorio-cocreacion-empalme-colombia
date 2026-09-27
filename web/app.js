/* Mapa PoC de instrumentos de política pública (D3.js, sin dependencias externas).
   Consume window.DATASET (web/datos.js, generado desde objetos.json).
   Grafo dirigido por fuerzas, con los nodos agrupados por política pública. */
(function () {
  "use strict";

  var COLOR = {
    "continuidad-estable": "#2e7d32", "conversion": "#1565c0",
    "estratificacion": "#7b1fa2", "terminacion": "#9e9e9e",
    "reversion": "#c62828", "deriva": "#ef6c00",
  };
  var SIMBOLO = {  // tipo NATO -> d3.symbol ; objetivo -> estrella
    nodalidad: d3.symbolSquare, autoridad: d3.symbolDiamond,
    tesoro: d3.symbolTriangle, organizacion: d3.symbolCircle,
  };
  var COLOR_ARISTA = {
    habilita: "#5c6bc0", financia: "#26a69a", "depende-de": "#8d6e63", encadena: "#ec407a",
  };
  var LABEL_CAMBIO = {
    "continuidad-estable": "continuidad estable", "conversion": "conversión",
    "estratificacion": "estratificación", "terminacion": "terminación",
    "reversion": "reversión", "deriva": "deriva",
  };
  var LABEL_NATO = {
    nodalidad: "Nodalidad (información)", autoridad: "Autoridad",
    tesoro: "Tesoro", organizacion: "Organización",
  };
  var VIGENCIAS = ["2018-2022", "2022-2026"];

  function getData(cb) {
    if (window.DATASET) return cb(window.DATASET);
    fetch("../data/sectores/ciencia-tecnologia/objetos.json")
      .then(function (r) { return r.json(); }).then(cb)
      .catch(function () {
        document.getElementById("cy").innerHTML =
          "<p style='padding:20px'>No se pudo cargar el dataset. Corré <code>uv run extraccion/generar_web.py</code>.</p>";
      });
  }

  function iniciar(data) {
    var politicas = data.politicas || [];
    var objetos = data.objetos || [];
    var relaciones = data.relaciones || [];

    var polPorId = {};
    politicas.forEach(function (p) { polPorId[p.id] = p; });

    // centros de cluster por política, en una grilla
    var pids = [];
    objetos.forEach(function (o) {
      var pid = o.politica && polPorId[o.politica] ? o.politica : "_otros";
      o._pid = pid;
      if (pids.indexOf(pid) === -1) pids.push(pid);
    });
    var cont = document.getElementById("cy");
    var W = cont.clientWidth || 900, H = cont.clientHeight || 600;
    var COLS = Math.ceil(Math.sqrt(pids.length));
    var ROWS = Math.ceil(pids.length / COLS);
    var cellW = W / COLS, cellH = H / ROWS;
    var centro = {};
    pids.forEach(function (pid, i) {
      centro[pid] = { x: (i % COLS + 0.5) * cellW, y: (Math.floor(i / COLS) + 0.5) * cellH };
    });

    // nodos y aristas para la simulación
    var nodos = objetos.map(function (o) {
      return { id: o.id, obj: o, pid: o._pid,
               x: centro[o._pid].x + (Math.random() - 0.5) * 40,
               y: centro[o._pid].y + (Math.random() - 0.5) * 40 };
    });
    var byId = {};
    nodos.forEach(function (n) { byId[n.id] = n; });
    var links = relaciones
      .filter(function (r) { return byId[r.source] && byId[r.target] && r.source !== r.target; })
      .map(function (r) { return { source: r.source, target: r.target, tipo: r.tipo, nota: r.nota || "" }; });

    // --- SVG + zoom ---
    var svg = d3.select("#cy").append("svg").attr("width", W).attr("height", H);
    var defs = svg.append("defs");
    Object.keys(COLOR_ARISTA).forEach(function (t) {
      defs.append("marker").attr("id", "flecha-" + t).attr("viewBox", "0 -5 10 10")
        .attr("refX", 18).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", COLOR_ARISTA[t]);
    });
    var g = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.2, 4]).on("zoom", function (ev) { g.attr("transform", ev.transform); }));

    // etiquetas de política (al fondo)
    g.append("g").selectAll("text.pol").data(pids).enter().append("text")
      .attr("class", "pol-label").attr("x", function (d) { return centro[d].x; })
      .attr("y", function (d) { return centro[d].y - cellH / 2 + 16; })
      .attr("text-anchor", "middle")
      .text(function (d) { return polPorId[d] ? polPorId[d].nombre : "Sin política"; });

    // aristas (ocultas por defecto)
    var link = g.append("g").selectAll("line").data(links).enter().append("line")
      .attr("class", function (d) { return "arista arista-" + d.tipo; })
      .attr("stroke", function (d) { return COLOR_ARISTA[d.tipo] || "#999"; })
      .attr("stroke-width", 1.8).attr("marker-end", function (d) { return "url(#flecha-" + d.tipo + ")"; })
      .style("display", "none");

    // nodos
    var sym = d3.symbol().size(230);
    var node = g.append("g").selectAll("g.nodo").data(nodos).enter().append("g").attr("class", "nodo")
      .style("cursor", "pointer").on("click", function (ev, d) {
        ev.stopPropagation();
        node.classed("sel", false); d3.select(this).classed("sel", true);
        document.getElementById("panel").innerHTML = renderPanel(d.obj, data);
      });
    node.append("path")
      .attr("d", function (d) { return sym.type(d.obj.es_objetivo ? d3.symbolStar : (SIMBOLO[d.obj.tipo_nato] || d3.symbolCircle))(); })
      .attr("fill", function (d) { return COLOR[d.obj.modo_cambio] || "#999"; })
      .attr("stroke", "#00000033").attr("stroke-width", 1);
    node.append("title").text(function (d) { return d.obj.nombre; });
    node.append("text").attr("class", "nodo-label").attr("y", 20).attr("text-anchor", "middle")
      .text(function (d) { var s = d.obj.nombre; return s.length > 26 ? s.slice(0, 25) + "…" : s; });

    // --- simulación de fuerzas ---
    var sim = d3.forceSimulation(nodos)
      .force("x", d3.forceX(function (d) { return centro[d.pid].x; }).strength(0.35))
      .force("y", d3.forceY(function (d) { return centro[d.pid].y; }).strength(0.35))
      .force("charge", d3.forceManyBody().strength(-90))
      .force("collide", d3.forceCollide(26))
      .force("link", d3.forceLink(links).id(function (d) { return d.id; }).distance(70).strength(0.15))
      .on("tick", function () {
        link.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
        node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
      });

    node.call(d3.drag()
      .on("start", function (ev, d) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", function (ev, d) { d.fx = ev.x; d.fy = ev.y; })
      .on("end", function (ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    // --- interacción de UI ---
    function aplicarToggles() {
      var activos = {};
      document.querySelectorAll(".toggle-arista:checked").forEach(function (c) { activos[c.value] = true; });
      link.style("display", function (d) { return activos[d.tipo] ? null : "none"; });
    }
    document.querySelectorAll(".toggle-arista").forEach(function (c) { c.addEventListener("change", aplicarToggles); });

    var panel = document.getElementById("panel");
    svg.on("click", function () {
      node.classed("sel", false);
      panel.innerHTML = '<p class="vacio">Clic en un instrumento para ver su evidencia.</p>';
    });
    document.getElementById("ajustar").addEventListener("click", function () {
      svg.transition().duration(400).call(d3.zoom().transform, d3.zoomIdentity);
    });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function renderPanel(o, data) {
    var pol = (data.politicas || []).filter(function (p) { return p.id === o.politica; })[0];
    var badges = [];
    var col = COLOR[o.modo_cambio] || "#555";
    badges.push('<span class="badge" style="background:' + col + '">' + esc(LABEL_CAMBIO[o.modo_cambio] || o.modo_cambio) + "</span>");
    badges.push('<span class="badge gris">' + (o.es_objetivo ? "objetivo de política" : "instrumento") + "</span>");
    if (!o.es_objetivo && o.tipo_nato) badges.push('<span class="badge gris">' + esc(LABEL_NATO[o.tipo_nato] || o.tipo_nato) + "</span>");
    if (o.confianza) badges.push('<span class="badge gris">confianza ' + esc(o.confianza) + "</span>");

    var html = "<h2>" + esc(o.nombre) + "</h2>";
    html += '<div class="badges">' + badges.join("") + "</div>";

    html += "<h3>Política</h3><div>" + esc(pol ? pol.nombre : (o.politica || "—"));
    if (pol && pol.objetivo) html += '<div class="cifra">' + esc(pol.objetivo) + "</div>";
    html += "</div>";

    html += "<h3>Presencia por vigencia</h3><table>";
    VIGENCIAS.forEach(function (v) {
      var pr = o.presencia && o.presencia[v];
      html += "<tr><td>" + v + "</td><td>" + (pr ? "activo" + (pr.modo ? " · " + esc(pr.modo) : "") : "—") + "</td></tr>";
    });
    html += "</table>";

    if (o.entidades && o.entidades.length)
      html += "<h3>Entidades</h3><div>" + o.entidades.map(esc).join(", ") + "</div>";
    if (o.alias && o.alias.length)
      html += "<h3>Alias</h3><div class='cifra'>" + o.alias.map(esc).join(" · ") + "</div>";

    html += "<h3>Evidencia</h3>";
    (o.evidencia || []).forEach(function (ev) {
      html += "<div><strong>" + esc(ev.vigencia) + "</strong>";
      if (ev.paginas && ev.paginas.length) html += " · págs. " + ev.paginas.join(", ");
      html += "</div>";
      (ev.cifras || []).forEach(function (cf) {
        html += '<div class="cifra">— ' + esc(cf.texto || (cf.metrica + ": " + cf.valor)) + "</div>";
      });
    });
    return html;
  }

  getData(iniciar);
})();
