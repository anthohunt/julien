import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataTable } from './DataTable';
import type { CsvRow } from '@/types/dataset';

const rows: CsvRow[] = [
  { id: 0, unique_id: 'productA', ds: '2020-01-01', y: 840.0 },
  { id: 1, unique_id: 'productA', ds: '2020-02-01', y: 630.0 },
  { id: 2, unique_id: 'productB', ds: '2020-01-01', y: 120.5 },
];

describe('US-D2: Raw data table preview', () => {
  it('renders table headers (id, unique_id, ds, y)', () => {
    render(<DataTable rows={rows} />);
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('unique_id')).toBeInTheDocument();
    expect(screen.getByText('ds')).toBeInTheDocument();
    expect(screen.getByText('y')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<DataTable rows={rows} />);
    expect(screen.getAllByText('productA')).toHaveLength(2);
    expect(screen.getByText('productB')).toBeInTheDocument();
    expect(screen.getByText('840')).toBeInTheDocument();
    expect(screen.getByText('120.5')).toBeInTheDocument();
  });

  it('renders correct number of rows', () => {
    render(<DataTable rows={rows} />);
    // 3 data rows + 1 header row
    const tableRows = screen.getAllByRole('row');
    expect(tableRows).toHaveLength(4);
  });

  it('shows empty state when no rows', () => {
    render(<DataTable rows={[]} />);
    expect(screen.getByText(/aucune donnee/i)).toBeInTheDocument();
  });

  it('displays dates in ds column', () => {
    render(<DataTable rows={rows} />);
    expect(screen.getAllByText('2020-01-01')).toHaveLength(2);
    expect(screen.getByText('2020-02-01')).toBeInTheDocument();
  });
});
