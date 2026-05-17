export interface CSPPolicy {
  defaultSrc?: string[];
  scriptSrc?: string[];
}

export function allowsScript(policy: CSPPolicy, source: string) {
  const allowed = policy.scriptSrc ?? policy.defaultSrc ?? ["*"];
  return allowed.includes("*") || allowed.includes(source);
}
