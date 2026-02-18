import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CSVRow {
  tool_name?: string;
  user_id?: string;
  login_count?: number;
  last_login?: string;
  session_duration_minutes?: number;
  sentiment_rating?: number;
}

interface CSVUploaderProps {
  onUploadComplete: (result: unknown) => void;
  onCancel?: () => void;
}

const CSVUploader = ({ onUploadComplete, onCancel }: CSVUploaderProps) => {
  const { toast } = useToast();
  const [airlineName, setAirlineName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string | number> = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        // Parse numeric values
        if (['login_count', 'session_duration_minutes', 'sentiment_rating'].includes(header)) {
          row[header] = parseFloat(value) || 0;
        } else {
          row[header] = value;
        }
      });

      rows.push(row as CSVRow);
    }

    return rows;
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setParseError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setParseError(null);

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);
      setParsedData(data);
      
      toast({
        title: 'File Parsed',
        description: `Found ${data.length} records across ${new Set(data.map(r => r.tool_name)).size} tools.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setParseError(message);
      setParsedData([]);
    }
  }, [toast]);

  const handleUpload = async () => {
    if (!airlineName.trim()) {
      toast({
        title: 'Missing Airline Name',
        description: 'Please enter an airline name.',
        variant: 'destructive',
      });
      return;
    }

    if (parsedData.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please upload a valid CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-adoption-csv`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            airline_name: airlineName.trim(),
            csv_data: parsedData,
            file_name: file?.name,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process CSV');
      }

      toast({
        title: 'Audit Generated',
        description: `Processed ${result.processed_data?.records_processed || 0} records.`,
      });

      onUploadComplete(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed';
      toast({
        title: 'Processing Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `tool_name,user_id,login_count,last_login,session_duration_minutes,sentiment_rating
Flight Planning,user001,45,2024-01-15,120,8
Flight Planning,user002,32,2024-01-14,90,7
Crew Rostering,user001,28,2024-01-15,60,9
Crew Rostering,user003,15,2024-01-10,45,6
Safety Management,user002,12,2024-01-13,30,7`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adoption_data_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueTools = [...new Set(parsedData.map(r => r.tool_name).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Airline Name */}
      <div className="space-y-2">
        <Label htmlFor="airlineName" className="text-foreground font-medium">
          Airline Name *
        </Label>
        <Input
          id="airlineName"
          placeholder="e.g., Delta Airlines"
          value={airlineName}
          onChange={(e) => setAirlineName(e.target.value)}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-foreground font-medium">Usage Data (CSV) *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadTemplate}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download Template
          </Button>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedData.length} records · {uniqueTools.length} tools
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setParsedData([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Drop your CSV file here or click to browse
              </p>
            </>
          )}
        </div>

        {parseError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {parseError}
          </div>
        )}
      </div>

      {/* Preview */}
      {parsedData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-muted/30 rounded-lg p-4 border border-border"
        >
          <p className="text-sm font-medium text-foreground mb-2">Preview</p>
          <div className="flex flex-wrap gap-2">
            {uniqueTools.map((tool) => {
              const count = parsedData.filter(r => r.tool_name === tool).length;
              return (
                <div
                  key={tool}
                  className="px-3 py-1.5 bg-background rounded-full border text-sm"
                >
                  <span className="font-medium">{tool}</span>
                  <span className="text-muted-foreground ml-1">({count} records)</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleUpload}
          disabled={isProcessing || !airlineName.trim() || parsedData.length === 0}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Generate Audit
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CSVUploader;
