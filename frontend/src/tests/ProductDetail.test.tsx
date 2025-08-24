// src/tests/ProductDetail.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import ProductDetail from '../pages/ProductDetail';
import AuthContext from '../context/AuthContext';

// ---- Mock router params (uuid/slug) ----
const mockedParams = { uuid: 'u-123', slug: 'cool-product' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockedParams,
  };
});

// ---- Mock API module (get, post) ----
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
import api from '../api';

// ---- Mock wishlist API ----
vi.mock('../api/wishlist', () => ({
  addToWishlist: vi.fn(),
}));
import { addToWishlist } from '../api/wishlist';

// ---- Mock child components to keep tests focused ----
vi.mock('../components/ImageGallery', () => ({
  default: ({ images }: any) => <div data-testid="image-gallery">{images?.length ?? 0} images</div>,
}));

vi.mock('../pages/ProductReviews', () => ({
  default: (p: any) => (
    <div
      data-testid="product-reviews"
      data-uuid={p.productUuid}
      data-slug={p.productSlug}
      data-auth={p.isAuthenticated ? 'yes' : 'no'}
    />
  ),
}));

// (Optional) We rely on the rating text "x.x/5", so no need to mock renderStars/util.

// ---- Mock Cart & Wishlist contexts (hooks) ----
let cartCtx: { cartCount: number; setCartCount: (n: number) => void };
let wishCtx: { wishlistCount: number; setWishlistCount: (n: number) => void };

vi.mock('../context/CartContext', () => ({
  useCartContext: () => cartCtx,
}));

vi.mock('../context/WishlistContext', () => ({
  useWishlistContext: () => wishCtx,
}));

// ---- Helpers & shared data ----
const mockedGet = api.get as unknown as vi.Mock;
const mockedPost = api.post as unknown as vi.Mock;
const mockedAddToWishlist = addToWishlist as unknown as vi.Mock;

const productPayload = {
  uuid: 'u-123',
  slug: 'cool-product',
  name: 'Cool Product',
  description: 'A very cool product',
  price: '12.5',
  stock: 7,
  images: [{ url: '/img1.jpg' }, { url: '/img2.jpg' }],
  average_rating: 4.5,
};

const renderWithProviders = (user: any = { id: 42, email: 'user@example.com' }) =>
  render(
    <AuthContext.Provider value={{ user } as any}>
      <MemoryRouter>
        <ProductDetail />
      </MemoryRouter>
    </AuthContext.Provider>
  );

beforeEach(() => {
  vi.resetAllMocks();
  // default contexts for each test
  cartCtx = { cartCount: 3, setCartCount: vi.fn() };
  wishCtx = { wishlistCount: 5, setWishlistCount: vi.fn() };
  // default params
  mockedParams.uuid = 'u-123';
  mockedParams.slug = 'cool-product';
  // jsdom alert mock
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  (window.alert as any).mockRestore?.();
});

