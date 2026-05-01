# 직접 만들어보며 이해하는 브라우저의 동작 원리

## 부제

프론트엔드 개발자를 위한 브라우저 내부 구조 실습서

## 이 책에 대하여

프론트엔드 개발자는 매일 브라우저 위에서 코드를 실행합니다. HTML을 작성하고, CSS로 화면을 꾸미고, JavaScript로 상태를 바꾸고, React나 Next.js로 애플리케이션을 만듭니다. 하지만 막상 "URL을 입력한 뒤 화면이 그려지기까지 브라우저 안에서 무슨 일이 일어나는가?"라고 물으면 설명이 끊기는 경우가 많습니다.

이 책은 브라우저 이론을 외우는 책이 아닙니다. 작은 브라우저를 TypeScript로 직접 만들어보면서 브라우저가 하는 일을 구조적으로 이해하는 책입니다.

우리가 만들 브라우저는 크롬처럼 완전한 브라우저가 아닙니다. 대신 브라우저의 핵심 파이프라인을 학습용으로 단순화합니다.

```text
URL 입력
-> HTTP 요청
-> HTML 파싱
-> DOM 생성
-> CSS 파싱
-> 스타일 계산
-> 렌더 트리 생성
-> 레이아웃
-> 페인트
-> JavaScript 실행
-> 이벤트 처리
-> 화면 갱신
```

이 흐름을 직접 구현하면 DOM, CSSOM, Render Tree, Reflow, Repaint, 이벤트 루프, CORS, 쿠키, Hydration 같은 개념이 서로 따로 떨어진 지식이 아니라 하나의 실행 흐름으로 연결됩니다.

## 대상 독자

- 브라우저 동작 원리를 깊게 이해하고 싶은 프론트엔드 개발자
- React, Next.js를 사용하지만 브라우저 내부 동작이 막연한 개발자
- 이벤트 루프, 렌더링, 리플로우, 리페인트를 제대로 이해하고 싶은 개발자
- 기술 면접에서 브라우저 관련 질문에 흐름 중심으로 답하고 싶은 개발자
- 웹 성능 최적화를 원리 기반으로 이해하고 싶은 개발자

## 필요한 사전 지식

- TypeScript 기본 문법
- HTML, CSS 기본 개념
- 간단한 HTTP 개념
- React 경험이 있으면 19장과 20장을 이해하는 데 도움이 됩니다.

## 최종 프로젝트 구조

```text
mini-browser/
├── src/
│   ├── network/
│   │   ├── url.ts
│   │   ├── http.ts
│   │   └── cookieJar.ts
│   ├── html/
│   │   ├── tokenizer.ts
│   │   ├── parser.ts
│   │   └── dom.ts
│   ├── css/
│   │   ├── tokenizer.ts
│   │   ├── parser.ts
│   │   ├── selector.ts
│   │   └── style.ts
│   ├── render/
│   │   ├── renderTree.ts
│   │   ├── layout.ts
│   │   └── paint.ts
│   ├── runtime/
│   │   ├── eventLoop.ts
│   │   ├── events.ts
│   │   └── script.ts
│   ├── security/
│   │   ├── origin.ts
│   │   ├── cors.ts
│   │   └── csp.ts
│   ├── devtools/
│   │   ├── domInspector.ts
│   │   ├── networkPanel.ts
│   │   └── renderLog.ts
│   └── app.ts
└── README.md
```

---

# Part 1. 브라우저의 역할 이해하기

## 1장. 브라우저를 직접 만든다는 것

### 이번 장에서 만들 것

이번 장에서는 미니 브라우저 프로젝트의 뼈대를 만듭니다. 주소창, 렌더링 영역, 로그 패널을 가진 간단한 화면을 만들고, 앞으로 구현할 파이프라인의 전체 흐름을 잡습니다.

### 먼저 개념 이해하기

