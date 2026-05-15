import type { MiniNode } from "../html/dom";

type Listener = (event: MiniEvent) => void;

export interface MiniEvent {
  type: string;
  target: MiniNode;
  currentTarget: MiniNode | null;
  propagationStopped: boolean;
  stopPropagation(): void;
}

const listeners = new WeakMap<MiniNode, Map<string, Listener[]>>();

export function addEventListener(node: MiniNode, type: string, listener: Listener) {
  const byType = listeners.get(node) ?? new Map<string, Listener[]>();
  const list = byType.get(type) ?? [];

  list.push(listener);
  byType.set(type, list);
  listeners.set(node, byType);
}

export function dispatchEvent(target: MiniNode, type: string) {
  const path = getEventPath(target);
  const event: MiniEvent = {
    type,
    target,
    currentTarget: null,
    propagationStopped: false,
    stopPropagation() {
      this.propagationStopped = true;
    },
  };

  for (const node of path) {
    event.currentTarget = node;
    const list = listeners.get(node)?.get(type) ?? [];
    for (const listener of list) listener(event);
    if (event.propagationStopped) return;
  }
}

function getEventPath(target: MiniNode) {
  const path: MiniNode[] = [];
  let current: MiniNode | null = target;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}
