import { useEffect, useState } from "react";
import { useWalletConnection } from "../hooks/useWalletConnection";
import { TankBattleSDK } from "../sdk/suiClient";
import type { GameRoom } from "../data/types";
import { useRooms } from "../hooks/useRooms";
import RoomCard from "../components/game/RoomCard";
import { roomUserIsIn } from "../service/room";
import { getUserFromLocalStorage } from "../utils/userLocalStorage";
import { Link } from "react-router-dom";

const GameLobby: React.FC = () => {
  const rooms = useRooms();
  console.log("Rooms in lobby:", rooms);

  const [roomUserJoined, setRoomUserJoined] = useState<GameRoom | null>(null);
  useEffect(() => {
    const fetchRoomUser = async () => {
      const room = await roomUserIsIn(getUserFromLocalStorage()!.uid);
      setRoomUserJoined(room);
    };
    fetchRoomUser();
  }, []);

  const { connected, account, signAndExecuteTransactionBlock } =
    useWalletConnection();
  const [sdk] = useState(() => new TankBattleSDK());
  const [joining, setJoining] = useState(false);

  const joinArena = async (arenaId: string, entryFee: number) => {
    if (!connected || !account) return;

    setJoining(true);
    try {
      const txb = await sdk.joinArena(arenaId, entryFee);
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
      });
      console.log("Joined arena:", result);
    } catch (error) {
      console.error("Join failed:", error);
    } finally {
      setJoining(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center text-black">
        <p>Vui lòng kết nối ví để tham gia game</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-yellow min-h-screen flex justify-center items-start">
      <div className="w-[70%]">
        <header className="">
          <h2 className=" text-xl mb-4">Sảnh Game For Arena I</h2>
          <p>
            Phí tham gia: 10 TANK
            <br />
            Số lượng người chơi: 2 người
          </p>
        </header>

        <div className="mt-[200px] flex justify-between items-stretch">
          {/* left part: thoong tin user */}
          <div className="flex-[1]">
            <h3 className="text-white font-bold">Thông tin người chơi</h3>
            <p className="text-white text-sm">Tài khoản: ...</p>
            <div>
              {roomUserJoined ? (
                <div className="mt-4 p-4 bg-red-400 rounded">
                  <h4 className="font-semibold mb-2 text-white">
                    Bạn đã tham gia phòng: {roomUserJoined.id}
                  </h4>
                  <Link
                    to={`/room/${roomUserJoined.id}`}
                    className="text-white underline"
                  >
                    Vào phòng
                  </Link>
                </div>
              ) : (
                <p className="text-white">Bạn chưa tham gia phòng nào.</p>
              )}
            </div>
          </div>
          {/* right part: list cac phong hoac tao moi */}
          <div className="flex-[3] bg-blue p-10">
            <h3 className="text-tank-green font-bold mb-2">Danh sách phòng</h3>
            {/* tim kiem va tao moi phong TODO */}
            {/* <div></div> */}
            <div>
              {rooms.map((room: GameRoom) => (
                <RoomCard key={room.id} {...room} />
              ))}
            </div>
          </div>
        </div>

        {/* <div className="grid gap-4">
        <div className="p-4 rounded border border-tank-green">
          <button
            onClick={() => joinArena("arena_1", 10)}
            disabled={joining}
            className="mt-2 bg-tank-green text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {joining ? "Đang tham gia..." : "Tham Gia"}
          </button>
        </div>
      </div> */}
      </div>
    </div>
  );
};

export default GameLobby;
