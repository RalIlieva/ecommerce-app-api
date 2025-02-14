// src/context/CartContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CartContextProps {
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
}

// Create the context
const CartContext = createContext<CartContextProps | undefined>(undefined);

// CartProvider component to wrap around the application
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(0);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
