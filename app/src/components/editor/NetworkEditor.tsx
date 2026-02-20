import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  type ReactFlowInstance,
  type OnConnectStartParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { load } from '@tauri-apps/plugin-store';
import { useNetworkStore } from '@/stores/networkStore';
import type { LayerDefinition, LayerNode } from '@/types/network';
import { ALL_LAYERS } from '@/types/network';
import { canConnect, getCompatibleLayers } from '@/types/connectionGrammar';
import { LayerPalette } from './LayerPalette';
import { PropertyInspector } from './PropertyInspector';
import { Toolbar } from './Toolbar';
import { LayerNodeMemo } from './LayerNode';
import './NetworkEditor.css';

const nodeTypes = { layerNode: LayerNodeMemo };

/* ── Edge-drop popup state ──────────────────────────────────── */
interface DropPopupState {
  screenX: number;
  screenY: number;
  flowX: number;
  flowY: number;
  anchorNodeId: string;
  /** Which handle the drag started from on the anchor node */
  handleType: 'source' | 'target';
}

export function NetworkEditor() {
  const reactFlowInstance = useRef<ReactFlowInstance<LayerNode> | null>(null);

  const nodes = useNetworkStore((s) => s.nodes);
  const edges = useNetworkStore((s) => s.edges);
  const onNodesChange = useNetworkStore((s) => s.onNodesChange);
  const onEdgesChange = useNetworkStore((s) => s.onEdgesChange);
  const onConnect = useNetworkStore((s) => s.onConnect);
  const addNode = useNetworkStore((s) => s.addNode);
  const addNodeWithEdge = useNetworkStore((s) => s.addNodeWithEdge);
  const selectNode = useNetworkStore((s) => s.selectNode);
  const selectedNodeId = useNetworkStore((s) => s.selectedNodeId);
  const deleteEdge = useNetworkStore((s) => s.deleteEdge);

  const [searchParams] = useSearchParams();
  const loadFromJSON = useNetworkStore((s) => s.loadFromJSON);

  /* ── Connection-start tracking (for edge-drop popup) ────── */
  const connectStartRef = useRef<{ nodeId: string; handleType: 'source' | 'target' } | null>(null);
  const [dropPopup, setDropPopup] = useState<DropPopupState | null>(null);

  /* ── Load saved architecture ──────────────────────────────── */
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const store = await load(`project-${projectId}.json`);
        const arch = await store.get<Record<string, unknown>>('architecture');
        if (arch && !cancelled) {
          loadFromJSON(JSON.stringify(arch));
        }
      } catch {
        // No saved architecture yet — use defaults
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams, loadFromJSON]);

  /* ── Click-to-add from palette (macOS Tauri DnD fallback) ── */
  const onPaletteLayerClick = useCallback(
    (layer: LayerDefinition) => {
      if (!reactFlowInstance.current) return;
      const viewport = reactFlowInstance.current.getViewport();
      // Place at center of visible canvas area
      const canvasEl = document.querySelector('.network-editor__canvas');
      const w = canvasEl?.clientWidth ?? 800;
      const h = canvasEl?.clientHeight ?? 600;
      const centerX = (-viewport.x + w / 2) / viewport.zoom;
      const centerY = (-viewport.y + h / 2) / viewport.zoom;
      // Slight random offset so stacked clicks don't overlap exactly
      const offset = () => (Math.random() - 0.5) * 60;
      addNode(layer, { x: centerX + offset(), y: centerY + offset() });
    },
    [addNode],
  );

  /* ── Drag-and-drop from palette ───────────────────────────── */
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      console.log('[DnD] onDrop fired on ReactFlow – types:', e.dataTransfer.types);
      const layerData = e.dataTransfer.getData('application/neuralforge-layer');
      console.log('[DnD] onDrop – layerData:', layerData || '(empty)');
      if (!layerData || !reactFlowInstance.current) return;

      const layer: LayerDefinition = JSON.parse(layerData);
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(layer, position);
    },
    [addNode],
  );

  /* ── Wrapper-level DnD fallback (macOS Tauri webview) ────── */
  const onWrapperDragOver = useCallback((e: DragEvent) => {
    // Only act if it hasn't been handled by ReactFlow already
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onWrapperDrop = useCallback(
    (e: DragEvent) => {
      // Fallback: if ReactFlow didn't consume the drop, handle it here
      const layerData = e.dataTransfer.getData('application/neuralforge-layer');
      console.log('[DnD] onWrapperDrop fired – layerData:', layerData || '(empty)');
      if (!layerData || !reactFlowInstance.current) return;

      e.preventDefault();
      const layer: LayerDefinition = JSON.parse(layerData);
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(layer, position);
    },
    [addNode],
  );

  /* ── Node / pane / edge clicks ────────────────────────────── */
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: LayerNode) => {
      selectNode(node.id);
    },
    [selectNode],
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    setDropPopup(null);
  }, [selectNode]);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      deleteEdge(edge.id);
    },
    [deleteEdge],
  );

  /* ── Connection validation (layer compatibility) ──────────── */
  const isValidConnection = useCallback(
    (connection: { source: string; target: string }) => {
      const srcNode = nodes.find((n) => n.id === connection.source);
      const tgtNode = nodes.find((n) => n.id === connection.target);
      if (!srcNode || !tgtNode) return false;
      return canConnect(srcNode.data.layerType, tgtNode.data.layerType);
    },
    [nodes],
  );

  /* ── Edge drop on empty canvas → show layer popup ─────────── */
  const onConnectStart = useCallback(
    (_: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
      if (params.nodeId && params.handleType) {
        connectStartRef.current = { nodeId: params.nodeId, handleType: params.handleType };
      }
    },
    [],
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const start = connectStartRef.current;
      connectStartRef.current = null;

      if (!start || !reactFlowInstance.current) return;

      // Check if dropped on the pane (empty canvas)
      const target = event.target as HTMLElement;
      if (!target.classList.contains('react-flow__pane')) return;

      const clientX = 'changedTouches' in event
        ? (event as TouchEvent).changedTouches[0]!.clientX
        : (event as MouseEvent).clientX;
      const clientY = 'changedTouches' in event
        ? (event as TouchEvent).changedTouches[0]!.clientY
        : (event as MouseEvent).clientY;
      const position = reactFlowInstance.current.screenToFlowPosition({ x: clientX, y: clientY });

      setDropPopup({
        screenX: clientX,
        screenY: clientY,
        flowX: position.x,
        flowY: position.y,
        anchorNodeId: start.nodeId,
        handleType: start.handleType,
      });
    },
    [],
  );

  const handlePopupSelect = useCallback(
    (layer: LayerDefinition) => {
      if (!dropPopup) return;
      addNodeWithEdge(
        layer,
        { x: dropPopup.flowX, y: dropPopup.flowY },
        dropPopup.anchorNodeId,
        dropPopup.handleType,
      );
      setDropPopup(null);
    },
    [dropPopup, addNodeWithEdge],
  );

  /* ── Compute compatible layers for popup ─────────────────── */
  const popupLayers = dropPopup
    ? (() => {
        const anchorNode = nodes.find((n) => n.id === dropPopup.anchorNodeId);
        if (!anchorNode) return [];
        const direction = dropPopup.handleType === 'source' ? 'outgoing' : 'incoming';
        return getCompatibleLayers(anchorNode.data.layerType, direction, ALL_LAYERS);
      })()
    : [];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="network-editor" data-testid="network-editor">
      <LayerPalette onLayerClick={onPaletteLayerClick} />
      <div className="network-editor__canvas-area">
        <Toolbar />
        <div
          className="network-editor__canvas"
          onDragOver={onWrapperDragOver}
          onDrop={onWrapperDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            isValidConnection={isValidConnection}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onEdgeClick={onEdgeClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
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

          {/* Edge-drop layer picker popup */}
          {dropPopup && popupLayers.length > 0 && (
            <div
              className="edge-drop-popup"
              style={{ left: dropPopup.screenX, top: dropPopup.screenY }}
            >
              <div className="edge-drop-popup__header">Add Layer</div>
              <ul className="edge-drop-popup__list">
                {popupLayers.map((layer) => (
                  <li
                    key={layer.type}
                    className="edge-drop-popup__item"
                    data-category={layer.category}
                    onClick={() => handlePopupSelect(layer)}
                  >
                    <span className="edge-drop-popup__label">{layer.label}</span>
                    <span className="edge-drop-popup__type">{layer.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {selectedNode && <PropertyInspector node={selectedNode} />}
    </div>
  );
}
