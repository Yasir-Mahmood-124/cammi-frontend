// redux/middleware/icpWebSocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { wsManager } from '../services/websocketManager';
import {
  setIsGenerating,
  setGeneratingProgress,
  setGeneratingContent,
  appendGeneratingContent,
  setCompletionMessageReceived,
} from '../services/icp/icpSlice';

let unsubscribeMessage: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeClose: (() => void) | null = null;
let currentGenerationUrl: string | null = null;

export const icpWebSocketMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Listen for when generation starts
  if (setIsGenerating.match(action) && action.payload === true) {
    const { wsUrl, isGenerating } = state.icp;
    
    // Only setup if this is a generation WebSocket (not upload)
    if (wsUrl && wsUrl.includes('4iqvtvmxle') && isGenerating) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║        🌐 Global WebSocket Middleware Activated           ║");
      console.log("╚════════════════════════════════════════════════════════════╝");
      console.log("🔗 [Global WS] URL:", wsUrl);
      
      // Cleanup previous listeners
      if (unsubscribeMessage) {
        console.log("🧹 [Global WS] Cleaning up previous listeners");
        unsubscribeMessage();
        unsubscribeError?.();
        unsubscribeClose?.();
      }
      
      // Disconnect if URL changed
      if (currentGenerationUrl && currentGenerationUrl !== wsUrl) {
        console.log("🔄 [Global WS] URL changed, disconnecting old connection");
        wsManager.disconnect();
      }
      
      currentGenerationUrl = wsUrl;
      
      // Connect to WebSocket
      setTimeout(() => {
        console.log("🔌 [Global WS] Connecting to WebSocket...");
        wsManager.connect(wsUrl);
      }, 100);

      // Setup global message listener
      unsubscribeMessage = wsManager.onMessage((message) => {
        try {
          console.log("🌐 [Global WS] Message received:", {
            action: message.action,
            type: message.type,
            body: typeof message.body === 'number' ? message.body + '%' : message.body,
            status: message.status
          });

          // ============ CRITICAL: COMPLETION MESSAGE ============
          if (
            message.action === "sendMessage" &&
            message.body === "Document generated successfully!"
          ) {
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║    🌐✅✅ GLOBAL COMPLETION MESSAGE RECEIVED ✅✅🌐      ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("💾 [Global WS] Saving completion flag to Redux (will persist)");
            
            // Save to Redux (will be persisted by Redux Persist)
            store.dispatch(setCompletionMessageReceived(true));
            
            console.log("🧹 [Global WS] Cleaning up WebSocket listeners");
            // Cleanup listeners after completion
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

          // Progress updates
          if (message.action === "sendMessage" && typeof message.body === "number") {
            const newProgress = message.body;
            console.log("📊 [Global WS] Progress update:", newProgress + "%");
            console.log("💾 [Global WS] Saving progress to Redux (will persist)");
            store.dispatch(setGeneratingProgress(newProgress));
            return;
          }

          // Content updates
          if (message.type === "tier_completion" && message.data?.content?.content) {
            const newContent = message.data.content.content;
            console.log("📄 [Global WS] Content chunk received:", newContent.length, "chars");
            console.log("💾 [Global WS] Saving content to Redux (will persist)");

            const currentState = store.getState();
            const currentContent = currentState.icp.generatingContent;

            if (currentContent === "Waiting for Document Generation...") {
              store.dispatch(setGeneratingContent(newContent));
            } else {
              store.dispatch(appendGeneratingContent(newContent));
            }
            return;
          }

          // Backup: Other completion indicators
          if (message.status === "completed" || message.status === "complete") {
            console.log("✅ [Global WS] Status completion indicator received");
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
          console.error("❌ [Global WS] Message processing error:", err);
        }
      });

      unsubscribeError = wsManager.onError((err) => {
        console.error("❌ [Global WS] WebSocket error:", err);
      });

      unsubscribeClose = wsManager.onClose((event) => {
        console.log("🔗 [Global WS] WebSocket closed - Code:", event.code, "Reason:", event.reason);
      });
    }
  }

  // Cleanup when generation stops
  if (setIsGenerating.match(action) && action.payload === false) {
    console.log("🌐 [Global WS] Generation stopped - cleaning up");
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