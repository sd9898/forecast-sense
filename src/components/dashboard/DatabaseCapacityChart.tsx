import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DatabaseCapacityChartProps {
  data: any[];
  selectedDate?: Date;
}

export const DatabaseCapacityChart = ({ data, selectedDate }: DatabaseCapacityChartProps) => {
  const processedData = useMemo(() => {
    if (!data.length) return [];

    return data.map((item, index) => {
      const timestamp = item.timestamp ? parseISO(item.timestamp) : new Date(2025, 0, index + 1);
      
      // Simulate database inputs based on CPU usage and other metrics
      const baseInputs = Math.round((item.cpu_usage || 50) * 10 + (item.memory_usage || 50) * 5);
      const variation = Math.random() * 400 - 200; // Add some realistic variation
      const dailyInputs = Math.max(0, baseInputs + variation);

      return {
        date: format(timestamp, 'MMM dd'),
        fullDate: timestamp,
        dailyInputs: Math.round(dailyInputs),
        cpuUsage: item.cpu_usage || 0,
        memoryUsage: item.memory_usage || 0,
        networkTraffic: item.network_traffic || 0,
        powerConsumption: item.power_consumption || 0
      };
    });
  }, [data]);

  const averageInputs = useMemo(() => {
    if (!processedData.length) return 0;
    return processedData.reduce((sum, item) => sum + item.dailyInputs, 0) / processedData.length;
  }, [processedData]);

  if (!processedData.length) {
    return (
      <Card className="p-6 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-cpu" />
              Daily Input Trends
            </h3>
            <p className="text-sm text-muted-foreground">365-day database activity overview</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Full Year View
          </Button>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </Card>
    );
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-chart-cpu">●</span> Daily Inputs: {data.dailyInputs.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-chart-memory">●</span> CPU Usage: {data.cpuUsage.toFixed(1)}%
            </p>
            <p className="text-sm">
              <span className="text-chart-network">●</span> Memory Usage: {data.memoryUsage.toFixed(1)}%
            </p>
            <p className="text-sm">
              <span className="text-chart-power">●</span> Network Traffic: {data.networkTraffic.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-chart-cpu" />
            Daily Input Trends
          </h3>
          <p className="text-sm text-muted-foreground">365-day database activity overview</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Full Year View
        </Button>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Daily Inputs', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={customTooltip} />
            
            {/* Average line */}
            <ReferenceLine 
              y={averageInputs} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
              label={{ value: "Avg", position: "insideTopRight" }}
            />
            
            {/* High threshold line */}
            <ReferenceLine 
              y={averageInputs * 1.3} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="3 3" 
              label={{ value: "High", position: "insideTopRight" }}
            />
            
            <Line 
              type="monotone" 
              dataKey="dailyInputs" 
              stroke="hsl(var(--chart-cpu))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--chart-cpu))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-cpu"></div>
          <span>Daily Inputs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-muted-foreground"></div>
          <span>Average Line</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-warning"></div>
          <span className="text-warning">Above 130% average</span>
        </div>
      </div>
    </Card>
  );
};