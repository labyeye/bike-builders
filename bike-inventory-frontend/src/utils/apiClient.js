import { authHeaders, clearToken } from "./auth";

const API_BASE = "https://backend.bikebuilders.in";

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Accept": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  };

  if (options.body instanceof FormData) {
    delete defaultOptions.headers["Content-Type"];
  } else if (!options.headers || !options.headers["Content-Type"]) {
    if (options.body && typeof options.body === "string") {
      defaultOptions.headers["Content-Type"] = "application/json";
    }
  }

  const finalOptions = { ...defaultOptions, ...options, headers: defaultOptions.headers };

  try {
    const response = await fetch(url, finalOptions);

    if (response.status === 401) {
      console.error("Authentication failed. Please login again.");
      clearToken();
      try {
        localStorage.removeItem("bb_user");
      } catch (e) {}
      window.location.href = "/login";
    }

    return response;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}

/**
 * GET request
 */
export function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: "GET",
    ...options,
  });
}

/**
 * POST request
 */
export function apiPost(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  });
}

/**
 * PUT request
 */
export function apiPut(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE request
 */
export function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, {
    method: "DELETE",
    ...options,
  });
}

/**
 * Check authentication status
 */
export async function checkAuth() {
  const response = await apiGet("/api/check-auth");
  if (!response.ok) {
    throw new Error("Authentication check failed");
  }
  return response.json();
}

export default {
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  checkAuth,
};
