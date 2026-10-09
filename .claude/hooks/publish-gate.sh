#!/bin/bash
# PreToolUse(Bash): Der einzige Weg nach außen ist `npm run publish` (scripts/publish.sh,
# docs/decisions/0008). Jeder direkte Push/Merge über GitHub — auch Varianten wie
# `git -C . push`, `git -c x=y push` oder ein push in einer Befehlskette — wird VERWEIGERT,
# damit kein Beitrag am deterministischen Check vorbei veröffentlicht werden kann.
# publish.sh selbst pusht intern; das sieht dieser Hook nicht, und das ist so gewollt.
cmd="$(jq -r '.tool_input.command // empty')"
if grep -Eq '(^|[;&|[:space:]])git([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]][^[:space:]]*)?)*[[:space:]]+push\b|\bgh[[:space:]]+(pr[[:space:]]+merge|release|repo[[:space:]]+(create|edit|delete))' <<<"$cmd"; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"Veröffentlichen nur über `npm run publish -- <beitrag>` (Check + Build + Push), nie direkt — docs/decisions/0008-automated-publish-gate.md"}}'
fi
exit 0
