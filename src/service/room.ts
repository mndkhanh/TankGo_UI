import {
  arrayRemove,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  QuerySnapshot,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { FsUser, GameRoom } from "../data/types";
import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import { firestore } from "../config/firebase";

export const subscribeRooms = (
  onChange: (rooms: GameRoom[]) => void,
  onError?: (e: unknown) => void
): (() => void) => {
  const colRef = collection(firestore, "rooms");

  const unsubscribe = onSnapshot(
    colRef,
    (snap: QuerySnapshot<DocumentData>) => {
      const rooms: GameRoom[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<GameRoom, "id">),
      }));

      onChange(rooms);
    },
    (err) => {
      console.error("Realtime rooms error:", err);
      onError?.(err);
    }
  );

  return unsubscribe;
};

export const subscribeRoom = (
  roomId: string,
  onChange: (room: GameRoom | null) => void,
  onError?: (e: unknown) => void
): (() => void) => {
  const docRef = doc(firestore, "rooms", roomId);
  const unsubscribe = onSnapshot(
    docRef,
    (snap: DocumentSnapshot<DocumentData>) => {
      if (snap.exists()) {
        const room: GameRoom = {
          id: snap.id,
          ...(snap.data() as Omit<GameRoom, "id">),
        };
        onChange(room);
      } else {
        onChange(null);
      }
    },
    (err) => {
      console.error(`Realtime error for room ${roomId}:`, err);
      onError?.(err);
    }
  );
  return unsubscribe;
};

export const getRooms = async (): Promise<GameRoom[]> => {
  try {
    const colRef = collection(firestore, "rooms");
    const snap: QuerySnapshot<DocumentData> = await getDocs(colRef);

    const rooms: GameRoom[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<GameRoom, "id">),
    }));

    return rooms;
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    return [];
  }
};

export const getRoomById = async (roomId: string): Promise<GameRoom | null> => {
  try {
    const docRef = doc(firestore, "rooms", roomId);
    const snap: DocumentSnapshot<DocumentData> = await getDoc(docRef);

    if (!snap.exists()) return null;

    const room: GameRoom = {
      id: snap.id,
      ...(snap.data() as Omit<GameRoom, "id">),
    };

    return room;
  } catch (err) {
    console.error(`❌ Error fetching room ${roomId}:`, err);
    return null;
  }
};

export const getRoomWithUsers = async (roomId: string) => {
  try {
    const roomSnap = await getDoc(doc(firestore, "rooms", roomId));
    if (!roomSnap.exists()) return null;

    const roomData = roomSnap.data() as Omit<GameRoom, "id">;
    const room: GameRoom = { id: roomSnap.id, ...roomData };

    const userDocs = await Promise.all(
      room.currentPlayers.map(async (ref) => {
        const userSnap = await getDoc(ref);
        return userSnap.exists()
          ? { id: userSnap.id, ...userSnap.data() }
          : null;
      })
    );

    const users = userDocs.filter(Boolean);

    return { room, users };
  } catch (err) {
    console.error("❌ Error retrieving room and users:", err);
    return null;
  }
};

export const isUserInRoom = async (uid: string): Promise<boolean> => {
  const userRef = doc(firestore, "users", uid);
  const q = query(
    collection(firestore, "rooms"),
    where("currentPlayers", "array-contains", userRef),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
};

export const roomUserIsIn = async (uid: string): Promise<GameRoom | null> => {
  const userRef = doc(firestore, "users", uid);
  const q = query(
    collection(firestore, "rooms"),
    where("currentPlayers", "array-contains", userRef),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const room = snap.docs[0].data() as GameRoom;
  return room;
};

export const userJoinRoom = async (
  roomId: string,
  uid: string
): Promise<boolean> => {
  try {
    const isUserInRoomAlready = await isUserInRoom(uid);
    if (isUserInRoomAlready) {
      alert("User is already in a room");
      return false;
    }

    const room = await getRoomById(roomId);
    if (!room) {
      alert("Room not found");
      return false;
    }

    if (room.currentPlayers.length >= room.numOfPlayers) {
      alert("Room is full");
      return false;
    }

    // Add user to the room
    const updatedRoom = {
      ...room,
      currentPlayers: [...room.currentPlayers, doc(firestore, "users", uid)],
    };

    // Update the room in the database
    const docRef = doc(firestore, "rooms", roomId);
    await setDoc(docRef, updatedRoom);

    return true;
  } catch (err) {
    console.error(`❌ Error joining room ${roomId}:`, err);
    return false;
  }
};

export const userLeaveRoom = async (
  roomId: string,
  uid: string
): Promise<boolean> => {
  try {
    const roomRef = doc(firestore, "rooms", roomId);
    const userRef = doc(firestore, "users", uid);
    await updateDoc(roomRef, { currentPlayers: arrayRemove(userRef) });
    return true;
  } catch (err) {
    console.error(`❌ Error leaving room ${roomId}:`, err);
    return false;
  }
};
