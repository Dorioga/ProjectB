const cache = new Map();

const SUMMARY_URL = "https://es.wikipedia.org/api/rest_v1/page/summary/";

export async function fetchElementImage(name) {
  if (!name) return null;

  const key = String(name).trim();

  if (cache.has(key)) {
    return cache.get(key);
  }

  const url = `${SUMMARY_URL}${encodeURIComponent(key)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      cache.set(key, null);
      return null;
    }

    const data = await response.json();

    const image =
      data?.originalimage?.source ||
      data?.thumbnail?.source ||
      null;

    cache.set(key, image);
    return image;
  } catch (error) {
    cache.set(key, null);
    return null;
  }
}
