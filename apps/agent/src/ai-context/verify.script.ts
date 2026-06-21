//apps/agent/src/ai-context/verify.script.ts

import { rm } from "node:fs/promises";
import {
  scaffoldAiContext,
  listIssues,
  readIssue,
  filterIssuesByStatus,
  searchIssuesByTag,
  createIssue,
  updateIssue,
  appendIssueLog,
  moveIssueStatus,
  consolidateIssue,
  AiContextMutationError,
} from "./index.js";

async function main() {
  const repositoryRoot = process.argv[2];

  if (!repositoryRoot) {
    console.error("uso: tsx verify.script.ts <repositoryRoot>");
    process.exit(1);
  }

  const first = await scaffoldAiContext(repositoryRoot);
  console.log("scaffold (1a chamada):", first);

  const second = await scaffoldAiContext(repositoryRoot);
  console.log("scaffold (2a chamada, deve ser idempotente):", second);
  console.assert(second.created.length === 0, "2a chamada não deveria criar nada");

  const all = await listIssues(repositoryRoot);
  console.log(`listIssues -> ${all.length} issue(s)`);

  const one = await readIssue(repositoryRoot, "ISSUE-0001");
  console.assert(one !== null, "ISSUE-0001 deveria ser lida com sucesso");
  console.log("readIssue(ISSUE-0001):", one?.frontmatter);

  const byStatus = await filterIssuesByStatus(repositoryRoot, "review");
  const byTag = await searchIssuesByTag(repositoryRoot, "ai-context");

  console.log({ byStatus: byStatus.length, byTag: byTag.length });

  // Smoke test descartável das mutações: cria, atualiza, loga, transiciona
  // e consolida uma issue de teste, depois limpa os artefatos gerados para
  // não poluir a instância real de AI_context.
  const created = await createIssue(repositoryRoot, {
    title: "[verify.script] issue descartável de teste",
    priority: "low",
    type: "research",
    owner: "agent",
    tags: ["verify-script-temp"],
  });
  console.log("createIssue ->", created.frontmatter.id);

  const updated = await updateIssue(repositoryRoot, created.frontmatter.id, {
    priority: "medium",
  });
  console.assert(updated.frontmatter.priority === "medium", "updateIssue deveria alterar priority");

  await appendIssueLog(repositoryRoot, created.frontmatter.id, "entrada de teste via verify.script");
  const withLog = await readIssue(repositoryRoot, created.frontmatter.id);
  console.assert(
    withLog?.body.includes("entrada de teste via verify.script"),
    "appendIssueLog deveria adicionar a entrada ao corpo"
  );

  await moveIssueStatus(repositoryRoot, created.frontmatter.id, "ready");
  await moveIssueStatus(repositoryRoot, created.frontmatter.id, "doing");
  await moveIssueStatus(repositoryRoot, created.frontmatter.id, "review");
  await moveIssueStatus(repositoryRoot, created.frontmatter.id, "done");

  try {
    await moveIssueStatus(repositoryRoot, created.frontmatter.id, "consolidated");
    console.error("esperava AiContextMutationError ao tentar ir para consolidated via moveIssueStatus");
  } catch (error) {
    console.assert(
      error instanceof AiContextMutationError,
      "transição inválida (done → consolidated via moveIssueStatus) deveria lançar AiContextMutationError"
    );
  }

  const consolidated = await consolidateIssue(repositoryRoot, created.frontmatter.id);
  console.log("consolidateIssue ->", consolidated.consolidatedId);

  const finalIssue = await readIssue(repositoryRoot, created.frontmatter.id);
  console.assert(finalIssue?.frontmatter.status === "consolidated", "issue deveria estar consolidated");

  await rm(created.filePath, { force: true });
  await rm(consolidated.consolidatedFilePath, { force: true });
  console.log("smoke test de mutações: ok (artefatos de teste removidos)");
}

main();
