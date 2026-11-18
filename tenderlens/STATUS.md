# TenderLens status board (the orchestrator updates this)

| Session | Folder | Status | Notes |
|---|---|---|---|
| engine | engine/, data/ | **GO**: 20 verified high/medium flags in 14 of 27 random specs. 662 lots + specs + 19,980 deals snapshotted; 55 lots analysed; API on :8765 | overnight: hero checks, template_findings, ~150 lots, /label page |
| app | app/, bot/ | UI and bot built on mock data | switching to the real cache, presentation mode, real screenshots; bot waits for token |
| deck | deck/ | starting | Uzbek (team decision, 17:44) |
| quarry | D:\projects\hackathon\quarry\ | running (started 22:56) | full UZEX coverage, spec downloads, verdicts in alerts; local branch, no push |

Engine, app and deck were stopped by a manual interrupt at 22:48 and resumed at 23:00 (Kamoliddin: "Resume all three").

**Usage limit:** app and deck hit the 5-hour usage limit at about 23:50 Tashkent. It resets at 00:30, and the orchestrator resumes them after that. Their new instructions (real cache, presentation mode, new numbers and lead lots) were delivered before the limit.

**00:20 update**
- **Engine:** 156 lots analysed (31 red, 66 amber, 59 green); `template_findings` added; labelling page at http://127.0.0.1:8765/label (local only); lead lots revised.
- **Quarry:** a real alert with the TenderLens verdict was delivered to the "Quarry" group (lot 522893). User-space PostgreSQL 18.7 runs in `quarry\.pg\` (127.0.0.1:54329). A title-match fallback for unreadable specs is approved. Local branch `tenderlens`, not pushed; I've asked @S0me2 how he wants it delivered.

**01:00 update**
- **App:** runs on the real cache (156 lots) with presentation mode. 16 screenshots retaken; a name-masking fix and a visual check are in progress, then the deck swaps them in.
- **Deck:** rebuilt on the engine's numbers. The proof slide leads with 524954, 525192 and 524769, plus the 53-lot template finding. PF-259 and ZRU-684 (minimum 2 bids) verified on lex.uz. Still placeholders: eval numbers and screenshots.
- **Quarry:** the title fallback is done. Second real alert delivered (524784). DB suite: everything passes except 3 OCR tests (need tesseract) and 1 Windows config-path test. Postgres stopped. Local commits `2871a63` and `fd34d4e`, not pushed.

**01:05:** the deck uses the real presentation-mode screenshots (slides 4 and 11) and was sent to the group (msg 273). Only the slide 6 eval numbers remain open. All sessions are idle and waiting on the morning items.

**18 Nov, morning (~10:45)**
- Engine API (:8765) and app (:8780) restarted after the PC was off. Watcher re-armed.
- Brief posted to the group (msg 284). Engine: building an offline label pack (`data/eval/label_pack.html`) plus an import command. Deck: building a new-alphabet version.
- @S0me2 asked about his scraper and recipes (msg 285). Answered in msg 288: the UZEX recipe is tested and fixed. uztender, legacy icppa and the AI recipe generator are untested; the generator needs a groq/openrouter/gemma key. Quarry session asked to live-test uztender and report on the generator's readiness, with no paid calls.

**~11:10**
- **Label pack** sent to the group (msg 291): `data/eval/label_pack.html`, 100 cards, pack `26845af7d3`. I checked it by eye at laptop and phone width. Asked for 2 names. When the JSON files come back: `python -X utf8 -m engine.evalset import <files>`, then `score --json`. Don't rebuild the pack before then.
- **Decks:** both sent (msgs 292–294), with `alphabet-review.txt`. Bobur picks the alphabet. Open: should place names stay in the old spelling?
- **Quarry beyond UZEX** (local commits `fc07937`, `96b5a55`):
  - UZTender: 100-lot sample, live.
  - ICPPA: 20-lot sample, live.
  - AI recipe generator: 82 offline tests pass. No live run, because there's no Groq/OpenRouter/Gemma key. Its candidate site is UK Find a Tender, not xarid.uzex.uz.
  - Reported to @S0me2 in msg 295.
- **Deck:** asked to add one Quarry "scale" slide (3 platforms live) to both decks, with no claim about the AI generator.

**Morning checklist (team)**
1. Two people check the three lead flags by hand against the specs (`data/eval/hero_check.md`).
2. Two people spend about an hour on the labelling page (http://127.0.0.1:8765/label). Then run `python -m engine.evalset score`, put the numbers in `deck/deck-data.json` and run `node deck/build/build_deck.js`.
3. Get the presentation rules: slot length, whether a live demo is allowed, the Q&A language.
4. Before going on stage, scan the dashboard by eye in presentation mode.

**For Kamoliddin in the morning**
- **Labelling page:** keep it local (reviewers use this PC), or restart the API with `TENDERLENS_HOST=0.0.0.0` on a phone hotspot so teammates can label from their laptops. It has no login, so never open it on the venue Wi-Fi.
- **ANTHROPIC_API_KEY:** not set. The engine filled the cache in-session; the live "analyse any lot" path needs a key. Set it on this machine if you want live analysis in the demo. The offline cache works either way.
- **PostgreSQL for Quarry:** this PC has no Docker, PostgreSQL, WSL or tesseract. The Quarry session will try a user-space Postgres (no admin). If that fails, the full install needs you: `winget install PostgreSQL.PostgreSQL.18` (UAC prompt, Windows service on 5432). Quarry's TENDERLENS.md will have the exact steps.
- **Bot token:** put it in `.env` (`TENDERLENS_BOT_TOKEN` for the TenderLens bot, plus Quarry's Telegram settings). Keep it out of chats.

**Open questions with the team**
- **Quarry repo:** the real Quarry repo hasn't been pushed. github.com/S0ME2/Quarry currently holds a different project.
- **Deck language:** not answered yet; English is the default.
- **Bot token:** the Telegram bot needs one from BotFather. The team has to create it.
