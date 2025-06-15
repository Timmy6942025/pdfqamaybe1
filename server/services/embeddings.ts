class EmbeddingService {
  private isInitialized = false;
  private embedder: any; // Changed type to 'any' to avoid importing pipeline type

  async initialize() {
    if (this.isInitialized) return;
    console.log('Initializing BAAI BGE-M3 embedding service...');
    // Load BAAI BGE-M3 - multilingual embedding model with excellent performance
    // BGE-M3 supports dense retrieval, multi-vector retrieval, and sparse retrieval
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { pipeline } = require('@xenova/transformers');
    this.embedder = await pipeline('feature-extraction', 'BAAI/bge-m3');
    this.isInitialized = true;
    console.log('BAAI BGE-M3 embedding service initialized successfully');
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