import { useRef, useEffect } from 'react';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface ChatContainerProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatContainer({
  messages,
  loading,
}: ChatContainerProps) {
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className={styles.cloud}>
      <div ref={messageListRef} className={styles.messagelist}>
        {messages.map((message, index) => (
          <div
            key={`chatMessage-${index}`}
            className={
              message.type === 'apiMessage'
                ? styles.apimessage
                : loading && index === messages.length - 1
                ? styles.usermessagewaiting
                : styles.usermessage
            }
          >
            <Image
              src={
                message.type === 'apiMessage'
                  ? '/bot-image.png'
                  : '/usericon.png'
              }
              alt={message.type === 'apiMessage' ? 'AI' : 'User'}
              width={40}
              height={40}
              priority
              className={
                message.type === 'apiMessage' ? styles.boticon : styles.usericon
              }
            />
            <div className={styles.markdownanswer}>
              <ReactMarkdown linkTarget="_blank">
                {message.message}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
