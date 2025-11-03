// Implementación del mapa usando Leaflet.js y OpenStreetMap
// Insertamos el CSS de Leaflet dinámicamente
// Asi no dependemos de que esté en el HTML
(function injectLeafletCSS() {
	const href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
	if (!document.querySelector(`link[href="${href}"]`)) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		document.head.appendChild(link);
	}
})();

// Asegura altura del #map
(function ensureMapHeight() {
	if (!document.getElementById("map")) return;
	if (!document.getElementById("map-inline-style")) {
		const style = document.createElement("style");
		style.id = "map-inline-style";
		style.textContent = `
			#map { height: 70vh; width: 100%; }
		`;
		document.head.appendChild(style);
	}
})();

// Carga un script de forma dinámica y devuelve una promesa cuando esté listo 
function loadScript(src) {
	return new Promise((resolve, reject) => {
		// Si ya está cargado, resolvemos inmediatamente
		if (document.querySelector(`script[src="${src}"]`)) {
			resolve();
			return;
		}
		const s = document.createElement("script");
		s.src = src;
		s.async = true;
		s.onload = resolve;
		s.onerror = reject;
		document.body.appendChild(s);
	});
}

// Inicializa el mapa una vez cargado Leaflet
async function initMap() {
	// Cargamos Leaflet JS
	await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");

	// Coordenadas de la Plaza de Maipú
	const PLAZA_MAIPU = [-32.985, -68.788];

	// Crear el mapa centrado en Plaza de Maipú
	const mapEl = document.getElementById("map");
	if (!mapEl) return;

	const map = L.map("map", { zoomControl: true }).setView(PLAZA_MAIPU, 16);

	// Utilizamos OpenStreetMap como capa base para complementar Leaflet
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; OpenStreetMap contributors"
	}).addTo(map);

	L.control.scale().addTo(map);

	// marcador en la plaza
	L.marker(PLAZA_MAIPU)
		.addTo(map)
		.bindPopup("<strong>Plaza de Maipú</strong>")
		.openPopup();

	// Intentamos cargar marcadores desde la API si es que hay
	try {
		const res = await fetch("/api/tourist_sites", { method: "GET" });
		if (res.ok) {
			const sites = await res.json();
			const markers = [];

			sites.forEach((s) => {
				if (s.lat != null && s.lng != null) {
					const m = L.marker([parseFloat(s.lat), parseFloat(s.lng)])
						.addTo(map)
						.bindPopup(`
							<strong>${s.name ?? "Sin nombre"}</strong><br/>
							${s.address ?? ""}<br/>
							<small>${s.category ?? ""}</small>
						`);
					markers.push(m);
				}
			});

			// Si hay sitios, encuadra todos (manteniendo visible la plaza)
			if (markers.length) {
				const group = L.featureGroup(markers.concat(L.marker(PLAZA_MAIPU)));
				map.fitBounds(group.getBounds().pad(0.2));
			}
		}
	} catch (e) {
		// Silencioso si no hay API todavía
	}
}

// Cargar el mapa cuando el DOM esté listo  
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initMap);
} else {
	initMap();
}
