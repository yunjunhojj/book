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

