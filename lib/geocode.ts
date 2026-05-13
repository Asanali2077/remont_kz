export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const headers = { "User-Agent": "Remont.kz/1.0 (diploma project)" };
  try {
    // Try with Kazakhstan country restriction first
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=kz&limit=1`;
    const res = await fetch(url, { headers });
    const data = await res.json() as Array<{ lat: string; lon: string }>;
    if (Array.isArray(data) && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }

    // Retry without country restriction
    const res2 = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers }
    );
    const data2 = await res2.json() as Array<{ lat: string; lon: string }>;
    if (Array.isArray(data2) && data2.length > 0) {
      return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}
