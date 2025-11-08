import type { DocumentReference } from "firebase/firestore/lite";

export interface FsUser {
  uid: string;
  name: string;
  email: string;
  photo: string;
}

export interface GameRoom {
  id: string;
  numOfPlayers: number;
  currentPlayers: DocumentReference[];
  readyPlayers?: DocumentReference[];
}

export interface GameBattle {
  id: string;
  numOfPlayers: number;
  currentPlayers: DocumentReference[];
  winner: DocumentReference | null;
  log?: string[];
  status: "STARTED" | "COMPLETED" | "BANNED";
}
