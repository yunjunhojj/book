# Part 4. 화면에 그리기

## 11장. Reflow와 Repaint 이해하기

### 이번 장에서 만들 것

스타일 변경이 어떤 렌더링 단계를 다시 실행하게 만드는지 로그로 표시합니다.

### 먼저 개념 이해하기

Reflow는 레이아웃을 다시 계산하는 작업입니다. Repaint는 시각적 표현을 다시 그리는 작업입니다. 요소의 크기나 위치가 바뀌면 보통 layout과 paint가 모두 필요합니다. 색상만 바뀌면 layout은 그대로 두고 paint만 다시 할 수 있습니다.

### TypeScript로 직접 구현하기

```ts
// src/render/invalidation.ts
const layoutProperties = new Set(["width", "height", "margin", "padding", "display"]);
const paintProperties = new Set(["color", "backgroundColor", "borderColor"]);

export type RenderWork = "layout" | "paint";

export function getInvalidation(property: string): RenderWork[] {
  if (layoutProperties.has(property)) {
    return ["layout", "paint"];
  }

  if (paintProperties.has(property)) {
    return ["paint"];
  }

  return ["layout", "paint"];
}
```

### 실행 결과 확인하기

```text
width 변경 -> layout + paint
color 변경 -> paint only
```

### 면접 질문으로 정리하기

- Reflow와 Repaint의 차이는 무엇인가요?
- 어떤 CSS 속성 변경이 Layout을 다시 계산하게 만드나요?
- Layout Thrashing은 왜 성능 문제를 일으키나요?

---

