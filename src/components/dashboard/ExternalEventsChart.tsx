import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, Activity, Calendar } from 'lucide-react';

interface ExternalEventsChartProps {
  predictionsData: any[];
  eventsData: any[];
}

export function ExternalEventsChart({ predictionsData, eventsData }: ExternalEventsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'network' | 'power'>('cpu');
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Process and correlate data
  const correlatedData = React.useMemo(() => {
    if (!predictionsData.length || !eventsData.length) return [];

    // Group predictions by month
    const monthlyPredictions = new Map();
    predictionsData.forEach(item => {
      if (!item.timestamp) return;
      
      const date = new Date(item.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyPredictions.has(monthKey)) {
        monthlyPredictions.set(monthKey, {
          month: monthKey,
          cpu_values: [],
          memory_values: [],
          network_values: [],
          power_values: [],
          events: []
        });
      }
      
      const monthData = monthlyPredictions.get(monthKey);
      if (item.cpu_usage !== undefined) monthData.cpu_values.push(parseFloat(item.cpu_usage) || 0);
      if (item.memory_usage !== undefined) monthData.memory_values.push(parseFloat(item.memory_usage) || 0);
      if (item.network_traffic !== undefined) monthData.network_values.push(parseFloat(item.network_traffic) || 0);
      if (item.power_consumption !== undefined) monthData.power_values.push(parseFloat(item.power_consumption) || 0);
    });

    // Add events to monthly data
    eventsData.forEach(event => {
      if (!event.timestamp) return;
      
      const date = new Date(event.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyPredictions.has(monthKey)) {
        monthlyPredictions.get(monthKey).events.push(event);
      }
    });

    // Calculate monthly averages and event impact
    return Array.from(monthlyPredictions.values()).map(monthData => {
      const cpu_avg = monthData.cpu_values.reduce((sum: number, val: number) => sum + val, 0) / monthData.cpu_values.length || 0;
      const memory_avg = monthData.memory_values.reduce((sum: number, val: number) => sum + val, 0) / monthData.memory_values.length || 0;
      const network_avg = monthData.network_values.reduce((sum: number, val: number) => sum + val, 0) / monthData.network_values.length || 0;
      const power_avg = monthData.power_values.reduce((sum: number, val: number) => sum + val, 0) / monthData.power_values.length || 0;
      
      const eventCount = monthData.events.length;
      const highSeverityEvents = monthData.events.filter((e: any) => 
        e.severity === 'high' || e.type?.toLowerCase().includes('earthquake') || e.type?.toLowerCase().includes('covid')
      ).length;

      // Simulate event impact (in real implementation, this would be calculated from actual correlation)
      const eventImpact = (eventCount * 5) + (highSeverityEvents * 15);

      return {
        month: monthData.month,
        cpu_avg,
        memory_avg,
        network_avg,
        power_avg,
        event_count: eventCount,
        high_severity_events: highSeverityEvents,
        event_impact: eventImpact,
        events: monthData.events
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }, [predictionsData, eventsData]);

  const getMetricData = (metric: string) => {
    switch (metric) {
      case 'cpu': return 'cpu_avg';
      case 'memory': return 'memory_avg';
      case 'network': return 'network_avg';
      case 'power': return 'power_avg';
      default: return 'cpu_avg';
    }
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

  const eventTypes = React.useMemo(() => {
    const types = new Set(['all']);
    eventsData.forEach(event => {
      if (event.type) types.add(event.type);
    });
    return Array.from(types);
  }, [eventsData]);

  const filteredData = React.useMemo(() => {
    if (eventFilter === 'all') return correlatedData;
    
    return correlatedData.map(item => ({
      ...item,
      events: item.events.filter((e: any) => e.type === eventFilter),
      event_count: item.events.filter((e: any) => e.type === eventFilter).length
    }));
  }, [correlatedData, eventFilter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs">
          <p className="font-medium mb-2">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(2)}${entry.dataKey === 'event_count' ? ' events' : entry.dataKey.includes('cpu') || entry.dataKey.includes('memory') ? '%' : entry.dataKey.includes('power') ? 'W' : 'MB/s'}`}
            </p>
          ))}
          {data.events && data.events.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs font-medium">Events:</p>
              {data.events.slice(0, 3).map((event: any, index: number) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {event.type || event.description || 'Unknown event'}
                </p>
              ))}
              {data.events.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ... and {data.events.length - 3} more
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const calculateCorrelation = () => {
    const validData = filteredData.filter(item => 
      item[getMetricData(selectedMetric)] && item.event_count
    );
    
    if (validData.length < 2) return 0;

    // Simple correlation calculation
    const metricValues = validData.map(item => item[getMetricData(selectedMetric)]);
    const eventValues = validData.map(item => item.event_count);
    
    const meanMetric = metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length;
    const meanEvents = eventValues.reduce((sum, val) => sum + val, 0) / eventValues.length;
    
    let numerator = 0;
    let denomMetric = 0;
    let denomEvents = 0;
    
    for (let i = 0; i < validData.length; i++) {
      const metricDiff = metricValues[i] - meanMetric;
      const eventDiff = eventValues[i] - meanEvents;
      
      numerator += metricDiff * eventDiff;
      denomMetric += metricDiff * metricDiff;
      denomEvents += eventDiff * eventDiff;
    }
    
    const correlation = numerator / Math.sqrt(denomMetric * denomEvents);
    return isNaN(correlation) ? 0 : correlation;
  };

  const correlation = calculateCorrelation();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">External Events Impact Analysis</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpu">CPU Usage</SelectItem>
              <SelectItem value="memory">Memory Usage</SelectItem>
              <SelectItem value="network">Network Traffic</SelectItem>
              <SelectItem value="power">Power Consumption</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Events' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Correlation Score */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Correlation Score</h4>
            <p className="text-xs text-muted-foreground">
              Between {selectedMetric.toUpperCase()} usage and external events
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: getMetricColor(selectedMetric) }}>
              {(correlation * 100).toFixed(1)}%
            </p>
            <Badge 
              variant={Math.abs(correlation) > 0.5 ? "destructive" : Math.abs(correlation) > 0.3 ? "secondary" : "outline"}
              className="text-xs"
            >
              {Math.abs(correlation) > 0.5 ? "Strong" : Math.abs(correlation) > 0.3 ? "Moderate" : "Weak"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="metric"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              yAxisId="events"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar
              yAxisId="events"
              dataKey="event_count"
              fill="hsl(var(--warning))"
              fillOpacity={0.6}
              name="Event Count"
            />
            
            <Line
              yAxisId="metric"
              type="monotone"
              dataKey={getMetricData(selectedMetric)}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={3}
              name={`${selectedMetric.toUpperCase()} Usage`}
              dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 4 }}
            />
            
            <Line
              yAxisId="events"
              type="monotone"
              dataKey="high_severity_events"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="High Severity Events"
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium mb-3">Event Impact Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-xl font-bold text-warning">
              {filteredData.reduce((sum, item) => sum + item.event_count, 0)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-muted-foreground">High Severity</p>
            <p className="text-xl font-bold text-destructive">
              {filteredData.reduce((sum, item) => sum + item.high_severity_events, 0)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Avg Impact</p>
            <p className="text-xl font-bold text-primary">
              {(filteredData.reduce((sum, item) => sum + item.event_impact, 0) / Math.max(filteredData.length, 1)).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}