브라우저는 HTML 파일을 보여주는 단순한 뷰어가 아닙니다. 브라우저는 네트워크 클라이언트이며, 문서 파서이며, 스타일 계산기이며, 레이아웃 엔진이며, 그래픽 출력 시스템이며, JavaScript 런타임이며, 보안 정책 실행기입니다.

크롬, 사파리, 파이어폭스는 내부 구현이 다르지만 공통적으로 다음 구성 요소를 가집니다.

- 네트워크 계층
- 렌더링 엔진
- JavaScript 엔진
- 스토리지 시스템
- 보안 정책
- 개발자 도구
- 사용자 인터페이스

렌더링 엔진과 JavaScript 엔진은 다릅니다. 렌더링 엔진은 HTML, CSS를 해석해 화면을 그리는 역할을 합니다. JavaScript 엔진은 JavaScript 코드를 실행합니다. 브라우저는 두 엔진을 연결해 `document.querySelector`, `addEventListener`, `setTimeout` 같은 Web API를 제공합니다.

### 단순화한 모델 설계하기

우리가 만들 미니 브라우저는 다음 모델을 사용합니다.

```text
Address Bar
  -> Network
  -> HTML Parser
  -> DOM
  -> CSS Parser
  -> Style
  -> Render Tree
  -> Layout
  -> Paint
  -> Runtime
  -> DevTools Log
```

### TypeScript 프로젝트 만들기

```bash
npm create vite@latest mini-browser -- --template vanilla-ts
cd mini-browser
npm install
npm run dev
```

기본 화면을 다음처럼 구성합니다.

```ts
// src/app.ts
export function createMiniBrowser(root: HTMLElement) {
  root.innerHTML = `
    <main class="browser">
      <form class="address-bar">
        <input name="url" value="https://example.com" />
        <button type="submit">이동</button>
      </form>
      <section class="workspace">
        <canvas class="viewport" width="900" height="600"></canvas>
        <aside class="devtools">
          <h2>Mini DevTools</h2>
          <pre class="log"></pre>
        </aside>
      </section>
    </main>
  `;

  const form = root.querySelector<HTMLFormElement>(".address-bar")!;
  const log = root.querySelector<HTMLPreElement>(".log")!;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const url = String(data.get("url"));
    log.textContent += `URL 입력: ${url}\n`;
  });
}
```

```ts
// src/main.ts
import "./style.css";
import { createMiniBrowser } from "./app";

createMiniBrowser(document.querySelector<HTMLDivElement>("#app")!);
```

### 실행 결과 확인하기

주소창에 URL을 입력하고 이동 버튼을 누르면 DevTools 로그 패널에 입력한 URL이 기록됩니다. 아직 네트워크 요청이나 렌더링은 하지 않지만, 사용자가 브라우저와 상호작용하는 첫 흐름이 생겼습니다.

### 실제 브라우저와의 차이

실제 브라우저는 주소창 자동완성, 검색어 처리, 히스토리, 보안 표시, 탭 관리, 프로세스 분리 등을 함께 처리합니다. 우리는 학습을 위해 주소 입력과 렌더링 파이프라인 호출에만 집중합니다.

### 면접 질문으로 정리하기

- 브라우저 엔진과 JavaScript 엔진은 어떻게 다른가요?
- 브라우저가 HTML을 화면에 그리기까지 어떤 단계를 거치나요?
- DOM API는 JavaScript 자체 기능인가요, 브라우저가 제공하는 기능인가요?

## 2장. URL을 입력하면 무슨 일이 일어날까

### 이번 장에서 만들 것

URL 문자열을 파싱하고, HTTP 요청을 보내 HTML 문자열을 가져오는 네트워크 계층을 만듭니다.

### 먼저 개념 이해하기

URL은 브라우저가 리소스를 찾기 위한 주소입니다.

```text
https://example.com:443/docs?page=1#title
└───┘   └─────────┘ └─┘ └───┘ └────┘ └───┘
scheme     host     port path query  hash
```

