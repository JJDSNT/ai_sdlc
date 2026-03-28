import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { CreateTaskInput, Task, TaskResult } from "../task.js";
import { getTask, listTasks, saveTask } from "../task-store.js";
import { executeTask } from "../services/task-runner.js";

const taskTargetSchema = z.union([
  z.object({
    kind: z.literal("local_path"),
    path: z.string().min(1, "path is required"),
  }),
  z.object({
    kind: z.literal("git"),
    url: z.string().min(1, "url is required"),
    ref: z.string().min(1).optional(),
  }),
]);

const createChatTaskSchema = z.object({
  kind: z.literal("chat"),
  prompt: z.string().min(1, "prompt is required"),
  target: taskTargetSchema.optional(),
});

const createRepoAnalyzeTaskSchema = z.object({
  kind: z.literal("repo-analyze"),
  prompt: z.string().min(1, "prompt is required"),
  target: taskTargetSchema,
});

const createRepoCommandTaskSchema = z.object({
  kind: z.literal("repo-command"),
  prompt: z.string().optional(),
  target: taskTargetSchema,
  command: z.object({
    intent: z.enum(["build", "test", "lint", "format", "install", "custom"]),
    customCommand: z.string().min(1).optional(),
  }),
});

const createTaskBodySchema = z.discriminatedUnion("kind", [
  createChatTaskSchema,
  createRepoAnalyzeTaskSchema,
  createRepoCommandTaskSchema,
]);

const taskParamsSchema = z.object({
  id: z.string().min(1),
});

function nowIso() {
  return new Date().toISOString();
}

function createBaseTask(input: CreateTaskInput): Task {
  const now = nowIso();

  if (input.kind === "repo-command") {
    return {
      id: crypto.randomUUID(),
      kind: input.kind,
      status: "queued",
      prompt: input.prompt,
      target: input.target,
      command: {
        intent: input.command.intent,
        customCommand: input.command.customCommand,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    id: crypto.randomUUID(),
    kind: input.kind,
    status: "queued",
    prompt: input.prompt,
    target: input.target,
    createdAt: now,
    updatedAt: now,
  };
}

export async function taskRoutes(app: FastifyInstance) {
  app.get("/tasks", async (_request, reply) => {
    return reply.send({
      tasks: await listTasks(),
    });
  });

  app.get("/tasks/:id", async (request, reply) => {
    const parsed = taskParamsSchema.safeParse(request.params);

    if (!parsed.success) {
      return reply.status(400).send({
        ok: false,
        error: "invalid_params",
        issues: parsed.error.flatten(),
      });
    }

    const task = await getTask(parsed.data.id);

    if (!task) {
      return reply.status(404).send({
        ok: false,
        error: "task_not_found",
        message: "Task não encontrada",
      });
    }

    const response: TaskResult = { task };
    return reply.send(response);
  });

  app.post("/tasks", async (request, reply) => {
    const parsed = createTaskBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        ok: false,
        error: "invalid_request",
        issues: parsed.error.flatten(),
      });
    }

    const body = parsed.data as CreateTaskInput;

    if (body.kind === "repo-analyze" && body.target.kind !== "local_path") {
      return reply.status(400).send({
        ok: false,
        error: "invalid_target",
        message:
          "repo-analyze exige target.kind = 'local_path' com path válido",
      });
    }

    if (body.kind === "repo-command" && body.target.kind !== "local_path") {
      return reply.status(400).send({
        ok: false,
        error: "invalid_target",
        message:
          "repo-command exige target.kind = 'local_path' com path válido",
      });
    }

    if (
      body.kind === "repo-command" &&
      body.command.intent === "custom" &&
      (!body.command.customCommand ||
        body.command.customCommand.trim().length === 0)
    ) {
      return reply.status(400).send({
        ok: false,
        error: "invalid_command",
        message: "repo-command com intent = 'custom' exige customCommand",
      });
    }

    const task = createBaseTask(body);
    await saveTask(task);

    queueMicrotask(() => {
      void executeTask(task);
    });

    return reply.status(202).send({
      task,
    });
  });
}