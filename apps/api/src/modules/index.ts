import { configurationModule } from "./configuration";
import { Db } from "../db";

export const identityModule = {
  register: async (db: Db, data: any) => {
    // TODO: implement
    return null;
  },
  confirm: async (db: Db, token: string) => {
    // TODO: implement
    return null;
  },
  login: async (db: Db, email: string, password: string) => {
    // TODO: implement
    return null;
  },
  logout: async (db: Db, sessionId: string) => {
    // TODO: implement
    return null;
  },
  getSession: async (db: Db, sessionId: string) => {
    // TODO: implement
    return null;
  },
};

export const charactersModule = {
  create: async (db: Db, memberId: string, name: string) => {
    // TODO: implement
    return null;
  },
  switch: async (db: Db, sessionId: string, characterId: string) => {
    // TODO: implement
    return null;
  },
  renameUsername: async (db: Db, characterId: string, username: string) => {
    // TODO: implement
    return null;
  },
  addQuickLogin: async (db: Db, characterId: string) => {
    // TODO: implement
    return null;
  },
  removeQuickLogin: async (db: Db, characterId: string) => {
    // TODO: implement
    return null;
  },
  setAvatar: async (db: Db, characterId: string, url: string) => {
    // TODO: implement
    return null;
  },
  setBanner: async (db: Db, characterId: string, url: string) => {
    // TODO: implement
    return null;
  },
};

export const boardsModule = {
  list: async (db: Db) => {
    // TODO: implement
    return [];
  },
  create: async (db: Db, data: any) => {
    // TODO: implement
    return null;
  },
  update: async (db: Db, id: string, data: any) => {
    // TODO: implement
    return null;
  },
  setPermissions: async (db: Db, boardId: string, permissions: any) => {
    // TODO: implement
    return null;
  },
  setVisibility: async (db: Db, boardId: string, hidden: boolean) => {
    // TODO: implement
    return null;
  },
  setContentLimits: async (db: Db, boardId: string, limits: any) => {
    // TODO: implement
    return null;
  },
};

export const contentModule = {
  listThreads: async (db: Db, boardId: string, params: any) => {
    // TODO: implement
    return [];
  },
  getThread: async (db: Db, id: string) => {
    // TODO: implement
    return null;
  },
  createThread: async (db: Db, data: any) => {
    // TODO: implement
    return null;
  },
  createPost: async (db: Db, data: any) => {
    // TODO: implement
    return null;
  },
  editPost: async (db: Db, id: string, content: string) => {
    // TODO: implement
    return null;
  },
  setState: async (db: Db, id: string, state: string) => {
    // TODO: implement
    return null;
  },
  pin: async (db: Db, id: string) => {
    // TODO: implement
    return null;
  },
  move: async (db: Db, id: string, targetBoardId: string) => {
    // TODO: implement
    return null;
  },
};

export const economyModule = {
  getBalance: async (db: Db, characterId: string) => {
    // TODO: implement
    return 0;
  },
  getEconomy: async (db: Db, characterId: string) => {
    // TODO: implement
    return null;
  },
  buy: async (db: Db, characterId: string, itemId: string, quantity: number) => {
    // TODO: implement
    return null;
  },
  sell: async (db: Db, entryId: string) => {
    // TODO: implement
    return null;
  },
  refund: async (db: Db, entryId: string) => {
    // TODO: implement
    return null;
  },
  adjust: async (db: Db, characterId: string, amount: number, reason: string) => {
    // TODO: implement
    return null;
  },
  grantEarn: async (db: Db, characterId: string, type: string, amount: number) => {
    // TODO: implement
    return null;
  },
  applyLoginStreak: async (db: Db, characterId: string) => {
    // TODO: implement
    return null;
  },
  runInterest: async (db: Db) => {
    // TODO: implement
    return null;
  },
  runBirthday: async (db: Db) => {
    // TODO: implement
    return null;
  },
};

export const moderationModule = {
  ban: async (db: Db, data: any) => {
    // TODO: implement
    return null;
  },
  isBanned: async (db: Db, email: string | null, ip: string) => {
    // TODO: implement
    return { banned: false };
  },
  appeal: async (db: Db, banId: string, message: string) => {
    // TODO: implement
    return null;
  },
  decideAppeal: async (db: Db, appealId: string, decision: string) => {
    // TODO: implement
    return null;
  },
  arbitrate: async (db: Db, banId: string, decision: string) => {
    // TODO: implement
    return null;
  },
  log: async (db: Db, data: any) => {
    // TODO: implement
    return null;
  },
};

export const sheetsModule = {
  defineFields: async (db: Db, fields: any) => {
    // TODO: implement
    return null;
  },
  create: async (db: Db, characterId: string, templateId: string, data: any) => {
    // TODO: implement
    return null;
  },
  update: async (db: Db, characterId: string, data: any) => {
    // TODO: implement
    return null;
  },
  get: async (db: Db, characterId: string) => {
    // TODO: implement
    return null;
  },
  evaluate: async (db: Db, characterId: string) => {
    // TODO: implement
    return null;
  },
};

export const notificationsModule = {
  emit: async (db: Db, recipientId: string, type: string, payload: any) => {
    // TODO: implement
    return null;
  },
  getPrefs: async (db: Db, memberId: string) => {
    // TODO: implement
    return null;
  },
  setPrefs: async (db: Db, memberId: string, prefs: any) => {
    // TODO: implement
    return null;
  },
  list: async (db: Db, memberId: string, params: any) => {
    // TODO: implement
    return [];
  },
  markRead: async (db: Db, notificationId: string) => {
    // TODO: implement
    return null;
  },
};

export const modules = {
  configuration: configurationModule,
  identity: identityModule,
  characters: charactersModule,
  boards: boardsModule,
  content: contentModule,
  economy: economyModule,
  moderation: moderationModule,
  sheets: sheetsModule,
  notifications: notificationsModule,
};