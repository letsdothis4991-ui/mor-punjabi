#!/usr/bin/env python3
"""Record every Punjabi word, sentence, story line and saying with Google Cloud Text-to-Speech.

Usage: GOOGLE_TTS_API_KEY=... python3 tools/make_audio.py courses/punjabi.json audio/punjabi [voice]

Writes one mp3 per text, named by a hash of the text, plus index.json mapping text to file.
Clips that already exist are skipped, so re-running after a course edit only records what changed.
"""
import hashlib, json, os, sys, base64, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

def texts(c):
    t = []
    add = lambda x: x and x not in t and t.append(x)
    for u in c["units"]:
        for s in u["skills"]:
            for w in s["words"] + s["sentences"]:
                if not s.get("letters"): add(w[0])
        for d in u["dialogues"]:
            for l in d["lines"]: add(l[1])
    for g in c.get("alphabet", []):
        for l in g["letters"]:
            add(l[3])
            if len(l) > 6: add(l[6])
    for st in c.get("stories", []):
        for l in st["lines"]: add(l[0])
    for g in c.get("sayings", []):
        for x in g["items"]: add(x[0])
    for f in c.get("festivals", []):
        for w in f["skill"]["words"] + f["skill"]["sentences"]: add(w[0])
        add(f["greeting"][0])
    for w in c.get("glossary", {}): add(w)
    for d in c.get("dictionary", []): add(d[0])
    n = c.get("numbers")
    if n:
        w = lambda k: n["words"][str(k)][0]
        for v in n["words"].values(): add(v[0])
        # 101 to 1000, built the same way as numberWords() in app.js.
        for k in range(101, 1000): add(" ".join(x for x in (w(k // 100), n["hundred"][0], w(k % 100) if k % 100 else "") if x))
        add(f"{w(1)} {n['thousand'][0]}")
    if c.get("greeting"): add(c["greeting"][0])
    return t

def synth(text, key, voice, lang):
    body = json.dumps({"input": {"text": text}, "voice": {"languageCode": lang, "name": voice},
                       "audioConfig": {"audioEncoding": "MP3", "speakingRate": 0.9, "sampleRateHertz": 24000}}).encode()
    req = urllib.request.Request(f"https://texttospeech.googleapis.com/v1/text:synthesize?key={key}", body, {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return base64.b64decode(json.load(r)["audioContent"])

if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "pa-IN-Wavenet-A"
    key = os.environ["GOOGLE_TTS_API_KEY"]
    course = json.load(open(src, encoding="utf-8"))
    os.makedirs(out, exist_ok=True)
    index, todo = {}, []
    for text in texts(course):
        name = hashlib.sha1(f"{voice}|{text}".encode()).hexdigest()[:12] + ".mp3"
        if not os.path.exists(os.path.join(out, name)): todo.append((text, name))
        index[text] = name
    def record(job):
        text, name = job
        # Google limits requests per minute (HTTP 429), so back off and try again.
        for tries in range(10):
            try:
                data = synth(text, key, voice, course.get("speech", "pa-IN")); break
            except Exception:
                if tries == 9: raise
                time.sleep(min(60, 2 ** tries))
        open(os.path.join(out, name + ".part"), "wb").write(data)
        os.replace(os.path.join(out, name + ".part"), os.path.join(out, name))
    with ThreadPoolExecutor(4) as pool: list(pool.map(record, todo))
    made = len(todo)
    for f in os.listdir(out):
        if f.endswith(".mp3") and f not in index.values(): os.remove(os.path.join(out, f))
    json.dump({"voice": voice, "clips": index}, open(os.path.join(out, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(index)} clips ({made} new) in {out}")
