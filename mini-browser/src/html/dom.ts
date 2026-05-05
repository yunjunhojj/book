export type MiniNode = DocumentNode | ElementNode | TextNode;

export interface BaseNode {
  parent: MiniNode | null;
  children: MiniNode[];
}

export interface DocumentNode extends BaseNode {
  type: "document";
}

export interface ElementNode extends BaseNode {
  type: "element";
  tagName: string;
  attributes: Record<string, string>;
}

export interface TextNode extends BaseNode {
  type: "text";
  text: string;
}

export function createDocument(): DocumentNode {
  return { type: "document", parent: null, children: [] };
}

export function createElement(
  tagName: string,
  attributes: Record<string, string>,
): ElementNode {
  return { type: "element", tagName, attributes, parent: null, children: [] };
}

export function createText(text: string): TextNode {
  return { type: "text", text, parent: null, children: [] };
}

export function appendChild(parent: MiniNode, child: MiniNode) {
  child.parent = parent;
  parent.children.push(child);
}
