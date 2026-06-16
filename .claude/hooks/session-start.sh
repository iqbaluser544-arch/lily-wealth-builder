#!/bin/bash
#
# SessionStart hook: make the committed marketing skills globally discoverable.
#
# The 44 marketing skills live in this repo under .claude/skills/ (project
# scope), so they are already available when working in this repo. This hook
# additionally mirrors them into the session's user-global skills directory
# (~/.claude/skills/) at startup, so they are discoverable regardless of the
# working directory or any config drift within the session.
#
# Idempotent and non-interactive. Remote (Claude Code on the web) only.

set -euo pipefail

# Only run in the remote/web environment; local machines manage skills themselves.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
SRC="$PROJECT_DIR/.claude/skills"
DEST="$HOME/.claude/skills"

if [ -d "$SRC" ]; then
  mkdir -p "$DEST"
  # Copy each skill folder; -n avoids clobbering anything already present.
  cp -rn "$SRC"/. "$DEST"/ 2>/dev/null || cp -r "$SRC"/. "$DEST"/
  echo "[session-start] Marketing skills mirrored to $DEST" >&2
fi

exit 0
