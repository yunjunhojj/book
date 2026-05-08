# Part 3. CSS 해석하기

## 7장. Computed Style 만들기

### 이번 장에서 만들 것

DOM 노드마다 최종적으로 적용될 `computed style`을 계산합니다.

### 먼저 개념 이해하기

Computed Style은 여러 출처의 스타일이 합쳐진 최종 결과입니다.

- User Agent Style
- 외부 CSS
- 내부 `style` 태그
- 인라인 스타일
- 상속된 스타일

### TypeScript로 직접 구현하기

```ts
// src/css/style.ts
import { ElementNode, MiniNode } from "../html/dom";
import { CSSRule } from "./parser";
import { calculateSpecificity, compareSpecificity, matchesSelector } from "./selector";

export type ComputedStyle = Record<string, string | number>;

export interface StyledNode {
  node: MiniNode;
  style: ComputedStyle;
  children: StyledNode[];
}

const userAgentStyle: Record<string, ComputedStyle> = {
  html: { display: "block", color: "black", fontSize: 16 },
  body: { display: "block", margin: 8, color: "black", fontSize: 16 },
  div: { display: "block" },
  span: { display: "inline" },
  p: { display: "block" },
};

const inheritedProperties = new Set(["color", "fontSize", "fontFamily"]);

export function computeStyleTree(
  node: MiniNode,
  rules: CSSRule[],
  parentStyle: ComputedStyle = {},
): StyledNode {
  const style: ComputedStyle = {};

  for (const property of inheritedProperties) {
    if (parentStyle[property] !== undefined) {
      style[property] = parentStyle[property];
    }
  }

  if (node.type === "element") {
    Object.assign(style, userAgentStyle[node.tagName] ?? {});
    Object.assign(style, matchRules(node, rules));
  }

  return {
    node,
    style,
    children: node.children.map((child) => computeStyleTree(child, rules, style)),
  };
}

function matchRules(node: ElementNode, rules: CSSRule[]) {
  const matched = rules
    .filter((rule) => matchesSelector(node, rule.selector))
    .map((rule, order) => ({
      rule,
      order,
      specificity: calculateSpecificity(rule.selector),
    }))
    .sort((a, b) => {
      const bySpecificity = compareSpecificity(a.specificity, b.specificity);
      return bySpecificity === 0 ? a.order - b.order : bySpecificity;
    });

  return matched.reduce<ComputedStyle>((style, item) => {
    return { ...style, ...item.rule.declarations };
  }, {});
}
```

### 실행 결과 확인하기

```ts
{
  display: "block",
  color: "black",
  fontSize: 16,
  width: "auto"
}
```

### 실제 브라우저와의 차이

실제 Computed Style은 상속, 초기값, 상대 단위 계산, 사용자 설정, 미디어 쿼리, cascade layer, shadow DOM 범위 등을 고려합니다. 우리는 우선순위와 상속의 기본 흐름에 집중합니다.

### 면접 질문으로 정리하기

- CSSOM과 Computed Style은 같은 개념인가요?
- 상속되는 CSS 속성과 상속되지 않는 CSS 속성의 차이는 무엇인가요?
- User Agent Style은 왜 필요한가요?

---