브라우저는 URL을 해석한 뒤 DNS를 통해 호스트 이름을 IP 주소로 바꾸고, HTTP 요청을 보냅니다. 응답의 `Content-Type`은 브라우저가 리소스를 어떻게 처리할지 결정하는 중요한 힌트입니다.

### 단순화한 모델 설계하기

브라우저의 네트워크 계층을 다음 함수들로 나눕니다.

- `parseURL`: URL 문자열을 구조화합니다.
- `fetchHTML`: URL로 요청을 보내 HTML을 가져옵니다.
- `NetworkLog`: 요청과 응답 정보를 기록합니다.

### TypeScript로 직접 구현하기

```ts
// src/network/url.ts
export interface ParsedURL {
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

export function parseURL(input: string): ParsedURL {
  const url = new URL(input);

  return {
    href: url.href,
    protocol: url.protocol,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
  };
}
```

```ts
// src/network/http.ts
export interface HttpResponse {
  url: string;
  status: number;
  contentType: string;
  body: string;
}

export async function fetchHTML(url: string): Promise<HttpResponse> {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  return {
    url: response.url,
    status: response.status,
    contentType,
    body,
  };
}
```

### 실행 결과 확인하기

```ts
const parsed = parseURL("https://example.com/path?query=1");
console.log(parsed.hostname); // example.com

const response = await fetchHTML("https://example.com");
console.log(response.status);
console.log(response.body);
```

### 실제 브라우저와의 차이

실제 브라우저는 DNS 캐시, HTTP 캐시, TLS 핸드셰이크, 리다이렉트, 쿠키, 인증, 프록시, HSTS, 혼합 콘텐츠 차단 등 훨씬 많은 일을 처리합니다. 이 장에서는 URL에서 HTML 문자열까지 도달하는 최소 흐름만 구현합니다.

### 면접 질문으로 정리하기

- URL을 입력하면 브라우저 안에서 어떤 일이 일어나나요?
- MIME Type은 왜 중요한가요?
- HTTP 응답의 `Content-Type`이 잘못되면 어떤 문제가 생길 수 있나요?

---

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

# Part 3. CSS 해석하기

## 5장. CSS 파서 만들기

### 이번 장에서 만들 것

CSS 문자열을 규칙 목록으로 바꾸는 간단한 파서를 만듭니다.

### 먼저 개념 이해하기

CSS는 선택자와 선언 블록으로 구성됩니다.

```css
.title {
  color: red;
  font-size: 20px;
}
```

위 코드는 다음 의미를 가집니다.

```ts
{
  selector: ".title",
  declarations: {
    color: "red",
    fontSize: "20px"
  }
}
```

### TypeScript로 직접 구현하기

```ts
// src/css/parser.ts
export interface CSSRule {
  selector: string;
  declarations: Record<string, string>;
}

function toCamelCase(property: string) {
  return property.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function parseCSS(css: string): CSSRule[] {
  const rules: CSSRule[] = [];
  const blockPattern = /([^{}]+)\{([^{}]+)\}/g;

  for (const match of css.matchAll(blockPattern)) {
    const selector = match[1].trim();
    const body = match[2].trim();
    const declarations: Record<string, string> = {};

    for (const declaration of body.split(";")) {
      const [property, value] = declaration.split(":").map((part) => part?.trim());
      if (!property || !value) continue;
      declarations[toCamelCase(property)] = value;
    }

    rules.push({ selector, declarations });
  }

  return rules;
}
```

### 실제 브라우저와의 차이

실제 CSS 파서는 미디어 쿼리, 중첩 함수, 커스텀 프로퍼티, 축약 속성, 잘못된 선언 복구 등을 처리합니다. 우리는 선택자와 선언 블록의 기본 구조만 다룹니다.

### 면접 질문으로 정리하기

- CSS Rule은 어떤 요소로 구성되나요?
- CSSOM은 DOM과 어떤 관계를 가지나요?
- CSS 파싱 오류가 있어도 일부 스타일이 적용되는 이유는 무엇인가요?

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

