import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SeriesStatsPanel } from './SeriesStats';
import type { SeriesStats } from '@/types/dataset';

const stats: SeriesStats[] = [
  {
    uniqueId: 'productA',
    nbPoints: 12,
    dateRange: ['2020-01-01', '2020-12-01'],
    min: 100,
    max: 900,
    mean: 500,
  },
  {
    uniqueId: 'productB',
    nbPoints: 6,
    dateRange: ['2020-03-01', '2020-08-01'],
    min: 50,
    max: 300,
    mean: 175,
  },
];

describe('US-D5: Per-series stats', () => {
  it('renders stats for each series', () => {
    render(<SeriesStatsPanel stats={stats} />);
    expect(screen.getByText('productA')).toBeInTheDocument();
    expect(screen.getByText('productB')).toBeInTheDocument();
  });

  it('displays number of points', () => {
    render(<SeriesStatsPanel stats={stats} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('displays date range', () => {
    render(<SeriesStatsPanel stats={stats} />);
    expect(screen.getByText(/2020-01-01.*2020-12-01/)).toBeInTheDocument();
    expect(screen.getByText(/2020-03-01.*2020-08-01/)).toBeInTheDocument();
  });

  it('displays min/max values', () => {
    render(<SeriesStatsPanel stats={stats} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('900')).toBeInTheDocument();
  });

  it('displays mean value', () => {
    render(<SeriesStatsPanel stats={stats} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('175')).toBeInTheDocument();
  });

  it('shows column headers', () => {
    render(<SeriesStatsPanel stats={stats} />);
    expect(screen.getByText(/points/i)).toBeInTheDocument();
    expect(screen.getByText(/min/i)).toBeInTheDocument();
    expect(screen.getByText(/max/i)).toBeInTheDocument();
    expect(screen.getByText(/moyenne/i)).toBeInTheDocument();
  });

  it('shows empty state when no stats', () => {
    render(<SeriesStatsPanel stats={[]} />);
    expect(screen.getByText(/aucune statistique/i)).toBeInTheDocument();
  });
});
