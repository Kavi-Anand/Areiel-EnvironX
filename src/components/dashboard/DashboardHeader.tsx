import React from 'react';
import { Activity, LogOut, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardHeader: React.FC = () => {
  const { user, role, signOut } = useAuth();

  return (
    <header className="industrial-panel border-b-0 rounded-b-none">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-wider text-foreground">
                  CLEAN ROOM EMS
                </h1>
                <p className="text-xs text-muted-foreground tracking-wide">
                  Environmental Monitoring System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <div className="status-indicator status-indicator-normal" />
              <span className="text-sm font-medium text-foreground">SYSTEM ONLINE</span>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-xs font-medium text-primary">
                <Shield className="w-3 h-3" />
                {role?.toUpperCase() || 'OPERATOR'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
