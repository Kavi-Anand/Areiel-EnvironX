import React from 'react';
import { Thermometer, Droplets, Gauge, Clock } from 'lucide-react';
import type { RoomData } from '@/hooks/useCleanRoomData';

interface RoomCardProps {
  room: RoomData;
}

const StatusIndicator: React.FC<{ status: RoomData['status'] }> = ({ status }) => {
  const statusClasses = {
    normal: 'status-indicator-normal',
    warning: 'status-indicator-warning',
    danger: 'status-indicator-danger'
  };

  return <div className={`status-indicator ${statusClasses[status]}`} />;
};

const DataValue: React.FC<{ 
  value: number; 
  unit: string; 
  status?: 'normal' | 'warning' | 'danger';
  icon: React.ReactNode;
  label: string;
}> = ({ value, unit, status = 'normal', icon, label }) => {
  const valueClasses = {
    normal: 'data-display',
    warning: 'data-display data-display-warning',
    danger: 'data-display data-display-danger'
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={valueClasses[status]}>{value.toFixed(1)}</span>
        <span className="data-unit">{unit}</span>
      </div>
    </div>
  );
};

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const getTempStatus = (temp: number): RoomData['status'] => {
    if (temp > 24) return 'danger';
    if (temp > 23) return 'warning';
    return 'normal';
  };

  const getHumidityStatus = (humidity: number): RoomData['status'] => {
    if (humidity < 40) return 'danger';
    if (humidity < 45) return 'warning';
    return 'normal';
  };

  const getPressureStatus = (pressure: number): RoomData['status'] => {
    if (pressure < -3 || pressure > 3) return 'danger';
    if (pressure < -2 || pressure > 2) return 'warning';
    return 'normal';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="room-card">
      <div className="industrial-panel-header">
        <div className="flex items-center gap-3">
          <StatusIndicator status={room.status} />
          <h3 className="font-display text-lg font-semibold tracking-wide text-foreground">
            {room.roomId}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTimestamp(room.timestamp)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border">
        <DataValue
          value={room.temperature}
          unit="°C"
          status={getTempStatus(room.temperature)}
          icon={<Thermometer className="w-5 h-5" />}
          label="Temperature"
        />
        <DataValue
          value={room.humidity}
          unit="%"
          status={getHumidityStatus(room.humidity)}
          icon={<Droplets className="w-5 h-5" />}
          label="Humidity"
        />
        <DataValue
          value={room.pressure}
          unit="Pa"
          status={getPressureStatus(room.pressure)}
          icon={<Gauge className="w-5 h-5" />}
          label="Pressure"
        />
      </div>
    </div>
  );
};
