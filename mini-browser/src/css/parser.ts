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
