import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { RoomHistory } from '@/hooks/useCleanRoomData';

interface TrendChartProps {
  roomHistory: RoomHistory[];
  dataKey: 'temperature' | 'humidity' | 'pressure';
  title: string;
  unit: string;
  thresholds?: { warning: number; danger: number; type: 'above' | 'below' | 'range'; rangeValue?: number };
}

const ROOM_COLORS = {
  'CR-01': '#06b6d4',
  'CR-02': '#10b981',
  'CR-03': '#f59e0b'
};

export const TrendChart: React.FC<TrendChartProps> = ({ 
  roomHistory, 
  dataKey, 
  title, 
  unit 
}) => {
  // Merge all room data by timestamp
  const mergedData = roomHistory[0]?.data.map((_, index) => {
    const point: Record<string, string | number> = {
      time: new Date(roomHistory[0].data[index]?.timestamp || '').toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    roomHistory.forEach((room) => {
      const dataPoint = room.data[index];
      if (dataPoint) {
        point[room.roomId] = Number(dataPoint[dataKey]);
      }
    });

    return point;
  }) || [];

  return (
    <div className="chart-container">
      <h3 className="font-display text-sm font-semibold tracking-wide text-foreground mb-4 uppercase">
        {title} Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={mergedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.5} 
          />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={10}
            tickLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          {roomHistory.map((room) => (
            <Line
              key={room.roomId}
              type="monotone"
              dataKey={room.roomId}
              stroke={ROOM_COLORS[room.roomId as keyof typeof ROOM_COLORS] || '#888'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
