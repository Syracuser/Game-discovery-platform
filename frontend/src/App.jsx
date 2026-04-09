import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Wishlist from "./pages/Wishlist/Wishlist";

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        {/* Layout route — wraps all pages with the Navbar */}
        {/* No "path" here because it applies to ALL child routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
