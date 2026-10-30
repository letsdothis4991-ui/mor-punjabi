#!/usr/bin/env python3
"""Turn a course source file (see courses/punjabi.txt) into the JSON the app loads.

Checks as it goes: every sentence has as many transliteration words as script words,
every skill has at least 4 words, and (for script courses) the target column uses only
that script plus punctuation.
"""
import json, re, sys, unicodedata

def build(src):
    course, section, unit, skill, dialog = None, None, None, None, None
    errors = []
    def err(n, msg): errors.append(f"line {n}: {msg}")
    for n, raw in enumerate(open(src, encoding="utf-8"), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        tag, _, rest = line.partition(" ")
        parts = [p.strip() for p in rest.split("|")]
        if tag == "COURSE":
            cid, name, native, badge, speech, translit = parts
            course = dict(id=cid, name=name, native=native, badge=badge, speech=speech,
                          translit=translit.lower() == "yes", sections=[], units=[])
        elif tag == "GREETING":
            course["greeting"] = [parts[0], parts[1] if len(parts) > 1 else ""]
        elif tag == "SECTION":
            section = dict(title=parts[0], desc=parts[1] if len(parts) > 1 else "", start=len(course["units"]))
            course["sections"].append(section)
        elif tag == "UNIT":
            unit = dict(title=parts[0], desc=parts[1] if len(parts) > 1 else "", tips=[], skills=[], dialogues=[])
            course["units"].append(unit); skill = dialog = None
        elif tag == "TIP":
            unit["tips"].append(rest.strip())
        elif tag == "SKILL":
            sid, name, native, glyph = parts[:4]
            skill = dict(id=sid, name=name, native=native, glyph=glyph, words=[], sentences=[])
            if len(parts) > 4 and parts[4] == "letters": skill["letters"] = True
            unit["skills"].append(skill); dialog = None
        elif tag in ("W", "S"):
            if len(parts) != 3: err(n, "needs 3 parts: script | transliteration | English"); continue
            if tag == "S" and len(parts[0].split()) != len(parts[1].split()):
                err(n, f"sentence has {len(parts[0].split())} words but transliteration has {len(parts[1].split())}")
            check_script(course, parts[0], n, err)
            skill["words" if tag == "W" else "sentences"].append(parts)
        elif tag == "ALPHABET":
            course["alphabet"] = []
        elif tag == "GROUP":
            course["alphabet"].append(dict(title=parts[0], note=parts[1] if len(parts) > 1 else "", letters=[]))
        elif tag == "L":
            if len(parts) != 6: err(n, "alphabet lines need 6 parts: letter | name | sound | example | transliteration | meaning"); continue
            course["alphabet"][-1]["letters"].append(parts)
        elif tag == "DIALOG":
            dialog = dict(people=parts, lines=[]); unit["dialogues"].append(dialog)
        elif tag in ("A", "B"):
            if len(parts) != 3: err(n, "needs 3 parts"); continue
            check_script(course, parts[0], n, err)
            dialog["lines"].append([tag] + parts)
        else:
            err(n, f"unknown tag {tag}")
    for u in course["units"]:
        for s in u["skills"]:
            if len(s["words"]) < 4: errors.append(f"skill {s['id']} has fewer than 4 words")
    ids = [s["id"] for u in course["units"] for s in u["skills"]]
    if len(ids) != len(set(ids)): errors.append("duplicate skill ids")
    return course, errors

def check_script(course, text, n, err):
    if not course or not course["translit"] or course["id"] != "punjabi": return
    for ch in text:
        if ch in " ,.?!।'-" or 0x0A00 <= ord(ch) <= 0x0A7F: continue
        err(n, f"unexpected character {ch!r} (U+{ord(ch):04X}) in {text!r}")

if __name__ == "__main__":
    course, errors = build(sys.argv[1])
    if errors:
        print("\n".join(errors)); sys.exit(1)
    json.dump(course, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    w = sum(len(s["words"]) + len(s["sentences"]) for u in course["units"] for s in u["skills"])
    print(f"{course['name']}: {len(course['units'])} units, {sum(len(u['skills']) for u in course['units'])} skills, {w} words and sentences, "
          f"{sum(len(d['lines']) for u in course['units'] for d in u['dialogues'])} dialogue lines")
