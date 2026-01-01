import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCleanRoomData } from '@/hooks/useCleanRoomData';
import { useDataSimulator } from '@/hooks/useDataSimulator';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { TrendChart } from '@/components/dashboard/TrendChart';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { roomData, roomHistory, alerts, loading: dataLoading } = useCleanRoomData();
  
  // Enable data simulation
  useDataSimulator(!!user);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background grid-overlay">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-6">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h2 className="font-display text-lg font-semibold tracking-wide text-foreground">
                ACTIVE ALERTS
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded">
                {alerts.length}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alerts.slice(0, 6).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </section>
        )}

        {/* Room Cards Section */}
        <section className="mb-6">
          <h2 className="font-display text-lg font-semibold tracking-wide text-foreground mb-4">
            CLEAN ROOM STATUS
          </h2>
          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : roomData.length === 0 ? (
            <div className="industrial-panel p-8 text-center">
              <p className="text-muted-foreground">
                Waiting for sensor data... Simulation will begin shortly.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roomData.map((room) => (
                <RoomCard key={room.roomId} room={room} />
              ))}
            </div>
          )}
        </section>

        {/* Trend Charts Section */}
        {roomHistory.length > 0 && roomHistory[0].data.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold tracking-wide text-foreground mb-4">
              TREND ANALYSIS
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <TrendChart
                roomHistory={roomHistory}
                dataKey="temperature"
                title="Temperature"
                unit="°C"
              />
              <TrendChart
                roomHistory={roomHistory}
                dataKey="humidity"
                title="Humidity"
                unit="%"
              />
              <TrendChart
                roomHistory={roomHistory}
                dataKey="pressure"
                title="Differential Pressure"
                unit="Pa"
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Clean Room EMS v1.0</span>
            <span className="font-mono">Auto-refresh: 5s</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
