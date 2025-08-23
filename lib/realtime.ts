import { EventEmitter } from "events";

type MessageEvent = {
  type: "message";
  conversationId: string;
  messageId: string;
};

class ConversationHub {
  private emitter = new EventEmitter();
  constructor() {
    // Avoid MaxListenersExceededWarning for many concurrent SSE clients per conversation
    this.emitter.setMaxListeners(0);
  }

  on(conversationId: string, listener: (event: MessageEvent) => void) {
    this.emitter.on(this.key(conversationId), listener);
  }

  off(conversationId: string, listener: (event: MessageEvent) => void) {
    this.emitter.off(this.key(conversationId), listener);
  }

  emit(event: MessageEvent) {
    this.emitter.emit(this.key(event.conversationId), event);
  }

  private key(id: string) {
    return `conv:${id}`;
  }
}

// Cache on globalThis to survive hot reloads (dev) and avoid duplicate emitters
const g = globalThis as unknown as { __conversationHub?: ConversationHub };
export const conversationHub = g.__conversationHub || (g.__conversationHub = new ConversationHub());
