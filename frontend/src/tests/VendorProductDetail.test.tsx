// src/tests/VendorProductDetail.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VendorProductDetail from '../pages/vendor/VendorProductDetail';
import api from '../api';
import { vi } from 'vitest';

// 1) MOCK react-router-dom.useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// 2) STUB out ProductForm to expose onSubmit, and assign formResetRef
vi.mock('../../components/ProductForm', () => ({
  default: (props: any) => {
    // expose the reset function so that formResetRef.current can be called
    React.useEffect(() => {
      props.formResetRef.current = () => { /* pretend reset */ };
    }, [props.formResetRef]);
    return (
      <button
        data-testid="mock-form-submit"
        onClick={() => props.onSubmit({ name: 'UPDATED' })}
      >
        {props.submitLabel}
      </button>
    );
  },
}));

// 3) STUB out ProductImageManager so it doesn't crash
vi.mock('../../components/ProductImageManager', () => ({
  default: () => <div data-testid="mock-image-manager" />,
}));

// 4) Prepare a mock product
const mockProduct = {
  uuid: 'prod-123',
  slug: 'my-product',
  name: 'My Product',
  description: 'A great product',
  price: 99.99,
  stock: 5,
  category: { name: 'Cat A' },
  tags: [{ name: 'Tag1' }, { name: 'Tag2' }],
};

describe('VendorProductDetail', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default behavior: first GET → product detail,
    // then categories/tags GETs → empty lists
    (api.get as any).mockImplementation((url: string) => {
      if (url.startsWith('/products/products/')) {
        return Promise.resolve({ data: mockProduct });
      }
      if (url.includes('/categories/')) {
        return Promise.resolve({ data: { results: [] } });
      }
      if (url.includes('/tags/')) {
        return Promise.resolve({ data: { results: [] } });
      }
      return Promise.resolve({ data: null });
    });

    // Default PUT and DELETE to succeed
    (api.put as any).mockResolvedValue({});
    (api.delete as any).mockResolvedValue({});
  });

  it('shows loading then renders all product fields plus buttons', async () => {
    render(<VendorProductDetail />);

    // initial loading
    expect(screen.getByText('Loading...')).toBeTruthy();

    // wait until the product name appears
    await waitFor(() => screen.getByText(/My Product/i));

    // assert key fields render
    expect(screen.getByText(/Description:/i)).toBeTruthy();
    expect(screen.getByText('A great product')).toBeTruthy();

    expect(screen.getByText(/Price:/i)).toBeTruthy();
    expect(screen.getByText('$99.99')).toBeTruthy();

    expect(screen.getByText(/Stock:/i)).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();

    expect(screen.getByText(/Category:/i)).toBeTruthy();
    expect(screen.getByText('Cat A')).toBeTruthy();

    expect(screen.getByText(/Tags:/i)).toBeTruthy();
    expect(screen.getByText('Tag1, Tag2')).toBeTruthy();

    // buttons
    expect(screen.getByRole('button', { name: /Edit Product/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Delete Product/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Back to Products/i })).toBeTruthy();

    // image manager stub
    expect(screen.getByTestId('mock-image-manager')).toBeTruthy();
  });

  it('renders an error alert if the initial GET fails', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('Network'));
    render(<VendorProductDetail />);

    await waitFor(() => screen.getByText(/Failed to load product details./i));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to load product details.'
    );
  });

  it('renders "Product not found." if API returns null data', async () => {
    (api.get as any).mockResolvedValueOnce({ data: null });
    render(<VendorProductDetail />);

    await waitFor(() => screen.getByText(/Product not found\./i));
    expect(screen.getByText('Product not found.')).toBeTruthy();
  });

  it('allows editing: opens modal, submits, refreshes, shows success, closes modal', async () => {
    render(<VendorProductDetail />);

    // wait for detail to load
    await waitFor(() => screen.getByText(/My Product/i));

    // open edit modal
    fireEvent.click(screen.getByRole('button', { name: /Edit Product/i }));
    // stub form renders a button with the submitLabel
    const submitBtn = screen.getByTestId('mock-form-submit');
    expect(submitBtn).toBeTruthy();

    // make the mock for the refresh GET return updated data
    (api.get as any).mockResolvedValueOnce({ data: { ...mockProduct, name: 'UPDATED' } });

    // click the stubbed form submit
    fireEvent.click(submitBtn);

    // on success, we should see the success Alert
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Product updated successfully.'
      )
    );

    // and modal should be closed (no longer seeing the form button)
    expect(screen.queryByTestId('mock-form-submit')).toBeNull();

    // and the new name appears in the heading
    expect(screen.getByText(/Product Detail - UPDATED/i)).toBeTruthy();
  });

  it('allows deleting: opens modal, confirms, shows success, then navigates', async () => {
    vi.useFakeTimers();

    render(<VendorProductDetail />);

    // wait for detail
    await waitFor(() => screen.getByText(/My Product/i));

    // open delete modal
    fireEvent.click(screen.getByRole('button', { name: /Delete Product/i }));
    // now we should see the confirm text
    expect(
      screen.getByText(/Are you sure you want to delete/i)
    ).toBeTruthy();

    // click the Delete button inside modal
    fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));

    // on success, Alert appears immediately
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Product deleted successfully.'
      )
    );

    // advance the 2s timeout
    vi.advanceTimersByTime(2000);

    // now navigate should have been called
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/vendor/products')
    );

    vi.useRealTimers();
  });
});
