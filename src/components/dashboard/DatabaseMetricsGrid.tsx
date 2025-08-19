import React from 'react';
import { Card } from '@/components/ui/card';
import { Database, Activity, TrendingDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DatabaseMetricsGridProps {
  data: any[];
  selectedDate?: Date;
}

export const DatabaseMetricsGrid = ({ data, selectedDate }: DatabaseMetricsGridProps) => {
  // Calculate metrics based on all data or selected date range
  const calculateMetrics = () => {
    if (!data.length) return null;

    const totalInputs = data.length;
    const dailyAverage = Math.round(totalInputs / 365);
    const cpuAvg = data.reduce((sum, item) => sum + (item.cpu_usage || 0), 0) / data.length;
    const memoryAvg = data.reduce((sum, item) => sum + (item.memory_usage || 0), 0) / data.length;
    const networkAvg = data.reduce((sum, item) => sum + (item.network_traffic || 0), 0) / data.length;
    
    // Calculate 30-day trend (simplified)
    const recent30Days = data.slice(-30);
    const previous30Days = data.slice(-60, -30);
    const recentAvg = recent30Days.reduce((sum, item) => sum + (item.cpu_usage || 0), 0) / recent30Days.length;
    const previousAvg = previous30Days.reduce((sum, item) => sum + (item.cpu_usage || 0), 0) / previous30Days.length;
    const trendPercent = ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1);
    
    // High-load days detection
    const highLoadDays = data.filter(item => 
      (item.cpu_usage || 0) > 80 || 
      (item.memory_usage || 0) > 85 || 
      (item.network_traffic || 0) > 90
    ).length;

    return {
      totalInputs,
      dailyAverage,
      cpuAvg,
      memoryAvg,
      networkAvg,
      trendPercent,
      highLoadDays
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 bg-card/50">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Database Inputs */}
      <Card className="p-6 bg-card/50 border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-chart-cpu/20">
            <Database className="h-5 w-5 text-chart-cpu" />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Database Inputs</p>
          <p className="text-2xl font-bold text-foreground">
            {metrics.totalInputs.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Across 365 days</p>
        </div>
      </Card>

      {/* Daily Average */}
      <Card className="p-6 bg-card/50 border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-chart-memory/20">
            <Activity className="h-5 w-5 text-chart-memory" />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-foreground">
            {metrics.dailyAverage.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Range: {Math.round(metrics.dailyAverage * 0.7)} - {Math.round(metrics.dailyAverage * 1.4)}
          </p>
        </div>
      </Card>

      {/* 30-Day Trend */}
      <Card className="p-6 bg-card/50 border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-chart-network/20">
            <TrendingDown className="h-5 w-5 text-chart-network" />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">30-Day Trend</p>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.trendPercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {parseFloat(metrics.trendPercent) >= 0 ? 'Increasing' : 'Declining'} trend
                </p>
        </div>
      </Card>

      {/* Maintenance Status */}
      <Card className="p-6 bg-card/50 border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <Badge variant="destructive" className="text-xs">
            Alert
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Maintenance Status</p>
          <p className="text-xl font-bold text-foreground">
            Action Required
          </p>
          <p className="text-xs text-muted-foreground">
            {metrics.highLoadDays} high-load days detected
          </p>
        </div>
      </Card>
    </div>
  );
};