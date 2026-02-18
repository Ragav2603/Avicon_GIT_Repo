import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  PenTool, 
  Loader2, 
  CheckCircle,
  FileUp,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Requirement {
  text: string;
  is_mandatory: boolean;
  weight: number;
}

interface ExtractedData {
  title: string;
  description: string;
  requirements?: Requirement[];
  budget?: number | null;
}

interface SmartRFPCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualCreate: () => void;
  onAICreate: (extractedData: ExtractedData) => void;
}

interface ErrorDetails {
  message: string;
  version?: string;
  azure_request_id?: string;
  status?: number;
  code?: string;
}

interface StructuredError extends ErrorDetails {
  isStructured: boolean;
}

const SmartRFPCreator = ({ open, onOpenChange, onManualCreate, onAICreate }: SmartRFPCreatorProps) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setErrorDetails(null);
    setIsUploading(true);

    try {
      // Step 1: Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user_uploads")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setIsUploading(false);
      setIsAnalyzing(true);

      // Step 2: Call the generate-draft edge function using supabase.functions.invoke
      const { data, error: functionError } = await supabase.functions.invoke("generate-draft", {
        body: {
          file_path: filePath,
          check_type: "rfp_extraction",
        },
      });

      if (functionError) {
        // Extract details from the error if available
        const details: ErrorDetails = {
          message: functionError.message || "Analysis failed",
        };
        throw { ...details, isStructured: true };
      }

      if (data?.error) {
        // The function returned an error response
        const details: ErrorDetails = {
          message: data.error,
          version: data.version,
          azure_request_id: data.azure_request_id,
          status: data.status,
          code: data.code,
        };
        throw { ...details, isStructured: true };
      }

      setScanComplete(true);
      setIsAnalyzing(false);

      // Brief delay to show success state
      await new Promise(resolve => setTimeout(resolve, 800));

      // Pass extracted data to parent
      onAICreate(data);
      resetState();

    } catch (error) {
      console.error("AI extraction error:", error);
      setIsUploading(false);
      setIsAnalyzing(false);
      
      // Build error details
      let details: ErrorDetails;

      if (
        typeof error === 'object' &&
        error !== null &&
        'isStructured' in error &&
        (error as { isStructured: unknown }).isStructured === true
      ) {
        const structError = error as StructuredError;
        details = {
          message: structError.message,
          version: structError.version,
          azure_request_id: structError.azure_request_id,
          status: structError.status,
          code: structError.code,
        };
      } else {
        details = {
          message: error instanceof Error ? error.message : "Failed to analyze document",
        };
      }
      
      setErrorDetails(details);
      
      toast({
        title: "Extraction Failed",
        description: details.message,
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    setUploadedFile(null);
    setIsUploading(false);
    setIsAnalyzing(false);
    setScanComplete(false);
    setErrorDetails(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            Create New RFP
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            Choose how you'd like to create your RFP. Our AI can extract requirements from your existing documents.
          </p>

          <AnimatePresence mode="wait">
            {(isUploading || isAnalyzing || scanComplete || errorDetails) ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12"
              >
                {errorDetails ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-destructive" />
                    </div>
                    <p className="mt-6 text-lg font-medium text-destructive">Extraction Failed</p>
                    <p className="text-muted-foreground mt-2 text-center max-w-sm">{errorDetails.message}</p>
                    
                    {/* Technical details collapsible */}
                    {(errorDetails.version || errorDetails.azure_request_id || errorDetails.code) && (
                      <Collapsible className="mt-4 w-full max-w-sm">
                        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto">
                          <ChevronDown className="w-3 h-3" />
                          Technical details
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono space-y-1">
                          {errorDetails.version && <p>Version: {errorDetails.version}</p>}
                          {errorDetails.azure_request_id && <p>Request ID: {errorDetails.azure_request_id}</p>}
                          {errorDetails.code && <p>Code: {errorDetails.code}</p>}
                          {errorDetails.status && <p>Status: {errorDetails.status}</p>}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={resetState}
                    >
                      Try Again
                    </Button>
                  </>
                ) : (isUploading || isAnalyzing) ? (
                  <>
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-secondary" />
                      </div>
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-secondary"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                      <span className="text-lg font-medium">
                        {isUploading ? "Uploading document..." : "Analyzing document..."}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">{uploadedFile?.name}</p>
                    <div className="mt-4 w-64 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary"
                        initial={{ width: "0%" }}
                        animate={{ width: isUploading ? "30%" : "100%" }}
                        transition={{ duration: isUploading ? 2 : 5 }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                    >
                      <CheckCircle className="w-10 h-10 text-primary" />
                    </motion.div>
                    <p className="mt-6 text-lg font-medium text-primary">Extraction Complete!</p>
                    <p className="text-muted-foreground mt-1">Redirecting to form...</p>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Option A: AI Extraction */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer group ${
                    isDragging 
                      ? "border-secondary bg-secondary/5" 
                      : "border-border hover:border-secondary/50 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                      <FileUp className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      AI Extraction
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a previous PDF/Doc. We will auto-fill your requirements.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      <span>Drag & drop or click to upload</span>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <span className="px-2 py-1 rounded bg-muted text-xs">.PDF</span>
                      <span className="px-2 py-1 rounded bg-muted text-xs">.DOC</span>
                      <span className="px-2 py-1 rounded bg-muted text-xs">.DOCX</span>
                    </div>
                  </div>

                  {/* Highlight badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </span>
                  </div>
                </div>

                {/* Option B: Manual Builder */}
                <div
                  onClick={() => {
                    onManualCreate();
                    handleClose();
                  }}
                  className="p-6 rounded-2xl border border-border hover:border-muted-foreground/30 hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-muted/80 transition-colors">
                      <PenTool className="w-8 h-8 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Manual Builder
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start from scratch and define your requirements step by step.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartRFPCreator;
