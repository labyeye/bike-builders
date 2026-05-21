/**
 * API Client with proper credentials and headers for session-based auth
 * Ensures cookies are sent with all requests including FormData uploads
 */

const API_BASE = "https://backend.bikebuilders.in";

/**
 * Make an API request with proper headers and credentials
 * @param {string} endpoint - API endpoint (e.g., "/api/admin/bike")
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions = {
    credentials: "include", // Always include credentials for session cookies
    headers: {
      "Accept": "application/json",
      ...options.headers, // Allow override
    },
  };

  // Don't set Content-Type for FormData - let browser set it with boundary
  if (options.body instanceof FormData) {
    delete defaultOptions.headers["Content-Type"];
  } else if (!options.headers || !options.headers["Content-Type"]) {
    // Set Content-Type for JSON requests
    if (options.body && typeof options.body === "string") {
      defaultOptions.headers["Content-Type"] = "application/json";
    }
  }

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, finalOptions);
    
    // Handle auth errors
    if (response.status === 401) {
      console.error("Authentication failed. Please login again.");
      // Clear stored user and redirect to login
      try {
        localStorage.removeItem("bb_user");
      } catch (e) {}
      // You might want to dispatch a logout action here if using state management
      window.location.href = "/admin/login";
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
  const response = await apiGet("/api/admin/check-auth");
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
