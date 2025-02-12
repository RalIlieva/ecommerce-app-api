// src/context/WishlistContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface WishlistContextProps {
  wishlistCount: number;
  setWishlistCount: React.Dispatch<React.SetStateAction<number>>;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistCount, setWishlistCount] = useState(0);

  return (
    <WishlistContext.Provider value={{ wishlistCount, setWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
