import { pipeline, env } from '@xenova/transformers';

// Disable local models, use remote models
env.allowRemoteModels = true;
env.allowLocalModels = false;

class EmbeddingService {
  private extractor: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing BAAI/bge-large-en-v1.5 embedding model...');
      this.extractor = await pipeline('feature-extraction', 'BAAI/bge-large-en-v1.5');
      this.isInitialized = true;
      console.log('Embedding model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize embedding model:', error);
      throw new Error('Failed to load embedding model');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Clean and prepare text
      const cleanText = text.replace(/\s+/g, ' ').trim();
      
      // Generate embedding
      const output = await this.extractor(cleanText, {
        pooling: 'mean',
        normalize: true
      });

      // Convert to regular array
      return Array.from(output.data);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate text embedding');
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const embeddings: number[][] = [];
    
    // Process in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.generateEmbedding(text));
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
      
      // Log progress
      console.log(`Processed ${Math.min(i + batchSize, texts.length)} of ${texts.length} embeddings`);
    }

    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();
