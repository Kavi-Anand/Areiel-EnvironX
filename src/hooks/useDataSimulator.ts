import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ROOM_IDS = ['CR-01', 'CR-02', 'CR-03'];

const generateRandomValue = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
};

export const useDataSimulator = (enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const simulateData = async () => {
      try {
        const records = ROOM_IDS.map((roomId) => {
          const temperature = generateRandomValue(18, 26);
          const humidity = generateRandomValue(40, 60);
          const pressure = generateRandomValue(-5, 5);

          return {
            room_id: roomId,
            temperature,
            humidity,
            pressure,
            timestamp: new Date().toISOString()
          };
        });

        const { error: insertError } = await supabase
          .from('clean_room_data')
          .insert(records);

        if (insertError) {
          console.error('Error inserting data:', insertError);
          return;
        }

        // Check for alerts
        for (const record of records) {
          const alerts = [];

          if (record.temperature > 24) {
            alerts.push({
              room_id: record.room_id,
              type: 'Temperature',
              value: record.temperature,
              message: `High temperature alert: ${record.temperature}°C exceeds 24°C threshold`,
              timestamp: new Date().toISOString()
            });
          }

          if (record.humidity < 40) {
            alerts.push({
              room_id: record.room_id,
              type: 'Humidity',
              value: record.humidity,
              message: `Low humidity alert: ${record.humidity}% below 40% threshold`,
              timestamp: new Date().toISOString()
            });
          }

          if (record.pressure < -3 || record.pressure > 3) {
            alerts.push({
              room_id: record.room_id,
              type: 'Pressure',
              value: record.pressure,
              message: `Pressure out of range: ${record.pressure} Pa outside ±3 Pa threshold`,
              timestamp: new Date().toISOString()
            });
          }

          if (alerts.length > 0) {
            await supabase.from('alerts').insert(alerts);
          }
        }
      } catch (err) {
        console.error('Simulation error:', err);
      }
    };

    // Initial simulation
    simulateData();

    // Simulate every 5 seconds
    intervalRef.current = setInterval(simulateData, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
};
