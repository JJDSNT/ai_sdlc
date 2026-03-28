import Fastify from "fastify";
import cors from "@fastify/cors";
import { taskRoutes } from "./routes/tasks.js";

const app = Fastify();

await app.register(cors, {
  origin: "http://localhost:3000",
});

app.get("/", async () => {
  return { message: "agent is running" };
});

app.get("/health", async () => {
  return { ok: true };
});

await app.register(taskRoutes);

app.listen({ port: 3001, host: "0.0.0.0" }).then(() => {
  console.log("agent running on http://localhost:3001");
});