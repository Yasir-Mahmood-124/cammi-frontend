import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

let socket: WebSocket | null = null;

export const editHeadingWebsocketApi = createApi({
  reducerPath: "editHeadingWebsocketApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    connectWebSocket: builder.mutation<{ success: boolean }, void>({
      queryFn: async () => {
        try {
          const token = Cookies.get("token");
          if (!token) throw new Error("Session ID not found in cookies");

          const wsUrl = `wss://ybkbmzlbbd.execute-api.us-east-1.amazonaws.com/prod/?session_id=${token}`;
          socket = new WebSocket(wsUrl);

          await new Promise<void>((resolve, reject) => {
            socket!.onopen = () => {
              console.log("✅ WebSocket connected");
              resolve();
            };
            socket!.onerror = (err) => {
              console.error("⚠️ WebSocket error:", err);
              reject(new Error("Failed to establish WebSocket connection"));
            };
          });

          socket.onclose = () => console.log("❌ WebSocket disconnected");

          return { data: { success: true } };
        } catch (error: any) {
          return { error: { status: "CUSTOM_ERROR", data: error.message } };
        }
      },
    }),

    sendEditHeading: builder.mutation<{ sent: boolean }, Record<string, any>>({
      queryFn: async (messageObject) => {
        try {
          if (!socket || socket.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
          }
          socket.send(JSON.stringify(messageObject));
          console.log("📤 Sent Message:", messageObject);
          return { data: { sent: true } };
        } catch (error: any) {
          console.error("❌ Send message error:", error);
          return { error: { status: "CUSTOM_ERROR", data: error.message } };
        }
      },
    }),

    // ✅ Improved listener for reliability
    listenMessages: builder.query<string[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(_, { updateCachedData, cacheEntryRemoved }) {
        if (!socket) return;

        const handleMessage = (event: MessageEvent) => {
          try {
            console.log("📩 Received:", event.data);
            updateCachedData((draft) => {
              draft.push(event.data); // ✅ Always trigger cache update
            });
          } catch (err) {
            console.error("❌ Error parsing WebSocket message:", err);
          }
        };

        socket.addEventListener("message", handleMessage);
        await cacheEntryRemoved;
        socket.removeEventListener("message", handleMessage);
      },
    }),

    disconnectWebSocket: builder.mutation<{ disconnected: boolean }, void>({
      queryFn: async () => {
        try {
          if (socket) {
            socket.close();
            socket = null;
            console.log("🔌 WebSocket manually disconnected");
          }
          return { data: { disconnected: true } };
        } catch (error: any) {
          return { error: { status: "CUSTOM_ERROR", data: error.message } };
        }
      },
    }),
  }),
});

export const {
  useConnectWebSocketMutation,
  useSendEditHeadingMutation,
  useListenMessagesQuery,
  useDisconnectWebSocketMutation,
} = editHeadingWebsocketApi;