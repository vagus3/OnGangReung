"use client";

import { create } from "zustand";

import { readRecord, readSet, writeRecord, writeSet } from "@/shared/storage";

const SAVED_KEY = "ongangreung-saved";
const VISITED_KEY = "ongangreung-visited";
const NOTES_KEY = "ongangreung-notes";

type SavesStore = {
  saved: Set<string>;
  visited: Set<string>;
  notes: Record<string, string>;
  hydrated: boolean;
  hydrate: () => void;
  toggleSave: (slug: string) => void;
  markVisited: (slug: string) => void;
  setNote: (slug: string, note: string) => void;
};

export const useSavesStore = create<SavesStore>((set, get) => ({
  // 서버 렌더링과 첫 클라이언트 렌더링이 어긋나면 안 되므로 빈 상태로 시작한다
  saved: new Set(),
  visited: new Set(),
  notes: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({
      saved: readSet(SAVED_KEY),
      visited: readSet(VISITED_KEY),
      notes: readRecord(NOTES_KEY),
      hydrated: true,
    });
  },

  toggleSave: (slug) => {
    const next = new Set(get().saved);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    writeSet(SAVED_KEY, next);
    set({ saved: next });
  },

  markVisited: (slug) => {
    const next = new Set(get().visited);
    next.add(slug);
    writeSet(VISITED_KEY, next);
    set({ visited: next });
  },

  setNote: (slug, note) => {
    const next = { ...get().notes };
    if (note.trim() === "") delete next[slug];
    else next[slug] = note;
    writeRecord(NOTES_KEY, next);
    set({ notes: next });
  },
}));
