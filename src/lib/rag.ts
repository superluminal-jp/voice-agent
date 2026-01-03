/**
 * RAG (Retrieval-Augmented Generation) Module
 *
 * Provides semantic search capabilities over local text files.
 * Uses File System Access API for folder selection, OpenAI Embeddings API
 * for vectorization, and in-memory cosine similarity search.
 *
 * Features:
 * - Folder selection via File System Access API
 * - Recursive text file reading
 * - Text chunking with overlap
 * - Embedding generation via OpenAI API
 * - In-memory vector search
 * - Session-scoped storage
 */

/**
 * Supported text file extensions
 */
const TEXT_FILE_EXTENSIONS = [
  ".txt",
  ".md",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".rb",
  ".php",
  ".swift",
  ".kt",
  ".scala",
  ".sh",
  ".bash",
  ".zsh",
  ".yaml",
  ".yml",
  ".xml",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".sql",
  ".r",
  ".m",
  ".pl",
  ".lua",
  ".vim",
  ".conf",
  ".config",
  ".log",
];

/**
 * Chunk configuration
 */
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

/**
 * Maximum number of chunks to prevent memory issues
 */
const MAX_CHUNKS = 10000;

/**
 * Embedding model configuration
 */
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Chunk with metadata
 */
export interface Chunk {
  text: string;
  filePath: string;
  fileName: string;
  chunkIndex: number;
  startChar: number;
  endChar: number;
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  chunk: Chunk;
  score: number;
}

/**
 * RAG index state
 */
interface RAGIndex {
  chunks: Chunk[];
  embeddings: Float32Array; // Flattened array: [chunk0_emb, chunk1_emb, ...]
  folderHandle: FileSystemDirectoryHandle | null;
  indexedAt: Date;
}

/**
 * Global RAG index (session-scoped)
 */
let ragIndex: RAGIndex | null = null;

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "showDirectoryPicker" in window &&
    "FileSystemHandle" in window
  );
}

/**
 * Check if a file has a supported text extension
 */
function isTextFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return TEXT_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

/**
 * Read text file content
 */
async function readTextFile(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    console.error(`[RAG] Error reading file ${file.name}:`, error);
    throw new Error(`Failed to read file: ${file.name}`);
  }
}

/**
 * Recursively read all text files from a directory
 */
