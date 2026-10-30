# Mor: Learn Punjabi

Mor (ਮੋਰ, "peacock") is a free app for learning Punjabi in Gurmukhi script, with transliteration under every word.
You climb a phulkari-stitched snakes-and-ladders board, one short lesson per square.

**Open it:** https://letsdothis4991-ui.github.io/mor-punjabi/

## Put it on your phone

Open the link on your phone, then:

- **iPhone (Safari):** tap Share, then **Add to Home Screen**.
- **Android (Chrome):** tap ⋮, then **Install app** or **Add to Home screen**.

It gets its own peacock icon and works offline after the first visit. Progress is saved on the device.

## What's inside

- 21 units in 4 levels, from the Gurmukhi alphabet to everyday conversation: 47 skills, 522 words and sentences, 18 dialogues.
- Exercises: meaning, picking the word, listening, matching pairs, building sentences from word tiles, and choosing the right reply in a conversation.
- A short guide for each unit with grammar notes and its dialogue.
- A unit test at the end of every unit. Score 80% to unlock the next one, or take it early to climb the ladder and skip ahead.
- Daily goal, streaks, and a calendar reminder so you don't lose your streak.
- Add your own languages in the app and share them with friends as a file.

Listening uses the phone's built-in text-to-speech. If there's no Punjabi voice, a Hindi voice reads the Gurmukhi, which is close but not perfect.

## Editing the Punjabi course

The course is written in plain text in [`courses/punjabi.txt`](courses/punjabi.txt), one word or sentence per line:

```
W ਪਾਣੀ | pāṇī | water
S ਮੈਨੂੰ ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ | mainūṃ pāṇī chāhīdā hai | I need water
```

After editing, rebuild the JSON the app loads. The script checks that every sentence's transliteration lines up word for word and that only Gurmukhi characters are used:

```
python3 tools/build_course.py courses/punjabi.txt courses/punjabi.json
```

Then bump `CACHE` in `sw.js` so installed copies pick up the change.

## Adding a language for everyone

Write a course file in the same format, build it to `courses/<language>.json`, and add it to `courses/index.json`.

## Content accuracy

The Punjabi was written with care but has not yet been fully checked by a native speaker. Corrections are very welcome: open an issue or edit `courses/punjabi.txt`.
