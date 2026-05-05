# Part 2. HTML을 DOM으로 바꾸기

## 4장. DOM 트리 만들기

### 이번 장에서 만들 것

HTML 토큰을 부모-자식 관계를 가진 DOM 트리로 바꿉니다.

### 먼저 개념 이해하기

DOM은 HTML 문자열이 아닙니다. DOM은 문서를 노드 객체의 트리로 표현한 구조입니다. 브라우저가 JavaScript에 `document.querySelector`, `appendChild`, `textContent` 같은 API를 제공할 수 있는 이유는 문서가 객체 모델로 존재하기 때문입니다.

### 단순화한 모델 설계하기

우리는 세 가지 노드를 만듭니다.

- `DocumentNode`
- `ElementNode`
- `TextNode`

### TypeScript로 직접 구현하기

```ts
// src/html/dom.ts
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
```

```ts
// src/html/parser.ts
import { HtmlToken } from "./tokenizer";
import {
  MiniNode,
  appendChild,
  createDocument,
  createElement,
  createText,
} from "./dom";

export function parseDOM(tokens: HtmlToken[]) {
  const document = createDocument();
  const stack: MiniNode[] = [document];

  for (const token of tokens) {
    const current = stack[stack.length - 1];

    if (token.type === "StartTag") {
      const element = createElement(token.tagName, token.attributes);
      appendChild(current, element);
      stack.push(element);
      continue;
    }

    if (token.type === "EndTag") {
      stack.pop();
      continue;
    }

    appendChild(current, createText(token.content));
  }

  return document;
}
```

### 실행 결과 확인하기

```text
Document
└── html
    └── body
        └── div
            └── "Hello"
```

### 실제 브라우저와의 차이

실제 DOM은 훨씬 많은 노드 타입과 API를 가집니다. 또한 HTML 파서는 특정 태그가 나타났을 때 암묵적으로 노드를 닫거나 삽입합니다. 우리는 스택을 사용해 부모-자식 구조가 만들어지는 핵심 원리에 집중합니다.

### 면접 질문으로 정리하기

- DOM은 HTML 문자열과 어떻게 다른가요?
- 브라우저가 DOM API를 제공하는 이유는 무엇인가요?
- HTML 토큰을 트리로 만들 때 스택이 필요한 이유는 무엇인가요?

---

