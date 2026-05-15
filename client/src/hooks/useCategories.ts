import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api';
import type { AxiosResponse } from 'axios';

interface Category {
  _id: string;
  name: string;
  nameTamil: string;
  slug: string;
  image: string;
  description: string;
  order: number;
  visible: boolean;
  productCount: number;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  refetch: () => void;
}

export function useCategories(all = false): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse = await categoriesAPI.getAll({ all: all ? 'true' : undefined });
      setCategories(res.data.data.categories);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [all]);

  return { categories, loading, refetch: fetch };
}
