import time, unicodedata, requests

USER_AGENT = "GoTour/1.0 (contacto: romanosantiagonicolas@gmail.com)"  
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Maipú aprox (lon/lat): west, south, east, north → sesga resultados sin repetir texto
VIEWBOX = (-68.95, -33.05, -68.60, -32.85)

def _search(params: dict):
    headers = {"User-Agent": USER_AGENT}
    r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=15)
    if r.status_code == 429:
        time.sleep(2)
        r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=15)
    r.raise_for_status()
    return r.json()

def _norm(s: str) -> str:
    s = " ".join(s.strip().split())
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return s.lower()

def build_query(address: str) -> str:
    # dedup simple por si el usuario repite “Maipú, Mendoza” en la misma cadena
    parts = [p.strip() for p in address.split(",") if p.strip()]
    seen, out = set(), []
    for p in parts:
        k = _norm(p)
        if k and k not in seen:
            seen.add(k); out.append(p)
    return ", ".join(out)

def geocode_address_free(address: str) -> tuple[float|None, float|None, str]:
    if not address:
        return None, None, "empty address"
    q = build_query(address)
    params = {
        "q": q,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
        "viewbox": f"{VIEWBOX[0]},{VIEWBOX[1]},{VIEWBOX[2]},{VIEWBOX[3]}",
        "bounded": 1,
        "countrycodes": "ar",
    }
    try:
        data = _search(params)
        if data:
            lat, lon = float(data[0]["lat"]), float(data[0]["lon"])
            time.sleep(1.0)  # 1 req/seg (política Nominatim)
            return lat, lon, f"free:{q}"
        return None, None, f"not_found:{q}"
    except Exception as e:
        return None, None, f"error:{e}"
