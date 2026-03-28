import { access, readFile } from "node:fs/promises";
import path from "node:path";

export type RepoCommandIntent =
  | "build"
  | "test"
  | "lint"
  | "format"
  | "install"
  | "custom";

export type RepoEcosystem =
  | "node-pnpm"
  | "node-npm"
  | "node-yarn"
  | "python"
  | "rust"
  | "go"
  | "make"
  | "unknown";

export type ResolvedRepoCommand = {
  ecosystem: RepoEcosystem;
  command: string;
  reason: string;
};

type PackageJson = {
  scripts?: Record<string, string>;
};

async function exists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export type DetectedRepositoryContext = {
  repositoryRoot: string;
  ecosystem: RepoEcosystem;
  packageJson: PackageJson | null;
  hasPnpmWorkspace: boolean;
  hasPnpmLock: boolean;
  hasNpmLock: boolean;
  hasYarnLock: boolean;
  hasPyproject: boolean;
  hasRequirementsTxt: boolean;
  hasPoetryLock: boolean;
  hasCargoToml: boolean;
  hasGoMod: boolean;
  hasMakefile: boolean;
};

export async function detectRepositoryContext(
  repositoryRoot: string
): Promise<DetectedRepositoryContext> {
  const packageJsonPath = path.join(repositoryRoot, "package.json");
  const pyprojectPath = path.join(repositoryRoot, "pyproject.toml");
  const requirementsPath = path.join(repositoryRoot, "requirements.txt");
  const poetryLockPath = path.join(repositoryRoot, "poetry.lock");
  const cargoTomlPath = path.join(repositoryRoot, "Cargo.toml");
  const goModPath = path.join(repositoryRoot, "go.mod");
  const makefilePath = path.join(repositoryRoot, "Makefile");
  const pnpmWorkspacePath = path.join(repositoryRoot, "pnpm-workspace.yaml");
  const pnpmLockPath = path.join(repositoryRoot, "pnpm-lock.yaml");
  const npmLockPath = path.join(repositoryRoot, "package-lock.json");
  const yarnLockPath = path.join(repositoryRoot, "yarn.lock");

  const [
    packageJson,
    hasPyproject,
    hasRequirementsTxt,
    hasPoetryLock,
    hasCargoToml,
    hasGoMod,
    hasMakefile,
    hasPnpmWorkspace,
    hasPnpmLock,
    hasNpmLock,
    hasYarnLock,
  ] = await Promise.all([
    readJsonFile<PackageJson>(packageJsonPath),
    exists(pyprojectPath),
    exists(requirementsPath),
    exists(poetryLockPath),
    exists(cargoTomlPath),
    exists(goModPath),
    exists(makefilePath),
    exists(pnpmWorkspacePath),
    exists(pnpmLockPath),
    exists(npmLockPath),
    exists(yarnLockPath),
  ]);

  let ecosystem: RepoEcosystem = "unknown";

  if (packageJson) {
    if (hasPnpmWorkspace || hasPnpmLock) {
      ecosystem = "node-pnpm";
    } else if (hasYarnLock) {
      ecosystem = "node-yarn";
    } else {
      ecosystem = "node-npm";
    }
  } else if (hasPyproject || hasRequirementsTxt || hasPoetryLock) {
    ecosystem = "python";
  } else if (hasCargoToml) {
    ecosystem = "rust";
  } else if (hasGoMod) {
    ecosystem = "go";
  } else if (hasMakefile) {
    ecosystem = "make";
  }

  return {
    repositoryRoot,
    ecosystem,
    packageJson,
    hasPnpmWorkspace,
    hasPnpmLock,
    hasNpmLock,
    hasYarnLock,
    hasPyproject,
    hasRequirementsTxt,
    hasPoetryLock,
    hasCargoToml,
    hasGoMod,
    hasMakefile,
  };
}

