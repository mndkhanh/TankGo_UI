import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { getUserFromLocalStorage } from "../utils/userLocalStorage";
import { userLeaveRoom } from "../service/room";
import { useEffect } from "react";

const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const room = useRoom(roomId!);

  const handleLeaveRoom = async () => {
    if (!room) return;
    const leaveSuccess = await userLeaveRoom(
      room.id,
      getUserFromLocalStorage()!.uid
    );
    if (!leaveSuccess) {
      alert("Error leaving room!");
      return;
    }
    navigate("/lobby", { replace: true });
  };

  if (!room) return <div>Loading room {roomId}...</div>;

  return (
    <div>
      <header>
        <h1>Room {room.id}</h1>
        <p>
          Players: {room.currentPlayers.length} / {room.numOfPlayers}
        </p>
        <button onClick={handleLeaveRoom}>Leave Room</button>
      </header>
    </div>
  );
};

export default Room;
