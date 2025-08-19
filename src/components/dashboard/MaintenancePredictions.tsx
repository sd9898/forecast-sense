import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface MaintenancePredictionsProps {
  data: any[];
  selectedDate?: Date;
}

export const MaintenancePredictions = ({ data, selectedDate }: MaintenancePredictionsProps) => {
  const maintenanceTasks = useMemo(() => {
    if (!data.length) return [];

    const totalInputs = data.length;
    const avgCpuUsage = data.reduce((sum, item) => sum + (item.cpu_usage || 0), 0) / data.length;
    const avgMemoryUsage = data.reduce((sum, item) => sum + (item.memory_usage || 0), 0) / data.length;
    const avgNetworkTraffic = data.reduce((sum, item) => sum + (item.network_traffic || 0), 0) / data.length;

    // Calculate vacuuming needs based on data volume and usage patterns
    const highUsageDays = data.filter(item => 
      (item.cpu_usage || 0) > 80 || (item.memory_usage || 0) > 85
    ).length;

    const vacuumFrequency = Math.ceil(totalInputs / 50000); // Every ~50k inputs
    const estimatedTime = Math.round(totalInputs / 100000 * 24); // Rough estimate in hours

    return [
      {
        id: 'vacuum',
        title: 'Database Vacuuming',
        status: highUsageDays > 50 ? 'Required' : 'Scheduled',
        severity: highUsageDays > 50 ? 'high' : 'medium',
        description: `Database requires vacuuming due to ${totalInputs.toLocaleString()} total inputs`,
        estimatedTime: `${estimatedTime}-${estimatedTime + 2}`,
        action: 'Schedule Run VACUUM ANALYZE',
        details: 'Improved query performance and space reclamation',
        frequency: `Every ${vacuumFrequency} days`,
        icon: Database
      },
      {
        id: 'index',
        title: 'Index Rebuilding',
        status: avgCpuUsage > 75 ? 'Recommended' : 'Optimal',
        severity: avgCpuUsage > 75 ? 'medium' : 'low',
        description: 'Index maintenance not currently required',
        estimatedTime: '1-2',
        action: 'Monitor performance metrics',
        details: 'Indexes are performing within optimal ranges',
        frequency: 'As needed',
        icon: CheckCircle
      },
      {
        id: 'statistics',
        title: 'Statistics Update',
        status: 'Scheduled',
        severity: 'medium',
        description: 'Regular statistics update for query optimization',
        estimatedTime: '0.5-1',
        action: 'Auto-scheduled weekly',
        details: 'Maintains query planner accuracy',
        frequency: 'Weekly',
        icon: Clock
      }
    ];
  }, [data]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <Card className="p-6 bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Maintenance Predictions
          </h3>
          <p className="text-sm text-muted-foreground">AI-powered database maintenance scheduling</p>
        </div>
      </div>

      <div className="space-y-4">
        {maintenanceTasks.map((task) => {
          const IconComponent = task.icon;
          const SeverityIcon = getSeverityIcon(task.severity);
          
          return (
            <div 
              key={task.id} 
              className={`p-4 rounded-lg border ${
                task.severity === 'high' ? 'border-destructive/50 bg-destructive/5' :
                task.severity === 'medium' ? 'border-warning/50 bg-warning/5' :
                'border-success/50 bg-success/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    task.severity === 'high' ? 'bg-destructive/20' :
                    task.severity === 'medium' ? 'bg-warning/20' :
                    'bg-success/20'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      task.severity === 'high' ? 'text-destructive' :
                      task.severity === 'medium' ? 'text-warning' :
                      'text-success'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(task.severity) as any} className="gap-1">
                    <SeverityIcon className="h-3 w-3" />
                    {task.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Est. Time:</p>
                  <p className="font-medium">{task.estimatedTime} hours</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Frequency:</p>
                  <p className="font-medium">{task.frequency}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{task.details}</p>
                  <Button 
                    size="sm" 
                    variant={task.severity === 'high' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {task.action}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Maintenance Schedule Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Next Critical Task</p>
            <p className="font-medium text-destructive">Database Vacuuming</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estimated Downtime</p>
            <p className="font-medium">2-4 hours</p>
          </div>
          <div>
            <p className="text-muted-foreground">Recommended Window</p>
            <p className="font-medium">Weekend</p>
          </div>
        </div>
      </div>
    </Card>
  );
};