function resolveNodeScriptCommand(
  packageJson: PackageJson | null,
  tool: "pnpm" | "npm" | "yarn",
  intent: Exclude<RepoCommandIntent, "custom">
): ResolvedRepoCommand | null {
  const scripts = packageJson?.scripts ?? {};

  const hasScript = (name: string) =>
    typeof scripts[name] === "string" && scripts[name].trim().length > 0;

  const run = (scriptName: string) => {
    if (tool === "npm") return `npm run ${scriptName}`;
    return `${tool} ${scriptName}`;
  };

  if (intent === "install") {
    return {
      ecosystem:
        tool === "pnpm" ? "node-pnpm" : tool === "yarn" ? "node-yarn" : "node-npm",
      command: tool === "yarn" ? "yarn install" : `${tool} install`,
      reason: `Detected Node.js repository using ${tool}`,
    };
  }

  if (intent === "build" && hasScript("build")) {
    return {
      ecosystem:
        tool === "pnpm" ? "node-pnpm" : tool === "yarn" ? "node-yarn" : "node-npm",
      command: run("build"),
      reason: `Detected Node.js ${tool} project with build script`,
    };
  }

  if (intent === "test" && hasScript("test")) {
    return {
      ecosystem:
        tool === "pnpm" ? "node-pnpm" : tool === "yarn" ? "node-yarn" : "node-npm",
      command: run("test"),
      reason: `Detected Node.js ${tool} project with test script`,
    };
  }

  if (intent === "lint" && hasScript("lint")) {
    return {
      ecosystem:
        tool === "pnpm" ? "node-pnpm" : tool === "yarn" ? "node-yarn" : "node-npm",
      command: run("lint"),
      reason: `Detected Node.js ${tool} project with lint script`,
    };
  }

  if (intent === "format") {
    if (hasScript("format")) {
      return {
        ecosystem:
          tool === "pnpm" ? "node-pnpm" : tool === "yarn" ? "node-yarn" : "node-npm",
        command: run("format"),
        reason: `Detected Node.js ${tool} project with format script`,
      };
    }

    if (hasScript("fmt")) {
      return {
        ecosystem:
          tool === "pnpm" ? "node-pnpm" : tool === "yarn" ? "node-yarn" : "node-npm",
        command: run("fmt"),
        reason: `Detected Node.js ${tool} project with fmt script`,
      };
    }
  }

  return null;
}

async function resolvePythonCommand(
  repositoryRoot: string,
  intent: Exclude<RepoCommandIntent, "custom">
): Promise<ResolvedRepoCommand | null> {
  const pyproject = await readTextFile(path.join(repositoryRoot, "pyproject.toml"));
  const requirements = await readTextFile(path.join(repositoryRoot, "requirements.txt"));

  if (intent === "install") {
    if (await exists(path.join(repositoryRoot, "poetry.lock"))) {
      return {
        ecosystem: "python",
        command: "poetry install",
        reason: "Detected Python project with poetry.lock",
      };
    }

    if (requirements) {
      return {
        ecosystem: "python",
        command: "pip install -r requirements.txt",
        reason: "Detected Python project with requirements.txt",
      };
    }
  }

  if (intent === "test") {
    if (pyproject?.includes("pytest") || (await exists(path.join(repositoryRoot, "pytest.ini")))) {
      return {
        ecosystem: "python",
        command: "pytest",
        reason: "Detected Python project using pytest",
      };
    }

    return {
      ecosystem: "python",
      command: "python -m unittest",
      reason: "Detected Python project; falling back to unittest",
    };
  }

  if (intent === "lint") {
    if (pyproject?.includes("ruff")) {
      return {
        ecosystem: "python",
        command: "ruff check .",
        reason: "Detected Python project using ruff",
      };
    }

    if (pyproject?.includes("flake8")) {
      return {
        ecosystem: "python",
        command: "flake8 .",
        reason: "Detected Python project using flake8",
      };
    }
  }

  if (intent === "format") {
    if (pyproject?.includes("ruff")) {
      return {
        ecosystem: "python",
        command: "ruff format .",
        reason: "Detected Python project using ruff formatter",
      };
    }

    if (pyproject?.includes("black")) {
      return {
        ecosystem: "python",
        command: "black .",
        reason: "Detected Python project using black",
      };
    }
  }

  if (intent === "build") {
    if (pyproject) {
      return {
        ecosystem: "python",
        command: "python -m build",
        reason: "Detected Python project with pyproject.toml",
      };
    }
  }

  return null;
}

