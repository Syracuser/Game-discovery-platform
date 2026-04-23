import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import FilterSidebar from "../FilterSidebar/FilterSidebar";
import "./Layout.css";

// ─────────────────────────────────────────────
// Layout — the "manager" component.
// Holds all shared state and passes it down
// to Navbar, FilterSidebar, and the page content.
// ─────────────────────────────────────────────

function Layout() {

  // ── Page detection ──────────────────────────
  // Filters only apply to the Home page ("/")
  const location = useLocation();
  const isHomePage = location.pathname === "/";


  // ── State ────────────────────────────────────

  const [searchText, setSearchText]       = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [genres, setGenres]   = useState([]);   // full list from backend
  const [tags, setTags]       = useState([]);   // full list from backend
  const [studios, setStudios] = useState([]);   // full list from backend

  const [selectedGenres, setSelectedGenres]   = useState([]);  // checked items
  const [selectedTags, setSelectedTags]       = useState([]);  // checked items
  const [selectedStudios, setSelectedStudios] = useState([]);  // checked items


  // ── Data fetching ────────────────────────────
  // Load genres and studios once when the app first mounts

  useEffect(() => {
    axios.get("http://localhost:8000/genres")
      .then((response) => setGenres(response.data))
      .catch((error) => console.error("Failed to fetch genres:", error));

    axios.get("http://localhost:8000/tags")
      .then((response) => setTags(response.data))
      .catch((error) => console.error("Failed to fetch tags:", error));

    axios.get("http://localhost:8000/studios")
      .then((response) => setStudios(response.data))
      .catch((error) => console.error("Failed to fetch studios:", error));
  }, []);


  // ── Filter handlers ──────────────────────────

  /**
   * Toggle a genre on/off.
   * If already selected → remove it. If not → add it.
   */
  function handleToggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  }

  /** Same logic as handleToggleGenre, but for tags. */
  function handleToggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  /** Same logic as handleToggleGenre, but for studios. */
  function handleToggleStudio(studio) {
    setSelectedStudios((prev) =>
      prev.includes(studio)
        ? prev.filter((s) => s !== studio)
        : [...prev, studio]
    );
  }


  // ── Render ───────────────────────────────────

  return (
    <div className="layout">

      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        showFilterToggle={isHomePage}
      />
      {/* Sidebar + main content side by side */}
      <div className="layout__body">

        <FilterSidebar
          isOpen={isHomePage && isSidebarOpen}
          genres={genres}
          tags={tags}
          studios={studios}
          selectedGenres={selectedGenres}
          selectedTags={selectedTags}
          selectedStudios={selectedStudios}
          onToggleGenre={handleToggleGenre}
          onToggleTag={handleToggleTag}
          onToggleStudio={handleToggleStudio}
        />

        <main className="main-content">
          {/* Pass search + filters to whatever page is currently rendered */}
          <Outlet context={{ searchText, selectedGenres, selectedTags, selectedStudios }} />
        </main>

      </div>
    </div>
  );
}

export default Layout;