describe('<ProductDetail />', () => {
  it('shows loading, fetches product by uuid/slug, then renders details', async () => {
    mockedGet.mockResolvedValueOnce({ data: productPayload });

    renderWithProviders();

    // Loading spinner is present
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    // Called with the correct endpoint
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/products/products/u-123/cool-product/')
    );

    // Renders product info
    expect(await screen.findByRole('heading', { name: /Cool Product/i })).toBeInTheDocument();
    expect(screen.getByText(/A very cool product/i)).toBeInTheDocument();

    // Price formatted and stock text
    expect(screen.getByText('$12.50')).toBeInTheDocument();
    expect(screen.getByText(/In stock: 7/i)).toBeInTheDocument();

    // Rating text
    expect(screen.getByText('4.5/5')).toBeInTheDocument();

    // Image gallery + reviews props
    expect(screen.getByTestId('image-gallery')).toHaveTextContent('2 images');
    const reviews = screen.getByTestId('product-reviews');
    expect(reviews).toHaveAttribute('data-uuid', 'u-123');
    expect(reviews).toHaveAttribute('data-slug', 'cool-product');
    expect(reviews).toHaveAttribute('data-auth', 'yes');
  });

  it('renders error state when fetch fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGet.mockRejectedValueOnce(new Error('fetch failed'));

    renderWithProviders();

    expect(await screen.findByText(/Failed to fetch product details\./i)).toBeInTheDocument();
    expect(screen.queryByText(/Loading\.\.\./i)).not.toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders "Product not found." when no product returned', async () => {
    mockedGet.mockResolvedValueOnce({ data: null });

    renderWithProviders();

    expect(await screen.findByText(/Product not found\./i)).toBeInTheDocument();
  });

  it('requires auth to add to cart', async () => {
    mockedGet.mockResolvedValueOnce({ data: productPayload });

    renderWithProviders(null); // user is null / unauthenticated

    await screen.findByRole('heading', { name: /Cool Product/i });

    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    expect(window.alert).toHaveBeenCalledWith('Please log in to add to cart.');
    expect(mockedPost).not.toHaveBeenCalled();
    expect(cartCtx.setCartCount).not.toHaveBeenCalled();

    // Reviews component should reflect not authenticated
    expect(screen.getByTestId('product-reviews')).toHaveAttribute('data-auth', 'no');
  });

  it('adds to cart with chosen quantity and updates cart count', async () => {
    mockedGet.mockResolvedValueOnce({ data: productPayload });
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });

    renderWithProviders();

    await screen.findByRole('heading', { name: /Cool Product/i });

    // Change quantity to 2
    const qty = screen.getByLabelText(/Quantity:/i) as HTMLInputElement;
    fireEvent.change(qty, { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith('/cart/add/', {
        product_uuid: 'u-123',
        quantity: 2,
      })
    );

    expect(window.alert).toHaveBeenCalledWith('Item added to cart!');
    // Cart count was 3, +2 = 5
    expect(cartCtx.setCartCount).toHaveBeenCalledWith(5);
  });

  it('shows backend message when cart add fails with 400 (e.g., insufficient stock)', async () => {
    mockedGet.mockResolvedValueOnce({ data: productPayload });
    mockedPost.mockRejectedValueOnce({
      response: { status: 400, data: { detail: 'Insufficient stock' } },
    });

    renderWithProviders();

    await screen.findByRole('heading', { name: /Cool Product/i });

    fireEvent.click(screen.getByRole('button', { name: /Add to Cart/i }));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Insufficient stock')
    );
    expect(cartCtx.setCartCount).not.toHaveBeenCalled();
  });

  it('adds to wishlist when authenticated and increments wishlist count', async () => {
    mockedGet.mockResolvedValueOnce({ data: productPayload });
    mockedAddToWishlist.mockResolvedValueOnce({ data: { ok: true } });

    renderWithProviders();

    await screen.findByRole('heading', { name: /Cool Product/i });

    fireEvent.click(screen.getByRole('button', { name: /Add to Wishlist/i }));

    await waitFor(() =>
      expect(mockedAddToWishlist).toHaveBeenCalledWith('u-123')
    );

    expect(window.alert).toHaveBeenCalledWith('Item added to wishlist!');
    // Wishlist count was 5, +1 = 6
    expect(wishCtx.setWishlistCount).toHaveBeenCalledWith(6);
  });

  it('requires auth to add to wishlist', async () => {
    mockedGet.mockResolvedValueOnce({ data: productPayload });

    renderWithProviders(null);

    await screen.findByRole('heading', { name: /Cool Product/i });

    fireEvent.click(screen.getByRole('button', { name: /Add to Wishlist/i }));

    expect(window.alert).toHaveBeenCalledWith('Please log in to add to wishlist.');
    expect(mockedAddToWishlist).not.toHaveBeenCalled();
    expect(wishCtx.setWishlistCount).not.toHaveBeenCalled();
  });
});
