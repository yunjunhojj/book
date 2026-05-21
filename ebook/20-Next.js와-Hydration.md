# Part 8. 프론트엔드 개발과 연결하기

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

