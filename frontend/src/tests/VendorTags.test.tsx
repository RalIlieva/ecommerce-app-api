// src/tests/VendorTags.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import VendorTags from '../pages/vendor/VendorTags';
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

describe('<VendorTags />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows spinner then renders fetched tags', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { results: [
        { uuid: 't1', name: 'Tag One', slug: 'tag-one' },
        { uuid: 't2', name: 'Tag Two', slug: 'tag-two' },
      ] }
    });

    render(<VendorTags />);
    // Should call the correct endpoint
    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith('/vendor/tags/tags');
    });

    // wrapper + spinner text
    await waitFor(() => {
      const loaders = screen.getAllByText('Loading...');
      expect(loaders.length).toBe(2);
    });

    // after load
    await waitFor(() => {
      expect(screen.queryAllByText('Loading...').length).toBe(0);
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Tag One' })).toBeTruthy();
    expect(screen.getByText(/Slug: tag-two/)).toBeTruthy();
  });

  it('creates a tag successfully', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    render(<VendorTags />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/vendor/tags/tags'));

    fireEvent.click(screen.getByRole('button', { name: /create tag/i }));
    expect(screen.getByTestId('modal')).toBeTruthy();

    const [nameInput, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(nameInput, { target: { value: 'New Tag' } });
    fireEvent.change(slugInput, { target: { value: 'new-tag' } });

    mockedPost.mockResolvedValueOnce({
      data: { uuid: 't3', name: 'New Tag', slug: 'new-tag' }
    });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith('/vendor/tags/tags', { name: 'New Tag', slug: 'new-tag' });
    });

    // Modal closes and new tag appears
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 3, name: 'New Tag' })).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Tag created successfully');
  });

  it('shows error if create fails', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    render(<VendorTags />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/vendor/tags/tags'));

    fireEvent.click(screen.getByRole('button', { name: /create tag/i }));
    const [ni, si] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(ni, { target: { value: 'X' } });
    fireEvent.change(si, { target: { value: 'x' } });

    mockedPost.mockRejectedValueOnce(new Error('fail'));
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to create tag');
    });
  });

  it('prevents duplicate slug on edit', async () => {
    const t1 = { uuid: 't1', name: 'A', slug: 'a' };
    const t2 = { uuid: 't2', name: 'B', slug: 'b' };
    mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });

    render(<VendorTags />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/vendor/tags'));

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    const [, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(slugInput, { target: { value: 'b' } });

    fireEvent.click(screen.getByRole('button', { name: /update/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('This slug already exists');
    });
  });

  it('updates a tag successfully', async () => {
    const t1 = { uuid: 't1', name: 'A', slug: 'a' };
    mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });

    render(<VendorTags />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/vendor/tags/tags'));

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const [nameInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(nameInput, { target: { value: 'A+' } });

    mockedPut.mockResolvedValueOnce({
      data: { ...t1, name: 'A+', slug: 'a' }
    });
    fireEvent.click(screen.getByRole('button', { name: /update/i }));
    await waitFor(() => {
      expect(mockedPut).toHaveBeenCalledWith('/vendor/tags/tags/t1', { name: 'A+', slug: 'a' });
    });

    // Modal closes and heading updates
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 3, name: 'A+' })).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Tag updated successfully');
  });

  it('deletes a tag successfully', async () => {
    const t1 = { uuid: 't1', name: 'DeleteMe', slug: 'del' };
    mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });

    render(<VendorTags />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith('/vendor/tags/tags'));

    fireEvent.click(screen.getByRole('button', { name: /delete$/i }));
    expect(screen.getByTestId('modal')).toBeTruthy();

    mockedDelete.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => {
      expect(mockedDelete).toHaveBeenCalledWith('/vendor/tags/tags/t1');
    });

    // Modal closes and tag is removed
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 3, name: 'DeleteMe' })).toBeNull();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Tag deleted successfully');
  });
});
