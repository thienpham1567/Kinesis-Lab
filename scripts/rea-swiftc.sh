#!/usr/bin/env bash
set -euo pipefail
# CLT on this host retains a duplicate legacy SwiftBridging module map.
# A per-invocation VFS overlay hides only that redundant definition. The
# canonical bridging.modulemap and REA's full ownership helper stay intact.
rea_overlay_dir="$(mktemp -d "${TMPDIR:-/tmp}/rea-swift-overlay.XXXXXX")"
trap 'rm -rf "$rea_overlay_dir"' EXIT
/usr/bin/python3 - "$rea_overlay_dir" <<'PY'
from pathlib import Path
import json,sys
root=Path(sys.argv[1])
(root/'empty.modulemap').write_text('// Canonical SwiftBridging remains in bridging.modulemap.\n')
(root/'overlay.json').write_text(json.dumps({'version':0,'roots':[{
  'type':'file',
  'name':'/Library/Developer/CommandLineTools/usr/include/swift/module.modulemap',
  'external-contents':str(root/'empty.modulemap'),
}]}))
PY
/Library/Developer/CommandLineTools/usr/bin/swiftc -vfsoverlay "$rea_overlay_dir/overlay.json" "$@"
