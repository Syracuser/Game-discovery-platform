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
| 3️⃣ Wishlist for live games | ✅ **Done** — whole wishlist re-keyed from `_id` to `rawg_id` (`useWishlist`, `GameSidebar`, `Wishlist` page; Home/Browse already used it). Works for live games end-to-end. |
| Issue A — dedupe gap | ✅ Done for dev — deleted the 2 visible seed duplicates (RDR2, God of War). Root cause vanishes at launch: **all seed games get wiped, leaving only RAWG games** (no rawg_id=None games left to collide). |
| Issue B — card image CSS | ✅ Done — changed `.gc__poster` aspect-ratio `16/7` → `16/9` so cover art isn't over-cropped. |

**Last completed:** Live recommendations (RAWG candidate pool + model ranking, top 15).
**🎉 All core scaling items AND the live-data conversions are DONE.**

**Also converted to live RAWG (post-core fixes):**
- ✅ **Search** — `/search?q=` hits RAWG's full catalog (was DB-only). SearchResults uses `rawg_id`.
- ✅ **Recommendations** — `/recommend` fetches a RAWG candidate pool by genre, scores
  with the model, returns top 15. Fallback to popular pool when no genres picked.
- ✅ **`/games` (AllGames) RETIRED from user access** — route now redirects to `/` with
  `<Navigate>`; the component is kept (not deleted) for possible revival. No nav link to it.
- ✅ **Non-English tags filtered** — `map_rawg_game` drops non-ASCII tags (RAWG returns some
  Russian/etc. tags). DB cleaned via a clear + rebuild + retrain.
- ✅ **Platform normalization** — RAWG's specific names (`PlayStation 4`) folded into icon
  families (`PlayStation`); mobile/web dropped. Also shown in the detail sidebar metadata.

**Polish done:** search button in navbar (red, submit), navbar logo two-tone, active
nav-link highlight (`NavLink`), reusable `BackButton` (GameDetails/Recommendations/SearchResults),
gallery chevron icons, Home section icons (flame/trophy/sparkles), Home hero header.

> 📌 **Remaining open items (small, not blocking):**
> - **Caching** of live RAWG calls — deliberately skipped; revisit only if needed.
> - **RAWG search is fuzzy** — occasionally an exact title isn't first. `search_precise=true`
>   is an option if it ever annoys.

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

## 3️⃣ Wishlist for Live Games  — ✅ DONE

**Why:** A user must be able to wishlist a game from deep pagination (a live game
not in our DB).

**How it was built:** the wishlist is **localStorage-based** (`useWishlist` hook) and
stores the **full game object** the user was viewing — which is already lightweight
enough (it's just the mapped RAWG fields). The whole wishlist was re-keyed from `_id`
to **`rawg_id`**, since every user-facing game is a live RAWG game. Updated:
`useWishlist`, `GameSidebar` (detail-page button), `Wishlist` page, and the GameCard
callers (Home/Browse/Search). Works end-to-end: wishlist from a card or detail page,
see it on `/wishlist`, click back to its live detail page, persists across refresh.

**Status:** ✅ Done.

---

## 🧩 Supporting Concerns (status)

- **RAWG rate limits** — acknowledged; our usage (a few calls per page view) is far
  under the 20k/month free tier. Not an issue in practice. ✅ no action needed
- **DB / ML performance** — the stored core stays small (~45 games), so `distinct`
  queries and the ML scoring loop are fast. ✅ fine at current scale
- **Dedup gap (Issue A)** — ✅ resolved for dev; vanishes at launch (seed games wiped).

---

## ✅ Build Order — all complete

1. ✅ Variety training core
2. ✅ Dedup gap (Issue A)
3. ✅ Live pagination + browse pages + Home sections + live detail route
4. ✅ Wishlist for live games
5. ✅ Live conversions: search + recommendations
6. ✅ Polish pass: navbar, back button, icons, hero header, platform/tag cleanup

---

## 📌 Definition of Done (for the RAWG/scaling chapter)

- [x] Variety training core built + model retrained on it
- [x] Live pagination working (browse full RAWG catalog)
- [x] Wishlist works for live games (keyed on `rawg_id`)
- [x] Dedup gap (Issue A) resolved
- [x] Card image CSS (Issue B) fixed
- [x] Search + recommendations converted to live RAWG
- [x] Existing features confirmed working with RAWG data

**🎉 The RAWG / scaling chapter is complete.** Only the pre-launch seed-game wipe remains
(see the ⚠️ reminder at the top) — a one-time cleanup done at deployment, not now.
