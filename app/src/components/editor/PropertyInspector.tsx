import { useNetworkStore } from '@/stores/networkStore';
import type { LayerNode } from '@/types/network';
import './PropertyInspector.css';

interface Props {
  node: LayerNode;
}

export function PropertyInspector({ node }: Props) {
  const updateNodeParam = useNetworkStore((s) => s.updateNodeParam);
  const params = node.data.params;

  const handleChange = (key: string, raw: string, currentValue: number | string | boolean) => {
    if (typeof currentValue === 'number') {
      const num = parseFloat(raw);
      if (!isNaN(num)) updateNodeParam(node.id, key, num);
    } else if (typeof currentValue === 'boolean') {
      updateNodeParam(node.id, key, raw === 'true');
    } else {
      updateNodeParam(node.id, key, raw);
    }
  };

  return (
    <aside className="property-inspector" data-testid="property-inspector">
      <h2 className="property-inspector__title">Propriétés</h2>
      <div className="property-inspector__header">
        <span className="property-inspector__node-label">{node.data.label}</span>
        <span className="property-inspector__node-type">{node.data.layerType}</span>
      </div>

      {Object.keys(params).length === 0 ? (
        <p className="property-inspector__empty">Aucun paramètre configurable</p>
      ) : (
        <div className="property-inspector__fields">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="property-inspector__field">
              <label className="property-inspector__label" htmlFor={`param-${key}`}>
                {key}
              </label>
              {typeof value === 'boolean' ? (
                <select
                  id={`param-${key}`}
                  className="property-inspector__select"
                  value={String(value)}
                  onChange={(e) => handleChange(key, e.target.value, value)}
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : key === 'activation' || key === 'function' ? (
                <select
                  id={`param-${key}`}
                  className="property-inspector__select"
                  value={String(value)}
                  onChange={(e) => handleChange(key, e.target.value, value)}
                >
                  <option value="relu">ReLU</option>
                  <option value="sigmoid">Sigmoid</option>
                  <option value="tanh">Tanh</option>
                  <option value="softmax">Softmax</option>
                  <option value="gelu">GELU</option>
                </select>
              ) : (
                <input
                  id={`param-${key}`}
                  className="property-inspector__input"
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={String(value)}
                  onChange={(e) => handleChange(key, e.target.value, value)}
                  step={typeof value === 'number' && value < 1 ? '0.01' : '1'}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
