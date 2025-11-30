import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-stream`;

interface UseChatStreamOptions {
  patientId: string | null;
  conversationId: string | null;
  onConversationIdChange?: (id: string) => void;
}

export const useChatStream = ({ patientId, conversationId, onConversationIdChange }: UseChatStreamOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  const sendMessage = useCallback(async (
    message: string,
    onDelta: (text: string) => void,
    onDone: () => void
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message,
          patientId: patientId || undefined,
          conversationId: currentConversationId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al conectar con el asistente');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle conversation ID from backend
              if (parsed.conversationId && !currentConversationId) {
                setCurrentConversationId(parsed.conversationId);
                onConversationIdChange?.(parsed.conversationId);
              }

              // Handle content delta
              if (parsed.content) {
                onDelta(parsed.content);
              } else if (parsed.choices?.[0]?.delta?.content) {
                onDelta(parsed.choices[0].delta.content);
              }
            } catch {
              // Plain text response
              if (data && data !== '[DONE]') {
                onDelta(data);
              }
            }
          }
        }
      }

      onDone();
    } catch (error) {
      console.error('Chat stream error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar mensaje');
      onDone();
    } finally {
      setIsLoading(false);
    }
  }, [patientId, currentConversationId, onConversationIdChange]);

  const resetConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    conversationId: currentConversationId,
    resetConversation,
  };
};
