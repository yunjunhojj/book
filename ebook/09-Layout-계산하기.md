# Part 4. 화면에 그리기

## 9장. Layout 계산하기

### 이번 장에서 만들 것

렌더 트리의 각 노드에 `x`, `y`, `width`, `height`를 계산해 배치 정보를 부여합니다.

### 먼저 개념 이해하기

Layout은 각 요소가 화면의 어느 위치에 어떤 크기로 놓일지 계산하는 단계입니다. CSS 박스 모델은 네 영역으로 구성됩니다.

- content
- padding
- border
- margin

### TypeScript로 직접 구현하기

```ts
// src/render/layout.ts
import { RenderNode } from "./renderTree";

export interface LayoutBox {
  node: RenderNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutBox[];
}

export interface LayoutContext {
  x: number;
  y: number;
  width: number;
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("px")) {
    return Number(value.slice(0, -2));
  }
  return fallback;
}

export function layout(renderNode: RenderNode, context: LayoutContext): LayoutBox {
  const style = renderNode.styledNode.style;
  const width = numberValue(style.width, context.width);
  const fontSize = numberValue(style.fontSize, 16);

  let currentY = context.y;
  const children: LayoutBox[] = [];

  for (const child of renderNode.children) {
    const childBox = layout(child, {
      x: context.x,
      y: currentY,
      width,
    });
    children.push(childBox);
    currentY += childBox.height;
  }

  const textHeight = renderNode.styledNode.node.type === "text" ? fontSize * 1.4 : 0;
  const childrenHeight = children.reduce((sum, child) => sum + child.height, 0);
  const height = numberValue(style.height, Math.max(textHeight, childrenHeight));

  return {
    node: renderNode,
    x: context.x,
    y: context.y,
    width,
    height,
    children,
  };
}
```

### 실제 브라우저와의 차이

실제 레이아웃 엔진은 inline layout, flexbox, grid, table layout, writing mode, overflow, position, transform, fragmentation 등 방대한 규칙을 처리합니다. 우리는 block 요소의 세로 배치만 구현합니다.

### 면접 질문으로 정리하기

- Layout 단계는 무엇을 계산하나요?
- Box Model은 어떤 영역으로 구성되나요?
- Reflow가 비싼 작업이 되는 이유는 무엇인가요?

