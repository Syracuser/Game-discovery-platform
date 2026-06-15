# 🎮 GameSense — Project Summary

## What it is
**GameSense** is a full-stack game discovery platform that helps users find games
worth their time. Instead of just listing games, it uses a **machine learning model**
to rank games by how well they match a user's personal taste — and explains *why*
each game was recommended.

---

## The problem it solves
There are god knows how many of games out there. Most "browse a catalog" sites leave you
scrolling endlessly. GameSense flips that: tell it what you like, and it surfaces the
games you're most likely to actually enjoy.

---

## How it works (the flow)
1. **Browse** trending, popular, and new games on the home page — pulled **live** from
   a real game database (the RAWG API, ~900,000 games).
2. **Pick your preferences** — favorite genres and tags.
3. The **ML model ranks** real games against your taste and returns your top matches,
   each with a short "why we recommended this" explanation.
4. **Wishlist** anything you want to play and revisit it later.

---

## The tech

| Layer | Technology |
|-------|------------|
| Frontend | React |
| Backend | Python (FastAPI) |
| Database | MongoDB |
| Machine Learning | Scikit-learn — Logistic Regression |
| Game data | RAWG API (live) |

---

## The machine learning, simply
The model learns one pattern: **a user tends to like games that share the genres and
tags they care about.** It's trained on a deliberately *varied* set of games (covering
every genre) so it understands the full range — then it can score **any** game, even
ones it has never seen, including live results pulled straight from RAWG.

The model doesn't just say "yes/no" — it produces a **match probability**, so games can
be ranked from best fit to worst.

---

## What makes it interesting
- **Real, live data** — not a small hardcoded list; it reaches a near-complete game catalog.
- **A genuine AI component** — a trained model making real predictions, not hardcoded rules.
- **Explainable** — every recommendation tells you which of your preferences it matched.
- **A clean hybrid design** — a small curated set trains the model behind the scenes,
  while everything the user browses is fetched live.

---

## Core features
- 🔥 Live home sections — Trending, Most Popular, New Releases
- 🔍 Search across the full game catalog
- 🧠 AI-powered, ranked recommendations with explanations
- ⭐ Wishlist that works on any game
- 🎯 Full game detail pages with screenshots, platforms, and info

---

## One-line pitch
> *"GameSense is an AI-powered game discovery platform that learns your taste and ranks
> nearly a million real games to find the ones you'll actually love."*

---

## ❓ Anticipated Questions (cheat sheet)

**Why Logistic Regression?**
> "It's the simplest model that fits the problem. My recommendation works by basically 
> asking a yes/no question — 'will this user like this game?' — and Logistic Regression is the
> standard model for yes/no predictions. It also gives a *probability*, not just yes/no,
> which is exactly what I need to **rank** games from best match to worst. Anything more
> complex would be overkill for this problem."

*(Why this is true: Logistic Regression is built for binary "like / not like" predictions;
it outputs a percentage that lets you sort games best-to-worst; and it's fast, works on
modest data, and is explainable — fancier models need huge data and are hard to reason about.)*

**Did you consider other models?**
> "For a yes/no prediction, the simple options are Logistic Regression and Decision Trees.
> I chose Logistic Regression because it natively gives a probability for ranking and it's
> the most standard, well-understood choice. The project also prioritizes being explainable."

**How accurate is it?**
> "Around 86% on held-out test data. Honestly though — it's trained on a modest dataset,
> so that reflects the model learning the genre/tag-matching pattern well, not a guarantee
> of perfect real-world taste prediction."

**How does it recommend games it was never trained on?**
> "The model learns a *pattern* — genre/tag overlap — not a fixed list of games. So it can
> score any game that has genres and tags, including live results pulled from RAWG. It's
> trained on a deliberately varied set so it understands every genre."

**Why store some games but fetch others live?**
> "A small curated set trains the model behind the scenes. Everything the user actually
> browses is fetched live from RAWG, so they get the full catalog without me having to
> download and store a million games."

**How do recommendations actually pick which games to rank? (And why might a very
obscure game not show up?)**
> "Recommendations can't score all ~900,000 games live — that would be far too slow. So
> instead I fetch a **candidate pool**: the top games in the user's chosen genres (sorted
> by popularity), then the model ranks *that pool* and returns the best 15. It's fast and
> the results are relevant.
>
> The honest trade-off is that a very obscure game might not surface — if it's not among
> the popular games in its genre, it never enters the pool to be ranked. I tested making
> the pool bigger, but to catch a truly obscure title you'd need thousands of candidates,
> which pushes the page to ~20 seconds — not worth it. The *proper* fix would be a
> precomputed search index over the whole catalog, which is a much bigger system. For this
> project, the pool approach is the right balance of speed and relevance."

*(Why this is a good answer: it shows you understand the speed-vs-coverage trade-off,
that you actually tested alternatives, and that you know what the "real" fix would be —
which is more impressive than pretending there's no limitation.)*

**What would you improve next?**
> "With real user data, I'd explore collaborative filtering — recommending based on what
> *similar users* liked, not just genre/tag overlap — and possibly more advanced models.
> I'd also consider a precomputed index so recommendations could reach the whole catalog,
> not just a popular-games pool."

> 💡 **If asked something you don't know:** don't bluff. A strong, honest answer is
> *"I deliberately chose the simple, well-understood approach — I prioritized understanding
> what my model does over using something flashy I couldn't explain."*
