class EmbeddingService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    console.log('Initializing simple text embedding service...');
    this.isInitialized = true;
    console.log('Embedding service initialized successfully');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Simple text embedding using character-based hashing
    const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
    const embedding: number[] = new Array(384).fill(0);
    
    // Generate deterministic embedding based on text content
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText.charCodeAt(i);
      const index = char % embedding.length;
      embedding[index] += Math.sin(char * 0.1) * 0.1;
    }
    
    // Add word-based features
    const words = cleanText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const char = word.charCodeAt(j);
        const index = (char + i * j) % embedding.length;
        embedding[index] += Math.cos(char * 0.1) * 0.05;
      }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }
    
    return embedding;
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
