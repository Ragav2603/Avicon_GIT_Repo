import { useState, useCallback, useEffect } from "react";

export interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

const STORAGE_KEY = "avicon_read_notifications";

function getReadIds(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored) as number[]);
  } catch {}
  return new Set();
}

function persistReadIds(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function useNotifications(initialNotifications: Notification[]) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const readIds = getReadIds();
    return initialNotifications.map((n) => ({
      ...n,
      unread: readIds.has(n.id) ? false : n.unread,
    }));
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, unread: false } : n));
      const readIds = getReadIds();
      readIds.add(id);
      persistReadIds(readIds);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const readIds = getReadIds();
      prev.forEach((n) => readIds.add(n.id));
      persistReadIds(readIds);
      return prev.map((n) => ({ ...n, unread: false }));
    });
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead };
}
