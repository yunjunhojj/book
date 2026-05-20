# Part 8. 프론트엔드 개발과 연결하기

## 19장. React 렌더링과 브라우저 렌더링

### 이번 장에서 만들 것

아주 작은 Virtual DOM과 diff 함수를 만들고, DOM 변경 이후 브라우저 렌더링 파이프라인이 다시 실행되는 흐름을 연결합니다.

### 먼저 개념 이해하기

React 렌더링과 브라우저 렌더링은 같은 말이 아닙니다. React 렌더링은 React Element를 만들고 이전 결과와 비교해 DOM 변경을 결정하는 과정입니다. 브라우저 렌더링은 변경된 DOM과 CSS를 바탕으로 layout, paint를 수행하는 과정입니다.

```text
React Render
-> Virtual DOM Diff
-> DOM Update
-> Browser Style/Layout/Paint
```

### TypeScript로 직접 구현하기

```ts
// src/frontend/vdom.ts
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
```

### 면접 질문으로 정리하기

- React의 렌더링과 브라우저의 렌더링은 어떻게 다른가요?
- Virtual DOM은 브라우저 DOM과 같은 것인가요?
- React Commit Phase 이후 브라우저에서는 어떤 일이 일어날 수 있나요?

