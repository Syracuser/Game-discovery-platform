import { useState } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import "./Layout.css";

// ─────────────────────────────────────────────
// Layout — global shell.
// Renders the Navbar, current page via Outlet, and Footer.
// ─────────────────────────────────────────────

function Layout() {
  const navigate   = useNavigate(); 
  const isHomePage = useLocation().pathname === "/";

  const [searchInputValue, setSearchInputValue] = useState("");
  const [isSidebarOpen,    setIsSidebarOpen]    = useState(false);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmedQuery = searchInputValue.trim();
    if (!trimmedQuery) return;
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setSearchInputValue("");
  }

  return (
    <div className="layout">

      <Navbar
        searchInputValue={searchInputValue}
        setSearchInputValue={setSearchInputValue}
        onSearchSubmit={handleSearchSubmit}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        showFilterToggle={isHomePage}
      />

      <div className="layout__body">
        {isHomePage ? (
          <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
        ) : (
          <main className="main-content">
            <Outlet context={{}} />
          </main>
        )}
      </div>

      <Footer />

    </div>
  );
}

export default Layout;
