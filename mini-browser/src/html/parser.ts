import type { HtmlToken } from "./tokenizer";
import {
  type MiniNode,
  appendChild,
  createDocument,
  createElement,
  createText,
} from "./dom";

const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

export function parseDOM(tokens: HtmlToken[]) {
  const document = createDocument();
  const stack: MiniNode[] = [document];

  for (const token of tokens) {
    const current = stack[stack.length - 1];

    if (token.type === "StartTag") {
      const element = createElement(token.tagName, token.attributes);
      appendChild(current, element);
      if (!voidElements.has(token.tagName)) {
        stack.push(element);
      }
      continue;
    }

    if (token.type === "EndTag") {
      while (stack.length > 1) {
        const top = stack.pop();
        if (top?.type === "element" && top.tagName === token.tagName) break;
      }
      continue;
    }

    appendChild(current, createText(token.content));
  }

  return document;
}
