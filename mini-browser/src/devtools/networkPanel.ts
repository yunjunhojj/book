import type { HttpResponse } from "../network/http";

export function formatNetworkResponse(response: HttpResponse) {
  return [
    `${response.status} ${response.url}`,
    `content-type: ${response.contentType || "(unknown)"}`,
    `bytes: ${response.body.length}`,
  ].join("\n");
}
