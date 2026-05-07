import type { ElementNode } from "../html/dom";

export interface Specificity {
  id: number;
  class: number;
  tag: number;
}

export function matchesSelector(node: ElementNode, selector: string): boolean {
  if (selector.startsWith("#")) {
    return node.attributes.id === selector.slice(1);
  }

  if (selector.startsWith(".")) {
    const className = node.attributes.class ?? "";
    return className.split(/\s+/).includes(selector.slice(1));
  }

  return node.tagName === selector.toLowerCase();
}

export function calculateSpecificity(selector: string): Specificity {
  return {
    id: selector.startsWith("#") ? 1 : 0,
    class: selector.startsWith(".") ? 1 : 0,
    tag: selector.startsWith(".") || selector.startsWith("#") ? 0 : 1,
  };
}

export function compareSpecificity(a: Specificity, b: Specificity) {
  if (a.id !== b.id) return a.id - b.id;
  if (a.class !== b.class) return a.class - b.class;
  return a.tag - b.tag;
}
