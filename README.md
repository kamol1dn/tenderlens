# tenderlens

national ai hackathon, tashkent stage (17-19 nov 2026), entrepreneurship track. team eclipse.

reads uzex etender spec docs, flags clauses that narrow who can bid (verbatim quotes, checked by code), scores each lot 0-100, writes a clarification letter in uzbek. gov dashboard ranks open lots by risk.

## layout

- `national-research/` - problem research, data dumps, `report.md`
- `tenderlens/engine/` - snapshot, text extraction, lint, scoring, fastapi on :8765
- `tenderlens/app/` - web ui on :8780 (supplier page, gov dashboard, presentation mode)
- `tenderlens/bot/` - telegram bot
- `tenderlens/deck/` - pitch deck + build script (`node deck/build/build_deck.js`, `--alphabet yangi` for the new alphabet)
- `tenderlens/data/` - snapshots, extracted text, lint output, cache, eval
- `tenderlens/CONTRACT.md` - data contract between the parts

spec pdfs and page renders aren't in the repo (~3.5gb). get them back with `python -m engine.snapshot` then `python -m engine.extract --all`.

## run

```
cd tenderlens
pip install -r engine/requirements.txt
python -m engine.api
python app/serve.py
```

app works offline from `data/cache/`. more in `tenderlens/engine/README.md` and `tenderlens/app/README.md`.