async function readDirectoryRecursive(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = ""
): Promise<Array<{ path: string; name: string; content: string }>> {
  const files: Array<{ path: string; name: string; content: string }> = [];

  try {
    for await (const [name, handle] of dirHandle.entries()) {
      const currentPath = basePath ? `${basePath}/${name}` : name;

      if (handle.kind === "file" && isTextFile(name)) {
        try {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const content = await readTextFile(file);
          files.push({
            path: currentPath,
            name,
            content,
          });
        } catch (error) {
          console.warn(`[RAG] Skipping file ${currentPath}:`, error);
        }
      } else if (handle.kind === "directory") {
        // Recursively read subdirectories
        try {
          const subFiles = await readDirectoryRecursive(
            handle as FileSystemDirectoryHandle,
            currentPath
          );
          files.push(...subFiles);
        } catch (error) {
          console.warn(`[RAG] Skipping directory ${currentPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`[RAG] Error reading directory ${basePath}:`, error);
    throw error;
  }

  return files;
}

/**
 * Split text into chunks with overlap
 */
function chunkText(
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): Array<{ text: string; startChar: number; endChar: number }> {
  const chunks: Array<{ text: string; startChar: number; endChar: number }> =
    [];

  if (text.length <= chunkSize) {
    return [{ text, startChar: 0, endChar: text.length }];
  }

  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end);

    chunks.push({
      text: chunkText,
      startChar: start,
      endChar: end,
    });

    // Move start position forward, accounting for overlap
    start += chunkSize - overlap;

    // Prevent infinite loop
    if (start >= text.length) break;
  }

  return chunks;
}

/**
 * Generate embeddings for texts using OpenAI API
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable."
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorData}`
      );
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error("[RAG] Error generating embeddings:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Select a folder using File System Access API
 */
export async function selectFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error(
      "File System Access API is not supported in this browser. Please use Chrome, Edge, or Safari 15.2+."
    );
  }

  try {
    const handle = await window.showDirectoryPicker({
      mode: "read",
    });
    return handle;
  } catch (error: any) {
    if (error.name === "AbortError") {
      // User cancelled
      return null;
    }
    console.error("[RAG] Error selecting folder:", error);
    throw error;
  }
}

/**
 * Index a folder: read files, chunk text, and generate embeddings
 */
export async function indexFolder(
  folderHandle: FileSystemDirectoryHandle
): Promise<{
  chunkCount: number;
  fileCount: number;
}> {
  if (process.env.NODE_ENV === "development") {
    console.log("[RAG] Starting folder indexing...");
  }

  // Read all text files
  const files = await readDirectoryRecursive(folderHandle);

  if (files.length === 0) {
    throw new Error("No text files found in the selected folder.");
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[RAG] Found ${files.length} text files`);
  }

  // Create chunks from all files
  const chunks: Chunk[] = [];

  for (const file of files) {
    const textChunks = chunkText(file.content);

    for (let i = 0; i < textChunks.length; i++) {
      if (chunks.length >= MAX_CHUNKS) {
        console.warn(
          `[RAG] Maximum chunk limit (${MAX_CHUNKS}) reached. Some content may not be indexed.`
        );
        break;
      }

      chunks.push({
        text: textChunks[i].text,
        filePath: file.path,
        fileName: file.name,
        chunkIndex: i,
        startChar: textChunks[i].startChar,
        endChar: textChunks[i].endChar,
      });
    }

    if (chunks.length >= MAX_CHUNKS) break;
  }

  if (chunks.length === 0) {
    throw new Error("No text content found to index.");
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[RAG] Created ${chunks.length} chunks, generating embeddings...`);
  }

  // Generate embeddings in batches
  const batchSize = 100; // OpenAI API limit
  const embeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchTexts = batch.map((chunk) => chunk.text);
    const batchEmbeddings = await generateEmbeddings(batchTexts);
    embeddings.push(...batchEmbeddings);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[RAG] Generated embeddings for ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`
      );
    }
  }

  // Flatten embeddings into Float32Array for efficient storage
  const flattenedEmbeddings = new Float32Array(
    embeddings.length * EMBEDDING_DIMENSIONS
  );
  for (let i = 0; i < embeddings.length; i++) {
    for (let j = 0; j < EMBEDDING_DIMENSIONS; j++) {
      flattenedEmbeddings[i * EMBEDDING_DIMENSIONS + j] = embeddings[i][j];
    }
  }

  // Store index
  ragIndex = {
    chunks,
    embeddings: flattenedEmbeddings,
    folderHandle,
    indexedAt: new Date(),
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[RAG] Folder indexing completed successfully");
  }

  return {
    chunkCount: chunks.length,
    fileCount: files.length,
  };
}

/**
 * Search for relevant chunks using semantic search
 */
export async function search(
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  if (!ragIndex) {
    throw new Error(
      "No folder indexed. Please select and index a folder first."
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[RAG] Searching for: "${query}"`);
  }

  // Generate embedding for query
  const queryEmbeddings = await generateEmbeddings([query]);
  const queryEmbedding = queryEmbeddings[0];

  // Calculate similarity scores
  const results: SearchResult[] = [];

  for (let i = 0; i < ragIndex.chunks.length; i++) {
    // Extract chunk embedding from flattened array
    const chunkEmbedding: number[] = [];
    for (let j = 0; j < EMBEDDING_DIMENSIONS; j++) {
      chunkEmbedding.push(
        ragIndex.embeddings[i * EMBEDDING_DIMENSIONS + j]
      );
    }

    const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
    results.push({
      chunk: ragIndex.chunks[i],
      score,
    });
  }

  // Sort by score (descending) and return top K
  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, topK);

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[RAG] Found ${topResults.length} results (top score: ${topResults[0]?.score.toFixed(4)})`
    );
  }

  return topResults;
}

/**
 * Check if a folder is currently indexed
 */
export function isIndexed(): boolean {
  return ragIndex !== null;
}

/**
 * Get index statistics
 */
export function getIndexStats(): {
  chunkCount: number;
  fileCount: number;
  indexedAt: Date | null;
} | null {
  if (!ragIndex) return null;

  // Count unique files
  const uniqueFiles = new Set(
    ragIndex.chunks.map((chunk) => chunk.filePath)
  );

  return {
    chunkCount: ragIndex.chunks.length,
    fileCount: uniqueFiles.size,
    indexedAt: ragIndex.indexedAt,
  };
}

/**
 * Clear the current index
 */
export function clearIndex(): void {
  ragIndex = null;
  if (process.env.NODE_ENV === "development") {
    console.log("[RAG] Index cleared");
  }
}

