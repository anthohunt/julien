import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimeseriesChart } from './TimeseriesChart';
import type { CsvRow } from '@/types/dataset';

// Mock echarts-for-react since it needs canvas
vi.mock('echarts-for-react', () => ({
  default: ({ option }: { option: Record<string, unknown> }) => (
    <div data-testid="echarts-mock" data-option={JSON.stringify(option)} />
  ),
}));

const rows: CsvRow[] = [
  { id: 0, unique_id: 'productA', ds: '2020-01-01', y: 840.0 },
  { id: 1, unique_id: 'productA', ds: '2020-02-01', y: 630.0 },
  { id: 2, unique_id: 'productB', ds: '2020-01-01', y: 120.5 },
  { id: 3, unique_id: 'productB', ds: '2020-02-01', y: 200.0 },
];

describe('US-D3: Echarts timeseries visualization', () => {
  it('renders the chart container', () => {
    render(<TimeseriesChart rows={rows} series={['productA', 'productB']} />);
    expect(screen.getByTestId('echarts-mock')).toBeInTheDocument();
  });

  it('passes correct series data to echarts', () => {
    render(<TimeseriesChart rows={rows} series={['productA', 'productB']} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option') ?? '{}');
    expect(option.series).toHaveLength(2);
    expect(option.series[0].name).toBe('productA');
    expect(option.series[1].name).toBe('productB');
  });

  it('includes legend with series names', () => {
    render(<TimeseriesChart rows={rows} series={['productA', 'productB']} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option') ?? '{}');
    expect(option.legend.data).toEqual(['productA', 'productB']);
  });

  it('sets x-axis as time/category axis', () => {
    render(<TimeseriesChart rows={rows} series={['productA', 'productB']} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option') ?? '{}');
    expect(option.xAxis.type).toBe('category');
  });

  it('renders only selected series when filtered', () => {
    render(<TimeseriesChart rows={rows} series={['productA']} />);
    const chart = screen.getByTestId('echarts-mock');
    const option = JSON.parse(chart.getAttribute('data-option') ?? '{}');
    expect(option.series).toHaveLength(1);
    expect(option.series[0].name).toBe('productA');
  });

  it('shows empty state when no series provided', () => {
    render(<TimeseriesChart rows={rows} series={[]} />);
    expect(screen.getByText(/aucune serie/i)).toBeInTheDocument();
  });
});
