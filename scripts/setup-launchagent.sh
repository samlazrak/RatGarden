#!/bin/bash

PLIST_SRC="$(dirname "$0")/homebrew.mxcl.quartz.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/homebrew.mxcl.quartz.plist"

cp "$PLIST_SRC" "$PLIST_DEST"
launchctl unload "$PLIST_DEST" 2>/dev/null
launchctl load "$PLIST_DEST"
echo "Quartz dev server will now run at login." 