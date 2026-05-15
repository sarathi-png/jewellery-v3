import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CART_STORAGE_KEY } from '@/lib/constants';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: number;
  purity: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    saveCart(newItems);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          const updated = prev.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
          );
          saveCart(updated);
          return updated;
        }
        const updated = [...prev, { ...item, quantity: 1 }];
        saveCart(updated);
        return updated;
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const updated = prev.filter((i) => i.productId !== productId);
        saveCart(updated);
        return updated;
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) => {
        const updated = prev.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        );
        saveCart(updated);
        return updated;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalAmount, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
