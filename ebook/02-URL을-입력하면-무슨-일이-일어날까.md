# Part 1. 브라우저의 역할 이해하기

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

