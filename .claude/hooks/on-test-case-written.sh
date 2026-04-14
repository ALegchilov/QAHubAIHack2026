#!/bin/bash
#
# Hook: on-test-case-written.sh
# Triggers after a Write/Edit tool modifies a manual test case file.
# Outputs a JSON user message that tells Claude to automate the test.
#
# Claude Code hooks receive tool_input as JSON on stdin.
# For Write/Edit, it contains { "file_path": "..." }
#

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('file_path',''))" 2>/dev/null)

# Only trigger for test case markdown files in output/
case "$FILE_PATH" in
  */output/api-tests/ATC-*.md)
    TYPE="api"
    ;;
  */output/TC-*.md)
    TYPE="ui"
    ;;
  *)
    exit 0
    ;;
esac

FILENAME=$(basename "$FILE_PATH" .md)

if [ "$TYPE" = "api" ]; then
  SPEC_DIR="tests/api"
  # Map ATC file to spec path: ATC-parts-create.md -> tests/api/parts/parts-create.spec.ts
  SPEC_NAME=$(echo "$FILENAME" | sed 's/^ATC-//' | sed 's/^parts-/parts\/parts-/' | sed 's/^categories-/categories\/categories-/' | sed 's/^field-/cross-cutting\/field-/' | sed 's/^relational-/cross-cutting\/relational-/' | sed 's/^edge-/cross-cutting\/edge-/' | sed 's/^parts-filtering/cross-cutting\/parts-filtering/')
  SPEC_FILE="${SPEC_DIR}/${SPEC_NAME}.spec.ts"
else
  SPEC_DIR="tests/ui"
  SPEC_NAME=$(echo "$FILENAME" | sed 's/^TC-//')
  SPEC_FILE="${SPEC_DIR}/${SPEC_NAME}.spec.ts"
fi

cat <<EOF
Test case file updated: $FILE_PATH
Corresponding spec: $SPEC_FILE
Type: $TYPE
Action: auto-implement
EOF
