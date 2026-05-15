import { useState, useEffect } from 'react';
import { productsAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';

interface Product {
  _id: string;
  name: string;
  nameTamil: string;
  slug: string;
  description: string;
  category: { _id: string; name: string; slug: string };
  images: string[];
  weight: number;
  purity: string;
  price: number;
  comparePrice: number;
  stock: number;
  sku: string;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  visible: boolean;
  specifications: { label: string; value: string }[];
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  refetch: () => void;
}

export function useProducts(params?: Record<string, string | number | boolean>): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: AxiosResponse = await productsAPI.getAll(params);
      setProducts(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  return { products, loading, error, pagination, refetch: fetchProducts };
}
