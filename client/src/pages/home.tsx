import { useState, useEffect } from 'react';
import { PDFViewer } from '@/components/PDFViewer';
import { QASidebar } from '@/components/QASidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useDocuments } from '@/hooks/use-pdf';
import { BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: documents = [], isLoading: documentsLoading } = useDocuments();

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  // Auto-select TTB.pdf when documents load
  useEffect(() => {
    if (documents.length > 0 && !selectedDocumentId) {
      const ttbDocument = documents.find(doc => doc.filename === 'TTB.pdf');
      if (ttbDocument) {
        setSelectedDocumentId(ttbDocument.id);
      }
    }
  }, [documents, selectedDocumentId]);

  if (documentsLoading || !selectedDocument) {
    return (
      <div className="h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-warm-brown mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-warm-brown mb-4">
            Loading Sacred Text...
          </h2>
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">
            Preparing the religious text for AI analysis
          </p>
        </div>
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
            <div className="text-sm opacity-90">
              <span>{selectedDocument.totalPages} pages</span> • 
              <span className="ml-1">
                {selectedDocument.processed ? 'Ready' : 'Processing...'}
              </span>
            </div>
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
      </div>
    </div>
  );
}
