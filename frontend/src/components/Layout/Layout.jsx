import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
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
          // Home manages its own sidebar — render Outlet directly so
          // FilterSidebar and main-content are siblings inside layout__body.
          <Outlet context={{ searchText, isSidebarOpen, setIsSidebarOpen }} />
        ) : (
          <main className="main-content">
            <Outlet context={{ searchText }} />
          </main>
        )}
      </div>

    </div>
  );
}

export default Layout;
