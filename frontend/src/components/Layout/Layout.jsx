import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
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
  const [selectedStudio, setSelectedStudio]   = useState(""); // single selected studio

  // Tracks the order filters were checked in, across genres and tags.
  // Each entry is { type: 'genre'|'tag', value: string }.
  // The first element is what appears in the GameDetails breadcrumb.
  const [filterOrder, setFilterOrder] = useState([]);


  // ── Data fetching ────────────────────────────
  // Load genres and studios once when the app first mounts

  useEffect(() => {
    axios.get(`${API_URL}/genres`)
      .then((response) => setGenres(response.data))
      .catch((error) => console.error("Failed to fetch genres:", error));

    axios.get(`${API_URL}/tags`)
      .then((response) => setTags(response.data))
      .catch((error) => console.error("Failed to fetch tags:", error));

    axios.get(`${API_URL}/studios`)
      .then((response) => setStudios(response.data))
      .catch((error) => console.error("Failed to fetch studios:", error));
  }, []);


  const navigate = useNavigate();

  // ── Preselect handler ────────────────────────
  // When the user clicks a filter crumb in the GameDetails breadcrumb,
  // they're sent back to "/" with { preselect: { type, value } } in location.state.
  // This effect reads that state, applies the filter, opens the sidebar,
  // then clears the state so it doesn't re-apply on future renders.
  useEffect(() => {
    
    if (!isHomePage || !location.state?.preselect) return;

    const { type, value } = location.state.preselect;
    
    if (type === "genre") setSelectedGenres([value]);
    if (type === "tag")   setSelectedTags([value]);
    
    setFilterOrder([{ type, value }]);
    setIsSidebarOpen(true);

    navigate("/", { replace: true, state: null });

  }, [location.state]);


  // ── Filter handlers ──────────────────────────

  /**
   * 'Factory' that produces a toggle-handler function for a given state setter.
   * Also updates filterOrder so the first-checked filter can be passed to GameDetails.
   * Returns a function that adds a value if it's not selected, or removes it if it is.
   */
  function makeToggler(setState, type) {
    return (value) => {
      setState((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
      setFilterOrder((prev) => {
        const exists = prev.some((f) => f.type === type && f.value === value);
        return exists
          ? prev.filter((f) => !(f.type === type && f.value === value))
          : [...prev, { type, value }];
      });
    };
  }


  const handleToggleGenre = makeToggler(setSelectedGenres, "genre");
  const handleToggleTag   = makeToggler(setSelectedTags, "tag");



  // Stores the studio the user picked inside selectedStudio.
  function handleSelectStudio(studio) {
    setSelectedStudio(studio);
  }

  // Removes the stored studio inside selectedStudio.
  function handleClearStudio() {
    setSelectedStudio("");
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
          selectedStudio={selectedStudio}
          onToggleGenre={handleToggleGenre}
          onToggleTag={handleToggleTag}
          onSelectStudio={handleSelectStudio}
          onClearStudio={handleClearStudio}
        />

        <main className="main-content">
          {/* Pass search + filters to whatever page is currently rendered */}
          <Outlet context={{ searchText, selectedGenres, selectedTags, selectedStudio, filterOrder }} />
        </main>

      </div>
    </div>
  );
}

export default Layout;
