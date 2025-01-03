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

/*
  TODO:
  - Render left/right anchors properly
  - Render all points properly
  - Check if browser dates are compatible with backend
  - Fix aesthetics
*/
export const PriceChart = ({
  productId,
  currentPrice,
}: {
  productId: number;
  currentPrice: number;
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPriceUpdates = async () => {
      try {
        const updates = await fetchPriceUpdatesApi(productId);

        const data: ChartDataPoint[] = [];

        if (updates.length > 0) {
          const firstUpdate = updates[0];
          const firstUpdateDate = new Date(firstUpdate.updated_at);
          console.log(firstUpdateDate, firstUpdate);
          const leftAnchorDate = new Date(
            firstUpdateDate.getTime() - 24 * 60 * 60 * 1000
          );

          // Add left anchor point (one day before the first price update)
          data.push({
            updatedAt: leftAnchorDate.toISOString(),
            price: firstUpdate.old_price || currentPrice,
          });

          // Add first price update
          data.push({
            updatedAt: firstUpdateDate.toISOString(),
            price: firstUpdate.new_price,
          });

          // Add remaining updates
          updates.slice(1).forEach((update) => {
            const updateDate = new Date(update.updated_at);
            if (!isNaN(updateDate.getTime())) {
              data.push({
                updatedAt: updateDate.toISOString(),
                price: update.new_price,
              });
            }
          });

          // Add right anchor point (current price)
          console.log(new Date());
          data.push({
            updatedAt: new Date().toISOString(), // Current time
            price: currentPrice,
          });
        } else {
          // No updates, fallback with default anchor points
          const leftAnchorDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // A day ago
          data.push({
            updatedAt: leftAnchorDate.toISOString(),
            price: currentPrice,
          });
          data.push({
            updatedAt: new Date().toISOString(), // Current time
            price: currentPrice,
          });
        }

        setChartData(data);
      } catch (err) {
        console.log('Failed to load price updates', err);
        setError('Failed to load price updates: ' + err);
      } finally {
        setLoading(false);
      }
    };

    loadPriceUpdates();
  }, [productId, currentPrice]);

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Price History</h3>
      {loading && <LoadingIndicator />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="updatedAt"
              padding={{ left: 20, right: 20 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis
              domain={[
                (dataMin: number) => Math.max(0, dataMin - 5),
                (dataMax: number) => dataMax + 5,
              ]}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              formatter={(value) => `$${value}`}
              labelFormatter={(label) =>
                `Date: ${new Date(label).toLocaleDateString()}`
              }
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
