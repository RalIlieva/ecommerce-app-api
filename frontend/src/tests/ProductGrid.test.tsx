// src/tests/ProductGrid.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductGrid from '../components/ProductGrid';
import { Product } from '../api/types';
import { vi } from 'vitest';

// 1) Mock out the ProductCard child, so we don't pull in its complexities
vi.mock('../components/ProductCard', () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid="card">{product.name}</div>
  ),
}));

describe('ProductGrid', () => {
  it('shows "No products found." when given an empty list', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByText('No products found.')).toBeTruthy();
  });

  it('renders one card per product', () => {
    const products: Product[] = [
      {
        uuid: 'p1',
        slug: 's1',
        name: 'First',
        price: 10,
        image: '',
        tags: [],
        average_rating: 0,
        category: null,
        stock: 1,
      },
      {
        uuid: 'p2',
        slug: 's2',
        name: 'Second',
        price: 20,
        image: '',
        tags: [],
        average_rating: 0,
        category: null,
        stock: 2,
      },
    ];

    render(<ProductGrid products={products} />);
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toBe('First');
    expect(cards[1].textContent).toBe('Second');
  });
});

