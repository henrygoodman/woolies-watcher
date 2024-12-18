'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchPriceUpdatesApi } from '@/lib/api/priceApi';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';

type ChartDataPoint = {
  updatedAt: string;
  price: number;
};

export const PriceChart = ({ productId }: { productId: number }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPriceUpdates = async () => {
      try {
        const updates = await fetchPriceUpdatesApi(productId);
        const data: ChartDataPoint[] = updates.map((update) => ({
          updatedAt: new Date(update.updated_at).toLocaleDateString(),
          price: update.new_price,
        }));
        setChartData(data);
      } catch (err) {
        setError('Failed to load price updates' + err);
      } finally {
        setLoading(false);
      }
    };

    loadPriceUpdates();
  }, [productId]);

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Price History</h3>
      {loading && <LoadingIndicator />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && (!chartData || chartData.length < 2) && (
        <div className="h-32 bg-muted flex items-center justify-center p-4">
          <span className="text-muted-foreground">
            No sufficient price history available. The product may have just
            started being tracked.
          </span>
        </div>
      )}
      {!loading && !error && chartData && chartData.length >= 2 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="updatedAt" padding={{ left: 20, right: 20 }} />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              formatter={(value) => `$${value}`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
