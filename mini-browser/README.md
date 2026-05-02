# Mini Browser

`직접 만들어보며 이해하는 브라우저의 동작 원리` 전자책에서 사용하는 TypeScript 실습 프로젝트입니다.

## 실행

```bash
npm install
npm run dev
```

개발 서버 기본 주소:

```text
http://127.0.0.1:5173/
```

## 빌드

```bash
npm run build
```

## 주요 구조

```text
src/
├── network/    URL, HTTP, Cookie Jar
├── html/       HTML Tokenizer, DOM Parser
├── css/        CSS Parser, Selector, Computed Style
├── render/     Render Tree, Layout, Paint
├── runtime/    Script, Event Loop, Event Propagation
├── security/   Origin, CORS, CSP
├── devtools/   DOM Inspector, Network Panel, Render Log
├── frontend/   Virtual DOM, Hydration
└── app.ts      Mini Browser UI와 렌더링 파이프라인 연결
```

## 샘플 URL

앱을 열면 기본으로 `mini://sample`을 렌더링합니다. 외부 URL을 입력할 수도 있지만, 브라우저의 CORS 정책 때문에 일부 사이트는 요청이 차단될 수 있습니다.
