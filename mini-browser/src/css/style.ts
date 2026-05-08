import type { ElementNode, MiniNode } from "../html/dom";
import type { CSSRule } from "./parser";
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
  h1: { display: "block", fontSize: 32 },
  p: { display: "block" },
  span: { display: "inline" },
  style: { display: "none" },
  script: { display: "none" },
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
