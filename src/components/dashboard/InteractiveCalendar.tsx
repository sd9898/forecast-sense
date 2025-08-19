import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, Activity, Zap } from 'lucide-react';
import { addDays, format, isSameDay } from 'date-fns';

interface CalendarData {
  date: Date;
  cpu_avg: number;
  memory_avg: number;
  network_avg: number;
  power_avg: number;
  events: string[];
}

interface InteractiveCalendarProps {
  data: any[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function InteractiveCalendar({ data, onDateSelect, selectedDate }: InteractiveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Process data to create calendar data
  const processedCalendarData = React.useMemo(() => {
    const calendarData: CalendarData[] = [];
    const today = new Date();
    
    // Generate next 365 days of data
    for (let i = 0; i < 365; i++) {
      const date = addDays(today, i);
      
      // Find data for this date (simplified - in real implementation you'd aggregate by date)
      const dayData = data.filter(item => {
        if (item.timestamp) {
          const itemDate = new Date(item.timestamp);
          return isSameDay(itemDate, date);
        }
        return false;
      });

      if (dayData.length > 0) {
        // Calculate averages for the day
        const cpu_avg = dayData.reduce((sum, item) => sum + (parseFloat(item.cpu_usage) || 0), 0) / dayData.length;
        const memory_avg = dayData.reduce((sum, item) => sum + (parseFloat(item.memory_usage) || 0), 0) / dayData.length;
        const network_avg = dayData.reduce((sum, item) => sum + (parseFloat(item.network_traffic) || 0), 0) / dayData.length;
        const power_avg = dayData.reduce((sum, item) => sum + (parseFloat(item.power_consumption) || 0), 0) / dayData.length;

        calendarData.push({
          date,
          cpu_avg,
          memory_avg,
          network_avg,
          power_avg,
          events: [] // Events would be populated from events data
        });
      }
    }
    
    return calendarData;
  }, [data]);

  const getDateData = (date: Date) => {
    return processedCalendarData.find(item => isSameDay(item.date, date));
  };

  const getDateIntensity = (date: Date) => {
    const dayData = getDateData(date);
    if (!dayData) return 0;
    
    // Calculate intensity based on average resource usage
    const avgUsage = (dayData.cpu_avg + dayData.memory_avg) / 2;
    if (avgUsage > 80) return 3; // High
    if (avgUsage > 60) return 2; // Medium
    if (avgUsage > 40) return 1; // Low
    return 0; // Minimal
  };

  const getSelectedDateDetails = () => {
    if (!selectedDate) return null;
    return getDateData(selectedDate);
  };

  const selectedDetails = getSelectedDateDetails();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Forecast Calendar</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
            modifiers={{
              high: (date) => getDateIntensity(date) === 3,
              medium: (date) => getDateIntensity(date) === 2,
              low: (date) => getDateIntensity(date) === 1,
            }}
            modifiersStyles={{
              high: { backgroundColor: 'hsl(var(--destructive))', color: 'white' },
              medium: { backgroundColor: 'hsl(var(--warning))', color: 'white' },
              low: { backgroundColor: 'hsl(var(--primary))', color: 'white' },
            }}
          />
          
          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Resource Usage Intensity</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="destructive" className="text-xs">High (80%+)</Badge>
              <Badge variant="secondary" className="text-xs bg-warning text-warning-foreground">Medium (60-80%)</Badge>
              <Badge variant="default" className="text-xs">Low (40-60%)</Badge>
              <Badge variant="outline" className="text-xs">Minimal (&lt;40%)</Badge>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h4>
                {selectedDetails ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-chart-cpu/10 rounded-lg">
                        <Activity className="h-4 w-4 text-chart-cpu" />
                        <div>
                          <p className="text-sm font-medium">CPU Usage</p>
                          <p className="text-lg font-bold">{selectedDetails.cpu_avg.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-chart-memory/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-chart-memory" />
                        <div>
                          <p className="text-sm font-medium">Memory</p>
                          <p className="text-lg font-bold">{selectedDetails.memory_avg.toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-chart-network/10 rounded-lg">
                        <Activity className="h-4 w-4 text-chart-network" />
                        <div>
                          <p className="text-sm font-medium">Network</p>
                          <p className="text-lg font-bold">{selectedDetails.network_avg.toFixed(1)}MB/s</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-chart-power/10 rounded-lg">
                        <Zap className="h-4 w-4 text-chart-power" />
                        <div>
                          <p className="text-sm font-medium">Power</p>
                          <p className="text-lg font-bold">{selectedDetails.power_avg.toFixed(1)}W</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedDetails.events.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">External Events</h5>
                        <div className="space-y-1">
                          {selectedDetails.events.map((event, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No prediction data available for this date.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a date to view forecast details</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}