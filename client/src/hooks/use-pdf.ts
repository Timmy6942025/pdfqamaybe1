import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Document } from "@shared/schema";

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
}

export function useDocument(id: number) {
  return useQuery<Document>({
    queryKey: ["/api/documents", id],
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await apiRequest("POST", "/api/documents/upload", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });
}

export function useSummarize() {
  return useMutation({
    mutationFn: async ({ documentId, pageStart, pageEnd }: {
      documentId: number;
      pageStart?: number;
      pageEnd?: number;
    }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/summarize`, {
        pageStart,
        pageEnd
      });
      return response.json();
    },
  });
}

export function useThemes() {
  return useMutation({
    mutationFn: async ({ documentId, pageStart, pageEnd }: {
      documentId: number;
      pageStart?: number;
      pageEnd?: number;
    }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/themes`, {
        pageStart,
        pageEnd
      });
      return response.json();
    },
  });
}
