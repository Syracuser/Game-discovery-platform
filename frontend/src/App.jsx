import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home/Home";
import Wishlist from "./pages/Wishlist/Wishlist";
import GameDetails from "./pages/GameDetails/GameDetails";
import Preferences from "./pages/Preferences/Preferences";
import Recommendations from "./pages/Recommendations/Recommendations";
import SearchResults from "./pages/SearchResults/SearchResults";
import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout route — wraps all pages with the Navbar and footer */}
        {/* No "path" here because it applies to ALL child routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/games/:id" element={<GameDetails />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
