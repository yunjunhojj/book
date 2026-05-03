export interface HttpResponse {
  url: string;
  status: number;
  contentType: string;
  headers: Record<string, string>;
  body: string;
}

export async function fetchHTML(url: string): Promise<HttpResponse> {
  if (url === "mini://sample") {
    return {
      url,
      status: 200,
      contentType: "text/html",
      headers: {},
      body: sampleHTML,
    };
  }

  const response = await fetch(url);
  const headers = Object.fromEntries(response.headers.entries());
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  return {
    url: response.url,
    status: response.status,
    contentType,
    headers,
    body,
  };
}

const sampleHTML = `
<html>
  <body>
    <style>
      body { background-color: #ffffff; color: #1e293b; font-size: 16px; }
      .title { color: #2563eb; font-size: 28px; }
      .box { background-color: #eef2ff; border-color: #6366f1; width: 760px; }
    </style>
    <div class="box">
      <h1 class="title">Mini Browser</h1>
      <p>HTML, CSS, Layout, Paint 흐름을 TypeScript로 실행합니다.</p>
    </div>
  </body>
</html>
`;
