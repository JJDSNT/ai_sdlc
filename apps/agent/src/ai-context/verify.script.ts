//apps/agent/src/ai-context/verify.script.ts

import {
  scaffoldAiContext,
  listIssues,
  readIssue,
  filterIssuesByStatus,
  searchIssuesByTag,
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
}

main();
