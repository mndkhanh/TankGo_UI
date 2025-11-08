import React from "react";
import type { GameRoom } from "../../data/types";
import { Link, useNavigate } from "react-router";
import { getRoomById, userJoinRoom } from "../../service/room";
import { getUserFromLocalStorage } from "../../utils/userLocalStorage";

const RoomCard: React.FC<GameRoom> = ({
  id,
  numOfPlayers,
  currentPlayers,
  status,
}) => {
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    const joinSuccess = await userJoinRoom(id, getUserFromLocalStorage()!.uid);
    if (!joinSuccess) {
      alert("Room full now!");
      return;
    }
    navigate(`/room/${id}`);
  };
  return (
    <div className="border p-4 rounded mb-4 bg-red-400 ">
      <h3 className="text-lg font-bold">Room ID: {id}</h3>
      <p>
        Players: {currentPlayers.length}/{numOfPlayers}
      </p>
      {currentPlayers.length < numOfPlayers ? (
        <button
          onClick={handleJoinRoom}
          className="text-blue-500 hover:underline"
        >
          Join Room
        </button>
      ) : (
        <span className="text-gray-500">Room Full</span>
      )}
    </div>
  );
};

export default RoomCard;
