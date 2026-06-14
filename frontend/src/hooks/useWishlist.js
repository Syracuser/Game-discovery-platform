import { useState, useEffect } from "react";

/**
 * useWishlist
 *
 * Manages the user's wishlist using localStorage so it persists across page refreshes.
 * Stores full game objects so the Wishlist page can render them without any extra fetch.
 *
 * Games are keyed by `rawg_id`. In the final product every game the user can browse
 * is a live RAWG game (the stored DB games are the ML training core, not user-facing),
 * so rawg_id is the single consistent id across the whole wishlist.
 *
 * Returns:
 *  - wishlist:      array of game objects currently in the wishlist
 *  - addGame:       (game) => void — adds a game if it isn't already there
 *  - removeGame:    (rawgId) => void — removes a game by its rawg_id
 *  - isWishlisted:  (rawgId) => boolean — quick check if a game is in the wishlist
 */

const STORAGE_KEY = "wishlist";

function useWishlist() {

  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY); // Check in localStorage if there is an existing stored wishlist.
      return stored ? JSON.parse(stored) : []; // If there is, parse it. (String -> Object), if not, empty array.
    } catch {
      return [];
    }
  });

  // Updates localstorage whenever wishlist changes (when either a game is added or removed)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  function addGame(game) {
    setWishlist((prev) => { // prev = current wishlist
      const alreadyAdded = prev.some((g) => g.rawg_id === game.rawg_id); // Check if the game being added is already in the existing wishlist.
      return alreadyAdded ? prev : [...prev, game]; // if it is, keep the wishlist as is. If it isn't, add the game and return the new wishlist with the game
    });
  }

  function removeGame(rawgId) {
    setWishlist((prev) => prev.filter((g) => g.rawg_id !== rawgId)); // Keep every game whose rawg_id is NOT the one being removed
  }

  function isWishlisted(rawgId) {
    return wishlist.some((g) => g.rawg_id === rawgId); // Check if a game with this rawg_id is already in the wishlist
  }

  return { wishlist, addGame, removeGame, isWishlisted };
}

export default useWishlist;
