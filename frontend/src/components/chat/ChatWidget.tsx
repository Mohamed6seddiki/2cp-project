import { useEffect } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

export default function ChatWidget(): JSX.Element {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://argaz-azegagh.app.n8n.cloud/webhook/7e6ffad9-5d9a-4fc8-a99d-4a64233980d1/chat',
      initialMessages: ['I am NovaAI, i am here to help ....'],
      showWelcomeScreen: true,
      
      // تخصيص الألوان والتصميم
      theme: {
        primary: '#00D9B5',
        secondary: '#0A1628',
        background: '#0A1628',
        text: '#FFFFFF',
        chatBubbleUser: '#00D9B5',
        chatBubbleBot: '#1E2A3A',
      },
      
      // تخصيص النصوص
      i18n: {
        en: {
          title: 'NovaAI Assistant',
          subtitle: 'Always here to help you',
          footer: '',
          getStarted: 'Start chatting',
          inputPlaceholder: 'Type your message...',
        },
      },
    });
  }, []);

  return (
    <>
      <div id="n8n-chat-container"></div>
      
      <style jsx global>{`
        /* ===== تخصيص زر الفتح (الأيقونة العائمة) ===== */
        #n8n-chat button[aria-label*="Open"],
        #n8n-chat > div > button,
        .n8n-chat-button {
          background: linear-gradient(135deg, #00D9B5 0%, #00C4A3 100%) !important;
          box-shadow: 0 4px 20px rgba(0, 217, 181, 0.3) !important;
          width: 60px !important;
          height: 60px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease-in-out !important;
        }
        
        /* لون أيقونة الفتح - أبيض */
        #n8n-chat button[aria-label*="Open"] svg,
        #n8n-chat > div > button svg,
        .n8n-chat-button svg {
          color: #FFFFFF !important;
          fill: #FFFFFF !important;
        }
        
        #n8n-chat button[aria-label*="Open"] svg path,
        #n8n-chat > div > button svg path {
          fill: #FFFFFF !important;
          stroke: #FFFFFF !important;
        }
        
        /* ===== تخصيص زر الإغلاق (السهم للأسفل) ===== */
        #n8n-chat button[aria-label*="Close"],
        #n8n-chat div[class*="close"] button,
        .n8n-chat-close-button {
          background: linear-gradient(135deg, #00D9B5 0%, #00C4A3 100%) !important;
          box-shadow: 0 4px 20px rgba(0, 217, 181, 0.3) !important;
        }
        
        #n8n-chat button[aria-label*="Close"] svg,
        .n8n-chat-close-button svg {
          color: #FFFFFF !important;
          fill: #FFFFFF !important;
        }
        
        #n8n-chat button[aria-label*="Close"] svg path,
        .n8n-chat-close-button svg path {
          fill: #FFFFFF !important;
          stroke: #FFFFFF !important;
        }
        
        /* Hover effects */
        #n8n-chat button[aria-label*="Open"]:hover,
        #n8n-chat button[aria-label*="Close"]:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 30px rgba(0, 217, 181, 0.5) !important;
        }
        
        /* أنيميشن نبض */
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(0, 217, 181, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(0, 217, 181, 0.4);
          }
        }
        
        #n8n-chat button[aria-label*="Open"] {
          animation: pulse 2.5s ease-in-out infinite;
        }
        
        #n8n-chat button[aria-label*="Open"]:hover {
          animation: none;
        }
        
        /* ===== تخصيص نافذة الشات ===== */
        .n8n-chat-window,
        #n8n-chat > div > div {
          border: 1px solid rgba(0, 217, 181, 0.3) !important;
          box-shadow: 0 8px 40px rgba(0, 217, 181, 0.2) !important;
          border-radius: 16px !important;
          background: #0A1628 !important;
        }
        
        /* ===== تخصيص Header ===== */
        .n8n-chat-header,
        #n8n-chat header {
          background: linear-gradient(135deg, #1E2A3A 0%, #0A1628 100%) !important;
          border-bottom: 2px solid #00D9B5 !important;
          color: #FFFFFF !important;
          border-radius: 16px 16px 0 0 !important;
          padding: 20px !important;
        }
        
        .n8n-chat-header h1,
        .n8n-chat-header h2,
        #n8n-chat header h1,
        #n8n-chat header h2 {
          color: #FFFFFF !important;
        }
        
        .n8n-chat-header p,
        #n8n-chat header p {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        /* ===== تخصيص منطقة الرسائل ===== */
        .n8n-chat-messages,
        #n8n-chat main {
          background: #0A1628 !important;
        }
        
        /* ===== تخصيص رسائل المستخدم ===== */
        .n8n-chat-message-user,
        div[class*="user"] div[class*="message"] {
          background: linear-gradient(135deg, #00D9B5 0%, #00C4A3 100%) !important;
          color: #0A1628 !important;
          font-weight: 500 !important;
          border-radius: 12px 12px 4px 12px !important;
          padding: 12px 16px !important;
        }
        
        /* ===== تخصيص رسائل البوت ===== */
        .n8n-chat-message-bot,
        .n8n-chat-message-assistant,
        div[class*="bot"] div[class*="message"],
        div[class*="assistant"] div[class*="message"] {
          background: #1E2A3A !important;
          color: #FFFFFF !important;
          border: 1px solid rgba(0, 217, 181, 0.2) !important;
          border-radius: 12px 12px 12px 4px !important;
          padding: 12px 16px !important;
        }
        
        /* ===== تخصيص رسائل الخطأ ===== */
        .n8n-chat-error,
        div[class*="error"] {
          background: rgba(255, 77, 77, 0.1) !important;
          border: 1px solid rgba(255, 77, 77, 0.3) !important;
          color: #FF9999 !important;
          border-radius: 8px !important;
          padding: 10px !important;
        }
        
        /* ===== تخصيص Footer وحقل الإدخال ===== */
        .n8n-chat-footer,
        #n8n-chat footer {
          background: #0A1628 !important;
          border-top: 1px solid rgba(0, 217, 181, 0.2) !important;
          padding: 16px !important;
        }
        
        .n8n-chat-input,
        .n8n-chat-input-wrapper input,
        #n8n-chat input[type="text"],
        #n8n-chat textarea {
          border: 1px solid rgba(0, 217, 181, 0.3) !important;
          background: #1E2A3A !important;
          color: #FFFFFF !important;
          border-radius: 10px !important;
          padding: 12px 16px !important;
        }
        
        .n8n-chat-input:focus,
        .n8n-chat-input-wrapper input:focus,
        #n8n-chat input:focus,
        #n8n-chat textarea:focus {
          border-color: #00D9B5 !important;
          box-shadow: 0 0 0 3px rgba(0, 217, 181, 0.15) !important;
          outline: none !important;
        }
        
        .n8n-chat-input::placeholder,
        #n8n-chat input::placeholder,
        #n8n-chat textarea::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        
        /* ===== تخصيص زر الإرسال ===== */
        .n8n-chat-send-button,
        button[type="submit"] {
          background: linear-gradient(135deg, #00D9B5 0%, #00C4A3 100%) !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          border: none !important;
        }
        
        .n8n-chat-send-button svg,
        button[type="submit"] svg {
          color: #0A1628 !important;
          fill: #0A1628 !important;
        }
        
        .n8n-chat-send-button:hover,
        button[type="submit"]:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 15px rgba(0, 217, 181, 0.3) !important;
        }
        
        /* ===== Scrollbar مخصص ===== */
        .n8n-chat-messages::-webkit-scrollbar,
        #n8n-chat main::-webkit-scrollbar {
          width: 6px;
        }
        
        .n8n-chat-messages::-webkit-scrollbar-track,
        #n8n-chat main::-webkit-scrollbar-track {
          background: #1E2A3A;
          border-radius: 3px;
        }
        
        .n8n-chat-messages::-webkit-scrollbar-thumb,
        #n8n-chat main::-webkit-scrollbar-thumb {
          background: #00D9B5;
          border-radius: 3px;
        }
        
        .n8n-chat-messages::-webkit-scrollbar-thumb:hover,
        #n8n-chat main::-webkit-scrollbar-thumb:hover {
          background: #00C4A3;
        }

        /* ===== Smooth transitions ===== */
        #n8n-chat * {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}