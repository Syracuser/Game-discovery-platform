import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import FilterSidebar from "../Home/FilterSidebar/FilterSidebar";
import GameCard from "../../components/GameCard/GameCard";
import Spinner from "../../components/Spinner/Spinner";
import useWishlist from "../../hooks/useWishlist";
import "./AllGames.css";

// ─────────────────────────────────────────────
// AllGames — the filterable browser for our STORED DB games.
// RETIRED: no route currently renders this component (see App.jsx for the
//  routing decision). Kept for possible revival. Filtering is client-side,
//  which is fine for our small stored set — it does NOT work for the full
//  RAWG catalog.
// ─────────────────────────────────────────────

function AllGames() {

  const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();

  const { addGame, removeGame, isWishlisted } = useWishlist();

  function handleWishlistToggle(game) {
    isWishlisted(game._id) ? removeGame(game._id) : addGame(game);
  }

  const navigate = useNavigate();
  const location = useLocation();

  // ── Filter options (loaded from backend) ─────
  const [genres,  setGenres]  = useState([]);
  const [tags,    setTags]    = useState([]);
  const [studios, setStudios] = useState([]);

  // ── Selected filter values ───────────────────
  const [selectedGenres,  setSelectedGenres]  = useState([]);
  const [selectedTags,    setSelectedTags]    = useState([]);
  const [selectedStudio,  setSelectedStudio]  = useState("");

  const [firstFilter, setFirstFilter] = useState(null);

  // ── Games state ──────────────────────────────
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // ── Data fetching ────────────────────────────
  useEffect(() => {
    axios.get(`${API_URL}/genres`)
      .then((res) => setGenres(res.data))
      .catch((err) => console.error("Failed to fetch genres:", err));

    axios.get(`${API_URL}/tags`)
      .then((res) => setTags(res.data))
      .catch((err) => console.error("Failed to fetch tags:", err));

    axios.get(`${API_URL}/studios`)
      .then((res) => setStudios(res.data))
      .catch((err) => console.error("Failed to fetch studios:", err));
  }, []);

  useEffect(() => {
    axios.get(`${API_URL}/games`)
      .then((res) => setGames(res.data))
      .catch((err) => {
        console.error("Failed to fetch games:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Preselect handler (from GameDetails breadcrumb) ──
  useEffect(() => {
    if (!location.state?.preselect) return;

    const { type, value } = location.state.preselect;

    if (type === "genre") setSelectedGenres([value]);
    if (type === "tag")   setSelectedTags([value]);

    setFirstFilter({ type, value });
    setIsSidebarOpen(true);

    navigate("/games", { replace: true, state: null });
  }, [location.state]);

  // ── Filter handlers ──────────────────────────
  function makeToggler(setState, type) {
    return (value) => {
      setState((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
      setFirstFilter((prev) => {
        const isChecked = prev?.type === type && prev?.value === value;
        if (isChecked) return null;
        if (prev === null) return { type, value };
        return prev;
      });
    };
  }

  const handleToggleGenre = makeToggler(setSelectedGenres, "genre");
  const handleToggleTag   = makeToggler(setSelectedTags, "tag");

  function handleSelectStudio(studio) { setSelectedStudio(studio); }
  function handleClearStudio() { setSelectedStudio(""); }

  // ── Filtering (client-side) ──────────────────
  const filteredGames = games
    .filter((game) =>
      selectedGenres.length === 0 ||
      selectedGenres.every((g) => game.genres.includes(g))
    )
    .filter((game) =>
      selectedTags.length === 0 ||
      selectedTags.every((t) => game.tags.includes(t))
    )
    .filter((game) =>
      !selectedStudio || game.studio === selectedStudio
    );

  // ── Render ───────────────────────────────────
  return (
    <>
      <FilterSidebar
        isOpen={isSidebarOpen}
        genres={genres}
        tags={tags}
        studios={studios}
        selectedGenres={selectedGenres}
        selectedTags={selectedTags}
        selectedStudio={selectedStudio}
        onToggleGenre={handleToggleGenre}
        onToggleTag={handleToggleTag}
        onSelectStudio={handleSelectStudio}
        onClearStudio={handleClearStudio}
      />

      <main className="main-content">
        {loading ? (
          <Spinner />

        ) : error ? (
          <div className="home">
            <p className="home__error">Failed to load games. Please try again later.</p>
          </div>

        ) : (
          <div className="home">
            <h1 className="home__title">All Games</h1>

            <div className="home__games-grid">
              {filteredGames.map((game) => (
                <Link
                  to={`/games/${game._id}${firstFilter ? `?filter=${firstFilter.type}:${firstFilter.value}` : ""}`}
                  key={game._id}
                  className="game-link"
                >
                  <GameCard
                    game={game}
                    isWishlisted={isWishlisted(game._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default AllGames;
