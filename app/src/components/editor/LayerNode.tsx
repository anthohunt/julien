import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LayerNodeData } from '@/types/network';
import './LayerNode.css';

type LayerNodeProps = NodeProps & { data: LayerNodeData };

function LayerNodeComponent({ data, selected }: LayerNodeProps) {
  return (
    <div className={`layer-node ${selected ? 'layer-node--selected' : ''}`} data-category={data.category}>
      <Handle type="target" position={Position.Top} className="layer-node__handle" />
      <div className="layer-node__body">
        <div className="layer-node__label">{data.label}</div>
        <div className="layer-node__type">{data.layerType}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="layer-node__handle" />
    </div>
  );
}

export const LayerNodeMemo = memo(LayerNodeComponent);
