import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CleanRoomData = Database['public']['Tables']['clean_room_data']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

export interface RoomData {
  roomId: string;
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'danger';
}

export interface RoomHistory {
  roomId: string;
  data: CleanRoomData[];
}

const ROOM_IDS = ['CR-01', 'CR-02', 'CR-03'];

const getStatus = (temp: number, humidity: number, pressure: number): 'normal' | 'warning' | 'danger' => {
  if (temp > 24 || humidity < 40 || pressure < -3 || pressure > 3) {
    return 'danger';
  }
  if (temp > 23 || humidity < 45 || pressure < -2 || pressure > 2) {
    return 'warning';
  }
  return 'normal';
};

export const useCleanRoomData = () => {
  const [roomData, setRoomData] = useState<RoomData[]>([]);
  const [roomHistory, setRoomHistory] = useState<RoomHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestData = async () => {
    try {
      const promises = ROOM_IDS.map(async (roomId) => {
        const { data, error } = await supabase
          .from('clean_room_data')
          .select('*')
          .eq('room_id', roomId)
          .order('timestamp', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        return data?.[0] || null;
      });

      const results = await Promise.all(promises);
      const formattedData: RoomData[] = results
        .filter((item): item is CleanRoomData => item !== null)
        .map((item) => ({
          roomId: item.room_id,
          temperature: Number(item.temperature),
          humidity: Number(item.humidity),
          pressure: Number(item.pressure),
          timestamp: item.timestamp,
          status: getStatus(Number(item.temperature), Number(item.humidity), Number(item.pressure))
        }));

      setRoomData(formattedData);
    } catch (err) {
      console.error('Error fetching room data:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const promises = ROOM_IDS.map(async (roomId) => {
        const { data, error } = await supabase
          .from('clean_room_data')
          .select('*')
          .eq('room_id', roomId)
          .order('timestamp', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        return { roomId, data: data?.reverse() || [] };
      });

      const results = await Promise.all(promises);
      setRoomHistory(results);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchLatestData(), fetchHistory(), fetchAlerts()]);
      setLoading(false);
    };

    loadData();

    // Set up realtime subscription
    const channel = supabase
      .channel('clean-room-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clean_room_data'
        },
        () => {
          fetchLatestData();
          fetchHistory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchLatestData();
      fetchAlerts();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { roomData, roomHistory, alerts, loading, refetch: fetchLatestData };
};
