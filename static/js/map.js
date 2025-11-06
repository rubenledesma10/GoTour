// --- CSS dinámico (Leaflet y mapa) --- 
(function inject(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }
})("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
(function inject(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }
})("https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css");

// Altura del mapa
(function ensureMapHeight() {
  if (!document.getElementById("map")) return;
  if (!document.getElementById("map-inline-style")) {
    const style = document.createElement("style");
    style.id = "map-inline-style";
    style.textContent = `#map{height:70vh;width:100%}`;
    document.head.appendChild(style);
  }
})();


//  Helpers para categorías y colores

const GT_COLORS = {
  me: "#E53935", // rojo (mi ubicación)
  bodega: "#e6a00bff",          
  gastronomia: "#802800ff",     
  olivicolas: "#2E7D32",      
  alojamiento: "#0fa4faff",     
  "turismo rural": "#FBC02D",  
  default: "#564da8ff"          
};

const norm = (s) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function colorForCategory(cat) {
  const c = norm(cat);
  if (c.includes("bodega")) return GT_COLORS.bodega;
  if (c.includes("rest")) return GT_COLORS.gastronomia;      // <- usa color de gastronomía
  if (c.includes("gastro")) return GT_COLORS.gastronomia;
  if (c.includes("oliv")) return GT_COLORS.olivicolas;
  if (c.includes("aloj") || c.includes("hotel")) return GT_COLORS.alojamiento;
  if (c.includes("turismo") && c.includes("rural")) return GT_COLORS["turismo rural"];
  if (c.includes("serv")) return GT_COLORS.default; // servicios turísticos
  return "#6c757d"; // otros
}

// Leyenda (etiquetas, colores y render) 
function canonicalCategoryLabel(raw) {
  const c = norm(raw);
  if (c.includes("bodega")) return "Bodegas";
  if (c.includes("rest")) return "Gastronomía";             // <- etiqueta unificada
  if (c.includes("gastro")) return "Gastronomía";
  if (c.includes("oliv")) return "Olívicolas";
  if (c.includes("aloj") || c.includes("hotel")) return "Alojamientos";
  if (c.includes("turismo") && c.includes("rural")) return "Turismo rural";
  if (c.includes("serv")) return "Servicios turísticos"; // 👈 azul
  return "Otros";
}

function colorForLabel(lbl) {
  switch (lbl) {
    case "Bodegas":              return GT_COLORS.bodega;
    case "Gastronomía":          return GT_COLORS.gastronomia; // <- color correcto
    case "Olívicolas":           return GT_COLORS.olivicolas;
    case "Alojamientos":         return GT_COLORS.alojamiento;
    case "Turismo rural":        return GT_COLORS["turismo rural"];
    case "Servicios turísticos": return GT_COLORS.default;    // azul
    default:                     return "#6c757d";            // otros (gris)
  }
}

const LEGEND_ORDER = [
  "Bodegas",
  "Gastronomía",
  "Olívcolas",
  "Alojamientos",
  "Turismo rural",
  "Servicios turísticos",
  "Otros"
].map(s => s.replace("Olívcolas","Olívcolas")); // evita typos si copias/pegas

// Renderiza debajo del mapa la leyenda de categorías usadas
function renderLegend(labelsSet) {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  // Permitimos usar #map_referencias si existe, o creamos #map-legend
  let legend =
    document.getElementById("map_referencias") ||
    document.getElementById("map-legend");

  if (!legend) {
    legend = document.createElement("div");
    legend.id = "map-legend";
    legend.className = "map-legend";
    mapEl.insertAdjacentElement("afterend", legend);
  }

  const labels = labelsSet && labelsSet.size
    ? LEGEND_ORDER.filter(l => labelsSet.has(l))
    : LEGEND_ORDER;

  legend.innerHTML =
    `<span class="legend-title">REFERENCIAS</span>` +
    labels.map(lbl => {
      const color = colorForLabel(lbl);
      return `
        <span class="legend-chip">
          <span class="swatch" style="background:${color}"></span>
          <span class="label">${lbl}</span>
        </span>`;
    }).join("");
}

