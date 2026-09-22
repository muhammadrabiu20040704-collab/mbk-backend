export interface SocketUser {
  id: string;
  username: string;
}

export interface SocketData {
  user?: SocketUser;
}

export type ClientToServerEvents = Record<string, never>;

export type ServerToClientEvents = Record<string, never>;

export type InterServerEvents = Record<string, never>;
