import { readFileSync } from 'fs';
import { pdfService } from './services/pdf.js';
import { storage } from './storage.js';

export async function initializeApplication() {
  try {
    // Check if TTB.pdf is already processed
    const documents = await storage.getAllDocuments();
    const existingDoc = documents.find(doc => doc.filename === 'TTB.pdf');
    
    if (existingDoc) {
      console.log('TTB.pdf already loaded and processed');
      return existingDoc.id;
    }

    // Load and process TTB.pdf
    console.log('Loading TTB.pdf...');
    const pdfBuffer = readFileSync('./TTB.pdf');
    const documentId = await pdfService.processPDFBuffer(pdfBuffer, 'TTB.pdf');
    
    console.log(`TTB.pdf loaded successfully with ID: ${documentId}`);
    return documentId;
  } catch (error) {
    console.error('Error initializing TTB.pdf:', error);
    throw error;
  }
}