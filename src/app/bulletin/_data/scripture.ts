export type ScriptureFragment =
  | { kind: "verse"; number: string }
  | { kind: "text"; content: string };

export function parseScripturePassage(passage: string): ScriptureFragment[] {
  const VERSE_MARKER = /\{(\d+)\}/g;
  const fragments: ScriptureFragment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = VERSE_MARKER.exec(passage)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        kind: "text",
        content: passage.slice(lastIndex, match.index),
      });
    }
    fragments.push({ kind: "verse", number: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < passage.length) {
    fragments.push({ kind: "text", content: passage.slice(lastIndex) });
  }

  return fragments;
}
