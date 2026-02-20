import type { SeriesStats } from '@/types/dataset';
import './SeriesStats.css';

interface SeriesStatsPanelProps {
  stats: SeriesStats[];
}

export function SeriesStatsPanel({ stats }: SeriesStatsPanelProps) {
  if (stats.length === 0) {
    return <p className="series-stats__empty">Aucune statistique disponible</p>;
  }

  return (
    <div className="series-stats__wrapper">
      <table className="series-stats">
        <thead>
          <tr>
            <th>Serie</th>
            <th>Points</th>
            <th>Periode</th>
            <th>Min</th>
            <th>Max</th>
            <th>Moyenne</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.uniqueId}>
              <td className="series-stats__name">{s.uniqueId}</td>
              <td>{s.nbPoints}</td>
              <td>{s.dateRange[0]} — {s.dateRange[1]}</td>
              <td>{s.min}</td>
              <td>{s.max}</td>
              <td>{s.mean}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