## 13장. 이벤트 루프 시뮬레이션하기

### 이번 장에서 만들 것

Task Queue, Microtask Queue, Render Step을 가진 간단한 이벤트 루프를 만듭니다.

### 먼저 개념 이해하기

브라우저는 JavaScript 실행, 타이머, 사용자 입력, 네트워크 콜백, 렌더링을 이벤트 루프로 조율합니다. Microtask는 현재 task가 끝난 직후, 렌더링 전에 처리됩니다.

### TypeScript로 직접 구현하기

```ts
// src/runtime/eventLoop.ts
type Job = () => void;

export class EventLoop {
  private tasks: Job[] = [];
  private microtasks: Job[] = [];
  private renderStep: Job;

  constructor(renderStep: Job) {
    this.renderStep = renderStep;
  }

  queueTask(job: Job) {
    this.tasks.push(job);
  }

  queueMicrotask(job: Job) {
    this.microtasks.push(job);
  }

  tick() {
    const task = this.tasks.shift();
    if (task) task();

    while (this.microtasks.length > 0) {
      const microtask = this.microtasks.shift()!;
      microtask();
    }

    this.renderStep();
  }
}
```

### 실행 결과 확인하기

```text
script 실행
-> microtask 처리
-> render
-> task 처리
```

### 면접 질문으로 정리하기

- Task Queue와 Microtask Queue의 차이는 무엇인가요?
- Promise 콜백은 언제 실행되나요?
- 렌더링은 이벤트 루프의 어느 시점과 관련이 있나요?

## 14장. 이벤트 전파 구현하기

### 이번 장에서 만들 것

클릭 이벤트의 캡처링, 타깃, 버블링 흐름을 시뮬레이션합니다.

### 먼저 개념 이해하기

브라우저 이벤트는 타깃 요소에서만 실행되지 않습니다. 이벤트는 문서 루트에서 타깃까지 내려가는 캡처링 단계, 타깃 단계, 다시 부모로 올라가는 버블링 단계를 거칩니다.

### TypeScript로 직접 구현하기

```ts
// src/runtime/events.ts
import { MiniNode } from "../html/dom";

type Listener = (event: MiniEvent) => void;

export interface MiniEvent {
  type: string;
  target: MiniNode;
  currentTarget: MiniNode | null;
  propagationStopped: boolean;
  stopPropagation(): void;
}

const listeners = new WeakMap<MiniNode, Map<string, Listener[]>>();

export function addEventListener(node: MiniNode, type: string, listener: Listener) {
  const byType = listeners.get(node) ?? new Map<string, Listener[]>();
  const list = byType.get(type) ?? [];

  list.push(listener);
  byType.set(type, list);
  listeners.set(node, byType);
}

export function dispatchEvent(target: MiniNode, type: string) {
  const path = getEventPath(target);
  const event: MiniEvent = {
    type,
    target,
    currentTarget: null,
    propagationStopped: false,
    stopPropagation() {
      this.propagationStopped = true;
    },
  };

  for (const node of path) {
    event.currentTarget = node;
    const list = listeners.get(node)?.get(type) ?? [];
    for (const listener of list) listener(event);
    if (event.propagationStopped) return;
  }
}

function getEventPath(target: MiniNode) {
  const path: MiniNode[] = [];
  let current: MiniNode | null = target;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}
```

### 면접 질문으로 정리하기

- 이벤트 캡처링과 버블링은 무엇인가요?
- `stopPropagation`은 어떤 역할을 하나요?
- 이벤트 위임은 브라우저 이벤트 전파와 어떤 관계가 있나요?

---

# Part 6. 저장소와 보안

## 15장. 쿠키와 스토리지 구현하기

### 이번 장에서 만들 것

URL별 쿠키를 저장하고, 다음 요청에 `Cookie` 헤더를 붙이는 Cookie Jar를 만듭니다.

### 먼저 개념 이해하기

