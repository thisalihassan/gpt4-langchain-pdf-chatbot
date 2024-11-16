import Layout from '@/src/components/layout';
import styles from '@/styles/Home.module.css';
import ChatContainer from '@/src/components/ChatContainer';
import MessageInput from '@/src/components/MessageInput';
import { useChat } from '@/src/hooks/useChat';

export default function Home() {
  const { messages, loading, error, handleSubmit } = useChat();

  return (
    <Layout>
      <div className="mx-auto flex flex-col gap-4">
        <main className={styles.main}>
          <ChatContainer messages={messages} loading={loading} />
          <MessageInput onSubmit={handleSubmit} loading={loading} />
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
