import { API_URL, PAGE_SIZE } from "../constants/business";

async function readJson(response, fallbackMessage) {
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/businesses/categories`);
  const data = await readJson(response, "Failed to load categories.");
  return data.categories || [];
}

export async function getBusinesses(searchTerm = "", filters = {}, page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (searchTerm.trim()) params.set("search", searchTerm.trim());
  if (filters.city?.trim()) params.set("city", filters.city.trim());
  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters.website && filters.website !== "all") {
    params.set("website", filters.website);
  }

  const response = await fetch(
    `${API_URL}/businesses/db?${params.toString()}`
  );
  return readJson(response, "Failed to load businesses.");
}

export async function discoverBusinesses(city, category) {
  const params = new URLSearchParams({
    city: city.trim(),
    category: category || "all",
  });

  const response = await fetch(`${API_URL}/businesses?${params.toString()}`);

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    let message = "Business discovery failed.";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      message = data.message || message;
    } else {
      const responseText = await response.text();
      if (responseText) message = responseText;
    }

    throw new Error(message);
  }

  // The discovery endpoint returns CSV on success.
  await response.blob();
}
