
# 🎮 Smart Game Discovery Platform

# Future name: GameSense / PlayScout


## Table of Contents
- [Overview](#-overview)
- [Project Goals](#-project-goals)
- [Tech Stack](#-tech-stack)
- [Core Concept](#-core-concept)
- [Features](#%EF%B8%8F-features)
- [Machine Learning Logic](#-machine-learning-logic)
- [Project Structure](#%EF%B8%8F-project-structure)
- [API Endpoints](#-api-endpoints)
- [Development Plan](#-development-plan)
- [Planned Improvements](#-planned-improvements)
- [Project Summary](#-project-summary)
- [Final Notes](#-final-notes)

---

## 📌 Overview
The **Smart Game Discovery Platform** is a full-stack web application designed to help users discover video games based on their personal preferences, play style, and interests.

Unlike a simple game browser, this system includes a **machine learning–based recommendation engine** that predicts which games a user is likely to enjoy, while also explaining *why* each recommendation was made.

---

## 🎯 Project Goals
- Build a complete full-stack application
- Implement a real **AI / machine learning** component
- Create a system that is clear, practical, and easy to explain
- Deliver a project that is interactive and suitable for presentation

---

## 🧱 Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React |
| Backend | Python (FastAPI) |
| Database | MongoDB |
| Machine Learning | Scikit-learn (Logistic Regression) |

---

## 🧠 Core Concept
At the heart of the project is a **machine learning recommendation engine** that predicts whether a user will like a game based on patterns learned from data.

Instead of relying on hardcoded rules, the system:
- Learns from structured data
- Detects patterns in user preferences
- Predicts the likelihood of a user enjoying a game
- Ranks games based on those predictions

---

## ⚙️ Features

### 🎮 1. Game Browser
- Browse a list of games
- Search games by name
- View game details

Each game includes:
- Name
- Genres
- Tags (e.g., Multiplayer, Fast-Paced)
- Rating
- Studio

### 🧠 2. AI-Powered Recommendation System
Users can select preferences such as:
- Genres
- Play style (fast-paced / slow)
- Gameplay type (casual / competitive)
- Singleplayer / multiplayer

The system:
- Converts user preferences and game attributes into features
- Uses a **Logistic Regression** model to predict user interest
- Produces a probability score for each game
- Ranks games by predicted relevance

### 💬 3. Recommendation Explanation
Each recommended game includes a short explanation, such as:

> “Recommended because it matches your preference for Action games and Multiplayer gameplay.”

This makes the system more transparent and easier to understand.

### 🔍 4. Find Similar Games
When viewing a game's details page, users can find similar games based on:
- Shared genres
- Shared tags

### 🎛️ 5. Filtering System
On the home page, users can filter games by:
- Genre
- Studio

### ⭐ 6. Wishlist System
Users can:
- Add games to a wishlist
- View saved games
- Remove games from the wishlist

### 🏠 7. Enhanced Home Page
The home page includes:
- Search bar
- Game list
- “Popular Now” section
- “Recently Added” section

### 🎮 8. Game Details Page
Each game page includes:
- Full game information
- Studio and rating
- “Why you might like this” insights
- Similar games section
- Add to wishlist option

---

## 🧮 Machine Learning Logic
The recommendation system is based on **supervised learning** using Logistic Regression.

### How it works
1. The system uses a dataset containing:
   - User preferences
   - Game features (genres, tags, etc.)
   - Outcome: liked / not liked

2. The model is trained to learn patterns such as:
   - Which features influence user preference
   - How different attributes combine to affect decisions

3. When a user submits preferences:
   - The system converts the input into feature vectors
   - The model predicts the probability of liking each game

4. Games are ranked based on predicted probability

### Key Advantage
Instead of manually defining rules, the system **learns what matters from data**.

---

## 🏗️ Project Structure

### Backend
```text
backend/
├── main.py
├── database/
│   └── connection.py
├── models/
│   └── game_model.py
├── routes/
│   └── games.py
├── services/
│   ├── recommender.py
│   └── similarity.py
└── ml/
    └── model.py
```

### Frontend
```text
frontend/
├── pages/
│   ├── Home.jsx
│   ├── GameDetails.jsx
│   ├── Recommendations.jsx
│   └── Wishlist.jsx
└── components/
    ├── GameCard.jsx
    ├── SearchBar.jsx
    └── Filters.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/games` | Retrieve all games |
| GET | `/games/{id}` | Retrieve a single game |
| POST | `/recommend` | Input user preferences, return AI-based ranked recommendations |
| GET | `/similar/{id}` | Retrieve similar games |
| GET | `/wishlist` | Retrieve wishlist items |
| POST | `/wishlist` | Add a game to wishlist |
| DELETE | `/wishlist/{id}` | Remove a game from wishlist |

---

## 🚀 Development Plan

### Phase 1 — Backend Foundation
- Set up FastAPI server
- Connect MongoDB
- Create basic game endpoints

### Phase 2 — Frontend Basics
- Build the Home page
- Display games
- Implement search
- Add filtering by genre and studio

### Phase 3 — Machine Learning Model
- Prepare dataset
- Train the Logistic Regression model
- Test prediction logic

### Phase 4 — Integration
- Connect the ML model to the backend
- Serve predictions through the API

### Phase 5 — Core Features (Full-Stack)
- Similar games — backend endpoint + frontend UI
- Wishlist system — backend endpoint + frontend UI
- Recommendations page — frontend connected to ML API
- Recommendation explanations — "Why you might like this" insights

### Phase 6 — UI Improvements
- Add Home page sections
- Improve layout and usability

---

## 🔮 Planned Improvements
- Integrate external game APIs such as **RAWG** to expand the dataset
- Add caching for API responses
- Explore more advanced recommendation models
- Add personalized user profiles

---

## 🎤 Project Summary
This project demonstrates:
- Full-stack development with React and Python
- Backend system design
- Implementation of a machine learning model
- Practical AI usage through prediction and ranking
- Data-driven decision making instead of hardcoded logic

---

## 📌 Final Notes
This project is designed to balance:
- Technical depth
- Clarity and usability
- Real-world applicability

The focus is on building a **complete, functional, and understandable AI-powered system** rather than an overly complex or unfinished one.

---

**Status:** In Development
