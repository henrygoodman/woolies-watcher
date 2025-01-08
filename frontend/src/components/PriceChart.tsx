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

const themeColors = {
  light: {
    lineStroke: 'black',
    gridStroke: '#ccc',
  },
  dark: {
    lineStroke: 'white',
    gridStroke: '#666',
  },
};

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
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Detect theme from the document's data-theme attribute
    const handleThemeChange = () => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') || 'light';
      setThemeMode(currentTheme as 'light' | 'dark');
    };

    // Initial theme setup
    handleThemeChange();

    // Add a mutation observer to detect changes to the data-theme attribute
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadPriceUpdates = async () => {
      try {
        const updates = await fetchPriceUpdatesApi(productId);

        const data: ChartDataPoint[] = [];

        if (updates.length > 0) {
          const firstUpdate = updates[0];
          const firstUpdateDate = new Date(firstUpdate.updated_at);
          const leftAnchorDate = new Date(
            firstUpdateDate.getTime() - 24 * 60 * 60 * 1000
          );

          // Add left anchor point
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

          // Add right anchor point
          data.push({
            updatedAt: new Date().toISOString(),
            price: currentPrice,
          });
        } else {
          // Default anchor points
          const leftAnchorDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
          data.push({
            updatedAt: leftAnchorDate.toISOString(),
            price: currentPrice,
          });
          data.push({
            updatedAt: new Date().toISOString(),
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

  const currentTheme = themeColors[themeMode];

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Price History</h3>
      {loading && <LoadingIndicator />}
      {error && <ErrorMessage error={error} />}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={currentTheme.gridStroke}
            />
            <XAxis
              dataKey="updatedAt"
              padding={{ left: 20, right: 20 }}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis
              domain={[
                (dataMin: number) => {
                  const padding = Math.abs(dataMin * 0.5);
                  const roundedMin = Math.floor((dataMin - padding) * 10) / 10; // Round down to nearest 10c
                  return Math.max(0, roundedMin);
                },
                (dataMax: number) => {
                  const padding = Math.abs(dataMax * 0.5);
                  const roundedMax = Math.ceil((dataMax + padding) * 10) / 10; // Round up to nearest 10c
                  return roundedMax;
                },
              ]}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />

            <Tooltip
              formatter={(value: number, name: string) => [
                <span style={{ color: themeMode === 'dark' ? '#ddd' : '#333' }}>
                  {`${name.charAt(0).toUpperCase() + name.slice(1)}: $${value.toFixed(2)}`}
                </span>,
              ]}
              labelFormatter={(label) => (
                <span style={{ color: themeMode === 'dark' ? '#ddd' : '#333' }}>
                  {`Date: ${new Date(label).toLocaleDateString()}`}
                </span>
              )}
              contentStyle={{
                backgroundColor: themeMode === 'dark' ? '#333' : '#fff',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
              labelStyle={{
                color: themeMode === 'dark' ? '#ddd' : '#333',
              }}
            />

            <Line
              type="linear"
              dataKey="price"
              stroke={currentTheme.lineStroke} // Dynamic theme color
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
