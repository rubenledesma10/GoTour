// Esta IIFE (función que se ejecuta sola) se asegura de que el CSS de Leaflet
// esté cargado. Si ya existe el <link> no lo vuelve a agregar.
(function injectLeafletCSS() {
	const href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
	if (!document.querySelector(`link[href="${href}"]`)) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		document.head.appendChild(link);
	}
})();

// loadScript devuelve una Promesa que se resuelve cuando el script termina de cargar.
// Si ya está cargado (mismo src), no lo vuelve a pedir.
function loadScript(src) {
	return new Promise((res, rej) => {
		if (document.querySelector(`script[src="${src}"]`)) {
			res();
			return;
		}
		const s = document.createElement("script");
		s.src = src;
		s.async = true;
		s.onload = res;
		s.onerror = rej;
		document.body.appendChild(s);
	});
}

// Variables globales del mapa
let map, marker;

// cache y control de abort para acelerar geocodificación
const memCache = new Map();
let pendingController = null;
let lastKey = null;
function normAddr(s){ return s.trim().toLowerCase().replace(/\s+/g,' '); }

// ==============================
// Creamos por unica vez el mapa de Leaflet
// ensureMap() devuelve SIEMPRE el mapa. Si no existe, lo crea.
// Uso: llamámos a ensureMap() y nos aseguramos de que esta el mapa.
function ensureMap() {
	if (map) return map;
	// Creamos el mapa dentro del div con id="map-picker"
	// Lo centramos en Maipú
	map = L.map("map-picker").setView([-32.985, -68.788], 14); // Coordenadas de la Plaza de Maipú 
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; OpenStreetMap contributors",
	}).addTo(map);
	return map;
}

// Para colocar o mover el marcador en el mapa
// setPoint(lat, lng) centra el mapa y pone un marcador en esas coordenadas.
// Además, cuando se suelta el marcador actualiza los inputs de lat/lng.
function setPoint(lat, lng) {
	const m = ensureMap();
	// Si no hay marcador todavía, lo creamos y lo hacemos arrastrable
	if (!marker) marker = L.marker([lat, lng], { draggable: true }).addTo(m);
	// Movemos el marcador a la nueva posición
	marker.setLatLng([lat, lng]);
	// Centramos el mapa en ese punto
	m.setView([lat, lng], 16);
	// Este es el evento para cuando el usuario termina de arrastrar el marcador
	// Esto permite "ajuste fino" de manera manual.
	marker.off("dragend").on("dragend", () => {
		const p = marker.getLatLng();
		document.getElementById("lat").value = p.lat.toFixed(6);
		document.getElementById("lng").value = p.lng.toFixed(6);
	});
}

// Geocodificación de direcciones desde el input "address"
// Llama a tu endpoint Flask `/api/geocode?address=...` y espera que lleguen los datos {lat, lng}
// Si no hay dirección o es muy corta, no hace nada.
async function geocodeAddress(addr) {
	if (!addr || addr.length < 4) return null;

	// cache en memoria + localStorage, para no repetir consultas
	const key = normAddr(addr);
	if (memCache.has(key)) return memCache.get(key);
	const lsKey = "geo:"+key;
	const cached = localStorage.getItem(lsKey);
	if (cached) {
		const val = JSON.parse(cached);
		memCache.set(key, val);
		return val;
	}

	// Evitamos repetir exactamente la misma consulta consecutiva
	if (lastKey === key) return null;
	lastKey = key;

	// Lo usamos para abortar la request anterior si llega una nueva
	if (pendingController) pendingController.abort();
	pendingController = new AbortController();

	try {
		const res = await fetch(`/api/geocode?address=${encodeURIComponent(addr)}`, { signal: pendingController.signal });
		const data = await res.json();
		// Guardar solo si hay coordenadas válidas
		if (data && data.lat != null && data.lng != null) {
			memCache.set(key, data);
			localStorage.setItem(lsKey, JSON.stringify(data));
		}
		return data; // {lat, lng}
	} catch (e) {
		// AbortError u otros → devolvemos null silencioso
		return null;
	} finally {
		pendingController = null;
	}
}

// Evita llamar a la API en cada tecla que se pulse: espera "ms" ms desde la última pulsación.
function debounce(fn, ms) {
	let t;
	return (...a) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...a), ms);
	};
}

// Handler cuando cambia la dirección
// Toma el valor del input #address
// Llama al backend para geocodificar
// Si encuentra lat/lng, completa inputs y mueve el pin
// Si no encuentra, muestra el mensaje diciendo que no se encontró.
async function onAddressChange() {
	const addr = document.getElementById("address").value.trim();
	const note = document.getElementById("geo-note");
	if (!addr) {
		note.textContent = "";
		return;
	}
	const r = await geocodeAddress(addr);
	if (r && r.lat != null && r.lng != null) {
		// completamos los inputs ocultos/visibles
		document.getElementById("lat").value = Number(r.lat).toFixed(6);
		document.getElementById("lng").value = Number(r.lng).toFixed(6);
		// movemos el marcador al lugar que nos devolvió el backend
		setPoint(r.lat, r.lng);
		note.textContent = `Ubicación encontrada (${r.note}). Podés ajustar el pin arrastrándolo.`;
	} else {
		// si vino null porque se abortó o era repetida, no “ensuciar” el estado actual
		if (note.textContent === "") {
			note.textContent = "No se encontró una ubicación clara para esa dirección.";
		}
	}
}

// IIFE async: carga Leaflet JS, luego engancha eventos al input de dirección
(async function boot() {
	// Cargamos la librería Leaflet JS desde  CDN. CDN es Content Delivery Network
	await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
	// Buscamos el input de dirección
	const addressInput = document.getElementById("address");
	if (addressInput) {
		// Al cambiar la dirección, llamamos a onAddressChange  
		// Usamos debounce para no saturar la API
		addressInput.addEventListener("input", debounce(onAddressChange, 800));
		// si pega una dirección y sale del input, también geocodificamos esa dirección
		addressInput.addEventListener("blur", onAddressChange); // por si pega y sale
	}
})();
