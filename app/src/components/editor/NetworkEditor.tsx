import { useCallback, useRef, type DragEvent } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNetworkStore } from '@/stores/networkStore';
import type { LayerDefinition, LayerNode } from '@/types/network';
import { LayerPalette } from './LayerPalette';
import { PropertyInspector } from './PropertyInspector';
import { Toolbar } from './Toolbar';
import { LayerNodeMemo } from './LayerNode';
import './NetworkEditor.css';

const nodeTypes = { layerNode: LayerNodeMemo };

export function NetworkEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance<LayerNode> | null>(null);

  const nodes = useNetworkStore((s) => s.nodes);
  const edges = useNetworkStore((s) => s.edges);
  const onNodesChange = useNetworkStore((s) => s.onNodesChange);
  const onEdgesChange = useNetworkStore((s) => s.onEdgesChange);
  const onConnect = useNetworkStore((s) => s.onConnect);
  const addNode = useNetworkStore((s) => s.addNode);
  const selectNode = useNetworkStore((s) => s.selectNode);
  const selectedNodeId = useNetworkStore((s) => s.selectedNodeId);
  const deleteEdge = useNetworkStore((s) => s.deleteEdge);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const layerData = e.dataTransfer.getData('application/neuralforge-layer');
      if (!layerData || !reactFlowInstance.current || !reactFlowWrapper.current) return;

      const layer: LayerDefinition = JSON.parse(layerData);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      addNode(layer, position);
    },
    [addNode],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: LayerNode) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      deleteEdge(edge.id);
    },
    [deleteEdge],
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="network-editor" data-testid="network-editor">
      <LayerPalette />
      <div className="network-editor__canvas-area">
        <Toolbar />
        <div className="network-editor__canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onEdgeClick={onEdgeClick}
            onInit={(instance) => {
              reactFlowInstance.current = instance as unknown as ReactFlowInstance<LayerNode>;
            }}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode="Delete"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
            <Controls className="network-editor__controls" />
            <MiniMap
              className="network-editor__minimap"
              nodeColor={() => 'var(--accent)'}
              maskColor="rgba(15, 15, 26, 0.8)"
            />
          </ReactFlow>
        </div>
      </div>
      {selectedNode && <PropertyInspector node={selectedNode} />}
    </div>
  );
}
