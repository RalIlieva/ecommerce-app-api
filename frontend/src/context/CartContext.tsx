import React, { createContext, useContext, useState } from 'react';

interface CartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};


// // src/context/CartContext.tsx
// import React, { createContext, useState, useContext, ReactNode } from 'react';
//
// interface CartContextProps {
//   cartCount: number;
//   setCartCount: React.Dispatch<React.SetStateAction<number>>;
// }
//
// const CartContext = createContext<CartContextProps | undefined>(undefined);
//
// export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [cartCount, setCartCount] = useState(0);
//
//   return (
//     <CartContext.Provider value={{ cartCount, setCartCount }}>
//       {children}
//     </CartContext.Provider>
//   );
// };
//
// export function useCartContext() {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error('useCartContext must be used within a CartProvider');
//   }
//   return context;
// }
