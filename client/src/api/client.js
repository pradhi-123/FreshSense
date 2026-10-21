export async function checkHealth(timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/health', { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    return null;
  }
}

export async function fetchLandingContent(timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/content/landing', { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.features || data.features.length === 0) return null;
    return data;
  } catch (err) {
    clearTimeout(id);
    return null;
  }
}

export async function fetchCrafts() {
  try {
    const res = await fetch('/api/crafts');
    if (res.ok) {
      const data = await res.json();
      return data.crafts || [];
    }
  } catch (err) {
    console.warn('Backend crafts fetch failed, using client crafts fallback:', err);
  }
  return null;
}

export async function calculateFairPrice(payload) {
  try {
    const res = await fetch('/api/ai/calculate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Fair price calculation API fallback:', err);
  }

  // Client-side instant calculation fallback
  const hours = Number(payload?.laborHours) || 16;
  const mat = Number(payload?.materialCost) || 800;
  const rate = Number(payload?.hourlyRate) || 150;
  const total = (hours * rate) + mat;

  return {
    ok: true,
    fairPrice: total,
    formattedPrice: `₹ ${total.toLocaleString('en-IN')}`,
    breakdown: { laborHours: hours, hourlyRate: rate, laborTotal: hours * rate, materialCost: mat },
  };
}

export async function generateCraftStory(payload) {
  try {
    const res = await fetch('/api/ai/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Story generation API fallback:', err);
  }

  return {
    ok: true,
    story: payload?.voiceText
      ? `“${payload.voiceText}” — Woven by hand using traditional pure silk threads, preserving 5 generations of craft lineage.`
      : 'Handcrafted with natural dyes and pure yarn, carrying generations of heritage lineage.',
  };
}