// parseo robusto: admite "−32,987" o "−32.987" o número
function parseCoord(v) {
  if (typeof v === "number") return v;
  const s = String(v || "").trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// Pin SVG brillante
function glossyPinIcon(color) {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 48'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='#fff' stop-opacity='.65'/>
        <stop offset='.6' stop-color='#fff' stop-opacity='0'/>
      </linearGradient>
    </defs>
    <path fill='${color}' stroke='#222' stroke-width='1'
      d='M16 1c-7.2 0-13 5.8-13 13 0 11.3 13 33 13 33s13-21.7 13-33C29 6.8 23.2 1 16 1z'/>
    <circle cx='16' cy='14' r='7' fill='url(#g)'/>
    <circle cx='16' cy='14' r='5' fill='#fff' fill-opacity='.2'/>
  </svg>`;
  return L.icon({
    iconUrl: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    iconSize: [32, 48],
    iconAnchor: [16, 46],
    popupAnchor: [0, -40],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });
}

// Cargar JS de una URL externa
function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = res; s.onerror = () => rej(new Error("No se pudo cargar: " + src));
    document.body.appendChild(s);
  });
}

//  Mapa

async function initMap() {
  // Leaflet
  try { await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"); }
  catch { await loadScript("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"); }
  if (typeof L === "undefined") { alert("Leaflet no se pudo cargar (CDN)."); return; }

  // Leaflet Routing Machine (LRM)
  try {
    await loadScript("https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.min.js");
  } catch {
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/leaflet-routing-machine@latest/dist/leaflet-routing-machine.min.js");
    } catch (e) { console.warn("LRM no disponible, se carga el mapa sin rutas.", e); }
  }

  // Localización 
  try { await loadScript("https://unpkg.com/lrm-localization@0.2.7/dist/lrm-localization.min.js"); }
  catch { /* ok */ }

  const PLAZA_MAIPU = [-32.985, -68.788];
  const el = document.getElementById("map");
  if (!el) { alert("No se encontró <div id='map'>."); return; }

  const map = L.map("map", { zoomControl: true }).setView(PLAZA_MAIPU, 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  L.control.scale().addTo(map);

  // Punto de referencia
  // (Se quita el pin fijo de la plaza para que no interfiera con el ruteo)

  // Capa de sitios turísticos
  const sitesLayer = L.layerGroup().addTo(map);
  const markersById = new Map();

  // Ruteo (LRM)
  let routingControl = null;
  let routeProfile   = "driving"; // driving|foot|cycling
  let routeLang      = "es";
  let currentLatLng  = null;
  let lastRouteColor = "#3388ff";

  // estilos por perfil (auto=línea lisa, bici=guiones, a pie=punteada)
  function lineStylesFor(profile, color, weight = 6, opacity = 1) {
    const base = { weight, opacity, color };
    if (profile === "cycling") return [{ ...base, dashArray: "10,8" }];
    if (profile === "foot")     return [{ ...base, dashArray: "2,10" }];
    return [{ ...base }];
  }

  function ensureRouting(color) {
    if (!L.Routing || !L.Routing.control) return null;

    const wantColor = color || lastRouteColor;
    if (routingControl) {
      if (wantColor !== lastRouteColor) { map.removeControl(routingControl); routingControl = null; }
    }
    lastRouteColor = wantColor;

    if (routingControl) return routingControl;

    const formatter =
      L.Routing.Localization && L.Routing.Localization[routeLang]
        ? new L.Routing.Formatter(L.Routing.Localization[routeLang])
        : new L.Routing.Formatter({ language: routeLang, units: "metric" });

    routingControl = L.Routing.control({
      waypoints: [],
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      show: true,
      collapsible: true,
      showAlternatives: true,
      // evita superponer un pin, sobre el pin rojo (origen)
      createMarker: (i) => (i === 0 ? null : undefined),
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: routeProfile,
        timeout: 30000,
        alternatives: 3,
        steps: true,
        annotations: true,
        continue_straight: true
      }),
      language: routeLang,
      formatter,
      lineOptions:    { styles: lineStylesFor(routeProfile, wantColor, 6, 1) },
      altLineOptions: { styles: lineStylesFor(routeProfile, wantColor, 4, 0.7).map(s => ({ ...s, dashOffset: "0", lineCap: "butt" })) },
      routeLine(route, options) {
        const line = L.Routing.line(route, options);
        line.on("linetouched", () => routingControl.selectRoute(route));
        return line;
      }
    }).addTo(map);

    routingControl.on("routesfound", (e) => {
      try {
        const styles    = lineStylesFor(routeProfile, lastRouteColor, 6, 1);
        const altStyles = lineStylesFor(routeProfile, lastRouteColor, 4, 0.7).map(s => ({ ...s, dashOffset: "0", lineCap: "butt" }));
        routingControl.getPlan()._line.options.styles = styles;
        routingControl.options.lineOptions.styles      = styles;
        routingControl.options.altLineOptions.styles   = altStyles;

        const line = L.Routing.line(e.routes[0], { styles: [{ weight: 1, opacity: 0 }] });
        const b = line.getBounds();
        if (b && b.isValid()) map.fitBounds(b.pad(0.2));
      } catch {}
    });

    routingControl._formatter = formatter;
    return routingControl;
  }

  // ¿ubicación activa?
  const isLocationActive = () => liveWatchId !== null || !!currentLatLng || !!meMarker;

  // actualización de pines de sitios
  function createOrUpdateSiteMarker(site) {
    const id = site.id ?? site.id_tourist_site ?? site._id ?? `${site.name}-${site.address}`;
    const lat = parseCoord(site.lat);
    const lng = parseCoord(site.lng);
    if (lat == null || lng == null) { console.warn("Sitio sin coordenadas válidas:", site); return; }

    const color = colorForCategory(site.category);
    const icon  = glossyPinIcon(color);
    const html  = `
      <strong>${site.name ?? "Sin nombre"}</strong><br/>
      ${site.address ?? ""}<br/>
      <small>${site.category ?? ""}</small><br/>
      <em>Click para trazar ruta</em>
    `;

    let m = markersById.get(id);
    if (!m) {
      m = L.marker([lat, lng], { icon, zIndexOffset: 200 }).bindPopup(html);
      m.on("click", () => { isLocationActive() ? routeTo([lat, lng], color) : m.openPopup(); });
      m.addTo(sitesLayer);
      markersById.set(id, m);
    } else {
      m.setLatLng([lat, lng]); m.setIcon(icon); m.setPopupContent(html);
    }
  }

  // Ruta hacia destino (coloreada según destino)
  async function routeTo(dest, color) {
    if (!currentLatLng && meMarker) {
      const p = meMarker.getLatLng();
      currentLatLng = L.latLng(p.lat, p.lng);
    }
    if (!currentLatLng) { alert("Activá tu ubicación (botón 📍) para calcular la ruta."); return; }
    const rc = ensureRouting(color);
    if (!rc) return;

    rc.options.lineOptions.styles    = lineStylesFor(routeProfile, color || lastRouteColor, 6, 1);
    rc.options.altLineOptions.styles = lineStylesFor(routeProfile, color || lastRouteColor, 4, 0.7).map(s => ({ ...s, dashOffset: "0", lineCap: "butt" }));
    rc.setWaypoints([ currentLatLng, L.latLng(dest[0], dest[1]) ]);
  }

  // Controles perfil (se quita el control ES|EN)
  const ProfileControl = L.Control.extend({
    onAdd() {
      const w = L.DomUtil.create("div", "leaflet-bar");
      w.style.background = "white"; w.style.padding = "4px"; w.style.userSelect = "none"; w.style.font = "12px system-ui";
      w.innerHTML = `
        <button data-prof="driving"  title="Auto"  style="padding:6px;border:0;cursor:pointer">🚗</button>
        <button data-prof="foot"     title="A pie" style="padding:6px;border:0;cursor:pointer">🚶</button>
        <button data-prof="cycling"  title="Bici"  style="padding:6px;border:0;cursor:pointer">🚴</button>`;
      L.DomEvent.disableClickPropagation(w); L.DomEvent.disableScrollPropagation(w);
      L.DomEvent.on(w, "click", (ev) => {
        const b = ev.target.closest("button"); if (!b) return;

        // Conservar y recalcular la ruta actual automáticamente
        let prevWps = null;
        if (routingControl && routingControl.getWaypoints) {
          const wps = routingControl.getWaypoints().map(w => w.latLng).filter(Boolean);
          if (wps.length >= 2) prevWps = wps;
        }

        routeProfile = b.dataset.prof;

        if (routingControl) { map.removeControl(routingControl); routingControl = null; }
        const rc = ensureRouting();

        if (rc) {
          rc.options.lineOptions.styles    = lineStylesFor(routeProfile, lastRouteColor, 6, 1);
          rc.options.altLineOptions.styles = lineStylesFor(routeProfile, lastRouteColor, 4, 0.7).map(s => ({ ...s, dashOffset: "0", lineCap: "butt" }));
          if (prevWps) rc.setWaypoints(prevWps); // recalcula la ruta anterior
        }
      });
      return w;
    }
  });
  map.addControl(new ProfileControl({ position: "topleft" }));

  //  Carga de sitios turísticos desde el servidor

  try {
    const res = await fetch("/api/tourist_sites", { method: "GET", cache: "no-store" });
    if (res.ok) {
      const sites  = await res.json();
      const bounds = [];
      const labels = new Set();

      sites.forEach((s) => {
        createOrUpdateSiteMarker(s);
        if (s.category) labels.add(canonicalCategoryLabel(s.category));
        const la = parseCoord(s.lat), ln = parseCoord(s.lng);
        if (la != null && ln != null) bounds.push([la, ln]);
      });

      renderLegend(labels); // pinta “REFERENCIAS” debajo del mapa
      if (bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.2));
      else map.setView(PLAZA_MAIPU, 16);
    } else {
      console.warn("GET /api/tourist_sites →", res.status);
      map.setView(PLAZA_MAIPU, 16);
    }
  } catch (e) {
    console.warn("No pude cargar sitios:", e);
    map.setView(PLAZA_MAIPU, 16);
  }


  //  Ubicación en tiempo real

  let liveWatchId = null;
  let meMarker = null;
  let accuracyCircle = null;

  function emitLiveLocation(lat, lng, accuracy) {
    window.dispatchEvent(new CustomEvent("gotour:liveLocation", { detail: { lat, lng, accuracy } }));
  }
  window.addEventListener("gotour:liveLocation", (e) => {
    currentLatLng = L.latLng(e.detail.lat, e.detail.lng);
  });

  function distanceMeters(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function getAccurateFix(targetAcc = 15, maxTries = 5, perTryTimeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const attempt = () => {
        tries++;
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const acc = pos.coords.accuracy ?? 9999;
            acc <= targetAcc || tries >= maxTries ? resolve(pos) : setTimeout(attempt, 500);
          },
          (err) => {
            tries >= maxTries ? reject(err) : setTimeout(attempt, 500);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: perTryTimeoutMs }
        );
      };
      attempt();
    });
  }

  // Iniciar seguimiento de ubicación

  async function startLiveLocation() {
    if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalización."); return; }
    if (liveWatchId) return;

    const ACC_OK = 20, MOVE_MIN = 10;
    let lastLatLng = null, gotFirstFix = false;

	// Intento de buena precisión inicial
    try {
      const first = await getAccurateFix(15, 6, 8000);
      const { latitude: fLat, longitude: fLng, accuracy: fAcc } = first.coords;
      meMarker = L.marker([fLat, fLng], {
        title: "Estás aquí",
        draggable: true,
        icon: glossyPinIcon(GT_COLORS.me)
      }).addTo(map);
      meMarker.bindPopup(() => `Precisión: ~${Math.round(fAcc)} m`);
      accuracyCircle = L.circle([fLat, fLng], { radius: fAcc }).addTo(map);
      currentLatLng = L.latLng(fLat, fLng);
      map.setView([fLat, fLng], Math.max(map.getZoom(), 18), { animate: true });
      lastLatLng = [fLat, fLng]; gotFirstFix = true; emitLiveLocation(fLat, fLng, fAcc);

      meMarker.on("dragend", () => {
        const p = meMarker.getLatLng();
        accuracyCircle.setLatLng(p);
        map.panTo(p, { animate: true });
        currentLatLng = L.latLng(p.lat, p.lng);
        emitLiveLocation(p.lat, p.lng, fAcc);
      });
    } catch (e) { console.debug("Good-fix inicial falló:", e); }

	// Seguimiento continuo de ubicación en segundo plano
    liveWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (gotFirstFix && typeof accuracy === "number" && accuracy > ACC_OK) return;

        if (!meMarker) {
          meMarker = L.marker([latitude, longitude], {
            title: "Estás aquí", draggable: true, icon: glossyPinIcon(GT_COLORS.me)
          }).addTo(map);
          accuracyCircle = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);
        } else {
          meMarker.setLatLng([latitude, longitude]);
          meMarker.setPopupContent(`Precisión: ~${Math.round(accuracy)} m`);
          accuracyCircle.setLatLng([latitude, longitude]).setRadius(accuracy);
        }

        const mustRecenter = !lastLatLng || distanceMeters(lastLatLng, [latitude, longitude]) > MOVE_MIN;
        if (mustRecenter) {
          map.setView([latitude, longitude], Math.max(map.getZoom(), 18), { animate: true });
          lastLatLng = [latitude, longitude];
        }

        currentLatLng = L.latLng(latitude, longitude);
        emitLiveLocation(latitude, longitude, accuracy);
        if (!gotFirstFix) gotFirstFix = true;
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED ? "No diste permiso de ubicación."
          : err.code === err.POSITION_UNAVAILABLE ? "Ubicación no disponible (activá Wi-Fi/GPS)."
          : err.code === err.TIMEOUT ? "Se agotó el tiempo para obtener ubicación."
          : err.message;
        alert("No pude obtener tu ubicación: " + msg);
        stopLiveLocation();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  }

  // Detener seguimiento de ubicación
  function stopLiveLocation() {
    if (liveWatchId !== null) { navigator.geolocation.clearWatch(liveWatchId); liveWatchId = null; }
    if (meMarker) { map.removeLayer(meMarker); meMarker = null; }
    if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null; }
  }

  // Control de ubicación (botón 📍)
  const LocateControl = L.Control.extend({
    onAdd() {
      const btn = L.DomUtil.create("button", "leaflet-bar");
      btn.innerHTML = "📍";
      btn.title = "Mi ubicación (activar/desactivar)";
      btn.style.width = "34px"; btn.style.height = "34px";
      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.stop(e);
        if (liveWatchId) { stopLiveLocation(); btn.style.background = ""; }
        else { startLiveLocation(); btn.style.background = "#eee"; }
      });
      return btn;
    }
  });
  map.addControl(new LocateControl({ position: "topleft" }));

  // Exponer API, si se desea, para uso externo
  window.MapLive = { startLiveLocation, stopLiveLocation, createOrUpdateSiteMarker };
} // initMap

// Iniciar cuando el DOM esté listo
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", initMap)
  : initMap();
