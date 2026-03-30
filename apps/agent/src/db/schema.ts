//apps/agent/src/db/schema.ts
import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

// ---------- Projects ----------

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------- Sessions ----------

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  threadId: text("thread_id"),
  metadataJson: text("metadata_json"),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------- Tasks ----------

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),

  projectId: text("project_id").notNull(),
  sessionId: text("session_id"),

  kind: text("kind").notNull(),

  status: text("status").notNull(), // queued | running | completed | failed | cancelled
  result: text("result"), // success | error | neutral

  title: text("title"),
  prompt: text("prompt"),

  inputJson: text("input_json"),
  outputJson: text("output_json"),
  errorJson: text("error_json"),

  startedAt: text("started_at"),
  completedAt: text("completed_at"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------- Task Messages ----------

export const taskMessages = sqliteTable("task_messages", {
  id: text("id").primaryKey(),

  taskId: text("task_id").notNull(),
  sessionId: text("session_id"),

  role: text("role").notNull(), // user | assistant | system
  content: text("content").notNull(),

  messageIndex: integer("message_index").notNull(),

  providerMessageId: text("provider_message_id"),
  metadataJson: text("metadata_json"),

  createdAt: text("created_at").notNull(),
});

// ---------- Task Events (STREAMING 🔥) ----------

export const taskEvents = sqliteTable("task_events", {
  id: text("id").primaryKey(),

  taskId: text("task_id").notNull(),

  eventType: text("event_type").notNull(),
  sequence: integer("sequence").notNull(),

  payloadJson: text("payload_json"),

  createdAt: text("created_at").notNull(),
});

// ---------- Task Outputs ----------

export const taskOutputs = sqliteTable("task_outputs", {
  taskId: text("task_id").primaryKey(),

  assistantText: text("assistant_text"),
  reasoningJson: text("reasoning_json"),
  toolsJson: text("tools_json"),
  finalMessageJson: text("final_message_json"),
  usageJson: text("usage_json"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ---------- Checkpoints ----------

export const checkpoints = sqliteTable("checkpoints", {
  id: text("id").primaryKey(),

  projectId: text("project_id").notNull(),
  sessionId: text("session_id"),

  summary: text("summary").notNull(),

  nextStepsJson: text("next_steps_json"),
  blockersJson: text("blockers_json"),
  activeEntitiesJson: text("active_entities_json"),

  createdAt: text("created_at").notNull(),
});

// ---------- Activity Events ----------

export const activityEvents = sqliteTable("activity_events", {
  id: text("id").primaryKey(),

  projectId: text("project_id").notNull(),

  artifactType: text("artifact_type").notNull(),
  artifactId: text("artifact_id").notNull(),

  eventType: text("event_type").notNull(),

  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),

  title: text("title"),
  description: text("description"),

  payloadJson: text("payload_json"),

  createdAt: text("created_at").notNull(),
});