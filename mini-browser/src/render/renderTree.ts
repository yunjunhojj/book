import type { StyledNode } from "../css/style";

export interface RenderNode {
  styledNode: StyledNode;
  children: RenderNode[];
}

export function buildRenderTree(styledNode: StyledNode): RenderNode | null {
  if (styledNode.style.display === "none") {
    return null;
  }

  const children = styledNode.children
    .map(buildRenderTree)
    .filter((node): node is RenderNode => node !== null);

  return { styledNode, children };
}
