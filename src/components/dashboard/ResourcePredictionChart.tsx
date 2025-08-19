import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, Cpu, HardDrive, Network, Zap } from 'lucide-react';

interface ResourcePredictionChartProps {
  data: any[];
  selectedDate?: Date;
}

export function ResourcePredictionChart({ data, selectedDate }: ResourcePredictionChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState({
    cpu: true,
    memory: true,
    network: true,
    power: true
  });
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Process data for monthly aggregation
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by month and calculate averages
    const monthlyData = new Map();
    
    data.forEach(item => {
      if (!item.timestamp) return;
      
      const date = new Date(item.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          date: date,
          cpu_usage: [],
          memory_usage: [],
          network_traffic: [],
          power_consumption: [],
          cpu_growth: [],
          memory_growth: [],
          network_growth: []
        });
      }
      
      const monthData = monthlyData.get(monthKey);
      if (item.cpu_usage !== undefined) monthData.cpu_usage.push(parseFloat(item.cpu_usage) || 0);
      if (item.memory_usage !== undefined) monthData.memory_usage.push(parseFloat(item.memory_usage) || 0);
      if (item.network_traffic !== undefined) monthData.network_traffic.push(parseFloat(item.network_traffic) || 0);
      if (item.power_consumption !== undefined) monthData.power_consumption.push(parseFloat(item.power_consumption) || 0);
      if (item.cpu_usage_growth_pct !== undefined) monthData.cpu_growth.push(parseFloat(item.cpu_usage_growth_pct) || 0);
      if (item.memory_usage_growth_pct !== undefined) monthData.memory_growth.push(parseFloat(item.memory_usage_growth_pct) || 0);
      if (item.network_traffic_growth_pct !== undefined) monthData.network_growth.push(parseFloat(item.network_traffic_growth_pct) || 0);
    });

    // Calculate averages for each month
    return Array.from(monthlyData.values()).map(monthData => ({
      month: monthData.month,
      cpu_avg: monthData.cpu_usage.reduce((sum, val) => sum + val, 0) / monthData.cpu_usage.length || 0,
      memory_avg: monthData.memory_usage.reduce((sum, val) => sum + val, 0) / monthData.memory_usage.length || 0,
      network_avg: monthData.network_traffic.reduce((sum, val) => sum + val, 0) / monthData.network_traffic.length || 0,
      power_avg: monthData.power_consumption.reduce((sum, val) => sum + val, 0) / monthData.power_consumption.length || 0,
      cpu_growth: monthData.cpu_growth.reduce((sum, val) => sum + val, 0) / monthData.cpu_growth.length || 0,
      memory_growth: monthData.memory_growth.reduce((sum, val) => sum + val, 0) / monthData.memory_growth.length || 0,
      network_growth: monthData.network_growth.reduce((sum, val) => sum + val, 0) / monthData.network_growth.length || 0,
    })).sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'cpu': return 'hsl(var(--chart-cpu))';
      case 'memory': return 'hsl(var(--chart-memory))';
      case 'network': return 'hsl(var(--chart-network))';
      case 'power': return 'hsl(var(--chart-power))';
      default: return 'hsl(var(--primary))';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}${entry.name.includes('cpu') || entry.name.includes('memory') ? '%' : entry.name.includes('power') ? 'W' : 'MB/s'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">System Resource Predictions</h3>
          <Badge variant="outline" className="text-xs">Monthly Aggregated</Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Line</span>
            <Switch 
              checked={chartType === 'area'} 
              onCheckedChange={(checked) => setChartType(checked ? 'area' : 'line')}
            />
            <span className="text-sm">Area</span>
          </div>
        </div>
      </div>

      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: 'cpu', label: 'CPU Usage', icon: Cpu, color: 'chart-cpu' },
          { key: 'memory', label: 'Memory Usage', icon: HardDrive, color: 'chart-memory' },
          { key: 'network', label: 'Network Traffic', icon: Network, color: 'chart-network' },
          { key: 'power', label: 'Power Consumption', icon: Zap, color: 'chart-power' }
        ].map(({ key, label, icon: Icon, color }) => (
          <Button
            key={key}
            variant={selectedMetrics[key as keyof typeof selectedMetrics] ? "default" : "outline"}
            size="sm"
            onClick={() => toggleMetric(key as keyof typeof selectedMetrics)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {selectedMetrics.cpu && (
              <DataComponent
                type="monotone"
                dataKey="cpu_avg"
                stroke={getMetricColor('cpu')}
                strokeWidth={2}
                name="CPU Usage (%)"
                {...(chartType === 'area' && { fill: getMetricColor('cpu'), fillOpacity: 0.3 })}
              />
            )}
            
            {selectedMetrics.memory && (
              <DataComponent
                type="monotone"
                dataKey="memory_avg"
                stroke={getMetricColor('memory')}
                strokeWidth={2}
                name="Memory Usage (%)"
                {...(chartType === 'area' && { fill: getMetricColor('memory'), fillOpacity: 0.3 })}
              />
            )}
            
            {selectedMetrics.network && (
              <DataComponent
                type="monotone"
                dataKey="network_avg"
                stroke={getMetricColor('network')}
                strokeWidth={2}
                name="Network Traffic (MB/s)"
                {...(chartType === 'area' && { fill: getMetricColor('network'), fillOpacity: 0.3 })}
              />
            )}
            
            {selectedMetrics.power && (
              <DataComponent
                type="monotone"
                dataKey="power_avg"
                stroke={getMetricColor('power')}
                strokeWidth={2}
                name="Power Consumption (W)"
                {...(chartType === 'area' && { fill: getMetricColor('power'), fillOpacity: 0.3 })}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Growth Metrics */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium mb-3">Average Monthly Growth Rates</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {processedData.length > 0 && (
            <>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">CPU Growth</p>
                <p className="text-lg font-bold text-chart-cpu">
                  {processedData[processedData.length - 1]?.cpu_growth?.toFixed(2) || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Memory Growth</p>
                <p className="text-lg font-bold text-chart-memory">
                  {processedData[processedData.length - 1]?.memory_growth?.toFixed(2) || 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Network Growth</p>
                <p className="text-lg font-bold text-chart-network">
                  {processedData[processedData.length - 1]?.network_growth?.toFixed(2) || 0}%
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}