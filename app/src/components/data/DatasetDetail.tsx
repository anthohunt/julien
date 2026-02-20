import { useState } from 'react';
import { useDatasetStore, computeSeriesStats } from '@/stores/datasetStore';
import type { Dataset } from '@/types/dataset';
import { DataTable } from './DataTable';
import { TimeseriesChart } from './TimeseriesChart';
import { SeriesSelector } from './SeriesSelector';
import { SeriesStatsPanel } from './SeriesStats';
import './DatasetDetail.css';

type Tab = 'preview' | 'chart' | 'series';

interface DatasetDetailProps {
  dataset: Dataset;
  onBack: () => void;
}

export function DatasetDetail({ dataset, onBack }: DatasetDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const toggleSeries = useDatasetStore((s) => s.toggleSeries);
  const selectAllSeries = useDatasetStore((s) => s.selectAllSeries);
  const deselectAllSeries = useDatasetStore((s) => s.deselectAllSeries);

  const stats = computeSeriesStats(dataset.rows, dataset.series);

  return (
    <div className="dataset-detail">
      <header className="dataset-detail__header">
        <button className="data-page__back" onClick={onBack}>
          ← Retour
        </button>
        <h2 className="dataset-detail__name">{dataset.name}</h2>
      </header>

      <nav className="dataset-detail__tabs">
        <button
          className={`dataset-detail__tab ${activeTab === 'preview' ? 'dataset-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Apercu
        </button>
        <button
          className={`dataset-detail__tab ${activeTab === 'chart' ? 'dataset-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          Graphique
        </button>
        <button
          className={`dataset-detail__tab ${activeTab === 'series' ? 'dataset-detail__tab--active' : ''}`}
          onClick={() => setActiveTab('series')}
        >
          Series
        </button>
      </nav>

      <div className="dataset-detail__content">
        {activeTab === 'preview' && <DataTable rows={dataset.rows} />}
        {activeTab === 'chart' && (
          <TimeseriesChart rows={dataset.rows} series={dataset.selectedSeries} />
        )}
        {activeTab === 'series' && (
          <div className="dataset-detail__series">
            <SeriesSelector
              series={dataset.series}
              selectedSeries={dataset.selectedSeries}
              onToggle={(uid) => toggleSeries(dataset.id, uid)}
              onSelectAll={() => selectAllSeries(dataset.id)}
              onDeselectAll={() => deselectAllSeries(dataset.id)}
            />
            <SeriesStatsPanel stats={stats} />
          </div>
        )}
      </div>
    </div>
  );
}
