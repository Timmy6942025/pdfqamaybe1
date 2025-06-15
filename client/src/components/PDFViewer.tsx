import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Download,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@shared/schema';

interface PDFViewerProps {
  document: Document;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PDFViewer({ document, currentPage, onPageChange }: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value);
    if (pageNum && pageNum >= 1 && pageNum <= document.totalPages) {
      onPageChange(pageNum);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < document.totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleFitToWidth = () => {
    setZoom(100);
  };

  // Extract content for current page (simplified - in real app would use PDF.js)
  const getPageContent = (pageNumber: number) => {
    const wordsPerPage = Math.ceil(document.content.split(' ').length / document.totalPages);
    const startIndex = (pageNumber - 1) * wordsPerPage;
    const endIndex = pageNumber * wordsPerPage;
    const words = document.content.split(' ');
    return words.slice(startIndex, endIndex).join(' ');
  };

  return (
    <div className="flex-1 bg-cream p-5 flex flex-col">
      {/* PDF Controls */}
      <Card className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="text-warm-brown hover:bg-warm-brown hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Page</span>
                <Input
                  type="number"
                  value={pageInput}
                  onChange={(e) => handlePageInputChange(e.target.value)}
                  min="1"
                  max={document.totalPages}
                  className="w-16 text-center text-sm"
                />
                <span className="text-sm text-gray-600">of {document.totalPages}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= document.totalPages}
                className="text-warm-brown hover:bg-warm-brown hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="text-warm-brown hover:bg-warm-brown hover:text-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-12 text-center">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="text-warm-brown hover:bg-warm-brown hover:text-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFitToWidth}
                className="text-warm-brown hover:bg-warm-brown hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Display Area */}
      <Card className="flex-1 shadow-sm">
        <CardContent className="p-6 h-full overflow-auto">
          <div 
            className="max-w-4xl mx-auto font-crimson text-lg leading-relaxed text-charcoal"
            style={{ 
              fontSize: `${16 * (zoom / 100)}px`,
              lineHeight: 1.7
            }}
          >
            {!document.processed ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-warm-brown mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-warm-brown mb-2">Processing Document</h3>
                  <p className="text-gray-600">Please wait while we prepare your document for AI analysis...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <div className="mb-8">
                  <h1 className="text-2xl font-semibold text-warm-brown text-center mb-6">
                    {document.title} - Page {currentPage}
                  </h1>
                  
                  <div className="space-y-4">
                    {getPageContent(currentPage).split('\n\n').map((paragraph, index) => (
                      <p key={index} className="indent-8 text-justify">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
