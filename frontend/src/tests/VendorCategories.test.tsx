// src/tests/VendorCategories.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import VendorCategories from '../pages/vendor/VendorCategories';
import api from '../api';

// --- MOCK react-bootstrap ---
vi.mock('react-bootstrap', () => {
  const FakeModal: any = (props: any) =>
    props.show ? <div data-testid="modal">{props.children}</div> : null;
  FakeModal.Header = (p: any) => <div>{p.children}</div>;
  FakeModal.Body   = (p: any) => <div>{p.children}</div>;
  FakeModal.Title  = (p: any) => <h2>{p.children}</h2>;
  FakeModal.Footer = (p: any) => <div>{p.children}</div>;

  const Card: any = (p: any) => <div>{p.children}</div>;
  Card.Body  = (p: any) => <div>{p.children}</div>;
  Card.Title = (p: any) => <h3>{p.children}</h3>;
  Card.Text  = (p: any) => <p>{p.children}</p>;

  const FormComp: any = (p: any) => <div>{p.children}</div>;
  FormComp.Group   = (p: any) => <div>{p.children}</div>;
  FormComp.Label   = (p: any) => <label>{p.children}</label>;
  FormComp.Control = (p: any) => <input {...p} />;

  return {
    Button:    (p: any) => <button {...p}>{p.children}</button>,
    Container: (p: any) => <div>{p.children}</div>,
    Row:       (p: any) => <div>{p.children}</div>,
    Col:       (p: any) => <div>{p.children}</div>,
    Modal:     FakeModal,
    Spinner:   ()   => <div>Loading...</div>,
    Alert:     (p: any) => <div role="alert">{p.children}</div>,
    Form:      FormComp,
    Card,
  };
});

// --- MOCK api ---
vi.mock('../api');
const mockedGet    = api.get    as vi.Mock;
const mockedPost   = api.post   as vi.Mock;
const mockedPut    = api.put    as vi.Mock;
const mockedDelete = api.delete as vi.Mock;

describe('<VendorCategories />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and renders categories', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { results: [
        { uuid: 'c1', name: 'Cat One', slug: 'cat-one' },
        { uuid: 'c2', name: 'Cat Two', slug: 'cat-two' },
      ] }
    });

    render(<VendorCategories />);
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/vendor/categories/categories/')
    );

    // Should show two cards:
    expect(await screen.findByRole('heading', { level: 3, name: 'Cat One' }))
      .toBeInTheDocument();
    expect(screen.getByText(/Slug: cat-two/)).toBeInTheDocument();
  });

  it('creates a category successfully', async () => {
    // initial empty fetch
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    render(<VendorCategories />);
    await waitFor(() =>
      expect(mockedGet).toHaveBeenCalledWith('/vendor/categories/categories/')
    );

    // open create form
    fireEvent.click(screen.getByRole('button', { name: /create category/i }));
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // fill and submit
    const [nameIn, slugIn] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(nameIn, { target: { value: 'NewCat' } });
    fireEvent.change(slugIn, { target: { value: 'new-cat' } });

    // mock POST
    mockedPost.mockResolvedValueOnce({
      data: { uuid: 'c3', name: 'NewCat', slug: 'new-cat', parent: '' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith(
        '/vendor/categories/categories/create/',
        { name: 'NewCat', slug: 'new-cat', parent: '' }
      )
    );

    // new card appears + success alert
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Category created successfully')
    );
    expect(screen.getByRole('heading', { level: 3, name: 'NewCat' }))
      .toBeInTheDocument();
  });

  it('shows error if create fails', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    render(<VendorCategories />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /create category/i }));
    const [ni, si] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(ni, { target: { value: 'X' } });
    fireEvent.change(si, { target: { value: 'x' } });

    mockedPost.mockRejectedValueOnce(new Error('fail'));
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to create category')
    );
  });

  it('prevents duplicate slug on edit', async () => {
    const c1 = { uuid: 'c1', name: 'A', slug: 'a' };
    const c2 = { uuid: 'c2', name: 'B', slug: 'b' };
    // initial fetch
    mockedGet.mockResolvedValueOnce({ data: { results: [c1, c2] } });
    render(<VendorCategories />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    const [, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(slugInput, { target: { value: 'b' } });

    fireEvent.click(screen.getByRole('button', { name: /update/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert'))
        .toHaveTextContent('Failed to update category')
    );
  });

  it('updates a category successfully', async () => {
    const c1 = { uuid: 'c1', name: 'A', slug: 'a', parent: '' };
    mockedGet.mockResolvedValueOnce({ data: { results: [c1] } });
    render(<VendorCategories />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const [nameIn] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(nameIn, { target: { value: 'A+' } });

    // second GET for duplicate‐slug check
    mockedGet.mockResolvedValueOnce({ data: { results: [c1] } });
    // mock PUT
    mockedPut.mockResolvedValueOnce({ data: { ...c1, name: 'A+' } });

    fireEvent.click(screen.getByRole('button', { name: /update/i }));
    await waitFor(() =>
      expect(mockedPut).toHaveBeenCalledWith(
        '/vendor/categories/categories/c1/manage/',
        { uuid: 'c1', name: 'A+', slug: 'a', parent: '' }
      )
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Category updated successfully')
    );
  });

  it('deletes a category successfully', async () => {
    const c1 = { uuid: 'c1', name: 'DelMe', slug: 'del', parent: '' };
    mockedGet.mockResolvedValueOnce({ data: { results: [c1] } });
    render(<VendorCategories />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: /^delete$/i })[0]);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    mockedDelete.mockResolvedValueOnce({});
    fireEvent.click(screen.getAllByRole('button', { name: /^delete$/i })[1]);
    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith(
        '/vendor/categories/categories/c1/manage/'
      )
    );
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Category deleted successfully')
    );
  });
});
