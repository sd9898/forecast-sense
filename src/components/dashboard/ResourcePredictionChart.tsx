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

  // Process data for daily display
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const timestamp = item.timestamp ? new Date(item.timestamp) : new Date(2025, 0, index + 1);
      
      // Calculate growth rates compared to previous day
      let cpuGrowth = 0;
      let memoryGrowth = 0;
      let networkGrowth = 0;

      if (index > 0) {
        const prevItem = data[index - 1];
        const prevCpu = prevItem.cpu_usage || 0;
        const prevMemory = prevItem.memory_usage || 0;
        const prevNetwork = prevItem.network_traffic || 0;
        const currentCpu = item.cpu_usage || 0;
        const currentMemory = item.memory_usage || 0;
        const currentNetwork = item.network_traffic || 0;

        cpuGrowth = prevCpu > 0 ? ((currentCpu - prevCpu) / prevCpu) * 100 : 0;
        memoryGrowth = prevMemory > 0 ? ((currentMemory - prevMemory) / prevMemory) * 100 : 0;
        networkGrowth = prevNetwork > 0 ? ((currentNetwork - prevNetwork) / prevNetwork) * 100 : 0;
      }

      return {
        date: timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: timestamp,
        cpu_avg: parseFloat((item.cpu_usage || 0).toFixed(2)),
        memory_avg: parseFloat((item.memory_usage || 0).toFixed(2)),
        network_avg: parseFloat((item.network_traffic || 0).toFixed(2)),
        power_avg: parseFloat((item.power_consumption || 0).toFixed(2)),
        cpu_growth: parseFloat(cpuGrowth.toFixed(2)),
        memory_growth: parseFloat(memoryGrowth.toFixed(2)),
        network_growth: parseFloat(networkGrowth.toFixed(2))
      };
    });
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
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}${entry.name.includes('cpu') || entry.name.includes('memory') ? '%' : entry.name.includes('power') ? 'W' : 'MB/s'}`}
              {entry.dataKey.includes('cpu') && data.cpu_growth !== 0 && (
                <span className="ml-2 text-xs">({data.cpu_growth > 0 ? '+' : ''}{data.cpu_growth.toFixed(1)}%)</span>
              )}
              {entry.dataKey.includes('memory') && data.memory_growth !== 0 && (
                <span className="ml-2 text-xs">({data.memory_growth > 0 ? '+' : ''}{data.memory_growth.toFixed(1)}%)</span>
              )}
              {entry.dataKey.includes('network') && data.network_growth !== 0 && (
                <span className="ml-2 text-xs">({data.network_growth > 0 ? '+' : ''}{data.network_growth.toFixed(1)}%)</span>
              )}
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
          <Badge variant="outline" className="text-xs">Daily Analysis</Badge>
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
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              interval="preserveStartEnd"
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
        <h4 className="text-sm font-medium mb-3">Latest Daily Growth Rates</h4>
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