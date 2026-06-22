//apps/agent/src/ai-context/verify.script.ts

import { rm } from "node:fs/promises";
import {
  scaffoldAiContext,
  listIssues,
  readIssue,
  filterIssuesByStatus,
  searchIssuesByTag,
  filterIssuesBySpec,
  createIssue,
  updateIssue,
  appendIssueLog,
  moveIssueStatus,
  consolidateIssue,
  AiContextMutationError,
  listSpecs,
  readSpec,
  createSpec,
  updateSpec,
  moveSpecStatus,
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

  // Smoke test descartável do módulo de Spec.
  const allSpecs = await listSpecs(repositoryRoot);
  console.log(`listSpecs -> ${allSpecs.length} spec(s)`);

  const createdSpec = await createSpec(repositoryRoot, {
    title: "[verify.script] spec descartável de teste",
    owner: "agent",
    tags: ["verify-script-temp"],
  });
  console.log("createSpec ->", createdSpec.frontmatter.id);

  const updatedSpec = await updateSpec(repositoryRoot, createdSpec.frontmatter.id, {
    title: "[verify.script] spec descartável de teste (editada)",
  });
  console.assert(
    updatedSpec.frontmatter.title.includes("editada"),
    "updateSpec deveria alterar title"
  );

  await moveSpecStatus(repositoryRoot, createdSpec.frontmatter.id, "validated");
  await moveSpecStatus(repositoryRoot, createdSpec.frontmatter.id, "active");

  try {
    await moveSpecStatus(repositoryRoot, createdSpec.frontmatter.id, "validated");
    console.error("esperava AiContextMutationError ao tentar active → validated direto");
  } catch (error) {
    console.assert(
      error instanceof AiContextMutationError,
      "transição active → validated deveria ser inválida"
    );
  }

  await moveSpecStatus(repositoryRoot, createdSpec.frontmatter.id, "deprecated");
  const finalSpec = await readSpec(repositoryRoot, createdSpec.frontmatter.id);
  console.assert(finalSpec?.frontmatter.status === "deprecated", "spec deveria estar deprecated");

  await rm(createdSpec.filePath, { force: true });
  console.log("smoke test de specs: ok (artefatos de teste removidos)");

  // Smoke test descartável do round-trip de spec_id (ISSUE-0008): cria uma
  // issue já vinculada a uma spec, lê de volta, confirma que sobrevive a uma
  // mutation subsequente que não toca em spec_id, e confirma o filtro.
  const specForLink = await createSpec(repositoryRoot, {
    title: "[verify.script] spec descartável para vínculo de issue",
    owner: "agent",
    tags: ["verify-script-temp"],
  });

  const linkedIssue = await createIssue(repositoryRoot, {
    title: "[verify.script] issue descartável vinculada a spec",
    priority: "low",
    type: "research",
    owner: "agent",
    tags: ["verify-script-temp"],
    spec_id: specForLink.frontmatter.id,
  });
  console.assert(
    linkedIssue.frontmatter.spec_id === specForLink.frontmatter.id,
    "createIssue deveria persistir spec_id"
  );

  const reread = await readIssue(repositoryRoot, linkedIssue.frontmatter.id);
  console.assert(
    reread?.frontmatter.spec_id === specForLink.frontmatter.id,
    "spec_id deveria sobreviver à releitura do arquivo"
  );

  await appendIssueLog(repositoryRoot, linkedIssue.frontmatter.id, "mutation subsequente sem tocar em spec_id");
  const afterMutation = await readIssue(repositoryRoot, linkedIssue.frontmatter.id);
  console.assert(
    afterMutation?.frontmatter.spec_id === specForLink.frontmatter.id,
    "spec_id deveria sobreviver a uma mutation subsequente (appendIssueLog)"
  );

  const bySpec = await filterIssuesBySpec(repositoryRoot, specForLink.frontmatter.id);
  console.assert(
    bySpec.some((issue) => issue.frontmatter.id === linkedIssue.frontmatter.id),
    "filterIssuesBySpec deveria encontrar a issue vinculada"
  );

  const unlinked = await updateIssue(repositoryRoot, linkedIssue.frontmatter.id, { spec_id: undefined });
  console.log("updateIssue com spec_id undefined ->", unlinked.frontmatter.spec_id);

  await rm(linkedIssue.filePath, { force: true });
  await rm(specForLink.filePath, { force: true });
  console.log("smoke test de spec_id (ISSUE-0008): ok (artefatos de teste removidos)");
}

main();
