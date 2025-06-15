import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export function useChatMessages(documentId: number) {
  return useQuery<ChatMessage[]>({
    queryKey: ["/api/documents", documentId, "messages"],
    enabled: !!documentId,
  });
}

export function useAskQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, question }: {
      documentId: number;
      question: string;
    }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/ask`, {
        question
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/documents", variables.documentId, "messages"] 
      });
    },
  });
}
