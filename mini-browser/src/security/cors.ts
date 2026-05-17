import { isSameOrigin } from "./origin";

export interface CORSInput {
  from: string;
  to: string;
  responseHeaders: Record<string, string>;
}

export function canReadResponse(input: CORSInput) {
  if (isSameOrigin(input.from, input.to)) {
    return true;
  }

  const allowedOrigin = input.responseHeaders["access-control-allow-origin"];
  return allowedOrigin === "*" || allowedOrigin === new URL(input.from).origin;
}
