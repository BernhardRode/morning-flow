/** Look up an element that the markup is expected to contain. */
export function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`index.html is missing #${id}`);
  return node as T;
}
