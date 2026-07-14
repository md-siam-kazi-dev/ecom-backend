const API_BASE = process.env.NEXT_PUBLIC_API;

export interface AddToCartPayload {
  productId: string;
  productName: string;
  userEmail: string;
  price: number;
  quantity: number;
}

export interface AddToCartResult {
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

/**
 * Sends the add-to-cart request to the backend.
 * If the user is logged out (no token), the POST request is ignored.
 * If the user is logged in, the JWT is sent for authentication.
 */
export async function addToCart(
  payload: AddToCartPayload,
  token: string | null,
): Promise<AddToCartResult> {
  if (!token) {
    // User is logged out -> ignore the POST request.
    return { ok: false, error: "User is not logged in" };
  }

  if (!API_BASE) {
    return { ok: false, error: "NEXT_PUBLIC_API is not configured" };
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/addCart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: "Failed to add to cart",
        data,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
