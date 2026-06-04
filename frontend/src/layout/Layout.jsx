import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import "./Layout.css";

// ─────────────────────────────────────────────
// Layout — global shell.
// Renders the Navbar and the current page via Outlet.
// Owns searchText and isSidebarOpen since both are
// driven by Navbar interactions and shared downward.
// ─────────────────────────────────────────────

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [searchText, setSearchText]       = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">

      <Navbar
        searchText={searchText}
        setSearchText={setSearchText}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        showFilterToggle={isHomePage}
      />

      <div className="layout__body">
        {isHomePage ? (
          //if the currently rendered page is the Home page - pass down to it the Filter-sidebar state.
          <Outlet context={{ searchText, isSidebarOpen, setIsSidebarOpen }} />
        ) : (
          // If the currently rendered page is NOT the home page - just pass the search-bar text state.
          <main className="main-content">
            <Outlet context={{ searchText }} />
          </main>
        )}
      </div>

      <Footer />

    </div>
  );
}

export default Layout;
