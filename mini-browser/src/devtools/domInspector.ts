import type { MiniNode } from "../html/dom";

export function inspectDOM(node: MiniNode, depth = 0): string {
  const indent = "  ".repeat(depth);

  if (node.type === "document") {
    return [`${indent}Document`, ...node.children.map((child) => inspectDOM(child, depth + 1))].join("\n");
  }

  if (node.type === "text") {
    return `${indent}"${node.text}"`;
  }

  const attrs = Object.entries(node.attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  const label = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`;

  return [indent + label, ...node.children.map((child) => inspectDOM(child, depth + 1))].join("\n");
}
