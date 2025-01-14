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
import { useTheme } from '@/contexts/ThemeContext';

type ChartDataPoint = {
  updatedAt: number;
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
  const { isDarkTheme } = useTheme();

  const currentTheme = isDarkTheme ? themeColors.dark : themeColors.light;

  useEffect(() => {
    const loadPriceUpdates = async () => {
      try {
        const updates = await fetchPriceUpdatesApi(productId);

        // Sort updates by updated_at before processing
        updates.sort(
          (a, b) =>
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );

        const data: ChartDataPoint[] = [];

        if (updates.length > 0) {
          updates.forEach((update) => {
            const updateDate = new Date(update.updated_at);
            if (!isNaN(updateDate.getTime())) {
              data.push({
                updatedAt: updateDate.getTime(),
                price: update.new_price,
              });
            }
          });
        }
        // Add right anchor point
        data.push({
          updatedAt: new Date().getTime(),
          price: currentPrice,
        });

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
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={currentTheme.gridStroke}
            />
            <XAxis
              dataKey="updatedAt"
              type="number"
              domain={['dataMin', 'dataMax']}
              scale="time"
              padding={{ left: 20, right: 20 }}
              tickFormatter={(timestamp) =>
                new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(timestamp))
              }
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
                <span
                  key={`${name}-${value}`}
                  style={{ color: isDarkTheme ? '#ddd' : '#333' }}
                >
                  {`${name.charAt(0).toUpperCase() + name.slice(1)}: $${value.toFixed(2)}`}
                </span>,
              ]}
              labelFormatter={(label) =>
                `Date: ${new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(label))}`
              }
              contentStyle={{
                backgroundColor: isDarkTheme ? '#333' : '#fff',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}
              labelStyle={{
                color: isDarkTheme ? '#ddd' : '#333',
              }}
            />

            <Line
              type="linear"
              dataKey="price"
              stroke={currentTheme.lineStroke} // Dynamic theme color
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