쿠키는 서버와 브라우저가 함께 사용하는 작은 상태 저장 장치입니다. 서버는 `Set-Cookie` 응답 헤더로 쿠키를 설정하고, 브라우저는 이후 같은 조건에 맞는 요청에 `Cookie` 헤더를 붙입니다.

### TypeScript로 직접 구현하기

```ts
// src/network/cookieJar.ts
export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

export class CookieJar {
  private cookies: Cookie[] = [];

  store(setCookie: string, requestUrl: string) {
    const url = new URL(requestUrl);
    const [pair, ...attributes] = setCookie.split(";").map((part) => part.trim());
    const [name, value] = pair.split("=");

    const cookie: Cookie = {
      name,
      value,
      domain: url.hostname,
      path: "/",
      secure: false,
      sameSite: "Lax",
    };

    for (const attribute of attributes) {
      const [key, attrValue] = attribute.split("=");
      const normalized = key.toLowerCase();

      if (normalized === "domain" && attrValue) cookie.domain = attrValue;
      if (normalized === "path" && attrValue) cookie.path = attrValue;
      if (normalized === "secure") cookie.secure = true;
      if (normalized === "samesite" && attrValue) {
        cookie.sameSite = attrValue as Cookie["sameSite"];
      }
    }

    this.cookies = this.cookies.filter((item) => {
      return !(item.name === cookie.name && item.domain === cookie.domain);
    });
    this.cookies.push(cookie);
  }

  getCookieHeader(requestUrl: string) {
    const url = new URL(requestUrl);

    return this.cookies
      .filter((cookie) => url.hostname.endsWith(cookie.domain))
      .filter((cookie) => url.pathname.startsWith(cookie.path))
      .filter((cookie) => !cookie.secure || url.protocol === "https:")
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }
}
```

### 면접 질문으로 정리하기

- 쿠키는 언제 HTTP 요청에 포함되나요?
- `HttpOnly`, `Secure`, `SameSite`는 각각 어떤 문제를 줄이나요?
- LocalStorage와 Cookie는 어떤 점이 다른가요?

## 16장. Same-Origin Policy와 CORS 이해하기

### 이번 장에서 만들 것

Origin 비교 함수와 CORS 허용 여부를 판단하는 함수를 만듭니다.

### 먼저 개념 이해하기

Same-Origin Policy는 한 출처의 문서나 스크립트가 다른 출처의 리소스에 함부로 접근하지 못하게 막는 브라우저 보안 정책입니다. Origin은 protocol, host, port의 조합입니다.

### TypeScript로 직접 구현하기

```ts
// src/security/origin.ts
export interface Origin {
  protocol: string;
  hostname: string;
  port: string;
}

export function getOrigin(input: string): Origin {
  const url = new URL(input);

  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port || defaultPort(url.protocol),
  };
}

export function isSameOrigin(a: string, b: string) {
  const left = getOrigin(a);
  const right = getOrigin(b);

  return (
    left.protocol === right.protocol &&
    left.hostname === right.hostname &&
    left.port === right.port
  );
}

function defaultPort(protocol: string) {
  if (protocol === "https:") return "443";
  if (protocol === "http:") return "80";
  return "";
}
```

```ts
// src/security/cors.ts
import { isSameOrigin } from "./origin";

export interface CORSInput {
  from: string;
  to: string;
  responseHeaders: Record<string, string>;
}

export function canReadResponse(input: CORSInput) {
  if (isSameOrigin(input.from, input.to)) {
    return true;
  }

  const allowedOrigin = input.responseHeaders["access-control-allow-origin"];
  return allowedOrigin === "*" || allowedOrigin === new URL(input.from).origin;
}
```

### 면접 질문으로 정리하기

- Same-Origin Policy는 무엇을 보호하나요?
- CORS는 서버 정책인가요, 브라우저 정책인가요?
- CORS 에러가 서버 에러처럼 보이지만 브라우저에서 발생하는 이유는 무엇인가요?

