import { socketEvent } from "../store/slices/ShareSessionSlice";
import { API } from "../api/api";

let socket = null;

export const connectSocket = (qr_id, dispatch) => {
  const wsBase = API.replace(/^http/, "ws");
  socket = new WebSocket(`${wsBase}/share/ws/${qr_id}`);

  socket.onopen = () => {
    console.log("✅ WS CONNECTED");

    socket.send(
      JSON.stringify({
        type: "INIT",
        qr_id,
      }),
    );
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📩 WS DATA:", data);
    dispatch(socketEvent(data));
  };

  socket.onclose = () => {
    console.log("❌ WS CLOSED");
  };
};

// ✅ ADD THIS
export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
