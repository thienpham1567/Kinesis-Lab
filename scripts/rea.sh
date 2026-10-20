#!/usr/bin/env bash
set -euo pipefail
# REA 6.7.0 supports Node 22 >=22.19, 24 >=24.11, or >=26.
rea_node="${REA_NODE:-}"
if [[ -z "$rea_node" ]]; then
  for candidate in "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" "$(command -v node || true)"; do
    [[ -x "$candidate" ]] || continue
    if "$candidate" -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit((a===22&&b>=19)||(a===24&&b>=11)||a>=26?0:1)' 2>/dev/null; then
      rea_node="$candidate"
      break
    fi
  done
fi
if [[ -z "$rea_node" || ! -x "$rea_node" ]]; then
  echo "REA requires Node 22.19+, 24.11+ or 26+. Set REA_NODE to a supported executable." >&2
  exit 1
fi
"$rea_node" -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit((a===22&&b>=19)||(a===24&&b>=11)||a>=26?0:1)'
export PATH="$(dirname "$rea_node"):$PATH"
# Scope the workaround to REA only, and only while both duplicate maps exist.
if [[ -z "${REA_DARWIN_SWIFTC_PATH:-}" && "$(uname -s)" == "Darwin" ]] &&
   [[ -f /Library/Developer/CommandLineTools/usr/include/swift/module.modulemap &&
      -f /Library/Developer/CommandLineTools/usr/include/swift/bridging.modulemap ]] &&
   grep -q 'module SwiftBridging' /Library/Developer/CommandLineTools/usr/include/swift/module.modulemap &&
   grep -q 'module SwiftBridging' /Library/Developer/CommandLineTools/usr/include/swift/bridging.modulemap; then
  rea_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  export REA_DARWIN_SWIFTC_PATH="$rea_script_dir/rea-swiftc.sh"
  export SDKROOT="${SDKROOT:-$(/usr/bin/xcrun --show-sdk-path)}"
fi
exec npx -y rea-agents@6.7.0 "$@"
