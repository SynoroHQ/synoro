// Simple in-memory pub/sub for streaming events keyed by runId
export type StreamEvent =
  | { type: "token"; data: { text: string } }
  | { type: "messageCreated"; data: { messageId: string } }
  | { type: "done"; data?: { messageId?: string } }
  | { type: "error"; data: { message: string } };

type Handler = (evt: StreamEvent) => void;

class EventBus {
  private channels = new Map<string, Set<Handler>>();

  publish(key: string, evt: StreamEvent) {
    const subs = this.channels.get(key);
    if (!subs) return;
    for (const h of subs) {
      try {
        h(evt);
      } catch (e) {
        // ignore subscriber errors
      }
    }
  }

  subscribe(key: string, handler: Handler) {
    let subs = this.channels.get(key);
    if (!subs) {
      subs = new Set();
      this.channels.set(key, subs);
    }
    subs.add(handler);

    return () => {
      subs!.delete(handler);
      if (subs!.size === 0) this.channels.delete(key);
    };
  }
}

export const eventBus = new EventBus();
