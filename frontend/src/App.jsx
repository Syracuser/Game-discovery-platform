import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home/Home";
// AllGames is retired from user access (see the /games route below) but kept for
// possible revival. Import intentionally removed to avoid an unused-import warning;
// re-add `import AllGames from "./pages/AllGames/AllGames";` if you revive the route.
import Wishlist from "./pages/Wishlist/Wishlist";
import GameDetails from "./pages/GameDetails/GameDetails";
import Preferences from "./pages/Preferences/Preferences";
import Recommendations from "./pages/Recommendations/Recommendations";
import SearchResults from "./pages/SearchResults/SearchResults";
import Browse from "./pages/Browse/Browse";
import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout route — wraps all pages with the Navbar and footer */}
        {/* No "path" here because it applies to ALL child routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* AllGames (the stored-games filter browser) is RETIRED from user access:
              it only shows the ML training core, which isn't meant for users. The
              component is kept (not deleted) but /games now redirects to Home so it's
              unreachable. To revive it, swap this back to <AllGames />. */}
          <Route path="/games" element={<Navigate to="/" replace />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/games/:id" element={<GameDetails />} />
          {/* Live RAWG game detail — same page, but fetches live by rawg_id */}
          <Route path="/games/rawg/:rawgId" element={<GameDetails />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/search" element={<SearchResults />} />
          {/* Live RAWG browse sections — one Browse page, parameterized by section */}
          <Route path="/popular" element={<Browse section="popular" />} />
          <Route path="/new" element={<Browse section="new" />} />
          <Route path="/trending" element={<Browse section="trending" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
