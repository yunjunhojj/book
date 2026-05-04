export type HtmlToken =
  | { type: "StartTag"; tagName: string; attributes: Record<string, string> }
  | { type: "EndTag"; tagName: string }
  | { type: "Text"; content: string };

const tagPattern = /<\/?[a-zA-Z][^>]*>|[^<]+/g;
const attrPattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g;

export function tokenizeHTML(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  const matches = html.match(tagPattern) ?? [];

  for (const raw of matches) {
    if (raw.startsWith("</")) {
      tokens.push({
        type: "EndTag",
        tagName: raw.slice(2, -1).trim().toLowerCase(),
      });
      continue;
    }

    if (raw.startsWith("<")) {
      const content = raw.slice(1, -1).trim();
      const [tagName] = content.split(/\s+/);
      const attributes: Record<string, string> = {};

      for (const match of content.matchAll(attrPattern)) {
        attributes[match[1]] = match[2];
      }

      tokens.push({
        type: "StartTag",
        tagName: tagName.toLowerCase(),
        attributes,
      });
      continue;
    }

    const content = raw.replace(/\s+/g, " ").trim();
    if (content) {
      tokens.push({ type: "Text", content });
    }
  }

  return tokens;
}
