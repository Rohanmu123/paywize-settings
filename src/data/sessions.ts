export type Session = { id: string; device: string; location: string; ip: string; lastActive: string; current?: boolean };
export type LoginEvent = { id: string; user: string; at: string; method: string; ip: string; result: "success" | "failed"; attempts?: number };

export const SESSIONS: Session[] = [
  { id: "s1", device: "Chrome on macOS", location: "Mumbai, IN", ip: "103.21.•••.14", lastActive: "Now", current: true },
  { id: "s2", device: "Safari on iPhone", location: "Thane, IN", ip: "49.36.•••.201", lastActive: "2 hours ago" },
  { id: "s3", device: "Chrome on Windows", location: "Pune, IN", ip: "117.98.•••.7", lastActive: "5 days ago" },
];

export const LOGIN_HISTORY: LoginEvent[] = [
  { id: "l1", user: "rohan@sharmatextiles.in", at: "23 Nov, 11:02 AM", method: "Password + SMS", ip: "103.21.•••.14", result: "success" },
  { id: "l2", user: "unknown@mail.com", at: "23 Nov, 03:14 AM", method: "Password", ip: "185.220.•••.9", result: "failed", attempts: 5 },
  { id: "l3", user: "meera@sharmatextiles.in", at: "22 Nov, 06:41 PM", method: "Password + SMS", ip: "49.36.•••.201", result: "success" },
];
