import styles from '@/styles/Home.module.css';
import { useState } from 'react';
import LoadingDots from '@/src/components/ui/LoadingDots';

interface MessageInputProps {
  onSubmit: (question: string) => void;
  loading: boolean;
}

export default function MessageInput({ onSubmit, loading }: MessageInputProps) {
  const [query, setQuery] = useState<string>('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (query.trim()) {
        onSubmit(query.trim());
        setQuery('');
      }
    }
  };

  return (
    <form
      className={styles.cloudform}
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          onSubmit(query.trim());
          setQuery('');
        }
      }}
    >
      <textarea
        disabled={loading}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          loading ? 'Waiting for response...' : 'What do you want to know?'
        }
        className={styles.textarea}
        rows={1}
        maxLength={512}
      />
      <button
        type="submit"
        disabled={loading}
        className={styles.generatebutton}
      >
        {loading ? (
          <div className={styles.loadingwheel}>
            <LoadingDots color="#000" />
          </div>
        ) : (
          // Send icon SVG in input field
          <svg
            viewBox="0 0 20 20"
            className={styles.svgicon}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
          </svg>
        )}
      </button>
    </form>
  );
}
