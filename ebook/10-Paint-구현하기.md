# Part 4. 화면에 그리기

## 10장. Paint 구현하기

### 이번 장에서 만들 것

계산된 레이아웃 박스를 Canvas에 그립니다.

### 먼저 개념 이해하기

Paint는 레이아웃 결과를 실제 픽셀로 바꾸기 위한 그리기 명령을 만드는 단계입니다. 브라우저는 배경, 테두리, 텍스트, 이미지 등을 적절한 순서로 그립니다.

### TypeScript로 직접 구현하기

```ts
// src/render/paint.ts
import { LayoutBox } from "./layout";

export function paint(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  drawBackground(ctx, box);
  drawBorder(ctx, box);
  drawText(ctx, box);

  for (const child of box.children) {
    paint(ctx, child);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  const color = box.node.styledNode.style.backgroundColor;
  if (typeof color !== "string") return;

  ctx.fillStyle = color;
  ctx.fillRect(box.x, box.y, box.width, box.height);
}

function drawBorder(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  const borderColor = box.node.styledNode.style.borderColor;
  if (typeof borderColor !== "string") return;

  ctx.strokeStyle = borderColor;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

function drawText(ctx: CanvasRenderingContext2D, box: LayoutBox) {
  const node = box.node.styledNode.node;
  if (node.type !== "text") return;

  const style = box.node.styledNode.style;
  const fontSize = typeof style.fontSize === "number" ? style.fontSize : 16;

  ctx.fillStyle = typeof style.color === "string" ? style.color : "black";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillText(node.text, box.x, box.y + fontSize);
}
```

### 실행 결과 확인하기

```text
HTML 문자열
-> DOM
-> Style
-> Layout
-> Paint
-> Canvas 화면
```

### 면접 질문으로 정리하기

- Paint 단계는 Layout 단계와 어떻게 다른가요?
- Canvas로 그리는 방식과 실제 브라우저의 페인트 과정은 어떻게 다른가요?
- 배경, 테두리, 텍스트는 어떤 순서로 그려져야 하나요?

