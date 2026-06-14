# 📈 Scaling Plan — Giving Users Access to All of RAWG

This document maps how the project scales from a small set of games to "virtually
all of RAWG," using a **Hybrid** approach inspired by LyricsTyping.

It is a planning reference — not all of it is built yet. Status is marked per item.

---

## 📊 Progress At A Glance

| Item | Status |
|------|--------|
| 1️⃣ Variety training core | ✅ **Done** — built, ~44 games added, model retrained (60% → 83% accuracy) |
| 2️⃣ Live display / pagination | ✅ **Done** — backend endpoints, browse pages + Pagination, Home live sections, AND the live detail route `/games/rawg/:rawgId` (with screenshots). Filterable browser moved to `/games` (AllGames page). |
| 3️⃣ Wishlist for live games | 🔴 Not started (the last remaining feature) |
| Issue A — dedupe gap | ✅ Done for dev — deleted the 2 visible seed duplicates (RDR2, God of War). Root cause vanishes at launch: **all seed games get wiped, leaving only RAWG games** (no rawg_id=None games left to collide). |
| Issue B — card image CSS | ✅ Done — changed `.gc__poster` aspect-ratio `16/7` → `16/9` so cover art isn't over-cropped. |

**Last completed:** Live detail route (`/games/rawg/:rawgId`) — backend `GET /rawg/{id}`
(detail + screenshots, mapped) + `GameDetails` now branches on stored vs live id.
**Suggested next:** Wishlist for live games (the last remaining feature).

> ⚠️ **Known gap (deferred to the wishlist task):** the wishlist BUTTON on a live
> game's detail page (`GameSidebar`) still uses `game._id`, which live games don't
> have. It renders fine but doesn't function for live games yet — fixed as part of
> item 3️⃣ (where `_id` vs `rawg_id` gets handled across the whole wishlist).

> 📌 **Open decisions (small, not blocking):**
> - Fate of the `/games` filter page (AllGames) — keep it or retire it? If keeping,
>   add a Navbar link to it (currently no nav link points there).
> - Navbar links generally — review that they point at the right routes now that
>   Home = live sections and the filter browser moved to `/games`.

> ⚠️ **Final-cleanup reminder:** before launch, delete ALL hand-seeded games
> (rawg_id = None). They are dev-only scaffolding; the live app is RAWG-only.

---

## 🧭 The Core Idea (Hybrid Model)

The app stores a **small curated set** of games in its own database, and reaches
the **full RAWG catalog live** through pagination. The home page is fast and
controlled; the "browse everything" experience is powered by live RAWG calls.

This means the app deals with **three different kinds of "game set"**, each with
its own job. Keeping them separate is the key to staying organized.

| # | Game set | Job | Stored in our DB? |
|---|----------|-----|-------------------|
| 1 | **Variety training core** | Teach the ML model the full pattern | ✅ Yes (full records) |
| 2 | **Live display games** | Browse the full RAWG catalog via pagination | ❌ No (fetched live) |
| 3 | **Wishlist references** | Let users wishlist ANY game, even live ones | ✅ Yes (lightweight reference only) |

---

## 1️⃣ Variety Training Core

**Why:** The ML model learns a *pattern* (genre/tag overlap → like/dislike), then
applies it to score *any* game — including live ones it never trained on. So the
core doesn't need to be huge; it needs to be **varied** enough to cover every
genre/tag, so the model learns the full vocabulary. Variety > size.

**Important distinction:** This core is NOT the same as the "Most Popular" display
section. Popular games cluster (lots of AAA shooters/RPGs), which is the opposite
of variety. The training core is chosen deliberately for coverage.

**How (built — see `build_training_core.py`):**
1. Get the genre list from RAWG (19 genres) — hardcoded slugs
2. For each genre, fetch the top 5 games (sorted by `-rating`)
3. Map + clean each game — reuses the mapper + tag blocklist from `import_rawg.py`
4. Filter out games with fewer than `MIN_TAGS` (3) tags — weak training examples
5. Dedupe (across DB + within the run) + insert
6. Retrain the model with `python -m ml.model`

**Result:** 44 games added across all 19 genres. Model retrained: 23 → 150 training
examples, accuracy 60% → 83%, predictions now discriminate by genre.

**Status:** ✅ Done.
**Tuning knobs (if needed later):** `GAMES_PER_GENRE`, `MIN_TAGS` in the script.

---

## 2️⃣ Live Display Games (Pagination)  — ✅ DONE

**Built:** backend (`services/browse.py` + `routes/browse.py`): `/popular`, `/new`,
`/trending` (live, junk-filtered, mapped), plus `/rawg/{id}` for one game's full
detail + screenshots. Frontend: reusable `Pagination` component, one parameterized
`Browse` page (all 3 sections), Home live-section rows (`HomeSection`), and
`GameDetails` extended to handle live games (`/games/rawg/:rawgId`). The old
filterable browser was preserved at `/games` (the `AllGames` page).

**Why:** To browse the whole catalog without importing it. Home page shows curated
sections (Popular / New, ~12 cards each); "View All" leads to a paginated page
where each "Next" makes a fresh live RAWG call.

**Design decisions (as built):**
- **Shape:** reuse `map_rawg_game()` on the backend so live games look IDENTICAL
  to stored games — the existing `GameCard` renders them with no changes.
