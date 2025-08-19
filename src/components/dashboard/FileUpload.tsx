import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';

interface FileUploadProps {
  onDataLoad: (predictions: any[]) => void;
  onClose: () => void;
}

interface FileStatus {
  name: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
  data?: any[];
}

export function FileUpload({ onDataLoad, onClose }: FileUploadProps) {
  const [predictionFile, setPredictionFile] = useState<FileStatus | null>(null);

  const processFile = useCallback(async (file: File) => {
    const fileStatus: FileStatus = {
      name: file.name,
      status: 'uploading',
      progress: 0
    };

    setPredictionFile(fileStatus);

    return new Promise<any[]>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            const errorStatus = {
              ...fileStatus,
              status: 'error' as const,
              error: results.errors[0].message
            };
            
            setPredictionFile(errorStatus);
            reject(new Error(results.errors[0].message));
            return;
          }

          const completeStatus = {
            ...fileStatus,
            status: 'complete' as const,
            progress: 100,
            data: results.data
          };

          setPredictionFile(completeStatus);

          resolve(results.data);
        },
        error: (error) => {
          const errorStatus = {
            ...fileStatus,
            status: 'error' as const,
            error: error.message
          };
          
          setPredictionFile(errorStatus);
          reject(error);
        }
      });
    });
  }, []);

  const onPredictionsDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        await processFile(file);
      } catch (error) {
        console.error('Error processing predictions file:', error);
      }
    }
  }, [processFile]);

  const {
    getRootProps: getPredictionsRootProps,
    getInputProps: getPredictionsInputProps,
    isDragActive: isPredictionsDragActive
  } = useDropzone({
    onDrop: onPredictionsDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });


  const handleLoadData = () => {
    if (predictionFile?.data) {
      onDataLoad(predictionFile.data);
      onClose();
    }
  };

  const canLoadData = predictionFile?.status === 'complete';

  const FileStatusIndicator = ({ file }: { file: FileStatus | null }) => {
    if (!file) return null;

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          {file.status === 'complete' && <CheckCircle className="h-4 w-4 text-success" />}
          {file.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
          {file.status === 'uploading' && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
          <span className="text-sm font-medium">{file.name}</span>
        </div>
        
        {file.status === 'uploading' && (
          <Progress value={file.progress} className="h-2" />
        )}
        
        {file.status === 'error' && file.error && (
          <Alert variant="destructive">
            <AlertDescription>{file.error}</AlertDescription>
          </Alert>
        )}
        
        {file.status === 'complete' && file.data && (
          <p className="text-sm text-muted-foreground">
            Loaded {file.data.length.toLocaleString()} records
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
        <Card className="p-6 shadow-dashboard">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Upload Data File</h2>
              <p className="text-muted-foreground">Upload your ML predictions CSV file</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Predictions File Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-2">ML Predictions Data</h3>
              <div
                {...getPredictionsRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isPredictionsDragActive 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getPredictionsInputProps()} />
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isPredictionsDragActive ? 'Drop the predictions file here' : 'Upload Predictions CSV'}
                </p>
                <p className="text-sm text-muted-foreground">
                  CSV file with cpu_usage, memory_usage, network_traffic, power_consumption columns
                </p>
              </div>
              <FileStatusIndicator file={predictionFile} />
            </div>


            {/* Load Data Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleLoadData} 
                disabled={!canLoadData}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Load Data & Continue
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}