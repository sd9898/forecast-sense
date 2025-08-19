import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { InteractiveCalendar } from '@/components/dashboard/InteractiveCalendar';
import { ResourcePredictionChart } from '@/components/dashboard/ResourcePredictionChart';
import { DatabaseMetricsGrid } from '@/components/dashboard/DatabaseMetricsGrid';
import { DatabaseCapacityChart } from '@/components/dashboard/DatabaseCapacityChart';
import { MaintenancePredictions } from '@/components/dashboard/MaintenancePredictions';

import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Upload, Calendar, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [predictionsData, setPredictionsData] = useState<any[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  const handleDataLoad = (predictions: any[]) => {
    setPredictionsData(predictions);
    toast({
      title: "Data Loaded Successfully",
      description: `Loaded ${predictions.length.toLocaleString()} predictions`,
    });
  };

  const hasData = predictionsData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        alertCount={3}
        onUploadClick={() => setShowFileUpload(true)}
        onSettingsClick={() => {}}
      />

      <main className="container mx-auto p-6 space-y-6">
        {!hasData ? (
          // Welcome Screen
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <Card className="max-w-2xl p-8 text-center shadow-dashboard">
              <div className="mb-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Database Capacity Forecasting</h1>
                <p className="text-muted-foreground text-lg">
                  ML-powered analytics dashboard for predictive database capacity planning
                </p>
              </div>

              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Upload your ML predictions CSV file to begin analysis.
                    The system supports files up to 150MB with advanced analytics.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 border border-border rounded-lg">
                    <Calendar className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Interactive Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Select any date to view 365-day forecasts with monthly aggregated predictions
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-chart-memory mb-3" />
                    <h3 className="font-semibold mb-2">Predictive Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced charts showing CPU, memory, network, and power consumption trends
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <Activity className="h-8 w-8 text-chart-network mb-3" />
                    <h3 className="font-semibold mb-2">Resource Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time monitoring of CPU, memory, network, and power consumption metrics
                    </p>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-warning mb-3" />
                    <h3 className="font-semibold mb-2">Performance Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Automated alerts for performance risks and capacity planning insights
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowFileUpload(true)}
                  className="gap-2 bg-gradient-primary shadow-glow hover:shadow-glow/80"
                  size="lg"
                >
                  <Upload className="h-5 w-5" />
                  Upload Data Files
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          // Dashboard Content
          <>
            {/* Database Metrics Grid */}
            <DatabaseMetricsGrid 
              data={predictionsData}
              selectedDate={selectedDate}
            />

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Database Capacity Chart */}
              <div className="lg:col-span-2">
                <DatabaseCapacityChart 
                  data={predictionsData}
                  selectedDate={selectedDate}
                />
              </div>

              {/* Right Column - Maintenance Predictions */}
              <div className="lg:col-span-1">
                <MaintenancePredictions 
                  data={predictionsData}
                  selectedDate={selectedDate}
                />
              </div>
            </div>

            {/* Calendar Section */}
            <InteractiveCalendar 
              data={predictionsData}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />

            {/* Resource Prediction Chart */}
            <ResourcePredictionChart 
              data={predictionsData}
              selectedDate={selectedDate}
            />

            {/* Data Status Bar */}
            <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="gap-1">
                  <Database className="h-3 w-3" />
                  {predictionsData.length.toLocaleString()} Predictions Loaded
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Daily Analysis Active
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFileUpload(true)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload New Data
              </Button>
            </div>
          </>
        )}
      </main>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload 
          onDataLoad={handleDataLoad}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
};

export default Index;