function resolveCargoCommand(
  intent: Exclude<RepoCommandIntent, "custom">
): ResolvedRepoCommand | null {
  const map: Partial<Record<typeof intent, string>> = {
    build: "cargo build",
    test: "cargo test",
    lint: "cargo clippy",
    format: "cargo fmt",
    install: "cargo fetch",
  };

  const command = map[intent];
  if (!command) return null;

  return {
    ecosystem: "rust",
    command,
    reason: "Detected Rust project with Cargo.toml",
  };
}

function resolveGoCommand(
  intent: Exclude<RepoCommandIntent, "custom">
): ResolvedRepoCommand | null {
  const map: Partial<Record<typeof intent, string>> = {
    build: "go build ./...",
    test: "go test ./...",
    lint: "go vet ./...",
    format: "gofmt -w .",
    install: "go mod download",
  };

  const command = map[intent];
  if (!command) return null;

  return {
    ecosystem: "go",
    command,
    reason: "Detected Go project with go.mod",
  };
}

function resolveMakeCommand(
  intent: Exclude<RepoCommandIntent, "custom">
): ResolvedRepoCommand | null {
  const map: Partial<Record<typeof intent, string>> = {
    build: "make build",
    test: "make test",
    lint: "make lint",
    format: "make format",
    install: "make install",
  };

  const command = map[intent];
  if (!command) return null;

  return {
    ecosystem: "make",
    command,
    reason: "Detected repository with Makefile",
  };
}

export async function resolveRepoCommand(input: {
  repositoryRoot: string;
  intent: RepoCommandIntent;
  customCommand?: string;
}): Promise<ResolvedRepoCommand> {
  const { repositoryRoot, intent, customCommand } = input;
  const context = await detectRepositoryContext(repositoryRoot);

  if (intent === "custom") {
    if (!customCommand || customCommand.trim().length === 0) {
      throw new Error("customCommand is required when intent = 'custom'");
    }

    return {
      ecosystem: context.ecosystem,
      command: customCommand.trim(),
      reason: "Using user-provided custom command",
    };
  }

  if (context.ecosystem === "node-pnpm") {
    const resolved = resolveNodeScriptCommand(
      context.packageJson,
      "pnpm",
      intent
    );
    if (resolved) return resolved;
  }

  if (context.ecosystem === "node-yarn") {
    const resolved = resolveNodeScriptCommand(
      context.packageJson,
      "yarn",
      intent
    );
    if (resolved) return resolved;
  }

  if (context.ecosystem === "node-npm") {
    const resolved = resolveNodeScriptCommand(
      context.packageJson,
      "npm",
      intent
    );
    if (resolved) return resolved;
  }

  if (context.ecosystem === "python") {
    const resolved = await resolvePythonCommand(repositoryRoot, intent);
    if (resolved) return resolved;
  }

  if (context.ecosystem === "rust") {
    const resolved = resolveCargoCommand(intent);
    if (resolved) return resolved;
  }

  if (context.ecosystem === "go") {
    const resolved = resolveGoCommand(intent);
    if (resolved) return resolved;
  }

  if (context.ecosystem === "make") {
    const resolved = resolveMakeCommand(intent);
    if (resolved) return resolved;
  }

  throw new Error(
    `Could not resolve a command for intent "${intent}" in repository "${repositoryRoot}"`
  );
}