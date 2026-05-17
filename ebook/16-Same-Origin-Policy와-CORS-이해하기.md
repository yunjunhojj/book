# Part 6. 저장소와 보안

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

