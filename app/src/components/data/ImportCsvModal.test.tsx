import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ImportCsvModal } from './ImportCsvModal';

describe('US-D1: CSV import drag & drop + modal', () => {
  it('renders modal when isOpen is true', () => {
    render(<ImportCsvModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByText('Importer un fichier CSV')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ImportCsvModal isOpen={false} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.queryByText('Importer un fichier CSV')).not.toBeInTheDocument();
  });

  it('has a drag & drop zone', () => {
    render(<ImportCsvModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByText(/glissez-deposez/i)).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImportCsvModal isOpen={true} onClose={onClose} onImport={vi.fn()} />);
    await user.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles file drop and calls onImport with file content', async () => {
    const onImport = vi.fn();
    render(<ImportCsvModal isOpen={true} onClose={vi.fn()} onImport={onImport} />);

    const dropZone = screen.getByTestId('drop-zone');
    const csvContent = 'id,unique_id,ds,y\n0,productA,2020-01-01,840.0';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    // Wait for FileReader to process
    await vi.waitFor(() => {
      expect(onImport).toHaveBeenCalledWith('test.csv', csvContent);
    });
  });

  it('shows error for non-CSV files', async () => {
    render(<ImportCsvModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const dropZone = screen.getByTestId('drop-zone');
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await vi.waitFor(() => {
      expect(screen.getByText(/csv uniquement/i)).toBeInTheDocument();
    });
  });

  it('highlights drop zone on dragover', () => {
    render(<ImportCsvModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);
    const dropZone = screen.getByTestId('drop-zone');

    fireEvent.dragOver(dropZone);
    expect(dropZone.classList.contains('drop-zone--active')).toBe(true);
  });
});
