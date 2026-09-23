/** Loads a JSON file. Throws a readable error if it can't be fetched. */

export async function loadJSON(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Could not load ${url} (HTTP ${response.status})`);
  }
  return response.json();
}
