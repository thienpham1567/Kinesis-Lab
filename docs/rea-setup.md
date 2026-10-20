# REA for this workspace

Installed on 2026-10-20 from the official `rea-agents@6.7.0` npm package
([repository](https://github.com/morluto/rea),
[installation guide](https://github.com/morluto/rea/blob/main/docs/installation.md)).

## Entry points

- CLI: `npm run rea -- --version`, `npm run rea -- --help`.
- Project skill: `.agents/skills/reverse-engineer-anything/`, copied from the matching released package, including its bundled references.
- Codex MCP registration: `rea` in `~/.codex/config.toml`, using `npx -y rea-agents@6.7.0 mcp` with an explicit supported runtime PATH and this project's Swift compiler adapter.
- Configuration snapshot before registration: `~/.codex/config.toml.before-rea-2026-10-20`.

The launcher pins REA to 6.7.0 and uses an existing supported Node runtime.
This machine currently uses Codex's bundled Node 24.19.0 because the shell's
Node 25 is unsupported by REA. Set `REA_NODE` to an absolute compatible Node
executable if that runtime moves. `npx` caches/downloads the pinned package.
No REA dependency was added to the application bundle.

Restart/reconnect Codex to load the newly registered tools. The skill is available
from the next turn. A configuration entry alone does not prove the active chat has
connected. Use REA for shipped artifacts/runtime evidence; normal source analysis
continues to use repository tools, as the REA skill instructs.

## Host-specific compiler adapter

The first official setup plan failed while compiling the Darwin process-ownership
helper: this Apple Command Line Tools installation has two definitions of
`SwiftBridging` in `usr/include/swift/module.modulemap` and
`usr/include/swift/bridging.modulemap`.

`scripts/rea-swiftc.sh` uses a temporary compiler VFS overlay that replaces only
the redundant legacy module map for that invocation. It retains the canonical
`bridging.modulemap` and compiles the full original REA helper. No Apple system
files are modified and process-ownership checks are retained. The wrapper removes
its temporary overlay on exit. The CLI auto-selects it only when both duplicate
maps contain the module; an explicit `REA_DARWIN_SWIFTC_PATH` takes precedence.
Codex's REA environment explicitly selects the adapter and the installed SDK.

After this repair, the official scoped setup command
`npm run rea -- setup --client codex --skill=false --yes --json` returned
`status: ready`, `doctor.healthy: true` for the Codex registration. `--skill=false`
keeps the matching project skill instead of adding another personal copy.
Setup also retained its own configuration snapshot at
`~/.codex/config.toml.rea.backup`.

## Installation verification (2026-10-20)

- CLI reports **6.7.0**, running with Node **24.19.0**.
- All seven installed skill files match the released package bytes.
- The four pre-existing MCP entries remain unchanged.
- A fresh stdio connection, using the saved Codex command/arguments/environment,
  initialized as REA **6.7.0** and advertised **207 tools**.
- A real `tools/call` for `binary_session` succeeded in that fresh connection.
- The older MCP process in this chat retained the pre-repair environment and still
  reported the original compiler error. Restart/reconnect Codex before using it.

These checks establish registration, startup, discovery and target-free session
inspection. They do not establish successful analysis of every artifact/provider.
Hopper/Ghidra/IDA remain optional, separately supplied engines; none was installed
or claimed operational here.
