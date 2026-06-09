import { useState, useEffect } from "react";

/**
 * useWishlist
 *
 * Manages the user's wishlist using localStorage so it persists across page refreshes.
 * Stores full game objects so the Wishlist page can render them without any extra fetch.
 *
 * Returns:
 *  - wishlist:      array of game objects currently in the wishlist
 *  - addGame:       (game) => void — adds a game if it isn't already there
 *  - removeGame:    (gameId) => void — removes a game by its _id
 *  - isWishlisted:  (gameId) => boolean — quick check if a game is in the wishlist
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
      const alreadyAdded = prev.some((g) => g._id === game._id); // Check if the game being added is already in the existing wishlist.
      return alreadyAdded ? prev : [...prev, game]; // if it is, keep the wishlist as is. If it isn't, return the new wishlist with the game
    });
  }

  function removeGame(gameId) {
    setWishlist((prev) => prev.filter((g) => g._id !== gameId)); // Goes through the current wishlist and checks if any games in it have the new game's ID
  }

  function isWishlisted(gameId) {
    return wishlist.some((g) => g._id === gameId); // Check if the game being added is already in the existing wishlist.
  }

  return { wishlist, addGame, removeGame, isWishlisted };
}

export default useWishlist;
