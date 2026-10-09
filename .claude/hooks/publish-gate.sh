#!/bin/bash
# PreToolUse(Bash): Veröffentlichen ist nach außen gerichtet und nicht umkehrbar
# (docs/decisions/0003-publish-gate.md). Die ask-Regeln in settings.json fangen nur
# Befehle, die wörtlich mit `git push` beginnen; dieser Hook fängt auch Varianten wie
# `git -C . push`, `git -c x=y push` oder ein push in einer Befehlskette und verlangt
# dafür immer eine Freigabe durch den Menschen.
cmd="$(jq -r '.tool_input.command // empty')"
if grep -Eq '(^|[;&|[:space:]])git([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]][^[:space:]]*)?)*[[:space:]]+push\b|\bgh[[:space:]]+(pr[[:space:]]+merge|release|repo[[:space:]]+(create|edit|delete))' <<<"$cmd"; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:"Veröffentlichung (push/merge) braucht immer die Freigabe des Owners — 0003-publish-gate.md"}}'
fi
exit 0
