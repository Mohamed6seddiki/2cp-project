import { useEffect } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';
import './chat-widget.css';

export default function ChatWidget() {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://argaz-azegagh.app.n8n.cloud/webhook/7e6ffad9-5d9a-4fc8-a99d-4a64233980d1/chat',
      initialMessages: ['I am NovaAI, i am here to help ....'],
      showWelcomeScreen: true,
      theme: {
        primary: '#00D9B5',
        secondary: '#0A1628',
        background: '#0A1628',
        text: '#FFFFFF',
        chatBubbleUser: '#00D9B5',
        chatBubbleBot: '#1E2A3A',
      },
    });
  }, []);

  return <div id="n8n-chat-container"></div>;
}