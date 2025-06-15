class EmbeddingService {
  private isInitialized = false;
  private embedder: any; // Changed type to 'any' to avoid importing pipeline type

  async initialize() {
    if (this.isInitialized) return;
    console.log('Initializing BAAI BGE-Large-EN-V1.5 embedding service...');
    // Load BAAI BGE-Large-EN-V1.5 - high-performance English embedding model
    // This model provides excellent semantic understanding for English text
    const { pipeline } = await import('@xenova/transformers');
    this.embedder = await pipeline('feature-extraction', 'BAAI/bge-large-en-v1.5');
    this.isInitialized = true;
    console.log('BAAI BGE-Large-EN-V1.5 embedding service initialized successfully');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const output = await this.embedder(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

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