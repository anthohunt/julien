import { create } from 'zustand';
import type { CsvRow, Dataset, SeriesStats } from '@/types/dataset';

interface DatasetState {
  datasets: Dataset[];
  addDataset: (name: string, rows: CsvRow[]) => void;
  deleteDataset: (id: string) => void;
  toggleSeries: (datasetId: string, uniqueId: string) => void;
  selectAllSeries: (datasetId: string) => void;
  deselectAllSeries: (datasetId: string) => void;
  getSeriesStats: (dataset: Dataset) => SeriesStats[];
}

function extractSeries(rows: CsvRow[]): string[] {
  return [...new Set(rows.map((r) => r.unique_id))];
}

export function computeSeriesStats(rows: CsvRow[], series: string[]): SeriesStats[] {
  return series.map((uid) => {
    const seriesRows = rows.filter((r) => r.unique_id === uid);
    const values = seriesRows.map((r) => r.y);
    const dates = seriesRows.map((r) => r.ds).sort();
    return {
      uniqueId: uid,
      nbPoints: seriesRows.length,
      dateRange: [dates[0] ?? '', dates[dates.length - 1] ?? ''] as [string, string],
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
    };
  });
}

export const useDatasetStore = create<DatasetState>((set, get) => ({
  datasets: [],

  addDataset: (name, rows) => {
    const series = extractSeries(rows);
    const dataset: Dataset = {
      id: crypto.randomUUID(),
      name,
      importedAt: new Date().toISOString(),
      rows,
      series,
      selectedSeries: [...series],
    };
    set((state) => ({ datasets: [...state.datasets, dataset] }));
  },

  deleteDataset: (id) => {
    set((state) => ({ datasets: state.datasets.filter((d) => d.id !== id) }));
  },

  toggleSeries: (datasetId, uniqueId) => {
    set((state) => ({
      datasets: state.datasets.map((d) => {
        if (d.id !== datasetId) return d;
        const selected = d.selectedSeries.includes(uniqueId)
          ? d.selectedSeries.filter((s) => s !== uniqueId)
          : [...d.selectedSeries, uniqueId];
        return { ...d, selectedSeries: selected };
      }),
    }));
  },

  selectAllSeries: (datasetId) => {
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === datasetId ? { ...d, selectedSeries: [...d.series] } : d
      ),
    }));
  },

  deselectAllSeries: (datasetId) => {
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === datasetId ? { ...d, selectedSeries: [] } : d
      ),
    }));
  },

  getSeriesStats: (dataset) => {
    return computeSeriesStats(dataset.rows, dataset.series);
  },
}));
