import re, time, unicodedata, requests  # re: regex, time: sleep, unicodedata: quitar acentos, requests: HTTP a Nominatim

USER_AGENT = "GoTour/1.0 (contacto: romanosantiagonicolas@gmail.com)"  # Nominatim requiere User-Agent válido
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
VIEWBOX = (-68.95, -33.05, -68.60, -32.85)  # W,S/E/N (Maipú)

def _search(params: dict):
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "es"}
    r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=15)
    if r.status_code == 429:            # demasiadas requests → esperamos y reintentamos 1 vez
        time.sleep(2)
        r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=15)
    r.raise_for_status()
    return r.json()

def _norm(s: str) -> str:
    s = " ".join(s.strip().split())     # espacios de más
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")  # quita acentos
    return s.lower()

def _strip_postal_codes(s: str) -> str:
    # Elimina CPs argentinos tipo M5517 o M5517ABC
    return re.sub(r"\b[A-Z]\d{4}[A-Z0-9]{0,3}\b", "", s, flags=re.IGNORECASE)

def _ensure_space_letters_digits(s: str) -> str:
    # RP60 -> RP 60, RN7 -> RN 7
    return re.sub(r'([A-Za-zÁÉÍÓÚÑáéíóúñ]+)\s*([0-9]+)', r'\1 \2', s)

def _normalize_intersection(s: str) -> str:
    # &, /, \  ->  " y "
    out = re.sub(r'\s*[/\\&]\s*', ' y ', s)
    return " ".join(out.split())

def _expand_abbr_variants(token: str) -> list[str]:
    """Genera variantes para RP/RN/Av/Bv."""
    t = token.strip()

    # RP / RN solos
    m = re.match(r'(?i)^(RP|RN)\s*([0-9]+)$', t)
    if m:
        kind = m.group(1).upper()
        num = m.group(2)
        if kind == "RP":
            return [
                f"RP {num}",
                f"Ruta Provincial {num}",
                f"Ruta Prov. {num}",
                f"Ruta Provincial Nº {num}",
                f"Ruta Provincial N° {num}",
                f"Provincial Route {num}",
            ]
        else:
            return [
                f"RN {num}",
                f"Ruta Nacional {num}",
                f"Ruta Nal. {num}",
                f"Ruta Nacional Nº {num}",
                f"Ruta Nacional N° {num}",
                f"National Route {num}",
            ]

    # Indicamos variantes para Av ... / Av. ...
    m2 = re.match(r'(?i)^(Av|Av\.)\s*(.+)$', t)
    if m2:
        street = m2.group(2).strip()
        return [f"Avenida {street}", f"Av {street}", f"Av. {street}"]

    # Bv ... / Bv. ...
    m3 = re.match(r'(?i)^(Bv|Bv\.)\s*(.+)$', t)
    if m3:
        street = m3.group(2).strip()
        return [f"Boulevard {street}", f"Bv {street}", f"Bv. {street}"]

    # por defecto
    return [t]

def _with_context(q: str) -> str:
    low = _norm(q)
    if "maipu" in low or "mendoza" in low:
        return q
    return f"{q}, Maipú, Mendoza"

def _build_intersection_variants(a: str, b: str) -> list[str]:
    """Combina variantes de ambas calles/rutas en distintos órdenes."""
    A = _expand_abbr_variants(a)
    B = _expand_abbr_variants(b)
    out = []
    for aa in A:
        for bb in B:
            out.append(f"{aa} y {bb}")
            out.append(f"{bb} y {aa}")
            out.append(f"{aa}, {bb}")   # también probamos con coma
    # dedupe preservando orden
    seen = set()
    dedup = []
    for v in out:
        k = _norm(v)
        if k not in seen:
            seen.add(k)
            dedup.append(v)
    return dedup

def _build_queries(address: str) -> list[tuple[str, bool]]:
    # Genera lista de queries (query, bounded) a probar.
    s = _strip_postal_codes(address)
    s = _ensure_space_letters_digits(s)
    s = " ".join(s.split())
    s = _normalize_intersection(s)  # normaliza cruces

    # Dividimos por &, /, \ o " y " (ignorando mayúsculas) 
    parts = re.split(r'\s*(?:[/\\&]| y )\s*', s, flags=re.IGNORECASE)
    queries = []

    if len(parts) >= 2:
        a, b = parts[0], parts[1]
        # primero: dentro del viewbox
        for base in _build_intersection_variants(a, b):
            queries.append((_with_context(base), True))
            queries.append((base, True))
        # después: sin viewbox
        for base in _build_intersection_variants(a, b):
            queries.append((_with_context(base), False))
            queries.append((base, False))
    else:
        # Calle única o ruta única
        for v in _expand_abbr_variants(s):
            queries.append((_with_context(v), True))
            queries.append((v, True))
        for v in _expand_abbr_variants(s):
            queries.append((_with_context(v), False))
            queries.append((v, False))

    # dedupe de pares (query, bounded)
    seen = set()
    final = []
    for q, b in queries:
        key = (_norm(q), b)
        if key not in seen:
            seen.add(key)
            final.append((q, b))
    return final

def geocode_address_free(address: str):
    # Intenta geocodificar la dirección usando Nominatim con múltiples estrategias.
    if not address:
        return None, None, "empty address"

    attempts = _build_queries(address)

    for i, (q, bounded) in enumerate(attempts, start=1):
        params = {
            "q": q,
            "format": "json",
            "limit": 1,
            "addressdetails": 1,
            "countrycodes": "ar",
        }
        if bounded:
            params["viewbox"] = f"{VIEWBOX[0]},{VIEWBOX[1]},{VIEWBOX[2]},{VIEWBOX[3]}"
            params["bounded"] = 1
        try:
            data = _search(params)
            if data:
                lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
                time.sleep(1.0)
                return lat, lon, f"free:q{i}:{q} | bounded={bounded}"
        except Exception as e:
            return None, None, f"error:{e}"

        time.sleep(1.0)

    return None, None, "not_found"
