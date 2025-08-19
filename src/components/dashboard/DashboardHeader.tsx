import { Bell, Settings, Upload, Database, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  alertCount?: number;
  onUploadClick?: () => void;
  onSettingsClick?: () => void;
}

export function DashboardHeader({ 
  alertCount = 0, 
  onUploadClick, 
  onSettingsClick 
}: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Database Capacity Forecast</h1>
            <p className="text-sm text-muted-foreground">ML-Powered Analytics Dashboard</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <Activity className="h-4 w-4 text-success" />
          <span className="text-sm text-success">System Active</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUploadClick}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Data
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative gap-2"
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {alertCount}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}