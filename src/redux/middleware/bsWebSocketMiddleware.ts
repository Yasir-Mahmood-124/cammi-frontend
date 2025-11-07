// redux/middleware/bsWebSocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { wsManager } from '../services/websocketManager';
import {
  setIsGenerating,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setCompletionMessageReceived,
} from '../services/bs/bsSlice';

let unsubscribeMessage: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeClose: (() => void) | null = null;
let currentGenerationUrl: string | null = null;

export const bsWebSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  if (setIsGenerating.match(action) && action.payload === true) {
    const { wsUrl, isGenerating } = state.bs;
    
    if (wsUrl && wsUrl.includes('4iqvtvmxle') && isGenerating) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║    🌐 BS Global WebSocket Middleware Activated            ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("🔗 [BS Global WS] URL:", wsUrl);
      
      if (unsubscribeMessage) {
        console.log("🧹 [BS Global WS] Cleaning up previous listeners");
        unsubscribeMessage();
        unsubscribeError?.();
        unsubscribeClose?.();
      }
      
      if (currentGenerationUrl && currentGenerationUrl !== wsUrl) {
        console.log("🔄 [BS Global WS] URL changed, disconnecting old connection");
        wsManager.disconnect();
      }
      
      currentGenerationUrl = wsUrl;
      
      setTimeout(() => {
        console.log("🔌 [BS Global WS] Connecting to WebSocket...");
        wsManager.connect(wsUrl);
      }, 100);

      unsubscribeMessage = wsManager.onMessage((message) => {
        try {
          console.log("🌐 [BS Global WS] Message received:", {
            action: message.action,
            type: message.type,
            body: typeof message.body === 'number' ? message.body + '%' : message.body,
            status: message.status
          });

          if (
            message.action === "sendMessage" &&
            message.body === "Document generated successfully!"
          ) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║   🌐✅✅ BS GLOBAL COMPLETION MESSAGE RECEIVED ✅✅🌐    ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("💾 [BS Global WS] Saving completion flag to Redux (will persist)");
            
            store.dispatch(setCompletionMessageReceived(true));
            
            console.log("🧹 [BS Global WS] Cleaning up WebSocket listeners");
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
            return;
          }

          if (message.action === "sendMessage" && typeof message.body === "number") {
            const newProgress = message.body;
            console.log("📊 [BS Global WS] Progress update:", newProgress + "%");
            console.log("💾 [BS Global WS] Saving progress to Redux (will persist)");
            store.dispatch(setGeneratingProgress(newProgress));
            return;
          }

          if (message.type === "tier_completion" && message.data?.content?.content) {
            const newContent = message.data.content.content;
            console.log("📄 [BS Global WS] Content chunk received:", newContent.length, "chars");
            console.log("💾 [BS Global WS] Saving content to Redux (will persist)");

            const currentState = store.getState();
            const currentContent = currentState.bs.generatingContent;

            if (currentContent === "Waiting for Document Generation...") {
              store.dispatch(setGeneratingContent(newContent));
            } else {
              store.dispatch(appendGeneratingContent(newContent));
            }
            return;
          }

          if (message.status === "completed" || message.status === "complete") {
            console.log("✅ [BS Global WS] Status completion indicator received");
            store.dispatch(setCompletionMessageReceived(true));
            
            if (unsubscribeMessage) {
              unsubscribeMessage();
              unsubscribeError?.();
              unsubscribeClose?.();
              unsubscribeMessage = null;
              unsubscribeError = null;
              unsubscribeClose = null;
            }
          }
        } catch (err) {
          console.error("❌ [BS Global WS] Message processing error:", err);
        }
      });

      unsubscribeError = wsManager.onError((err) => {
        console.error("❌ [BS Global WS] WebSocket error:", err);
      });

      unsubscribeClose = wsManager.onClose((event) => {
        console.log("🔗 [BS Global WS] WebSocket closed - Code:", event.code, "Reason:", event.reason);
      });
    }
  }

  if (setIsGenerating.match(action) && action.payload === false) {
    console.log("🌐 [BS Global WS] Generation stopped - cleaning up");
    if (unsubscribeMessage) {
      unsubscribeMessage();
      unsubscribeError?.();
      unsubscribeClose?.();
      unsubscribeMessage = null;
      unsubscribeError = null;
      unsubscribeClose = null;
    }
    currentGenerationUrl = null;
  }

  return result;
};