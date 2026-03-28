// apps/agent/src/services/run-task.ts

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runTask(prompt: string) {
  const { stdout, stderr } = await execFileAsync("echo", [prompt]);

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}