// src/tests/ProductForm.test.tsx
import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ProductForm from '../components/ProductForm';
import { vi } from 'vitest';

describe('ProductForm', () => {
  const categories = [
    { uuid: 'c1', name: 'Cat A', slug: 'cat-a' },
    { uuid: 'c2', name: 'Cat B', slug: 'cat-b' },
  ];
  const tags = [
    { uuid: 't1', name: 'Tag1', slug: 'tag1' },
    { uuid: 't2', name: 'Tag2', slug: 'tag2' },
  ];

  it('renders with initialValues and calls onSubmit with correct payload', async () => {
    const initial = {
      name: 'Prod',
      description: 'Desc',
      price: 42,
      stock: 3,
      category: categories[1],
      tags: [tags[0]],
    };
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ProductForm
        initialValues={initial}
        onSubmit={onSubmit}
        categories={categories}
        tags={tags}
        submitLabel="Save"
      />
    );

    // Check initial values
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Prod');
    expect((screen.getByLabelText('Description') as HTMLTextAreaElement).value).toBe('Desc');
    expect((screen.getByLabelText('Price') as HTMLInputElement).value).toBe('42');
    expect((screen.getByLabelText('Stock') as HTMLInputElement).value).toBe('3');
    expect((screen.getByLabelText('Category') as HTMLSelectElement).value).toBe('cat-b');

    // Check initial tag selection
    const tagSelect = screen.getByLabelText('Tags') as HTMLSelectElement;
    expect(Array.from(tagSelect.selectedOptions).map(o => o.value)).toEqual(['tag1']);

    // Change name and category (skip multi-select complexity)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'NewName' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'cat-a' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // Wait for onSubmit to be called
    await screen.findByRole('button', { name: 'Save' });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'NewName',
      description: 'Desc',
      price: 42,
      stock: 3,
      category: { name: 'Cat A', slug: 'cat-a' },
      tags: [
        { name: 'Tag1', slug: 'tag1' },
      ],
    });
  });

  it('resets fields when formResetRef.current() is called', () => {
    const onSubmit = vi.fn();
    const ref = createRef<() => void>();

    render(
      <ProductForm
        onSubmit={onSubmit}
        categories={categories}
        tags={tags}
        formResetRef={ref}
      />
    );

    // Change the Name field
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Foo' } });
    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Foo');

    // Reset via the ref inside an act
    act(() => {
      ref.current?.();
    });

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('');
  });
});
