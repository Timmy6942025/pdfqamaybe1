import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PDFViewer } from '@/components/PDFViewer';
import { QASidebar } from '@/components/QASidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useDocuments, useUploadDocument } from '@/hooks/use-pdf';
import { BookOpen, Upload, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: documents = [], isLoading: documentsLoading } = useDocuments();
  const uploadMutation = useUploadDocument();

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync(file);
      setSelectedDocumentId(result.documentId);
      setCurrentPage(1);
      toast({
        title: "Upload successful",
        description: "Your PDF is being processed for AI analysis",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (documentsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-warm-brown text-white px-5 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="text-gold text-xl" />
            <h1 className="text-xl font-semibold">Sacred Text Q&A</h1>
            <span className="text-sm opacity-80">Religious Text Analysis</span>
          </div>
          <div className="flex items-center space-x-4">
            {selectedDocument && (
              <div className="text-sm opacity-90">
                <span>{selectedDocument.totalPages} pages</span> • 
                <span className="ml-1">
                  {selectedDocument.processed ? 'Ready' : 'Processing...'}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!selectedDocument ? (
          // Document Selection/Upload Screen
          <div className="flex-1 flex items-center justify-center bg-cream p-8">
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-warm-brown mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-warm-brown mb-4">
                  Welcome to Sacred Text Q&A
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload a religious text PDF to begin AI-powered analysis and questioning.
                </p>

                {documents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Or select from uploaded documents:
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {documents.map((doc) => (
                        <Button
                          key={doc.id}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            setSelectedDocumentId(doc.id);
                            setCurrentPage(1);
                          }}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span className="truncate">{doc.title}</span>
                          {!doc.processed && (
                            <LoadingSpinner size="sm" className="ml-auto" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="bg-warm-brown hover:bg-warm-brown/90 text-white"
                  size="lg"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // PDF Viewer and Sidebar
          <>
            <PDFViewer
              document={selectedDocument}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            <QASidebar
              document={selectedDocument}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              currentPage={currentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
