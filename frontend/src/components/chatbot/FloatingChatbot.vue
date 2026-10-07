<template>
  <div class="floating-chatbot-container">
    <!-- Chatbot Window -->
    <transition name="chat-fade">
      <div v-if="isOpen" class="chatbot-window" :class="{ 'dark-mode': isDark }">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="header-left">
            <span class="bot-avatar">🤖</span>
            <div class="bot-info">
              <h4>Travel AI Assistant</h4>
              <span class="status">Đang hoạt động</span>
            </div>
          </div>
          <button class="close-btn" @click="isOpen = false" aria-label="Đóng chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Messages Area -->
        <div class="chatbot-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="welcome-msg">
            Xin chào! Tôi là trợ lý du lịch AI. Tôi có thể giúp bạn tìm địa điểm, lên lịch trình hoặc giải đáp thắc mắc về các chuyến đi ở Miền Trung. Bạn cần hỗ trợ gì?
          </div>
          
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message-wrapper', msg.role === 'user' ? 'user' : 'assistant']"
          >
            <div class="message-bubble" v-if="msg.role === 'user'">
              {{ msg.text }}
            </div>
            <div class="message-bubble markdown-body" v-else v-html="parseMarkdown(msg.text)">
            </div>
          </div>
          
          <div v-if="isTyping" class="message-wrapper assistant typing-indicator">
            <div class="message-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <form class="chatbot-input-area" @submit.prevent="sendMessage">
          <input 
            type="text" 
            v-model="inputText" 
            placeholder="Nhập tin nhắn..." 
            :disabled="isTyping"
          />
          <button type="submit" :disabled="!inputText.trim() || isTyping" class="send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </transition>

    <!-- Floating Toggle Button -->
    <button 
      class="chatbot-toggle-btn" 
      @click="isOpen = !isOpen"
      :class="{ 'is-open': isOpen }"
      aria-label="Chat với AI"
    >
      <transition name="icon-swap" mode="out-in">
        <svg v-if="isOpen" key="close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <svg v-else key="chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toggle-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </transition>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import api from '../../services/api'
import { marked } from 'marked'

// Configure marked to be safe and use breaks
marked.setOptions({
  breaks: true,
  gfm: true
})

const parseMarkdown = (text) => {
  if (!text) return ''
  return marked.parse(text)
}

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(false)
const inputText = ref('')
const isTyping = ref(false)
const messages = ref([])
const messagesContainer = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({ role: 'user', text })
  inputText.value = ''
  isTyping.value = true
  scrollToBottom()

  try {
    const res = await api.post('/ai/chat-general', { message: text })
    messages.value.push({ role: 'assistant', text: res.data.reply })
  } catch (error) {
    console.error('Lỗi gọi chat bot:', error)
    messages.value.push({ 
      role: 'assistant', 
      text: 'Xin lỗi, hệ thống AI đang quá tải hoặc gặp sự cố. Vui lòng thử lại sau.' 
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    scrollToBottom()
  }
})
</script>

<style scoped>
.floating-chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

@media (max-width: 820px) {
  .floating-chatbot-container {
    bottom: 90px; /* Tránh đè lên Bottom Navigation Bar */
    right: 16px;
  }
}

.chatbot-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary, #0d7c76);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(13, 124, 118, 0.4);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chatbot-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(13, 124, 118, 0.5);
}

.chatbot-toggle-btn.is-open {
  background: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.toggle-icon {
  width: 28px;
  height: 28px;
}

.chatbot-window {
  width: 350px;
  height: 480px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  transform-origin: bottom right;
}

@media (max-width: 400px) {
  .chatbot-window {
    width: calc(100vw - 32px);
    height: 60vh;
  }
}

.chatbot-window.dark-mode {
  background: #1e293b;
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.chatbot-header {
  padding: 16px;
  background: linear-gradient(135deg, var(--primary, #0d7c76) 0%, #0f766e 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  font-size: 1.5rem;
  background: rgba(255,255,255,0.2);
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.bot-info h4 {
  margin: 0 0 2px 0;
  font-size: 1rem;
  font-weight: 600;
}

.bot-info .status {
  font-size: 0.75rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.bot-info .status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  display: inline-block;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.chatbot-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.chatbot-window.dark-mode .chatbot-messages {
  background: #0f172a;
}

.welcome-msg {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin: 10px 0 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.chatbot-window.dark-mode .welcome-msg {
  background: #1e293b;
  color: #94a3b8;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-wrapper.user .message-bubble {
  background: var(--primary, #0d7c76);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-wrapper.assistant .message-bubble {
  background: #f1f5f9;
  color: #334155;
  border-bottom-left-radius: 4px;
}

.chatbot-window.dark-mode .message-wrapper.assistant .message-bubble {
  background: #334155;
  color: #f8fafc;
}

.chatbot-input-area {
  display: flex;
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.chatbot-window.dark-mode .chatbot-input-area {
  background: #1e293b;
  border-top-color: #334155;
}

.chatbot-input-area input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 8px;
  font-size: 0.9rem;
}

.chatbot-window.dark-mode .chatbot-input-area input {
  color: white;
}

.send-btn {
  background: var(--primary, #0d7c76);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 16px;
  height: 16px;
}

/* Typing Indicator */
.typing-indicator .message-bubble {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 14px 16px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #94a3b8;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Animations */
.chat-fade-enter-active,
.chat-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.chat-fade-enter-from,
.chat-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: all 0.2s ease;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

/* Markdown Styles */
:deep(.markdown-body) {
  font-size: 0.9rem;
  line-height: 1.5;
}
:deep(.markdown-body p) {
  margin-top: 0;
  margin-bottom: 0.8em;
}
:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}
:deep(.markdown-body h3), :deep(.markdown-body h4) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-size: 1.05rem;
  font-weight: 600;
}
:deep(.markdown-body ul), :deep(.markdown-body ol) {
  margin-top: 0.2em;
  margin-bottom: 0.8em;
  padding-left: 1.2em;
}
:deep(.markdown-body li) {
  margin-bottom: 0.3em;
}
:deep(.markdown-body strong) {
  font-weight: 600;
  color: var(--primary, #0d7c76);
}
:deep(.markdown-body hr) {
  border: 0;
  border-top: 1px solid rgba(0,0,0,0.1);
  margin: 1em 0;
}
.chatbot-window.dark-mode :deep(.markdown-body strong) {
  color: #38bdf8;
}
.chatbot-window.dark-mode :deep(.markdown-body hr) {
  border-top-color: rgba(255,255,255,0.1);
}
</style>
