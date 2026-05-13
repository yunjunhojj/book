# Part 5. JavaScript와 브라우저 런타임

## 12장. JavaScript 실행 흐름 이해하기

### 이번 장에서 만들 것

`script` 태그를 찾아 제한된 방식으로 실행하고, 미니 DOM API 일부를 제공합니다.

### 먼저 개념 이해하기

JavaScript 엔진은 JavaScript 언어를 실행합니다. 그러나 `document`, `window`, `setTimeout`, `fetch` 같은 API는 JavaScript 언어 자체가 아니라 브라우저가 제공하는 Web API입니다.

### TypeScript로 직접 구현하기

```ts
// src/runtime/script.ts
import { ElementNode, MiniNode } from "../html/dom";

export interface MiniDocument {
  querySelector(selector: string): ElementNode | null;
}

export function createMiniDocument(root: MiniNode): MiniDocument {
  return {
    querySelector(selector: string) {
      return findElement(root, selector);
    },
  };
}

function findElement(node: MiniNode, selector: string): ElementNode | null {
  if (node.type === "element") {
    if (selector.startsWith(".") && node.attributes.class === selector.slice(1)) {
      return node;
    }

    if (selector.startsWith("#") && node.attributes.id === selector.slice(1)) {
      return node;
    }

    if (node.tagName === selector) {
      return node;
    }
  }

  for (const child of node.children) {
    const found = findElement(child, selector);
    if (found) return found;
  }

  return null;
}

export function runScript(code: string, document: MiniDocument) {
  const execute = new Function("document", code);
  execute(document);
}
```

### 실제 브라우저와의 차이

이 구현은 학습용입니다. 실제 서비스 코드에서 임의 문자열을 `new Function`으로 실행하면 보안 문제가 생깁니다. 실제 브라우저는 JavaScript 엔진, realm, global object, CSP, sandbox 등을 함께 고려합니다.

### 면접 질문으로 정리하기

- JavaScript 엔진과 브라우저 런타임은 어떻게 다른가요?
- DOM API는 JavaScript 자체 기능인가요?
- `script` 태그는 HTML 파싱에 어떤 영향을 줄 수 있나요?

