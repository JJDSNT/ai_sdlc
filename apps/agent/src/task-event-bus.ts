//apps/agent/src/realtime/task-event-bus.ts
import { EventEmitter } from "node:events";
import type { TaskEvent } from "@/task-event";

const emitter = new EventEmitter();

emitter.setMaxListeners(100);

export const taskEventBus = {
  publish(taskId: string, event: TaskEvent) {
    emitter.emit(`${taskId}:event`, event);
  },

  subscribe(taskId: string, listener: (event: TaskEvent) => void) {
    emitter.on(`${taskId}:event`, listener);

    return () => {
      emitter.off(`${taskId}:event`, listener);
    };
  },
};