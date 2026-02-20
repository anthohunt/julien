import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDatasetStore, computeSeriesStats } from '@/stores/datasetStore';
import type { Dataset } from '@/types/dataset';
import { ImportCsvModal } from './ImportCsvModal';
import { DeleteDatasetModal } from './DeleteDatasetModal';
import { DatasetDetail } from './DatasetDetail';
import './DataManagementPage.css';

export function DataManagementPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const datasets = useDatasetStore((s) => s.datasets);
  const addDataset = useDatasetStore((s) => s.addDataset);
  const deleteDataset = useDatasetStore((s) => s.deleteDataset);

  const [showImport, setShowImport] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const projectId = searchParams.get('project');

  const handleImport = useCallback(
    (fileName: string, content: string) => {
      addDataset(fileName, parseCsvContent(content));
      setShowImport(false);
    },
    [addDataset]
  );

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  if (selectedDataset) {
    return (
      <DatasetDetail
        dataset={selectedDataset}
        onBack={() => setSelectedDatasetId(null)}
      />
    );
  }

  return (
    <div className="data-page">
      <header className="data-page__header">
        <div className="data-page__nav">
          <button
            className="data-page__back"
            onClick={() => navigate(`/editor?project=${projectId ?? ''}`)}
          >
            ← Retour
          </button>
          <h1 className="data-page__title">Gestion des donnees</h1>
        </div>
        <button className="data-page__import-btn" onClick={() => setShowImport(true)}>
          + Importer CSV
        </button>
      </header>

      <main className="data-page__content">
        {datasets.length === 0 ? (
          <div className="data-page__empty">
            <p>Aucun dataset</p>
            <p className="data-page__empty-hint">Importez un fichier CSV pour commencer</p>
          </div>
        ) : (
          <div className="data-page__grid">
            {datasets.map((ds) => {
              const stats = computeSeriesStats(ds.rows, ds.series);
              return (
                <div key={ds.id} className="dataset-card" onClick={() => setSelectedDatasetId(ds.id)}>
                  <div className="dataset-card__header">
                    <h3 className="dataset-card__name">{ds.name}</h3>
                    <button
                      className="dataset-card__delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDatasetToDelete(ds);
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="dataset-card__stats">
                    <span>{ds.series.length} series</span>
                    <span>{ds.rows.length} points</span>
                    <span>
                      {ds.selectedSeries.length}/{ds.series.length} selectionnees
                    </span>
                  </div>
                  <span
                    className={`dataset-card__badge ${
                      ds.selectedSeries.length === ds.series.length
                        ? 'dataset-card__badge--ready'
                        : 'dataset-card__badge--partial'
                    }`}
                  >
                    {ds.selectedSeries.length === ds.series.length ? 'Pret' : 'Partiel'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ImportCsvModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      <DeleteDatasetModal
        isOpen={datasetToDelete !== null}
        datasetName={datasetToDelete?.name ?? ''}
        onClose={() => setDatasetToDelete(null)}
        onConfirm={() => {
          if (datasetToDelete) deleteDataset(datasetToDelete.id);
        }}
      />
    </div>
  );
}

function parseCsvContent(content: string): { id: number; unique_id: string; ds: string; y: number }[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const parts = line.split(',').map((s) => s.trim());
    return {
      id: parseInt(parts[0] ?? '0', 10),
      unique_id: parts[1] ?? '',
      ds: parts[2] ?? '',
      y: parseFloat(parts[3] ?? '0'),
    };
  });
}
