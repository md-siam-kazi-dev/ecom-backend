import { useState } from "react";
import { addToCart } from "../lib/cart";

export interface Product {
  id: string;
  name: string;
  price: number;
  email: string;
}

interface ProductCardProps {
  product: Product;
  token: string | null;
  onAdded?: () => void;
}

const MAX_QUANTITY = 5;

export function ProductCard({ product, token, onAdded }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setStatus(null);

    const result = await addToCart(
      {
        productId: product.id,
        productName: product.name,
        userEmail: product.email,
        price: product.price,
        quantity,
      },
      token,
    );

    if (result.ok) {
      setStatus("Added to cart");
      onAdded?.();
    } else if (token) {
      setStatus(result.error ?? "Could not add to cart");
    } else {
      setStatus("Please log in to add items to your cart");
    }
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>

      <label htmlFor={`qty-${product.id}`}>Quantity</label>
      <select
        id={`qty-${product.id}`}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      >
        {Array.from({ length: MAX_QUANTITY }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <button type="button" onClick={handleAddToCart}>
        Add to cart
      </button>

      {status && <p className="status">{status}</p>}
    </div>
  );
}
