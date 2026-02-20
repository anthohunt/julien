import { describe, it, expect, beforeEach } from 'vitest';
import { useDatasetStore } from './datasetStore';
import type { CsvRow } from '@/types/dataset';

const sampleRows: CsvRow[] = [
  { id: 0, unique_id: 'productA', ds: '2020-01-01', y: 840.0 },
  { id: 1, unique_id: 'productA', ds: '2020-02-01', y: 630.0 },
  { id: 2, unique_id: 'productB', ds: '2020-01-01', y: 120.5 },
];

describe('US-D6: Delete dataset + store operations', () => {
  beforeEach(() => {
    useDatasetStore.setState({ datasets: [] });
  });

  it('adds a dataset', () => {
    useDatasetStore.getState().addDataset('test.csv', sampleRows);
    const datasets = useDatasetStore.getState().datasets;
    expect(datasets).toHaveLength(1);
    expect(datasets[0]!.name).toBe('test.csv');
    expect(datasets[0]!.rows).toHaveLength(3);
    expect(datasets[0]!.series).toEqual(['productA', 'productB']);
  });

  it('deletes a dataset by id', () => {
    useDatasetStore.getState().addDataset('test.csv', sampleRows);
    const id = useDatasetStore.getState().datasets[0]!.id;
    useDatasetStore.getState().deleteDataset(id);
    expect(useDatasetStore.getState().datasets).toHaveLength(0);
  });

  it('does not delete other datasets', () => {
    useDatasetStore.getState().addDataset('first.csv', sampleRows);
    useDatasetStore.getState().addDataset('second.csv', sampleRows);
    const firstId = useDatasetStore.getState().datasets[0]!.id;
    useDatasetStore.getState().deleteDataset(firstId);
    const remaining = useDatasetStore.getState().datasets;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]!.name).toBe('second.csv');
  });

  it('auto-selects all series on import', () => {
    useDatasetStore.getState().addDataset('test.csv', sampleRows);
    const ds = useDatasetStore.getState().datasets[0]!;
    expect(ds.selectedSeries).toEqual(['productA', 'productB']);
  });

  it('toggles series selection', () => {
    useDatasetStore.getState().addDataset('test.csv', sampleRows);
    const id = useDatasetStore.getState().datasets[0]!.id;
    useDatasetStore.getState().toggleSeries(id, 'productA');
    expect(useDatasetStore.getState().datasets[0]!.selectedSeries).toEqual(['productB']);
    useDatasetStore.getState().toggleSeries(id, 'productA');
    expect(useDatasetStore.getState().datasets[0]!.selectedSeries).toContain('productA');
  });

  it('select all / deselect all', () => {
    useDatasetStore.getState().addDataset('test.csv', sampleRows);
    const id = useDatasetStore.getState().datasets[0]!.id;
    useDatasetStore.getState().deselectAllSeries(id);
    expect(useDatasetStore.getState().datasets[0]!.selectedSeries).toHaveLength(0);
    useDatasetStore.getState().selectAllSeries(id);
    expect(useDatasetStore.getState().datasets[0]!.selectedSeries).toEqual(['productA', 'productB']);
  });

  it('computes series stats', () => {
    useDatasetStore.getState().addDataset('test.csv', sampleRows);
    const ds = useDatasetStore.getState().datasets[0]!;
    const stats = useDatasetStore.getState().getSeriesStats(ds);
    expect(stats).toHaveLength(2);
    const statsA = stats.find((s) => s.uniqueId === 'productA')!;
    expect(statsA.nbPoints).toBe(2);
    expect(statsA.min).toBe(630);
    expect(statsA.max).toBe(840);
    expect(statsA.mean).toBe(735);
  });
});