---

# Part 7. 브라우저 고급 구조

## 17장. 멀티 프로세스 구조 이해하기

### 이번 장에서 만들 것

실제 멀티 프로세스를 만들지는 않고, 브라우저 프로세스와 렌더러 프로세스 사이의 메시지 패싱 구조를 TypeScript 객체로 시뮬레이션합니다.

### 먼저 개념 이해하기

현대 브라우저는 안정성과 보안을 위해 여러 프로세스를 사용합니다.

- Browser Process: 탭, 주소창, 권한, 전체 조율
- Renderer Process: HTML/CSS/JS 실행과 렌더링
- Network Process: 네트워크 요청
- GPU Process: 그래픽 처리

탭 하나가 멈추더라도 전체 브라우저가 죽지 않게 만들고, 사이트 격리를 통해 보안 경계를 강화합니다.

### TypeScript로 직접 구현하기

```ts
// src/process/message.ts
export type BrowserMessage =
  | { type: "Navigate"; url: string }
  | { type: "PaintResult"; commands: string[] };

export class MessagePort<T> {
  private handlers: Array<(message: T) => void> = [];

  postMessage(message: T) {
    for (const handler of this.handlers) {
      handler(message);
    }
  }

  onMessage(handler: (message: T) => void) {
    this.handlers.push(handler);
  }
}
```

### 면접 질문으로 정리하기

- 브라우저가 멀티 프로세스 구조를 사용하는 이유는 무엇인가요?
- Browser Process와 Renderer Process는 어떤 역할을 하나요?
- Site Isolation은 어떤 보안 문제를 줄이나요?

## 18장. Mini DevTools 만들기

### 이번 장에서 만들 것

DOM Tree, CSS Rule, Network Log, Render Pipeline Log를 보여주는 미니 개발자 도구를 만듭니다.

### 먼저 개념 이해하기

개발자 도구는 브라우저 내부 상태를 사람이 볼 수 있는 형태로 노출합니다. Elements 패널은 DOM과 스타일을, Network 패널은 요청과 응답을, Performance 패널은 렌더링 비용을 보여줍니다.

### TypeScript로 직접 구현하기

```ts
// src/devtools/renderLog.ts
export interface RenderLogEntry {
  step: "network" | "html" | "css" | "style" | "layout" | "paint" | "runtime";
  message: string;
  time: number;
}

export class RenderLogger {
  private entries: RenderLogEntry[] = [];

  add(step: RenderLogEntry["step"], message: string) {
    this.entries.push({ step, message, time: performance.now() });
  }

  getEntries() {
    return [...this.entries];
  }
}
```

### 면접 질문으로 정리하기

- 개발자 도구의 Elements 패널은 브라우저 내부의 어떤 정보를 보여주나요?
- Network 패널에서 확인할 수 있는 핵심 정보는 무엇인가요?
- Performance 패널은 렌더링 병목을 찾는 데 어떻게 도움이 되나요?

---

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

## 20장. Next.js와 Hydration

### 이번 장에서 만들 것

서버가 HTML 문자열을 만들고, 클라이언트가 기존 DOM에 이벤트를 연결하는 hydration 흐름을 시뮬레이션합니다.

### 먼저 개념 이해하기

SSR은 서버에서 HTML을 만들어 브라우저에 보내는 방식입니다. 브라우저는 받은 HTML을 파싱해 DOM을 만들고 먼저 화면을 보여줄 수 있습니다. 이후 JavaScript 번들이 로드되면 React가 기존 DOM과 자신의 컴포넌트 트리를 연결합니다. 이 과정을 hydration이라고 부릅니다.

```text
Server HTML
-> Browser Parse
-> JS Load
-> Hydration
-> Interactive
```

### TypeScript로 직접 구현하기

