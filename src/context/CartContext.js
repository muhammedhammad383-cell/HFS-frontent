import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const isCustomer = user && user.role === "customer";
  const [cart, setCart] = useState({ items: [], saved: [], subtotal: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isCustomer) { setCart({ items: [], saved: [], subtotal: 0 }); setCartLoaded(true); return; }
    setCartLoaded(false);
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (e) { /* ignore */ }
    finally { setCartLoaded(true); }
  }, [isCustomer]);

  const refreshWishlist = useCallback(async () => {
    if (!isCustomer) { setWishlist([]); return; }
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data);
    } catch (e) { /* ignore */ }
  }, [isCustomer]);

  useEffect(() => { refreshCart(); refreshWishlist(); }, [refreshCart, refreshWishlist]);

  const addToCart = async (productId, qty = 1) => {
    if (!isCustomer) { toast.error("Please login as a customer to shop"); return false; }
    await api.post("/cart/add", { product_id: productId, qty });
    await refreshCart();
    toast.success("Added to cart");
    return true;
  };

  const updateQty = async (productId, qty) => {
    await api.put("/cart/update", { product_id: productId, qty });
    await refreshCart();
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/${productId}`);
    await refreshCart();
  };

  const saveForLater = async (productId) => {
    await api.post(`/cart/save-for-later/${productId}`);
    await refreshCart();
  };

  const moveToCart = async (productId) => {
    await api.post(`/cart/move-to-cart/${productId}`);
    await refreshCart();
  };

  const toggleWishlist = async (productId) => {
    if (!isCustomer) { toast.error("Please login as a customer"); return; }
    const { data } = await api.post(`/wishlist/toggle/${productId}`);
    await refreshWishlist();
    toast.success(data.added ? "Added to wishlist" : "Removed from wishlist");
  };

  const inWishlist = (id) => wishlist.some((p) => p.id === id);
  const cartCount = cart.items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, wishlist, cartCount, cartLoaded, refreshCart, refreshWishlist, addToCart,
        updateQty, removeItem, saveForLater, moveToCart, toggleWishlist, inWishlist }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
