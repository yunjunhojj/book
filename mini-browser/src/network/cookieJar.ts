export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

export class CookieJar {
  private cookies: Cookie[] = [];

  store(setCookie: string, requestUrl: string) {
    const url = new URL(requestUrl);
    const [pair, ...attributes] = setCookie.split(";").map((part) => part.trim());
    const [name, value] = pair.split("=");

    const cookie: Cookie = {
      name,
      value,
      domain: url.hostname,
      path: "/",
      secure: false,
      sameSite: "Lax",
    };

    for (const attribute of attributes) {
      const [key, attrValue] = attribute.split("=");
      const normalized = key.toLowerCase();

      if (normalized === "domain" && attrValue) cookie.domain = attrValue;
      if (normalized === "path" && attrValue) cookie.path = attrValue;
      if (normalized === "secure") cookie.secure = true;
      if (normalized === "samesite" && isSameSite(attrValue)) {
        cookie.sameSite = attrValue;
      }
    }

    this.cookies = this.cookies.filter((item) => {
      return !(item.name === cookie.name && item.domain === cookie.domain);
    });
    this.cookies.push(cookie);
  }

  getCookieHeader(requestUrl: string) {
    const url = new URL(requestUrl);

    return this.cookies
      .filter((cookie) => url.hostname.endsWith(cookie.domain))
      .filter((cookie) => url.pathname.startsWith(cookie.path))
      .filter((cookie) => !cookie.secure || url.protocol === "https:")
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
  }
}

function isSameSite(value: string | undefined): value is Cookie["sameSite"] {
  return value === "Strict" || value === "Lax" || value === "None";
}
