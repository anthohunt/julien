/**
 * Connection Grammar — defines which layer types can connect to which.
 *
 * Edit the RULES map to change allowed connections.
 * Each key is a LayerRole; its value lists the roles it may connect TO (as source → target).
 *
 * Roles:
 *   input      — network entry point  (Input layer)
 *   output     — network exit point   (Output layer)
 *   processing — computational layers (Dense, Conv, LSTM, Transformer, Activation, BatchNorm, Dropout)
 *   utility    — structural helpers   (Reshape, Concat, Split)
 */

import type { LayerDefinition } from './network';

export type LayerRole = 'input' | 'processing' | 'output' | 'utility';

/* ── Role classification ──────────────────────────────────── */

const ROLE_MAP: Record<string, LayerRole> = {
  input: 'input',
  output: 'output',
  reshape: 'utility',
  concat: 'utility',
  split: 'utility',
};

/** Returns the role for a given layer type. Defaults to 'processing'. */
export function getLayerRole(layerType: string): LayerRole {
  return ROLE_MAP[layerType] ?? 'processing';
}

/* ── Connection rules ─────────────────────────────────────── */

/**
 * Allowed outgoing connection targets for each source role.
 * If a role is NOT listed as a key, it cannot be a source (e.g. 'output').
 */
const RULES: Partial<Record<LayerRole, Set<LayerRole>>> = {
  input: new Set(['processing']),
  processing: new Set(['processing', 'utility', 'output']),
  utility: new Set(['processing', 'utility', 'output']),
  // output: not listed → cannot be a source
};

/**
 * Returns true if a connection from sourceType → targetType is allowed.
 */
export function canConnect(sourceType: string, targetType: string): boolean {
  const srcRole = getLayerRole(sourceType);
  const tgtRole = getLayerRole(targetType);

  const allowed = RULES[srcRole];
  if (!allowed) return false;          // role cannot be a source (e.g. output)
  if (tgtRole === 'input') return false; // input can never be a target
  return allowed.has(tgtRole);
}

/* ── Handle visibility ────────────────────────────────────── */

/** Whether a layer type should show an input (target) handle. */
export function hasInputHandle(layerType: string): boolean {
  return getLayerRole(layerType) !== 'input';
}

/** Whether a layer type should show an output (source) handle. */
export function hasOutputHandle(layerType: string): boolean {
  return getLayerRole(layerType) !== 'output';
}

/* ── Compatible-layer lookup (for edge-drop popup) ────────── */

export function getCompatibleLayers(
  anchorType: string,
  direction: 'outgoing' | 'incoming',
  allLayers: LayerDefinition[],
): LayerDefinition[] {
  return allLayers.filter((layer) =>
    direction === 'outgoing'
      ? canConnect(anchorType, layer.type)
      : canConnect(layer.type, anchorType),
  );
}
