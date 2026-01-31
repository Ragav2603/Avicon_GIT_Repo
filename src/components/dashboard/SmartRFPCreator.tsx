import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  PenTool, 
  X, 
  Loader2, 
  CheckCircle,
  FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SmartRFPCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualCreate: () => void;
  onAICreate: (extractedData: { title: string; description: string }) => void;
}

const SmartRFPCreator = ({ open, onOpenChange, onManualCreate, onAICreate }: SmartRFPCreatorProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsScanning(true);

    // Simulate AI scanning
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setScanComplete(true);
    setIsScanning(false);

    // Simulate extraction complete after brief delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock extracted data
    const extractedData = {
      title: "Cloud Infrastructure Modernization Platform",
      description: "We are seeking proposals for a comprehensive cloud infrastructure modernization solution that includes: \n\n• Migration of legacy on-premises systems to cloud-native architecture\n• Implementation of containerization and orchestration (Kubernetes)\n• Automated CI/CD pipeline setup\n• 24/7 monitoring and incident response SLA\n• Compliance with SOC2 Type II and ISO 27001 standards\n• Data residency requirements for US/EU operations\n\nThe ideal vendor will have proven experience with aviation industry clients and demonstrate capability for enterprise-scale deployments with 99.9% uptime guarantees.",
    };

    onAICreate(extractedData);
    resetState();
  };

  const resetState = () => {
    setUploadedFile(null);
    setIsScanning(false);
    setScanComplete(false);
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
            {isScanning || scanComplete ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12"
              >
                {isScanning ? (
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
                      <span className="text-lg font-medium">Scanning document...</span>
                    </div>
                    <p className="text-muted-foreground mt-2">{uploadedFile?.name}</p>
                    <div className="mt-4 w-64 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-secondary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
                    >
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <p className="mt-6 text-lg font-medium text-green-600">Extraction Complete!</p>
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
