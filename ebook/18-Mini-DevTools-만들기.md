# Part 7. 브라우저 고급 구조

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

