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

