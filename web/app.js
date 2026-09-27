/* Mapa PoC del laboratorio (D3.js, sin dependencias externas).
   RED BIPARTITA: políticas públicas (hubs) ↔ instrumentos. Un instrumento puede servir a varias
   políticas (los compartidos enlazan la red). Sobre eso, relaciones instrumento-instrumento bajo
   demanda. Selector de vigencia (2018-2022 / 2022-2026 / ambos). Consume window.DATASET. */
(function () {
  "use strict";

  var COLOR = {
    "continuidad-estable": "#2e7d32", "conversion": "#1565c0",
    "estratificacion": "#7b1fa2", "terminacion": "#9e9e9e",
    "reversion": "#c62828", "deriva": "#ef6c00",
  };
  var SIMBOLO = {
    nodalidad: d3.symbolSquare, autoridad: d3.symbolDiamond,
    tesoro: d3.symbolTriangle, organizacion: d3.symbolCircle,
  };
  var COLOR_REL = {
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

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function iniciar(data) {
    var politicas = data.politicas || [];
    var objetos = data.objetos || [];
    var relaciones = data.relaciones || [];
    var polPorId = {}; politicas.forEach(function (p) { polPorId[p.id] = p; });
    var objPorId = {}; objetos.forEach(function (o) { objPorId[o.id] = o; });
    var panel = document.getElementById("panel");
    var cont = document.getElementById("cy");
    var vigencia = "ambos";
    var sim = null;

    function activo(o, vig) { return vig === "ambos" || (o.presencia && o.presencia[vig] && o.presencia[vig].activo); }

    function dibujar() {
      if (sim) sim.stop();
      d3.select("#cy").selectAll("*").remove();
      var W = cont.clientWidth || 900, H = cont.clientHeight || 600;

      // instrumentos visibles según vigencia
      var instVis = objetos.filter(function (o) { return activo(o, vigencia); });
      var visIds = {}; instVis.forEach(function (o) { visIds[o.id] = true; });

      // políticas visibles = las que tienen ≥1 instrumento visible
      var polUsada = {};
      instVis.forEach(function (o) { (o.politicas || []).forEach(function (pid) { if (polPorId[pid]) polUsada[pid] = true; }); });

      var nodos = [];
      politicas.forEach(function (p) {
        if (polUsada[p.id]) nodos.push({ id: "pol:" + p.id, tipo: "pol", pol: p });
      });
      instVis.forEach(function (o) { nodos.push({ id: "ins:" + o.id, tipo: "ins", obj: o }); });
      var byId = {}; nodos.forEach(function (n) { n.x = W / 2 + (Math.random() - 0.5) * 200; n.y = H / 2 + (Math.random() - 0.5) * 200; byId[n.id] = n; });

      // aristas bipartitas (instrumento -> política): backbone, siempre visibles
      var memb = [];
      instVis.forEach(function (o) {
        (o.politicas || []).forEach(function (pid) {
          if (polUsada[pid]) memb.push({ source: "ins:" + o.id, target: "pol:" + pid, clase: "membership" });
        });
      });
      // relaciones instrumento-instrumento: overlay bajo demanda
      var rel = relaciones.filter(function (r) { return visIds[r.source] && visIds[r.target] && r.source !== r.target; })
        .map(function (r) { return { source: "ins:" + r.source, target: "ins:" + r.target, tipo: r.tipo, nota: r.nota || "", clase: "rel" }; });

      var svg = d3.select("#cy").append("svg").attr("width", W).attr("height", H);
      var defs = svg.append("defs");
      Object.keys(COLOR_REL).forEach(function (t) {
        defs.append("marker").attr("id", "fl-" + t).attr("viewBox", "0 -5 10 10")
          .attr("refX", 16).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6)
          .attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", COLOR_REL[t]);
      });
      var g = svg.append("g");
      var zoom = d3.zoom().scaleExtent([0.2, 4]).on("zoom", function (ev) { g.attr("transform", ev.transform); });
      svg.call(zoom);

      var lMemb = g.append("g").selectAll("line.memb").data(memb).enter().append("line")
        .attr("class", "memb");
      var lRel = g.append("g").selectAll("line.rel").data(rel).enter().append("line")
        .attr("class", function (d) { return "arista rel rel-" + d.tipo; })
        .attr("stroke", function (d) { return COLOR_REL[d.tipo] || "#999"; })
        .attr("stroke-width", 2).attr("marker-end", function (d) { return "url(#fl-" + d.tipo + ")"; })
        .style("display", "none");

      var nodo = g.append("g").selectAll("g.nodo").data(nodos).enter().append("g")
        .attr("class", function (d) { return "nodo " + d.tipo; }).style("cursor", "pointer")
        .on("click", function (ev, d) {
          ev.stopPropagation();
          nodo.classed("sel", false); d3.select(this).classed("sel", true);
          panel.innerHTML = d.tipo === "pol" ? renderPol(d.pol, objetos) : renderInst(d.obj, polPorId);
        });

      // políticas: círculo hub; instrumentos: símbolo por NATO, color por modo de cambio
      var sym = d3.symbol().size(210);
      nodo.filter(function (d) { return d.tipo === "pol"; }).append("circle")
        .attr("r", 15).attr("fill", "#ffffff").attr("stroke", "#17203a").attr("stroke-width", 2.5);
      nodo.filter(function (d) { return d.tipo === "ins"; }).append("path")
        .attr("d", function (d) { return sym.type(d.obj.es_objetivo ? d3.symbolStar : (SIMBOLO[d.obj.tipo_nato] || d3.symbolCircle))(); })
        .attr("fill", function (d) { return COLOR[d.obj.modo_cambio] || "#999"; })
        .attr("stroke", "#00000033").attr("stroke-width", 1);
      nodo.append("title").text(function (d) { return d.tipo === "pol" ? d.pol.nombre : d.obj.nombre; });
      nodo.append("text").attr("class", function (d) { return "label " + d.tipo; })
        .attr("y", function (d) { return d.tipo === "pol" ? 27 : 18; }).attr("text-anchor", "middle")
        .text(function (d) {
          var s = d.tipo === "pol" ? d.pol.nombre : d.obj.nombre;
          var max = d.tipo === "pol" ? 34 : 24;
          return s.length > max ? s.slice(0, max - 1) + "…" : s;
        });

      sim = d3.forceSimulation(nodos)
        .force("link", d3.forceLink(memb).id(function (d) { return d.id; }).distance(70).strength(0.5))
        .force("charge", d3.forceManyBody().strength(function (d) { return d.tipo === "pol" ? -400 : -120; }))
        .force("collide", d3.forceCollide(function (d) { return d.tipo === "pol" ? 34 : 24; }))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .on("tick", function () {
          lMemb.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; })
               .attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
          lRel.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; })
              .attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
          nodo.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        });

      nodo.call(d3.drag()
        .on("start", function (ev, d) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", function (ev, d) { d.fx = ev.x; d.fy = ev.y; })
        .on("end", function (ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

      aplicarToggles(lRel);
      svg.on("click", function () { nodo.classed("sel", false); panel.innerHTML = vacio(); });
      document.getElementById("ajustar").onclick = function () {
        svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
      };
    }

    function aplicarToggles(lRel) {
      var activos = {};
      document.querySelectorAll(".toggle-arista:checked").forEach(function (c) { activos[c.value] = true; });
      lRel.style("display", function (d) { return activos[d.tipo] ? null : "none"; });
    }

    document.querySelectorAll(".toggle-arista").forEach(function (c) {
      c.addEventListener("change", function () { aplicarToggles(d3.selectAll("line.rel")); });
    });
    document.getElementById("vigencia").addEventListener("change", function (e) {
      vigencia = e.target.value; panel.innerHTML = vacio(); dibujar();
    });

    dibujar();
  }

  function vacio() { return '<p class="vacio">Clic en un nodo para ver su detalle.</p>'; }

  function renderInst(o, polPorId) {
    var col = COLOR[o.modo_cambio] || "#555";
    var badges = ['<span class="badge" style="background:' + col + '">' + esc(LABEL_CAMBIO[o.modo_cambio] || o.modo_cambio) + "</span>",
      '<span class="badge linea">' + (o.es_objetivo ? "objetivo de política" : "instrumento") + "</span>"];
    if (!o.es_objetivo && o.tipo_nato) badges.push('<span class="badge linea">' + esc(LABEL_NATO[o.tipo_nato] || o.tipo_nato) + "</span>");
    if (o.confianza) badges.push('<span class="badge linea">confianza ' + esc(o.confianza) + "</span>");

    var html = "<h2>" + esc(o.nombre) + "</h2><div class='regla' style='background:" + col + "'></div>" +
      "<div class='badges'>" + badges.join("") + "</div>";

    html += "<h3>Políticas que sirve</h3><ul>";
    (o.politicas || []).forEach(function (pid) { html += "<li>" + esc(polPorId[pid] ? polPorId[pid].nombre : pid) + "</li>"; });
    if (!(o.politicas || []).length) html += "<li class='cifra'>—</li>";
    html += "</ul>";

    html += "<h3>Presencia por vigencia</h3><table>";
    VIGENCIAS.forEach(function (v) {
      var pr = o.presencia && o.presencia[v];
      html += "<tr><td>" + v + "</td><td>" + (pr ? "activo" + (pr.modo ? " · " + esc(pr.modo) : "") : "—") + "</td></tr>";
    });
    html += "</table>";

    if (o.narrativa && (o.narrativa.g2018 || o.narrativa.g2022 || o.narrativa.cambio)) {
      html += "<h3>Qué fue bajo cada gobierno</h3>";
      if (o.narrativa.g2018) html += '<div class="vig-tag">2018–2022</div><div class="cifra">' + esc(o.narrativa.g2018) + "</div>";
      if (o.narrativa.g2022) html += '<div class="vig-tag">2022–2026</div><div class="cifra">' + esc(o.narrativa.g2022) + "</div>";
      if (o.narrativa.cambio) html += '<div class="narr-cambio">' + esc(o.narrativa.cambio) + "</div>";
    }

    if (o.entidades && o.entidades.length) html += "<h3>Entidades</h3><div>" + o.entidades.map(esc).join(", ") + "</div>";
    if (o.alias && o.alias.length) html += "<h3>Alias</h3><div class='cifra'>" + o.alias.map(esc).join(" · ") + "</div>";

    html += "<h3>Evidencia</h3>";
    (o.evidencia || []).forEach(function (ev) {
      html += '<div class="vig-tag">' + esc(ev.vigencia);
      if (ev.paginas && ev.paginas.length) html += " · págs. " + ev.paginas.join(", ");
      html += "</div>";
      (ev.cifras || []).forEach(function (cf) {
        html += '<div class="cifra">— ' + esc(cf.texto || (cf.metrica + ": " + cf.valor)) + "</div>";
      });
    });
    return html;
  }

  function renderPol(p, objetos) {
    var suyos = objetos.filter(function (o) { return (o.politicas || []).indexOf(p.id) !== -1; });
    var html = "<h2>" + esc(p.nombre) + "</h2><div class='regla' style='background:#17203a'></div>" +
      "<div class='badges'><span class='badge linea'>política pública</span></div>";
    if (p.objetivo) html += "<h3>Objetivo</h3><div>" + esc(p.objetivo) + "</div>";
    html += "<h3>Instrumentos (" + suyos.length + ")</h3><ul>";
    suyos.forEach(function (o) {
      var col = COLOR[o.modo_cambio] || "#999";
      html += "<li><span class='punto' style='background:" + col + "'></span>" + esc(o.nombre) +
        (o.es_objetivo ? " <em>(objetivo)</em>" : (o.tipo_nato ? " <em>(" + esc(o.tipo_nato) + ")</em>" : "")) + "</li>";
    });
    html += "</ul>";
    return html;
  }

  getData(iniciar);
})();
