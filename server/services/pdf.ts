// @ts-ignore
import pdf from 'pdf-parse';
import { embeddingService } from './embeddings.js';
import { storage } from '../storage.js';
import type { InsertDocument } from '@shared/schema';

class PDFService {
  async processPDFBuffer(buffer: Buffer, filename: string): Promise<number> {
    try {
      // Extract text from PDF
      console.log('Extracting text from PDF...');
      const data = await pdf(buffer);
      
      const document: InsertDocument = {
        title: filename.replace('.pdf', ''),
        filename,
        content: data.text,
        totalPages: data.numpages,
        processed: false
      };

      // Create document record
      const createdDocument = await storage.createDocument(document);
      
      // Process document in background
      this.processDocumentChunks(createdDocument.id, data.text, data.numpages);
      
      return createdDocument.id;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  private async processDocumentChunks(documentId: number, content: string, totalPages: number) {
    try {
      console.log(`Processing document chunks for document ${documentId}...`);
      
      // Split content into chunks (roughly 500 words each)
      const chunks = this.splitIntoChunks(content, 500);
      
      // Generate embeddings for each chunk
      const embeddings = await embeddingService.generateBatchEmbeddings(
        chunks.map(chunk => chunk.text)
      );

      // Store chunks with embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];
        
        await storage.createDocumentChunk({
          documentId,
          chunkText: chunk.text,
          pageNumber: this.estimatePageNumber(chunk.startIndex, content.length, totalPages),
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
          embedding
        });
      }

      // Mark document as processed
      await storage.updateDocument(documentId, { processed: true });
      console.log(`Document ${documentId} processing completed`);
      
    } catch (error) {
      console.error('Error processing document chunks:', error);
      await storage.updateDocument(documentId, { processed: false });
    }
  }

  private splitIntoChunks(text: string, maxWords: number = 500): Array<{
    text: string;
    startIndex: number;
    endIndex: number;
  }> {
    const words = text.split(/\s+/);
    const chunks: Array<{ text: string; startIndex: number; endIndex: number }> = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
      const chunkWords = words.slice(i, i + maxWords);
      const chunkText = chunkWords.join(' ');
      
      // Find the actual start and end positions in the original text
      const startIndex = text.indexOf(chunkWords[0], i > 0 ? chunks[chunks.length - 1]?.endIndex || 0 : 0);
      const endIndex = startIndex + chunkText.length;
      
      chunks.push({
        text: chunkText,
        startIndex,
        endIndex
      });
    }
    
    return chunks;
  }

  private estimatePageNumber(charIndex: number, totalChars: number, totalPages: number): number {
    const progress = charIndex / totalChars;
    return Math.ceil(progress * totalPages) || 1;
  }

  async searchDocument(documentId: number, query: string, limit: number = 5) {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      
      // Find similar chunks
      const similarChunks = await storage.searchSimilarChunks(documentId, queryEmbedding, limit);
      
      return similarChunks.map(chunk => ({
        chunkId: chunk.id,
        pageNumber: chunk.pageNumber,
        text: chunk.chunkText,
        similarity: chunk.similarity
      }));
    } catch (error) {
      console.error('Error searching document:', error);
      throw new Error('Failed to search document');
    }
  }
}

export const pdfService = new PDFService();
