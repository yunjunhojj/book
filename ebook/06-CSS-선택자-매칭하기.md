# Part 3. CSS 해석하기

## 6장. CSS 선택자 매칭하기

### 이번 장에서 만들 것

CSS 선택자가 DOM 노드에 적용되는지 판단하고, 우선순위를 계산합니다.

### 먼저 개념 이해하기

브라우저는 CSS 규칙을 DOM 노드에 적용하기 위해 선택자를 매칭합니다. 가장 기본적인 선택자는 다음과 같습니다.

- 태그 선택자: `div`
- 클래스 선택자: `.title`
- ID 선택자: `#main`

여러 규칙이 같은 속성을 지정하면 우선순위가 높은 규칙이 이깁니다.

### TypeScript로 직접 구현하기

```ts
// src/css/selector.ts
import { ElementNode } from "../html/dom";

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
```

### 실제 브라우저와의 차이

실제 선택자 매칭은 자손 선택자, 자식 선택자, 속성 선택자, 의사 클래스, 의사 요소, cascade layer, `!important`, inline style 등을 함께 고려합니다.

### 면접 질문으로 정리하기

- CSS 우선순위는 어떻게 계산되나요?
- 클래스 선택자와 ID 선택자가 충돌하면 어떤 스타일이 적용되나요?
- 선택자 매칭이 성능에 영향을 줄 수 있는 이유는 무엇인가요?

