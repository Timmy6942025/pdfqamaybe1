import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage.js";
import { pdfService } from "./services/pdf.js";
import { aiService } from "./services/ai.js";
import { insertChatMessageSchema } from "@shared/schema.js";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Upload and process PDF
  app.post("/api/documents/upload", upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file provided" });
      }

      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: "File must be a PDF" });
      }

      const documentId = await pdfService.processPDFBuffer(req.file.buffer, req.file.originalname);
      
      res.json({ 
        documentId, 
        message: "PDF uploaded successfully. Processing in background..." 
      });
    } catch (error) {
      console.error("Error uploading PDF:", error);
      res.status(500).json({ error: "Failed to upload PDF" });
    }
  });

  // Get chat messages for a document
  app.get("/api/documents/:id/messages", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(documentId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Ask a question about the document
  app.post("/api/documents/:id/ask", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { question } = req.body;

      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: "Question is required" });
      }

      // Check if document exists and is processed
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (!document.processed) {
        return res.status(400).json({ error: "Document is still being processed" });
      }

      // Store user question
      await storage.createChatMessage({
        documentId,
        type: "user",
        content: question
      });

      // Search for relevant context
      const relevantChunks = await pdfService.searchDocument(documentId, question, 5);
      
      // Generate AI response
      const context = relevantChunks.map(chunk => chunk.text).join('\n\n');
      const aiResponse = await aiService.generateResponse(question, context);

      // Store AI response
      const responseMessage = await storage.createChatMessage({
        documentId,
        type: "assistant",
        content: aiResponse,
        context: { relevantChunks }
      });

      res.json({
        response: aiResponse,
        context: relevantChunks,
        messageId: responseMessage.id
      });

    } catch (error) {
      console.error("Error processing question:", error);
      res.status(500).json({ error: "Failed to process question" });
    }
  });

  // Quick actions
  app.post("/api/documents/:id/summarize", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { pageStart, pageEnd } = req.body;

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Get relevant chunks for the page range
      const chunks = await storage.getDocumentChunks(documentId);
      const relevantChunks = chunks.filter(chunk => 
        (!pageStart || chunk.pageNumber >= pageStart) &&
        (!pageEnd || chunk.pageNumber <= pageEnd)
      );

      const content = relevantChunks.map(chunk => chunk.chunkText).join('\n\n');
      const summary = await aiService.summarizeChapter(content);

      res.json({ summary });
    } catch (error) {
      console.error("Error summarizing:", error);
      res.status(500).json({ error: "Failed to summarize content" });
    }
  });

  app.post("/api/documents/:id/themes", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { pageStart, pageEnd } = req.body;

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const chunks = await storage.getDocumentChunks(documentId);
      const relevantChunks = chunks.filter(chunk => 
        (!pageStart || chunk.pageNumber >= pageStart) &&
        (!pageEnd || chunk.pageNumber <= pageEnd)
      );

      const content = relevantChunks.map(chunk => chunk.chunkText).join('\n\n');
      const themes = await aiService.findThemes(content);

      res.json({ themes });
    } catch (error) {
      console.error("Error finding themes:", error);
      res.status(500).json({ error: "Failed to analyze themes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