```ts
// src/frontend/hydration.ts
export function renderServerHTML(count: number) {
  return `<button id="counter">Count: ${count}</button>`;
}

export function hydrateCounter(root: HTMLElement, initialCount: number) {
  let count = initialCount;
  const button = root.querySelector<HTMLButtonElement>("#counter")!;

  const expectedText = `Count: ${initialCount}`;
  if (button.textContent !== expectedText) {
    console.warn("Hydration mismatch", {
      server: button.textContent,
      client: expectedText,
    });
  }

  button.addEventListener("click", () => {
    count += 1;
    button.textContent = `Count: ${count}`;
  });
}
```

### 면접 질문으로 정리하기

- Hydration은 무엇인가요?
- Hydration mismatch는 왜 발생하나요?
- SSR에서 브라우저가 받는 것은 HTML인가요, React 컴포넌트인가요?

## 21장. 웹 성능 최적화

### 이번 장에서 만들 것

렌더링 단계별 시간을 측정하고, 큰 JavaScript 파일과 잦은 레이아웃 변경이 성능에 미치는 영향을 시뮬레이션합니다.

### 먼저 개념 이해하기

웹 성능은 브라우저 내부 동작과 직접 연결됩니다.

- LCP: 주요 콘텐츠가 그려지는 시간
- CLS: 레이아웃이 얼마나 흔들리는지
- INP: 사용자 입력에 얼마나 빠르게 반응하는지
- Critical Rendering Path: HTML, CSS, JS가 첫 화면 렌더링에 영향을 주는 흐름

### TypeScript로 직접 구현하기

```ts
// src/performance/measure.ts
export async function measure<T>(label: string, task: () => T | Promise<T>) {
  const start = performance.now();
  const result = await task();
  const end = performance.now();

  return {
    label,
    duration: end - start,
    result,
  };
}
```

### 면접 질문으로 정리하기

- Critical Rendering Path는 무엇인가요?
- 큰 JavaScript 번들은 왜 초기 렌더링을 늦출 수 있나요?
- Layout Thrashing은 어떤 코드 패턴에서 발생하나요?

---

# Part 9. 최종 프로젝트

## 22장. Mini Chrome 완성하기

### 이번 장에서 만들 것

지금까지 만든 모듈을 하나의 미니 브라우저로 연결합니다.

### 최종 기능

- URL 입력
- HTML 로딩
- CSS 적용
- DOM Tree 표시
- Render Tree 표시
- Canvas 렌더링
- 클릭 이벤트
- 링크 이동
- 쿠키 저장
- Network Log
- Render Log
- Mini DevTools

### TypeScript로 직접 구현하기

```ts
// src/app.ts
import { fetchHTML } from "./network/http";
import { tokenizeHTML } from "./html/tokenizer";
import { parseDOM } from "./html/parser";
import { parseCSS } from "./css/parser";
import { computeStyleTree } from "./css/style";
import { buildRenderTree } from "./render/renderTree";
import { layout } from "./render/layout";
import { paint } from "./render/paint";
import { RenderLogger } from "./devtools/renderLog";

export async function navigate(url: string, canvas: HTMLCanvasElement) {
  const logger = new RenderLogger();

  logger.add("network", `${url} 요청 시작`);
  const response = await fetchHTML(url);
  logger.add("network", `${response.status} 응답 수신`);

  logger.add("html", "HTML 토큰화 시작");
  const tokens = tokenizeHTML(response.body);

  logger.add("html", "DOM 트리 생성");
  const dom = parseDOM(tokens);

  logger.add("css", "CSS 파싱");
  const css = extractStyleText(response.body);
  const rules = parseCSS(css);

  logger.add("style", "Computed Style 계산");
  const styledTree = computeStyleTree(dom, rules);

  logger.add("layout", "Render Tree 생성 및 Layout 계산");
  const renderTree = buildRenderTree(styledTree);
  if (!renderTree) return logger.getEntries();

  const layoutTree = layout(renderTree, {
    x: 0,
    y: 0,
    width: canvas.width,
  });

  logger.add("paint", "Canvas Paint");
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paint(ctx, layoutTree);

  return logger.getEntries();
}

function extractStyleText(html: string) {
  const matches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  return [...matches].map((match) => match[1]).join("\n");
}
```

