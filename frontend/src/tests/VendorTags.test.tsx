// // // src/tests/VendorTags.test.tsx
// // import React from 'react';
// // import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// // import userEvent from '@testing-library/user-event';
// // import { vi } from 'vitest';
// // import VendorTags from '../pages/vendor/VendorTags';
// // import api from '../api';
// //
// // // mock react‑bootstrap so our Spinner, Modal, etc. render simply
// // vi.mock('react-bootstrap', () => {
// //   const FakeModal = (p: any) => (p.show ? <div data-testid="modal">{p.children}</div> : null);
// //   FakeModal.Header = (p: any) => <div>{p.children}</div>;
// //   FakeModal.Body = (p: any) => <div>{p.children}</div>;
// //   FakeModal.Title = (p: any) => <h2>{p.children}</h2>;
// //   FakeModal.Footer = (p: any) => <div>{p.children}</div>;
// //
// //   return {
// //     Button: (p: any) => <button {...p}>{p.children}</button>,
// //     Card: {
// //       Body: (p: any) => <div>{p.children}</div>,
// //       Title: (p: any) => <h3>{p.children}</h3>,
// //       Text: (p: any) => <p>{p.children}</p>,
// //       default: (p: any) => <div>{p.children}</div>,
// //     },
// //     Container: (p: any) => <div>{p.children}</div>,
// //     Row: (p: any) => <div>{p.children}</div>,
// //     Col: (p: any) => <div>{p.children}</div>,
// //     Modal: FakeModal,
// //     Form: {
// //       Group: (p: any) => <div>{p.children}</div>,
// //       Label: (p: any) => <label>{p.children}</label>,
// //       Control: (p: any) => <input {...p} />,
// //     },
// //     Spinner: () => <div>Loading...</div>,
// //     Alert: (p: any) => <div role="alert">{p.children}</div>,
// //   };
// // });
// //
// // vi.mock('../api');
// // const mockedGet = api.get as vi.Mock;
// // const mockedPost = api.post as vi.Mock;
// // const mockedPut = api.put as vi.Mock;
// // const mockedDelete = api.delete as vi.Mock;
// //
// // describe('<VendorTags />', () => {
// //   beforeEach(() => {
// //     vi.resetAllMocks();
// //   });
// //
// //   it('shows spinner then renders fetched tags', async () => {
// //     // initial stub: two tags
// //     mockedGet.mockResolvedValueOnce({ data: { results: [
// //       { uuid: 't1', name: 'Tag One', slug: 'tag-one' },
// //       { uuid: 't2', name: 'Tag Two', slug: 'tag-two' },
// //     ] } });
// //
// //     render(<VendorTags />);
// //
// //     // spinner visible during load
// //     expect(screen.getByText('Loading...')).toBeInTheDocument();
// //
// //     // after fetch, spinner goes away and cards appear
// //     await waitFor(() => {
// //       expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
// //     });
// //
// //     expect(screen.getByRole('heading', { level: 3, name: 'Tag One' })).toBeInTheDocument();
// //     expect(screen.getByText(/Slug: tag-one/)).toBeInTheDocument();
// //     expect(screen.getByRole('heading', { level: 3, name: 'Tag Two' })).toBeInTheDocument();
// //   });
// //
// //   it('creates a tag successfully', async () => {
// //     // initial load: empty
// //     mockedGet.mockResolvedValueOnce({ data: { results: [] } });
// //     render(<VendorTags />);
// //
// //     await waitFor(() => expect(mockedGet).toHaveBeenCalled());
// //
// //     // open create modal
// //     userEvent.click(screen.getByRole('button', { name: /create tag/i }));
// //     expect(screen.getByTestId('modal')).toBeInTheDocument();
// //
// //     // fill form
// //     const inputs = screen.getAllByRole('textbox');
// //     // first textbox: name, second: slug
// //     userEvent.type(inputs[0], 'New Tag');
// //     userEvent.type(inputs[1], 'new-tag');
// //
// //     // stub create response
// //     mockedPost.mockResolvedValueOnce({ data: { uuid: 't3', name: 'New Tag', slug: 'new-tag' } });
// //
// //     // submit
// //     userEvent.click(screen.getByRole('button', { name: /^create$/i }));
// //
// //     // after create, new card should appear and modal close
// //     await waitFor(() => {
// //       expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
// //     });
// //     expect(screen.getByRole('heading', { name: 'New Tag' })).toBeInTheDocument();
// //     expect(screen.getByRole('alert')).toHaveTextContent('Tag created successfully');
// //   });
// //
// //   it('shows error if create fails', async () => {
// //     mockedGet.mockResolvedValueOnce({ data: { results: [] } });
// //     render(<VendorTags />);
// //     await waitFor(() => expect(mockedGet).toHaveBeenCalled());
// //
// //     userEvent.click(screen.getByRole('button', { name: /create tag/i }));
// //     const inputs = screen.getAllByRole('textbox');
// //     userEvent.type(inputs[0], 'X');
// //     userEvent.type(inputs[1], 'x');
// //     mockedPost.mockRejectedValueOnce(new Error('fail'));
// //     userEvent.click(screen.getByRole('button', { name: /^create$/i }));
// //
// //     await waitFor(() => {
// //       expect(screen.getByRole('alert')).toHaveTextContent('Failed to create tag');
// //     });
// //   });
// //
// //   it('edits a tag and prevents duplicate slug', async () => {
// //     // initial tags: two
// //     const t1 = { uuid: 't1', id: 1, name: 'A', slug: 'a' };
// //     const t2 = { uuid: 't2', id: 2, name: 'B', slug: 'b' };
// //     mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });
// //
// //     render(<VendorTags />);
// //     await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
// //
// //     // click edit on first
// //     userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
// //     expect(screen.getByTestId('modal')).toBeInTheDocument();
// //
// //     // change slug to 'b' which already exists
// //     const slugInput = screen.getAllByRole('textbox')[0]; // in edit only one fieldset
// //     userEvent.clear(slugInput);
// //     userEvent.type(slugInput, 'b');
// //
// //     // stub get for existing tags inside update flow
// //     mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });
// //     userEvent.click(screen.getByRole('button', { name: /update/i }));
// //
// //     await waitFor(() => {
// //       expect(screen.getByRole('alert')).toHaveTextContent('This slug already exists');
// //     });
// //   });
// //
// //   it('updates a tag successfully', async () => {
// //     const t1 = { uuid: 't1', id: 1, name: 'A', slug: 'a' };
// //     mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
// //
// //     render(<VendorTags />);
// //     await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
// //
// //     // open edit, change name
// //     userEvent.click(screen.getByRole('button', { name: /edit/i }));
// //     const nameInput = screen.getAllByRole('textbox')[0];
// //     userEvent.clear(nameInput);
// //     userEvent.type(nameInput, 'A+');
// //
// //     // stub get existing
// //     mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
// //     // stub put
// //     mockedPut.mockResolvedValueOnce({ data: { ...t1, name: 'A+' } });
// //
// //     userEvent.click(screen.getByRole('button', { name: /update/i }));
// //
// //     await waitFor(() => {
// //       expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
// //     });
// //     expect(screen.getByRole('heading', { name: 'A+' })).toBeInTheDocument();
// //     expect(screen.getByRole('alert')).toHaveTextContent('Tag updated successfully');
// //   });
// //
// //   it('deletes a tag successfully', async () => {
// //     const t1 = { uuid: 't1', name: 'DeleteMe', slug: 'del' };
// //     mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
// //
// //     render(<VendorTags />);
// //     await waitFor(() => expect(screen.getByText('DeleteMe')).toBeInTheDocument());
// //
// //     // open delete confirm
// //     userEvent.click(screen.getByRole('button', { name: /delete/i }));
// //     expect(screen.getByTestId('modal')).toBeInTheDocument();
// //
// //     mockedDelete.mockResolvedValueOnce({});
// //     userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
// //
// //     await waitFor(() => {
// //       expect(screen.queryByText('DeleteMe')).not.toBeInTheDocument();
// //     });
// //     expect(screen.getByRole('alert')).toHaveTextContent('Tag deleted successfully');
// //   });
// // });
//
// // src/tests/VendorTags.test.tsx
// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import { vi } from 'vitest';
// import VendorTags from '../pages/vendor/VendorTags';
// import api from '../api';
//
// // --- MOCK react‑bootstrap ---
// vi.mock('react-bootstrap', () => {
//   // Fake Modal
//   const FakeModal: any = (props: any) =>
//     props.show ? <div data-testid="modal">{props.children}</div> : null;
//   FakeModal.Header = (p: any) => <div>{p.children}</div>;
//   FakeModal.Body   = (p: any) => <div>{p.children}</div>;
//   FakeModal.Title  = (p: any) => <h2>{p.children}</h2>;
//   FakeModal.Footer = (p: any) => <div>{p.children}</div>;
//
//   // Fake Card (function + sub‑components)
//   const Card: any = (p: any) => <div>{p.children}</div>;
//   Card.Body  = (p: any) => <div>{p.children}</div>;
//   Card.Title = (p: any) => <h3>{p.children}</h3>;
//   Card.Text  = (p: any) => <p>{p.children}</p>;
//
//   return {
//     Button:    (p: any) => <button {...p}>{p.children}</button>,
//     Container: (p: any) => <div>{p.children}</div>,
//     Row:       (p: any) => <div>{p.children}</div>,
//     Col:       (p: any) => <div>{p.children}</div>,
//     Modal:     FakeModal,
//     Spinner:   ()   => <div>Loading...</div>,
//     Alert:     (p: any) => <div role="alert">{p.children}</div>,
//     Form: {
//       Group:   (p: any) => <div>{p.children}</div>,
//       Label:   (p: any) => <label>{p.children}</label>,
//       Control: (p: any) => <input {...p} />,
//     },
//     Card,
//   };
// });
//
// // --- MOCK api ---
// vi.mock('../api');
// const mockedGet    = api.get    as vi.Mock;
// const mockedPost   = api.post   as vi.Mock;
// const mockedPut    = api.put    as vi.Mock;
// const mockedDelete = api.delete as vi.Mock;
//
// describe('<VendorTags />', () => {
//   beforeEach(() => {
//     vi.resetAllMocks();
//   });
//
//   it('shows spinner then renders fetched tags', async () => {
//     mockedGet.mockResolvedValueOnce({
//       data: { results: [
//         { uuid: 't1', name: 'Tag One', slug: 'tag-one' },
//         { uuid: 't2', name: 'Tag Two', slug: 'tag-two' },
//       ] }
//     });
//
//     render(<VendorTags />);
//
//     // There are two "Loading..." elements (wrapper + spinner text)
//     await waitFor(() => {
//       expect(screen.getAllByText('Loading...')).toHaveLength(2);
//     });
//
//     // After fetch, spinner goes away
//     await waitFor(() => {
//       expect(screen.queryAllByText('Loading...')).toHaveLength(0);
//     });
//
//     expect(
//       screen.getByRole('heading', { level: 3, name: 'Tag One' })
//     ).toBeInTheDocument();
//     expect(screen.getByText(/Slug: tag-two/)).toBeInTheDocument();
//   });
//
//   it('creates a tag successfully', async () => {
//     mockedGet.mockResolvedValueOnce({ data: { results: [] } });
//     render(<VendorTags />);
//     await waitFor(() => expect(mockedGet).toHaveBeenCalled());
//
//     fireEvent.click(screen.getByRole('button', { name: /create tag/i }));
//     expect(screen.getByTestId('modal')).toBeInTheDocument();
//
//     const [nameInput, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
//     fireEvent.change(nameInput, { target: { value: 'New Tag' } });
//     fireEvent.change(slugInput, { target: { value: 'new-tag' } });
//
//     mockedPost.mockResolvedValueOnce({
//       data: { uuid: 't3', name: 'New Tag', slug: 'new-tag' }
//     });
//     fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
//
//     await waitFor(() => {
//       expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
//     });
//
//     expect(
//       screen.getByRole('heading', { level: 3, name: 'New Tag' })
//     ).toBeInTheDocument();
//     expect(screen.getByRole('alert')).toHaveTextContent('Tag created successfully');
//   });
//
//   it('shows error if create fails', async () => {
//     mockedGet.mockResolvedValueOnce({ data: { results: [] } });
//     render(<VendorTags />);
//     await waitFor(() => expect(mockedGet).toHaveBeenCalled());
//
//     fireEvent.click(screen.getByRole('button', { name: /create tag/i }));
//     const [ni, si] = screen.getAllByRole('textbox') as HTMLInputElement[];
//     fireEvent.change(ni, { target: { value: 'X' } });
//     fireEvent.change(si, { target: { value: 'x' } });
//
//     mockedPost.mockRejectedValueOnce(new Error('fail'));
//     fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
//
//     await waitFor(() => {
//       expect(screen.getByRole('alert')).toHaveTextContent('Failed to create tag');
//     });
//   });
//
//   it('prevents duplicate slug on edit', async () => {
//     const t1 = { uuid: 't1', id: 1, name: 'A', slug: 'a' };
//     const t2 = { uuid: 't2', id: 2, name: 'B', slug: 'b' };
//     mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });
//
//     render(<VendorTags />);
//     await waitFor(() => screen.getByRole('heading', { name: 'A' }));
//
//     fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
//     const [, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
//     fireEvent.change(slugInput, { target: { value: 'b' } });
//
//     // Stub fetch existing tags inside update
//     mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });
//     fireEvent.click(screen.getByRole('button', { name: /update/i }));
//
//     await waitFor(() => {
//       expect(screen.getByRole('alert')).toHaveTextContent('This slug already exists');
//     });
//   });
//
//   it('updates a tag successfully', async () => {
//     const t1 = { uuid: 't1', id: 1, name: 'A', slug: 'a' };
//     mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
//
//     render(<VendorTags />);
//     await waitFor(() => screen.getByRole('heading', { name: 'A' }));
//
//     fireEvent.click(screen.getByRole('button', { name: /edit/i }));
//     const [nameInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
//     fireEvent.change(nameInput, { target: { value: 'A+' } });
//
//     mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
//     mockedPut.mockResolvedValueOnce({ data: { ...t1, name: 'A+' } });
//     fireEvent.click(screen.getByRole('button', { name: /update/i }));
//
//     await waitFor(() => {
//       expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
//     });
//     expect(
//       screen.getByRole('heading', { level: 3, name: 'A+' })
//     ).toBeInTheDocument();
//     expect(screen.getByRole('alert')).toHaveTextContent('Tag updated successfully');
//   });
//
//   it('deletes a tag successfully', async () => {
//     const t1 = { uuid: 't1', name: 'DeleteMe', slug: 'del' };
//     mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
//
//     render(<VendorTags />);
//     await waitFor(() =>
//       screen.getByRole('heading', { level: 3, name: 'DeleteMe' })
//     );
//
//     fireEvent.click(screen.getByRole('button', { name: /delete$/i }));
//     expect(screen.getByTestId('modal')).toBeInTheDocument();
//
//     mockedDelete.mockResolvedValueOnce({});
//     fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
//
//     await waitFor(() => {
//       expect(
//         screen.queryByRole('heading', { level: 3, name: 'DeleteMe' })
//       ).toBeNull();
//     });
//     expect(screen.getByRole('alert')).toHaveTextContent('Tag deleted successfully');
//   });
// });

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
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /create tag/i }));
    expect(screen.getByTestId('modal')).toBeTruthy();

    const [nameInput, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(nameInput, { target: { value: 'New Tag' } });
    fireEvent.change(slugInput, { target: { value: 'new-tag' } });

    mockedPost.mockResolvedValueOnce({ data: { uuid: 't3', name: 'New Tag', slug: 'new-tag' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 3, name: 'New Tag' })).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveTextContent('Tag created successfully');
  });

  it('shows error if create fails', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } });
    render(<VendorTags />);
    await waitFor(() => expect(mockedGet).toHaveBeenCalled());

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
    const t1 = { uuid: 't1', id: 1, name: 'A', slug: 'a' };
    const t2 = { uuid: 't2', id: 2, name: 'B', slug: 'b' };
    mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });

    render(<VendorTags />);
    await waitFor(() => screen.getByRole('heading', { name: 'A' }));

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    const [, slugInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(slugInput, { target: { value: 'b' } });

    mockedGet.mockResolvedValueOnce({ data: { results: [t1, t2] } });
    fireEvent.click(screen.getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('This slug already exists');
    });
  });

  it('updates a tag successfully', async () => {
    const t1 = { uuid: 't1', id: 1, name: 'A', slug: 'a' };
    mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });

    render(<VendorTags />);
    await waitFor(() => screen.getByRole('heading', { name: 'A' }));

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    const [nameInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(nameInput, { target: { value: 'A+' } });

    mockedGet.mockResolvedValueOnce({ data: { results: [t1] } });
    mockedPut.mockResolvedValueOnce({ data: { ...t1, name: 'A+' } });
    fireEvent.click(screen.getByRole('button', { name: /update/i }));

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
    await waitFor(() => screen.getByRole('heading', { level: 3, name: 'DeleteMe' }));

    fireEvent.click(screen.getByRole('button', { name: /delete$/i }));
    expect(screen.getByTestId('modal')).toBeTruthy();

    mockedDelete.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 3, name: 'DeleteMe' })).toBeNull();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Tag deleted successfully');
  });
});
