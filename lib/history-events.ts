export const HISTORY_UPDATED_EVENT = "history:updated"

export function emitHistoryUpdatedEvent() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT))
}
