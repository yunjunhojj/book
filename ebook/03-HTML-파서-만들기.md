# Part 2. HTML을 DOM으로 바꾸기

## 3장. HTML 파서 만들기

### 이번 장에서 만들 것

HTML 문자열을 토큰 목록으로 바꾸는 간단한 토크나이저를 만듭니다.

### 먼저 개념 이해하기

브라우저는 HTML 문자열을 바로 DOM으로 바꾸지 않습니다. 먼저 문자열을 읽으면서 의미 있는 단위로 나눕니다. 이 단위를 토큰이라고 부릅니다.

예를 들어 다음 HTML이 있다고 하겠습니다.

```html
<div class="title">Hello</div>
```

토크나이저는 이를 다음처럼 나눌 수 있습니다.

```ts
[
  { type: "StartTag", tagName: "div", attributes: { class: "title" } },
  { type: "Text", content: "Hello" },
  { type: "EndTag", tagName: "div" },
]
```

### 단순화한 모델 설계하기

실제 HTML 파서는 매우 복잡합니다. 태그가 잘못 닫히거나, 생략되거나, 중첩이 깨져도 브라우저는 가능한 방식으로 DOM을 만듭니다. 우리는 다음 토큰만 처리합니다.

- 시작 태그
- 종료 태그
- 텍스트

### TypeScript로 직접 구현하기

```ts
// src/html/tokenizer.ts
export type HtmlToken =
  | { type: "StartTag"; tagName: string; attributes: Record<string, string> }
  | { type: "EndTag"; tagName: string }
  | { type: "Text"; content: string };

const tagPattern = /<\/?[a-zA-Z][^>]*>|[^<]+/g;
const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g;

export function tokenizeHTML(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  const matches = html.match(tagPattern) ?? [];

  for (const raw of matches) {
    if (raw.startsWith("</")) {
      tokens.push({
        type: "EndTag",
        tagName: raw.slice(2, -1).trim().toLowerCase(),
      });
      continue;
    }

    if (raw.startsWith("<")) {
      const content = raw.slice(1, -1).trim();
      const [tagName] = content.split(/\s+/);
      const attributes: Record<string, string> = {};

      for (const match of content.matchAll(attrPattern)) {
        attributes[match[1]] = match[2];
      }

      tokens.push({
        type: "StartTag",
        tagName: tagName.toLowerCase(),
        attributes,
      });
      continue;
    }

    const content = raw.replace(/\s+/g, " ").trim();
    if (content) {
      tokens.push({ type: "Text", content });
    }
  }

  return tokens;
}
```

### 실행 결과 확인하기

```ts
console.log(tokenizeHTML('<div class="title">Hello</div>'));
```

### 실제 브라우저와의 차이

실제 HTML 파서는 상태 머신으로 동작합니다. `script`, `style`, 주석, doctype, self-closing 태그, 잘못된 중첩, 암묵적 `html`, `head`, `body` 삽입 등을 처리합니다. 우리의 토크나이저는 핵심 개념을 이해하기 위한 최소 구현입니다.

### 면접 질문으로 정리하기

- HTML 파싱은 왜 단순 문자열 분리가 아닌가요?
- 브라우저는 잘못된 HTML도 왜 어느 정도 렌더링할 수 있나요?
- 토큰화와 파싱은 어떻게 다른가요?