- **No cache** to start (fetch live each load). Caching is a later optimization.
- **Rate limits:** acknowledged, not pre-solved. RAWG free tier = 20k calls/month;
  our usage is tiny. Note for later.
- **One call per section:** the RAWG *list* endpoint returns a full sorted page
  (~12 games with name/image/rating/genres) in ONE call. No per-game detail calls
  needed for display — that 2-calls-per-game cost only applies to importing.

**Planned backend endpoints (live RAWG passthrough) — FLAT routes to match the
existing style (`/wishlist`, `/recommend`, `/games`):**
- `GET /popular`        → RAWG `ordering=-added` (all-time popular)
- `GET /new`            → RAWG `ordering=-released` + an `added__gte` threshold
                          (see note below) — recent games people actually add
- `GET /trending`       → RAWG `dates=<last ~3 months>` + `ordering=-added`
                          (recent games gaining traction)
- `GET /popular?page=N` (and `/new`, `/trending`) → same routes, paginated for the
  "View All" / Next pages

> **Route convention:** backend routes are FLAT (`/popular`), matching existing
> endpoints. Frontend (React Router) URLs mirror them: `/popular`, `/popular?p=2`,
> `/new`, `/trending` — like LyricsTyping. Backend API routes and frontend page
> URLs are separate things that happen to share names.

> **"New Releases" junk filtering:** raw `ordering=-released` returns shovelware
> (`test test game`, rating 0, added 1). The real signal is `added` (how many users
> have the game), NOT date or rating. So `/new` uses `added__gte=<threshold>` to drop
> dead-on-arrival titles. This is just an extra URL parameter — zero risk, no new
> code. Trade-off: "newest" leans slightly toward "recent with some traction" rather
> than pure chronological order (which is what users want anyway). Tune the threshold
> when building.

**Data flow:** Frontend → our backend → RAWG (live, sorted) → `map_rawg_game()` →
frontend gets game objects identical to stored ones → existing `GameCard` renders.

**Rule of thumb:** listing cards = 1 list call (summary is enough); opening a game's
detail page = 1 detail call for that game.

> **Known gap — studio on browse cards (Option A, accepted):** the RAWG *list*
> endpoint includes name/image/rating/genres/platforms but NOT `developers`. So
> live browse-section cards show no studio. We accept this to keep "1 call per
> section" (fetching detail per game would mean ~13 calls/section). The studio
> still appears on a game's DETAIL page (that's a per-game detail call which does
> include `developers`). Net loss: studio missing only on small browse cards.

**Frontend plan:**
- **Reusable `Pagination` component** — "dumb": only UI + navigation (page number,
  Next/Prev, disabled states). Does NOT fetch. The parent page fetches and passes
  page state in/out. Reusable across all browse pages (and search later).
- **One parameterized `Browse` page** — a single page component used for all three
  sections; the route passes `section="popular" | "new" | "trending"`. Maps section
  → endpoint + title. Avoids 3 copy-pasted page files.
  Routes: `/popular`, `/new`, `/trending` → all render `<Browse section=... />`.

> **Live game ids (decided): route by `rawg_id`.** Stored games keep `/games/:id`
> (Mongo `_id`) unchanged — zero risk to existing wishlist/detail code. Live games
> get a parallel route `/games/rawg/:rawgId` that fetches live from RAWG. Additive,
> not a refactor. Cost: `GameDetails` must branch on which id type it received.
> (The live detail route itself is built in the detail-page/wishlist step, not the
> browse-pages step — browse cards just link to it.)

---

## 3️⃣ Wishlist for Live Games

**Why:** A user must be able to wishlist a game from deep pagination (a live game
not in our DB). We save a **lightweight reference** (e.g. rawg_id + name + image),
NOT a full game record. The wishlist re-shows or re-fetches by id on demand.

This keeps the wishlist universal (works for core AND live games) without pulling
the whole catalog into the DB or the ML model.

**Status:** 🔴 Not designed yet. Open questions:
- Exact fields to store in a wishlist reference
- One wishlist collection for both core + live games, or separate handling?

---

## 🧩 Supporting Concerns (under scaling)

- **RAWG rate limits** — live pagination + per-genre fetching both hit the API
- **DB / ML performance** — `/genres`, `/tags` (distinct) and the ML scoring loop
  run over every stored game; watch as the core grows
- **Dedup gap (Issue A)** — seed games have no `rawg_id`, so RAWG re-adds overlaps.
  Becomes more relevant at scale. Decide: name-fallback vs. replace seed data.

---

## ✅ Suggested Build Order

1. **Variety training core** (mostly reuse — safe first win)
2. **Resolve dedup gap (Issue A)** — small, clears the path
3. **Live pagination** (the bigger new piece — design first)
4. **Wishlist for live games**
5. **Final verification pass** — confirm recommendations, similar-games, filters
   all work with the new RAWG data

---

## 📌 Definition of Done (for the RAWG/scaling chapter)

- [ ] Variety training core built + model retrained on it
- [ ] Live pagination working (browse full RAWG catalog)
- [ ] Wishlist works for both stored and live games
- [ ] Dedup gap (Issue A) resolved
- [ ] Card image CSS (Issue B) fixed
- [ ] Existing features confirmed working with RAWG data at scale
