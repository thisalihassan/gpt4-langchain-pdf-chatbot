import { useEffect, useState } from 'react';
import { Message } from '@/types/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      message: 'Hi, what would you like to learn?',
      type: 'apiMessage',
    },
  ]);
  const [history, setHistory] = useState<ChatHistory>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (question: string) => {
    if (!question.trim()) {
      setError('Please input a question.');
      return;
    }

    setMessages((prev) => [
      ...prev,
      { type: 'userMessage', message: question },
      { type: 'apiMessage', message: '' },
    ]);

    setLoading(true);
  };

  const handleStreaming = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messages.at(-2)!.message,
          history,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader!.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');

          for (const line of lines) {
            if (line.includes('[DONE]')) return;

            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.content) {
                setMessages((prev) => {
                  const lastMessage = { ...prev.at(-1)! };
                  lastMessage.message += data.content || '';
                  return [...prev.slice(0, -1), lastMessage];
                });
                setHistory((prev) => {
                  if (prev?.at(-1)?.role != 'assistant') {
                    return [
                      ...prev,
                      { role: 'assistant', content: data.content },
                    ];
                  } else {
                    const assistantMessage =
                      prev.at(-1)!.content + data.content;
                    return [
                      ...prev.slice(0, -1),
                      { role: 'assistant', content: assistantMessage },
                    ];
                  }
                });
              } else {
                setHistory([
                  ...history,
                  {
                    role: 'user',
                    content: data.prompt,
                  },
                ]);
              }
            } catch (err) {
              console.error('Error parsing line:', line, err);
            }
          }
        }
      }
    } catch (err) {
      setError('An error occurred while fetching the data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      handleStreaming().then();
    }
  }, [loading]);

  return {
    messages,
    loading,
    error,
    handleSubmit,
  };
}
