import { useSyncExternalStore } from 'react';

/** Customer-app submissions (orders, bookings, subscriptions), shared by the bell panel and the detail page. */
let state = { items: [], err: '', loaded: false };
const subs = new Set();
export const getInbox = () => state;
export function setInbox(patch) { state = { ...state, ...patch }; subs.forEach((f) => f()); }
export const useInbox = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, getInbox);

/** set by Bell: (item, status) => Promise */
let changer = null;
export const registerStatusChanger = (fn) => { changer = fn; };
export const changeStatus = (it, status) => (changer ? changer(it, status) : Promise.resolve());
