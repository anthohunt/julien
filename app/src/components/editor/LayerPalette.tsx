import { type DragEvent } from 'react';
import { BURN_LAYERS, UTILITY_LAYERS, type LayerDefinition } from '@/types/network';
import './LayerPalette.css';

interface LayerItemProps {
  layer: LayerDefinition;
  onLayerClick?: (layer: LayerDefinition) => void;
}

function LayerItem({ layer, onLayerClick }: LayerItemProps) {
  const onDragStart = (e: DragEvent) => {
    console.log('[DnD] onDragStart – layer:', layer.type, 'dataTransfer:', e.dataTransfer);
    e.dataTransfer.setData('application/neuralforge-layer', JSON.stringify(layer));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <li
      className="layer-item"
      draggable="true"
      onDragStart={onDragStart}
      onClick={() => onLayerClick?.(layer)}
      data-category={layer.category}
    >
      <span className="layer-item__name">{layer.label}</span>
      <span className="layer-item__type">{layer.type}</span>
    </li>
  );
}

export interface LayerPaletteProps {
  onLayerClick?: (layer: LayerDefinition) => void;
}

export function LayerPalette({ onLayerClick }: LayerPaletteProps) {
  return (
    <aside className="layer-palette" data-testid="layer-palette">
      <h2 className="layer-palette__title">Layers</h2>

      <div className="layer-palette__section">
        <h3 className="layer-palette__heading">Layers Burn</h3>
        <ul className="layer-palette__list">
          {BURN_LAYERS.map((layer) => (
            <LayerItem key={layer.type} layer={layer} onLayerClick={onLayerClick} />
          ))}
        </ul>
      </div>

      <div className="layer-palette__section">
        <h3 className="layer-palette__heading">Utilitaires</h3>
        <ul className="layer-palette__list">
          {UTILITY_LAYERS.map((layer) => (
            <LayerItem key={layer.type} layer={layer} onLayerClick={onLayerClick} />
          ))}
        </ul>
      </div>
    </aside>
  );
}
