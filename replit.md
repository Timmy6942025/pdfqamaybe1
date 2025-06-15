# Religious Text Assistant

## Overview

This is a full-stack web application designed to analyze and provide AI-powered insights into religious texts. The application allows users to upload PDF documents, processes them into searchable chunks with embeddings, and provides an intelligent Q&A interface powered by Google's Gemini AI. The system is built with a modern React frontend and Express.js backend, utilizing PostgreSQL for data persistence and advanced NLP techniques for semantic search.

## System Architecture

The application follows a three-tier architecture:

**Frontend (React + TypeScript)**
- Built with Vite for fast development and optimized builds
- Uses shadcn/ui components for consistent, accessible UI design
- Implements TanStack Query for efficient data fetching and caching
- Styled with Tailwind CSS using a warm, academic color scheme

**Backend (Express.js + TypeScript)**
- RESTful API with Express.js serving both API endpoints and static assets
- Processes PDF documents using pdf-parse library
- Generates embeddings using BAAI/bge-large-en-v1.5 model via Xenova Transformers
- Integrates with Google Gemini AI for intelligent text analysis

**Database (PostgreSQL)**
- Uses Drizzle ORM for type-safe database operations
- Stores documents, chunked text with embeddings, and chat history
- Supports vector similarity search for semantic text matching

## Key Components

### Document Processing Pipeline
- **PDF Upload**: Handles file uploads with 50MB size limit
- **Text Extraction**: Extracts full text content from PDF documents
- **Chunking**: Splits documents into ~500-word semantic chunks
- **Embedding Generation**: Creates vector embeddings for each chunk using transformer models
- **Storage**: Persists chunks with embeddings in PostgreSQL for fast retrieval

### AI-Powered Features
- **Semantic Search**: Finds relevant document sections using vector similarity
- **Contextual Q&A**: Provides intelligent answers based on document content
- **Content Summarization**: Generates chapter and section summaries
- **Chat History**: Maintains conversation context for follow-up questions

### User Interface
- **PDF Viewer**: Custom PDF display with navigation controls
- **Collapsible Sidebar**: Q&A interface with chat history
- **Document Library**: Browse and select uploaded documents
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Data Flow

1. **Document Upload**: User uploads PDF → Backend processes and extracts text
2. **Background Processing**: Text is chunked → Embeddings generated → Stored in database
3. **User Query**: Question submitted → Relevant chunks retrieved via similarity search
4. **AI Response**: Context + question sent to Gemini → Response generated and stored
5. **Display**: Answer shown with source references and chat history updated

## External Dependencies

### Core Technologies
- **React 18**: Modern UI framework with hooks and concurrent features
- **Express.js**: Web server framework for Node.js
- **PostgreSQL**: Relational database with JSON support for embeddings
- **Drizzle ORM**: Type-safe database toolkit for TypeScript

### AI/ML Services
- **Google Gemini AI**: Large language model for text analysis and Q&A
- **Xenova Transformers**: Browser-compatible ML models for embeddings
- **BAAI/bge-large-en-v1.5**: Embedding model for semantic search

### UI/UX Libraries
- **shadcn/ui**: Pre-built, customizable React components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Consistent icon library

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

**Development Environment**
- Uses `tsx` for TypeScript execution in development
- Vite dev server with HMR for fast frontend development
- PostgreSQL 16 module for database functionality

**Production Build**
- Frontend built with Vite → optimized static assets
- Backend compiled with esbuild → single JavaScript bundle
- Serves static files and API from single Express server

**Configuration**
- Environment variables for database URL and API keys
- Port 5000 for development, 80 for production
- Autoscale deployment target for production scaling

## Changelog

```
Changelog:
- June 15, 2025. Initial setup
- June 15, 2025. Configured automatic TTB.pdf loading and AI integration
- June 15, 2025. Fixed PDF viewer to show proper page structure instead of full document dump
- June 15, 2025. Implemented semantic search with custom embedding service
- June 15, 2025. Application fully operational with Gemini AI and 994 processed text chunks
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```