### 실행 흐름

```text
Mini Chrome
├── Address Bar
├── Viewport
├── DOM Inspector
├── Style Inspector
├── Network Panel
└── Render Pipeline Log
```

### 면접 질문으로 정리하기

- URL 입력 후 화면이 그려지기까지의 전체 과정을 설명해주세요.
- DOM, CSSOM, Render Tree, Layout, Paint는 어떻게 연결되나요?
- 브라우저 렌더링 파이프라인을 이해하면 성능 최적화에 어떤 도움이 되나요?

## 23장. 진짜 브라우저와 비교하기

### 이번 장에서 정리할 것

우리가 만든 미니 브라우저와 실제 브라우저의 차이를 정리하고, 앞으로 더 공부할 방향을 잡습니다.

### 우리가 만든 것

- URL 파싱
- HTTP 요청
- HTML 토큰화
- DOM 트리 생성
- CSS 파싱
- 선택자 매칭
- Computed Style 계산
- Render Tree 생성
- Layout 계산
- Canvas Paint
- 이벤트 루프 시뮬레이션
- 이벤트 전파
- 쿠키 저장
- CORS 판단
- Mini DevTools 로그

### 실제 브라우저가 더 하는 일

실제 Chromium은 훨씬 더 복잡한 구조를 가집니다.

- Blink: 렌더링 엔진
- V8: JavaScript 엔진
- Skia: 그래픽 라이브러리
- DevTools Protocol: 개발자 도구와 브라우저 사이의 통신 프로토콜
- Multi Process Architecture: 안정성과 보안을 위한 프로세스 분리
- Web Platform API: 수많은 브라우저 API

### 최종적으로 설명할 수 있어야 하는 흐름

```text
사용자가 URL을 입력한다.
브라우저가 URL을 파싱하고 네트워크 요청을 보낸다.
서버는 HTML을 응답한다.
브라우저는 HTML을 토큰화하고 DOM 트리를 만든다.
CSS를 파싱해 CSS 규칙을 만들고 DOM 노드에 적용한다.
Computed Style을 계산한다.
화면에 그릴 노드만 모아 Render Tree를 만든다.
각 노드의 위치와 크기를 계산한다.
계산된 박스를 페인트한다.
JavaScript가 DOM을 바꾸면 필요한 렌더링 단계를 다시 실행한다.
사용자 이벤트는 캡처링, 타깃, 버블링 단계를 거쳐 전달된다.
브라우저는 쿠키, Same-Origin Policy, CORS, CSP 같은 정책으로 런타임을 보호한다.
```

### 앞으로 더 공부할 방향

- HTML Living Standard의 파싱 알고리즘
- CSS Cascade와 Layout 알고리즘
- Chromium Blink 구조
- V8의 실행 모델
- DevTools Protocol
- Web Performance Metrics
- Browser Security Model

### 마지막 메시지

브라우저는 단순히 HTML을 보여주는 프로그램이 아닙니다. 브라우저는 네트워크, 파싱, 스타일 계산, 레이아웃, 페인팅, JavaScript 실행, 이벤트 처리, 저장소, 보안 정책이 결합된 복합 런타임입니다.

프론트엔드 개발자가 이 구조를 이해하면 성능 문제를 원인 기반으로 분석할 수 있고, React와 Next.js의 동작을 브라우저 관점에서 설명할 수 있으며, 이벤트 루프와 보안 정책을 암기가 아닌 흐름으로 이해할 수 있습니다.

이 책에서 만든 미니 브라우저는 작지만, 브라우저를 이해하는 데 필요한 핵심 질문을 계속 던지게 해줍니다.

> 브라우저는 지금 어떤 일을 하고 있는가?

이 질문에 답할 수 있다면, 웹 애플리케이션을 보는 눈이 달라집니다.

