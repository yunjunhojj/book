export function renderServerHTML(count: number) {
  return `<button id="counter">Count: ${count}</button>`;
}

export function hydrateCounter(root: HTMLElement, initialCount: number) {
  let count = initialCount;
  const button = root.querySelector<HTMLButtonElement>("#counter")!;

  const expectedText = `Count: ${initialCount}`;
  if (button.textContent !== expectedText) {
    console.warn("Hydration mismatch", {
      server: button.textContent,
      client: expectedText,
    });
  }

  button.addEventListener("click", () => {
    count += 1;
    button.textContent = `Count: ${count}`;
  });
}
