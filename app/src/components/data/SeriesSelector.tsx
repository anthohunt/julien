import './SeriesSelector.css';

interface SeriesSelectorProps {
  series: string[];
  selectedSeries: string[];
  onToggle: (uniqueId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SeriesSelector({
  series,
  selectedSeries,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: SeriesSelectorProps) {
  return (
    <div className="series-selector">
      <div className="series-selector__header">
        <span className="series-selector__count">
          {selectedSeries.length} / {series.length} series selectionnees
        </span>
        <div className="series-selector__actions">
          <button className="series-selector__btn" onClick={onSelectAll}>
            Tout selectionner
          </button>
          <button className="series-selector__btn" onClick={onDeselectAll}>
            Tout deselectionner
          </button>
        </div>
      </div>
      <ul className="series-selector__list">
        {series.map((uid) => (
          <li key={uid} className="series-selector__item">
            <label className="series-selector__label">
              <input
                type="checkbox"
                checked={selectedSeries.includes(uid)}
                onChange={() => onToggle(uid)}
                aria-label={uid}
              />
              <span className="series-selector__name">{uid}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
