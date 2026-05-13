import type { ElementNode, MiniNode } from "../html/dom";

export interface MiniDocument {
  querySelector(selector: string): ElementNode | null;
}

export function createMiniDocument(root: MiniNode): MiniDocument {
  return {
    querySelector(selector: string) {
      return findElement(root, selector);
    },
  };
}

function findElement(node: MiniNode, selector: string): ElementNode | null {
  if (node.type === "element") {
    if (selector.startsWith(".") && (node.attributes.class ?? "").split(/\s+/).includes(selector.slice(1))) {
      return node;
    }

    if (selector.startsWith("#") && node.attributes.id === selector.slice(1)) {
      return node;
    }

    if (node.tagName === selector) {
      return node;
    }
  }

  for (const child of node.children) {
    const found = findElement(child, selector);
    if (found) return found;
  }

  return null;
}

export function runScript(code: string, document: MiniDocument) {
  const execute = new Function("document", code);
  execute(document);
}
