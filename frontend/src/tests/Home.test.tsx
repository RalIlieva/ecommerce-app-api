// src/tests/Home.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('<Home />', () => {
  const renderHome = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

  it('renders the headline and lead copy', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: /Welcome to the E-commerce App/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Explore our wide range of products and find the best deals for you\./i
      )
    ).toBeInTheDocument();
  });

  it('shows the main call-to-action link to products', () => {
    renderHome();

    const cta = screen.getByRole('link', { name: /View Products/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/products');
  });

  it('renders three info cards with titles, descriptions, and links', () => {
    renderHome();

    // Card 1: Featured Products
    const featured = screen.getByRole('heading', { name: /Featured Products/i }).closest('.card');
    expect(featured).toBeInTheDocument();
    expect(within(featured as HTMLElement).getByText(/top-rated products/i)).toBeInTheDocument();
    expect(
      within(featured as HTMLElement).getByRole('link', { name: /Shop Now/i })
    ).toHaveAttribute('href', '/products');

    // Card 2: Special Offers
    const offers = screen.getByRole('heading', { name: /Special Offers/i }).closest('.card');
    expect(offers).toBeInTheDocument();
    expect(within(offers as HTMLElement).getByText(/exclusive discounts and deals/i)).toBeInTheDocument();
    expect(
      within(offers as HTMLElement).getByRole('link', { name: /View Offers/i })
    ).toHaveAttribute('href', '/products');

    // Card 3: New Arrivals
    const arrivals = screen.getByRole('heading', { name: /New Arrivals/i }).closest('.card');
    expect(arrivals).toBeInTheDocument();
    expect(within(arrivals as HTMLElement).getByText(/latest additions/i)).toBeInTheDocument();
    expect(
      within(arrivals as HTMLElement).getByRole('link', { name: /Explore Now/i })
    ).toHaveAttribute('href', '/products');
  });

  it('has exactly four links to /products (CTA + 3 cards)', () => {
    renderHome();

    const allProductLinks = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '/products');
    expect(allProductLinks).toHaveLength(4);

    // sanity: label set
    const labels = allProductLinks.map((a) => a.textContent?.trim());
    expect(labels).toEqual(
      expect.arrayContaining(['View Products', 'Shop Now', 'View Offers', 'Explore Now'])
    );
  });
});
