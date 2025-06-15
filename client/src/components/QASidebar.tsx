import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Send, 
  Bot, 
  Brain, 
  Search,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingDots } from '@/components/ui/loading-spinner';
import { useChatMessages, useAskQuestion } from '@/hooks/use-chat';
import { useSummarize, useThemes } from '@/hooks/use-pdf';
import type { Document } from '@shared/schema';

interface QASidebarProps {
  document: Document;
  isOpen: boolean;
  onToggle: () => void;
  currentPage: number;
}

export function QASidebar({ document, isOpen, onToggle, currentPage }: QASidebarProps) {
  const [question, setQuestion] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(document.id);
  const askMutation = useAskQuestion();
  const summarizeMutation = useSummarize();
  const themesMutation = useThemes();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmitQuestion = async () => {
    if (!question.trim() || askMutation.isPending) return;
    
    const currentQuestion = question;
    setQuestion('');
    
    try {
      await askMutation.mutateAsync({
        documentId: document.id,
        question: currentQuestion
      });
    } catch (error) {
      console.error('Failed to ask question:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'summarize':
          await summarizeMutation.mutateAsync({
            documentId: document.id,
            pageStart: currentPage,
            pageEnd: currentPage
          });
          break;
        case 'themes':
          await themesMutation.mutateAsync({
            documentId: document.id,
            pageStart: currentPage,
            pageEnd: currentPage
          });
          break;
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed right-5 top-1/2 transform -translate-y-1/2 bg-warm-brown text-white p-3 rounded-l-lg shadow-lg hover:bg-warm-brown/90"
        size="lg"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="w-96 bg-light-beige border-l border-gray-200 flex flex-col transition-all duration-300">
      {/* Sidebar Header */}
      <Card className="rounded-none border-0 border-b">
        <CardHeader className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-warm-brown flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-gray-500 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Ask questions about the religious text and get AI-powered insights
          </p>
        </CardHeader>
      </Card>

      {/* Chat History */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-5">
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingDots />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation about the text</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.type === "user" ? (
                  <div className="bg-warm-brown text-white p-3 rounded-lg rounded-br-sm max-w-xs shadow-sm">
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {formatTimestamp(message.timestamp!)}
                    </span>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg rounded-bl-sm max-w-sm shadow-sm border border-gray-100">
                    <div className="flex items-center mb-2">
                      <Bot className="text-gold text-sm mr-2 h-4 w-4" />
                      <span className="text-xs font-medium text-gray-600">Gemini AI</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{message.content}</p>
                    
                    {message.context?.relevantChunks && message.context.relevantChunks.length > 0 && (
                      <div className="bg-cream p-2 rounded text-xs">
                        <div className="font-medium text-warm-brown mb-1">Referenced Passages:</div>
                        <div className="text-gray-600">
                          {message.context.relevantChunks.map((chunk, idx) => (
                            <span key={chunk.chunkId}>
                              Page {chunk.pageNumber}
                              {idx < message.context.relevantChunks!.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <span className="text-xs text-gray-500 mt-2 block">
                      {formatTimestamp(message.timestamp!)}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
          
          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-lg rounded-bl-sm max-w-sm shadow-sm border border-gray-100">
                <div className="flex items-center mb-2">
                  <Bot className="text-gold text-sm mr-2 h-4 w-4" />
                  <span className="text-xs font-medium text-gray-600">Gemini AI</span>
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <LoadingDots />
                  <span className="text-xs text-gray-500 ml-2">Analyzing text...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Question Input */}
      <Card className="rounded-none border-0 border-t">
        <CardContent className="p-5">
          <div className="space-y-3">
            {/* AI Model Indicator */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Brain className="h-3 w-3 text-gold" />
                <span>Gemini-2.0-Flash</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="h-3 w-3 text-gold" />
                <span>BGE-Large Embeddings</span>
              </div>
            </div>
            
            {/* Input Area */}
            <div className="relative">
              <Textarea
                placeholder="Ask a question about the text..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                className="resize-none pr-12 focus:ring-2 focus:ring-warm-brown focus:border-transparent"
                rows={3}
                disabled={!document.processed}
              />
              <Button
                onClick={handleSubmitQuestion}
                disabled={!question.trim() || askMutation.isPending || !document.processed}
                className="absolute bottom-3 right-3 p-2 bg-warm-brown text-white hover:bg-warm-brown/90"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {!document.processed && (
              <p className="text-xs text-amber-600">
                Document is still being processed. Please wait...
              </p>
            )}
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="cursor-pointer bg-cream text-warm-brown hover:bg-gold hover:text-white transition-colors"
                onClick={() => handleQuickAction('summarize')}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Summarize page
              </Badge>
              <Badge
                variant="secondary"
                className="cursor-pointer bg-cream text-warm-brown hover:bg-gold hover:text-white transition-colors"
                onClick={() => handleQuickAction('themes')}
              >
                Find themes
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
