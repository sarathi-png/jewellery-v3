import { useState, useEffect } from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'framer-motion';
import {
  Package, ShoppingCart, BarChart3, AlertTriangle, TrendingUp,
  ThumbsUp, ThumbsDown, Zap, Trash2, RefreshCw, Layers, Archive
} from 'lucide-react';
import { analyticsAPI } from '@/lib/api';

interface CategoryStock {
  _id: string;
  categoryName: string;
  categorySlug: string;
  productCount: number;
  totalStock: number;
  totalSold: number;
  totalPurchased: number;
  totalRevenue: number;
}

interface TopSeller {
  _id: string;
  productName: string;
  totalSold: number;
  revenue: number;
  remainingStock: number;
  categoryName: string;
}

interface UnsoldProduct {
  _id: string;
  name: string;
  stock: number;
  price: number;
  category: { name: string; slug: string };
}

interface AnalysisItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  comparePrice: number;
  stock: number;
  totalSold: number;
  monthlySold: number;
  discountPct: number;
  reason: string;
}

interface AnalysisResult {
  valueForMoney: AnalysisItem[];
  notValueForMoney: AnalysisItem[];
  futureDemand: AnalysisItem[];
  wasteToBuy: AnalysisItem[];
  generatedAt: string;
}

const statCardClass = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5';

export default function StockAnalytics() {
  const [categories, setCategories] = useState<CategoryStock[]>([]);
  const [grandTotalStock, setGrandTotalStock] = useState(0);
  const [grandTotalSold, setGrandTotalSold] = useState(0);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [unsold, setUnsold] = useState<UnsoldProduct[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [overviewRes, topRes, unsoldRes] = await Promise.all([
          analyticsAPI.getStockOverview(),
          analyticsAPI.getTopSellers({ month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
          analyticsAPI.getUnsoldProducts(),
        ]);
        setCategories(overviewRes.data.data.categories || []);
        setGrandTotalStock(overviewRes.data.data.grandTotalStock || 0);
        setGrandTotalSold(overviewRes.data.data.grandTotalSold || 0);
        setTopSellers(topRes.data.data.topSellers || []);
        setUnsold(unsoldRes.data.data.unsold || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalysisLoading(true);
    setShowAnalysis(true);
    try {
      const res = await analyticsAPI.runAnalysis();
      setAnalysis(res.data.data);
    } catch {
      // silent
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Stock Analytics - Admin Panel</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Stock Analytics</h1>
            <p className="text-gray-500">Inventory overview and sales insights</p>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={analysisLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {analysisLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Run Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Categories', value: categories.length, icon: Layers, color: 'bg-amber-500' },
            { label: 'Total Stock (Purchased)', value: grandTotalStock + grandTotalSold, icon: Package, color: 'bg-blue-500' },
            { label: 'Total Sold', value: grandTotalSold, icon: ShoppingCart, color: 'bg-green-500' },
            { label: 'In Hand', value: grandTotalStock, icon: Archive, color: 'bg-purple-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={statCardClass}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Stock by Category
          </h2>
          {categories.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Category</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Products</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Purchased</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Sold</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">In Hand</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">{cat.categoryName}</td>
                      <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">{cat.productCount}</td>
                      <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400">{cat.totalPurchased}</td>
                      <td className="py-3 px-2 text-right text-green-600 font-medium">{cat.totalSold}</td>
                      <td className="py-3 px-2 text-right text-blue-600 font-medium">{cat.totalStock}</td>
                      <td className="py-3 px-2 text-right text-gray-900 dark:text-white">₹{cat.totalRevenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No category data</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Top Sellers This Month
            </h2>
            {topSellers.length ? (
              <div className="space-y-3">
                {topSellers.slice(0, 10).map((item, i) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-bold text-gray-400">#{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{item.productName}</p>
                        <p className="text-gray-500 text-xs">{item.categoryName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{item.totalSold} sold</p>
                      <p className="text-xs text-gray-500">{item.remainingStock} left</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No sales this month</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Unsold Products
            </h2>
            {unsold.length ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {unsold.slice(0, 15).map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{item.name}</p>
                      <p className="text-gray-500 text-xs">{item.category?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-500">{item.stock} in stock</p>
                      <p className="text-xs text-gray-500">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">All products have been sold</p>
            )}
          </div>
        </div>

        {showAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Detailed Analysis
              {analysis && (
                <span className="text-xs font-normal text-gray-400">
                  Generated {new Date(analysis.generatedAt).toLocaleString('en-IN')}
                </span>
              )}
            </h2>

            {analysisLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : analysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Value for Money
                    <span className="text-xs font-normal text-gray-400 ml-auto">({analysis.valueForMoney.length})</span>
                  </h3>
                  {analysis.valueForMoney.length ? (
                    <div className="space-y-2">
                      {analysis.valueForMoney.map((item) => (
                        <div key={item._id} className="flex items-start justify-between text-sm p-2 rounded-lg bg-green-50 dark:bg-green-900/10">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category} — {item.reason}</p>
                          </div>
                          <span className="text-green-600 font-medium text-xs whitespace-nowrap">-{item.discountPct}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No value-for-money products found</p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4" /> Not Value for Money
                    <span className="text-xs font-normal text-gray-400 ml-auto">({analysis.notValueForMoney.length})</span>
                  </h3>
                  {analysis.notValueForMoney.length ? (
                    <div className="space-y-2">
                      {analysis.notValueForMoney.map((item) => (
                        <div key={item._id} className="flex items-start justify-between text-sm p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category} — {item.reason}</p>
                          </div>
                          <span className="text-red-500 font-medium text-xs">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">All products are reasonably priced</p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Future Demand
                    <span className="text-xs font-normal text-gray-400 ml-auto">({analysis.futureDemand.length})</span>
                  </h3>
                  {analysis.futureDemand.length ? (
                    <div className="space-y-2">
                      {analysis.futureDemand.map((item) => (
                        <div key={item._id} className="flex items-start justify-between text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category} — {item.reason}</p>
                          </div>
                          <span className="text-blue-600 font-medium text-xs whitespace-nowrap">{item.monthlySold}/mo</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No products with critical demand</p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Waste to Buy
                    <span className="text-xs font-normal text-gray-400 ml-auto">({analysis.wasteToBuy.length})</span>
                  </h3>
                  {analysis.wasteToBuy.length ? (
                    <div className="space-y-2">
                      {analysis.wasteToBuy.map((item) => (
                        <div key={item._id} className="flex items-start justify-between text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category} — {item.reason}</p>
                          </div>
                          <span className="text-red-500 font-medium text-xs">{item.stock} units</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No wasteful inventory found</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Failed to load analysis</p>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
