import { 
  users, 
  documents, 
  documentChunks, 
  chatMessages,
  type User, 
  type InsertUser,
  type Document,
  type InsertDocument,
  type DocumentChunk,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  
  createDocumentChunk(chunk: Omit<DocumentChunk, 'id'>): Promise<DocumentChunk>;
  getDocumentChunks(documentId: number): Promise<DocumentChunk[]>;
  searchSimilarChunks(documentId: number, embedding: number[], limit?: number): Promise<Array<DocumentChunk & { similarity: number }>>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(documentId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private documentChunks: Map<number, DocumentChunk>;
  private chatMessages: Map<number, ChatMessage>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentChunkId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.documentChunks = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentChunkId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      processed: insertDocument.processed ?? false,
      createdAt: new Date() 
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async createDocumentChunk(chunk: Omit<DocumentChunk, 'id'>): Promise<DocumentChunk> {
    const id = this.currentChunkId++;
    const documentChunk: DocumentChunk = { ...chunk, id };
    this.documentChunks.set(id, documentChunk);
    return documentChunk;
  }

  async getDocumentChunks(documentId: number): Promise<DocumentChunk[]> {
    return Array.from(this.documentChunks.values()).filter(
      chunk => chunk.documentId === documentId
    );
  }

  async searchSimilarChunks(
    documentId: number, 
    queryEmbedding: number[], 
    limit: number = 5
  ): Promise<Array<DocumentChunk & { similarity: number }>> {
    const chunks = await this.getDocumentChunks(documentId);
    
    const chunksWithSimilarity = chunks
      .filter(chunk => chunk.embedding)
      .map(chunk => {
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding!);
        return { ...chunk, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return chunksWithSimilarity;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      context: insertMessage.context as any || null,
      timestamp: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(documentId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.documentId === documentId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }
}

export const storage = new MemStorage();
