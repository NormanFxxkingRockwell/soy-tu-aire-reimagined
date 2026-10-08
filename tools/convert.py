"""Convert Pablo Zárate's recovered choreography (song time) into our engine's
cue format (video time = song time + 4s lead-in)."""
import json, collections

OFFSET = 4.0
data = json.load(open("choreography.json", encoding="utf-8"))
events = data["events"]

# --- params track: presion / velocidad / climax keyframes ---
params = []
for e in events:
    params.append({
        "t": round(e["t"] + OFFSET, 2),
        "presion": e.get("presion", 1),
        "velocidad": e.get("velocidad", 1),
        "climax": e.get("climax", 0)
    })

# --- cues: merge rapid-fire bursts of the same creature ---
CREATURE_MAP = {
    "chica": "photoFigure", "pajaros": "birds", "pezmancha": "koi",
    "pececillo": "minnows", "surco": "surco", "pequenitos": "surco",
    "cera": "wax", "derretida": None, "cremallera": "zipper",
    "entrando": None, "cosquilla": "tickles", "Ogrande": "bigO",
    "burbuja": "bubbles", "Ondasagua": "waterRings", "salpico": "splash",
    "recuerdo_b": "memories", "lagrima": "teardrop", "labios": "lips",
    "mariposa": "butterflies", "mariposanoloop": "butterflies",
    "dandelion": "dandelions", "Entradaagujero": "holeIn",
    "Salidaagujero": "holeOut", "alambre": "wire", "uno": "uno"
}
REVEAL_MAP = {  # word -> tintas image key (from fotos map)
    "cosquillas": "cosquillas", "cosquilla": "cosquillas",
    "unoyuno": "unoyuno"
}

cues = []
for e in events:
    at = round(e["t"] + OFFSET, 2)
    for w in e.get("reveals", []):
        cues.append({"at": at, "type": "word", "text": w})
    for c in e.get("creatures", []):
        mapped = CREATURE_MAP.get(c)
        if mapped is None:
            continue
        # merge with a previous burst of same type within 0.4s
        for prev in reversed(cues):
            if prev["type"] == mapped and at - prev["at"] <= 0.4 and "text" not in prev:
                prev["count"] = prev.get("count", 1) + 1
                prev["at"] = at  # keep window tail
                break
        else:
            cues.append({"at": at, "type": mapped, "count": 1})

cues.sort(key=lambda c: c["at"])

def js_params():
    lines = [f"  {{ t: {p['t']}, presion: {p['presion']}, velocidad: {p['velocidad']}, climax: {p['climax']} }}" for p in params]
    return ",\n".join(lines)

def js_cues():
    lines = []
    for c in cues:
        if c["type"] == "word":
            lines.append(f'  {{ at: {c["at"]}, type: "word", text: "{c["text"]}" }}')
        else:
            lines.append(f'  {{ at: {c["at"]}, type: "{c["type"]}", count: {c.get("count", 1)} }}')
    return ",\n".join(lines)

out = f"""// GENERATED from Pablo Zárate's recovered choreography (lab.pablozarate.com)
// song time + 4s video lead-in. Do not edit by hand; regenerate via tools/convert.py.
export const PARAMS = [
{js_params()}
];

export const CUES = [
{js_cues()}
];
"""
open(r"D:\MM\soy-tu-aire-reimagined\dist\choreography.js", "w", encoding="utf-8").write(out)
print(f"params: {len(params)}, cues: {len(cues)}")
types = collections.Counter(c["type"] for c in cues)
print(dict(types))
