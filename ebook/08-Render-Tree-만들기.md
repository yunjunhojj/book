# Part 4. 화면에 그리기

## 8장. Render Tree 만들기

### 이번 장에서 만들 것

스타일이 계산된 DOM에서 실제로 화면에 그려질 노드만 모아 렌더 트리를 만듭니다.

### 먼저 개념 이해하기

DOM Tree는 문서 구조를 나타냅니다. Render Tree는 화면에 그릴 대상만 나타냅니다. `display: none`인 노드는 렌더 트리에 포함되지 않습니다. 반면 `visibility: hidden`인 노드는 보이지 않지만 공간은 차지하므로 렌더 트리에 포함될 수 있습니다.

### TypeScript로 직접 구현하기

```ts
// src/render/renderTree.ts
import { StyledNode } from "../css/style";

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
```

### 면접 질문으로 정리하기

- DOM Tree와 Render Tree는 어떻게 다른가요?
- `display: none`과 `visibility: hidden`은 렌더링 관점에서 어떻게 다른가요?
- Render Tree가 필요한 이유는 무엇인가요?

