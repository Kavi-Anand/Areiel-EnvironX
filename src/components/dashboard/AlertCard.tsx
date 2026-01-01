import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Alert = Database['public']['Tables']['alerts']['Row'];

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Temperature':
        return '🌡️';
      case 'Humidity':
        return '💧';
      case 'Pressure':
        return '📊';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="alert-card">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-destructive/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getTypeIcon(alert.type)}</span>
              <span className="font-semibold text-foreground">{alert.room_id}</span>
              <span className="px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded">
                {alert.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {alert.message || `${alert.type} value: ${alert.value}`}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{formatTimestamp(alert.timestamp)}</span>
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-destructive text-glow-danger">
            {Number(alert.value).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};
