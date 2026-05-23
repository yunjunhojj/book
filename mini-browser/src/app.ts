import { parseCSS } from "./css/parser";
import { computeStyleTree } from "./css/style";
import { inspectDOM } from "./devtools/domInspector";
import { formatNetworkResponse } from "./devtools/networkPanel";
import { RenderLogger, type RenderLogEntry } from "./devtools/renderLog";
import { parseDOM } from "./html/parser";
import { tokenizeHTML } from "./html/tokenizer";
import { fetchHTML } from "./network/http";
import { layout } from "./render/layout";
import { paint } from "./render/paint";
import { buildRenderTree } from "./render/renderTree";

export function createMiniBrowser(root: HTMLElement) {
  root.innerHTML = `
    <main class="browser">
      <form class="address-bar">
        <input name="url" value="mini://sample" aria-label="URL" />
        <button type="submit">이동</button>
        <button type="button" data-sample>샘플</button>
      </form>
      <section class="workspace">
        <div class="viewport-wrap">
          <canvas class="viewport" width="980" height="640"></canvas>
        </div>
        <aside class="devtools">
          <h2>Mini DevTools</h2>
          <section class="panel">
            <h3>Network</h3>
            <pre data-network></pre>
          </section>
          <section class="panel">
            <h3>DOM</h3>
            <pre data-dom></pre>
          </section>
          <section class="panel">
            <h3>Render Log</h3>
            <pre data-log></pre>
          </section>
        </aside>
      </section>
    </main>
  `;

  const form = root.querySelector<HTMLFormElement>(".address-bar")!;
  const input = root.querySelector<HTMLInputElement>('input[name="url"]')!;
  const sampleButton = root.querySelector<HTMLButtonElement>("[data-sample]")!;
  const canvas = root.querySelector<HTMLCanvasElement>(".viewport")!;
  const networkPanel = root.querySelector<HTMLPreElement>("[data-network]")!;
  const domPanel = root.querySelector<HTMLPreElement>("[data-dom]")!;
  const logPanel = root.querySelector<HTMLPreElement>("[data-log]")!;

  const renderURL = async (url: string) => {
    networkPanel.textContent = "loading...";
    domPanel.textContent = "";
    logPanel.textContent = "";

    try {
      const result = await navigate(url, canvas);
      networkPanel.textContent = formatNetworkResponse(result.response);
      domPanel.textContent = inspectDOM(result.dom);
      logPanel.textContent = formatLogs(result.logs);
    } catch (error) {
      networkPanel.textContent = error instanceof Error ? error.message : String(error);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void renderURL(input.value);
  });

  sampleButton.addEventListener("click", () => {
    input.value = "mini://sample";
    void renderURL(input.value);
  });

  void renderURL(input.value);
}

export async function navigate(url: string, canvas: HTMLCanvasElement) {
  const logger = new RenderLogger();

  logger.add("network", `${url} 요청 시작`);
  const response = await fetchHTML(url);
  logger.add("network", `${response.status} 응답 수신`);

  logger.add("html", "HTML 토큰화 시작");
  const tokens = tokenizeHTML(response.body);

  logger.add("html", "DOM 트리 생성");
  const dom = parseDOM(tokens);

  logger.add("css", "CSS 파싱");
  const css = extractStyleText(response.body);
  const rules = parseCSS(css);

  logger.add("style", "Computed Style 계산");
  const styledTree = computeStyleTree(dom, rules);

  logger.add("layout", "Render Tree 생성 및 Layout 계산");
  const renderTree = buildRenderTree(styledTree);
  if (!renderTree) {
    return { response, dom, logs: logger.getEntries() };
  }

  const layoutTree = layout(renderTree, {
    x: 0,
    y: 0,
    width: canvas.width,
  });

  logger.add("paint", "Canvas Paint");
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paint(ctx, layoutTree);

  return { response, dom, logs: logger.getEntries() };
}

function extractStyleText(html: string) {
  const matches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  return [...matches].map((match) => match[1]).join("\n");
}

function formatLogs(logs: RenderLogEntry[]) {
  return logs
    .map((entry) => `${entry.time.toFixed(2)}ms [${entry.step}] ${entry.message}`)
    .join("\n");
}
