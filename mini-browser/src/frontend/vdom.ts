export interface VNode {
  type: string;
  props: Record<string, unknown>;
  children: Array<VNode | string>;
}

export function h(
  type: string,
  props: Record<string, unknown>,
  ...children: Array<VNode | string>
): VNode {
  return { type, props, children };
}

export function changed(a: VNode | string, b: VNode | string) {
  return typeof a !== typeof b || JSON.stringify(a) !== JSON.stringify(b);
}
