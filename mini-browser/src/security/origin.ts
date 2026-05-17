export interface Origin {
  protocol: string;
  hostname: string;
  port: string;
}

export function getOrigin(input: string): Origin {
  const url = new URL(input);

  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port || defaultPort(url.protocol),
  };
}

export function isSameOrigin(a: string, b: string) {
  const left = getOrigin(a);
  const right = getOrigin(b);

  return (
    left.protocol === right.protocol &&
    left.hostname === right.hostname &&
    left.port === right.port
  );
}

function defaultPort(protocol: string) {
  if (protocol === "https:") return "443";
  if (protocol === "http:") return "80";
  return "";
}
