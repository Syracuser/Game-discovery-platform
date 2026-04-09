import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import FilterSidebar from "../FilterSidebar/FilterSidebar";
import "./Layout.css";

function Layout() {
  // Check which page the user is on — filters only apply to the Home page
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Search state (already existed)
  const [searchText, setSearchText] = useState("");

  // Sidebar toggle state — controls whether the sidebar is visible
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filter options — the full lists fetched from the backend
  const [genres, setGenres] = useState([]);
  const [studios, setStudios] = useState([]);

  // Selected filters — which checkboxes the user has checked
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStudios, setSelectedStudios] = useState([]);

  // Fetch the available genres and studios when the app first loads
  useEffect(() => {
    axios.get("http://localhost:8000/genres")
      .then((response) => setGenres(response.data))
      .catch((error) => console.error("Failed to fetch genres:", error));

    axios.get("http://localhost:8000/studios")
      .then((response) => setStudios(response.data))
      .catch((error) => console.error("Failed to fetch studios:", error));
  }, []);

  // Toggle a genre: if it's already selected, remove it. Otherwise, add it.
  function handleToggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  }

  // Toggle a studio: same logic as genres
  function handleToggleStudio(studio) {
    setSelectedStudios((prev) =>
      prev.includes(studio)
        ? prev.filter((s) => s !== studio)
        : [...prev, studio]
    );
  }

  return (
    <div className="layout">
      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        showFilterToggle={isHomePage}
      />

      {/* Flex container: sidebar on the left, main content on the right */}
      <div className="layout__body">
        <FilterSidebar
          isOpen={isHomePage && isSidebarOpen}
          genres={genres}
          studios={studios}
          selectedGenres={selectedGenres}
          selectedStudios={selectedStudios}
          onToggleGenre={handleToggleGenre}
          onToggleStudio={handleToggleStudio}
        />

        <main className="main-content">
          {/* Pass search text and selected filters to whatever page is rendered */}
          <Outlet context={{ searchText, selectedGenres, selectedStudios }} />
        </main>
      </div>
    </div>
  );
}

export default Layout;
