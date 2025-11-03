// Carga dinámica de Leaflet (igual patrón que usaste)
(function injectLeafletCSS() {
	const href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
	if (!document.querySelector(`link[href="${href}"]`)) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		document.head.appendChild(link);
	}
})();

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

let map, marker;

function ensureMap() {
	if (map) return map;
	map = L.map("map-picker").setView([-32.985, -68.788], 14); // Plaza Maipú aprox
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution: "&copy; OpenStreetMap contributors",
	}).addTo(map);
	return map;
}

function setPoint(lat, lng) {
	const m = ensureMap();
	if (!marker) marker = L.marker([lat, lng], { draggable: true }).addTo(m);
	marker.setLatLng([lat, lng]);
	m.setView([lat, lng], 16);
	// permitir ajuste fino manual
	marker.off("dragend").on("dragend", () => {
		const p = marker.getLatLng();
		document.getElementById("lat").value = p.lat.toFixed(6);
		document.getElementById("lng").value = p.lng.toFixed(6);
	});
}

async function geocodeAddress(addr) {
	if (!addr || addr.length < 4) return null;
	const res = await fetch(`/api/geocode?address=${encodeURIComponent(addr)}`);
	const data = await res.json();
	return data; // {lat, lng, note}
}

function debounce(fn, ms) {
	let t;
	return (...a) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...a), ms);
	};
}

async function onAddressChange() {
	const addr = document.getElementById("address").value.trim();
	const note = document.getElementById("geo-note");
	if (!addr) {
		note.textContent = "";
		return;
	}
	const r = await geocodeAddress(addr);
	if (r && r.lat != null && r.lng != null) {
		document.getElementById("lat").value = Number(r.lat).toFixed(6);
		document.getElementById("lng").value = Number(r.lng).toFixed(6);
		setPoint(r.lat, r.lng);
		note.textContent = `Ubicación encontrada (${r.note}). Podés ajustar el pin arrastrándolo.`;
	} else {
		note.textContent = "No se encontró una ubicación clara para esa dirección.";
	}
}

(async function boot() {
	await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
	const addressInput = document.getElementById("address");
	if (addressInput) {
		addressInput.addEventListener("input", debounce(onAddressChange, 600));
		addressInput.addEventListener("blur", onAddressChange); // por si pega y sale
	}
})();
