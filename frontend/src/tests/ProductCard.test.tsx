// src/tests/ProductCard.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AuthContext from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import api from '../api';
import * as wishlistApi from '../api/wishlist';
import { vi } from 'vitest';

vi.mock('../api');
vi.mock('../api/wishlist');

describe('ProductCard', () => {
  const product = {
    uuid: 'p1',
    slug: 's1',
    name: 'Test Product',
    price: '9.99',
    image: '',
    tags: [],
    average_rating: 3.5,
    category: null,
    stock: 5,
  };

  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    (api.post as vi.Mock).mockResolvedValue({});
    (wishlistApi.addToWishlist as vi.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    alertSpy.mockRestore();
    vi.resetAllMocks();
  });

  function renderWithProviders(user: any) {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user }}>
          <CartProvider>
            <WishlistProvider>
              <ProductCard product={product as any} />
            </WishlistProvider>
          </CartProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  it('prompts login when adding to cart if no user', () => {
    renderWithProviders(null);
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please log in to add to cart.');
  });

  it('calls API and alerts success when adding to cart as logged-in user', async () => {
    renderWithProviders({ id: 123 });
    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/cart/add/', {
        product_uuid: product.uuid,
        quantity: 1,
      })
    );
    expect(alertSpy).toHaveBeenCalledWith('Item added to cart!');
  });

  it('prompts login when adding to wishlist if no user', () => {
    renderWithProviders(null);
    fireEvent.click(screen.getByRole('button', { name: /Add to Wishlist/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please log in to add to wishlist.');
  });

  it('calls wishlist API and alerts success when adding to wishlist as logged-in user', async () => {
    renderWithProviders({ id: 123 });
    fireEvent.click(screen.getByRole('button', { name: /Add to Wishlist/i }));
    await waitFor(() =>
      expect(wishlistApi.addToWishlist).toHaveBeenCalledWith(product.uuid)
    );
    expect(alertSpy).toHaveBeenCalledWith('Item added to wishlist!');
  });
});
