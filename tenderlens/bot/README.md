# TenderLens Telegram bot (`bot/`)

A user sends a lot number, a 14-digit `display_no` or an `etender.uzex.uz/lot/…` link. The bot replies with:
1. the **score and verdict**: fairness score with a traffic light, the verdict and its reasons, up to 3 flags with the verbatim quote, page, explanation and neutral rewrite, the customer history, and the savings estimate (*taxminiy*). A button opens the lot on etender.
2. the **clarification letter** in a `<pre>` block, so it can be copied with one tap.

`/start` and `/help` show usage; `/lot 525192` also works. All texts are in Uzbek Latin.

**Customer names are masked by default** (same rules and aliases as the web UI's presentation mode, from `app/masking.py`): "Buyurtmachi A/B/…", neutral titles, no TIN, no region, no external link. `TENDERLENS_PRESENT=0` or `--no-present` shows real names.

**Closed lots** (past `end_date`) get the analysis marked "yopilgan" and no letter. **Uncached lots** get "hali tahlil qilinmagan".

## Run

```bash
pip install -r bot/requirements.txt
```

```bash
python bot/tenderlens_bot.py
```

The bot finds the token in the first of these places:
1. the environment variable `TENDERLENS_BOT_TOKEN`;
2. a `TENDERLENS_BOT_TOKEN=...` line in `tenderlens/.env`;
3. a `TENDERLENS_BOT_TOKEN=...` line in `bot/.env`.

The token is never printed or logged. httpx request logging, which would include the token in URLs, is silenced, and a rejected token exits with a message that doesn't contain it.

Check without Telegram:

```bash
python bot/tenderlens_bot.py --check-token
```

```bash
python bot/tenderlens_bot.py --dry-run 524784
```

## Data

The bot looks in three places, in order:
1. the engine API, `GET http://127.0.0.1:8765/api/lots/{id}` (pre-analysed lots only; an uncached lot gets "hali tahlil qilinmagan");
2. `data/cache/lots/{id}.json`;
3. `app/mock/lots/{id}.json`, only while no cache exists.

Override the engine address with `TENDERLENS_ENGINE`.

Flags with `quote_verified` not true are never sent. The bot needs internet to reach Telegram; the analysis itself comes from the local engine or cache.
