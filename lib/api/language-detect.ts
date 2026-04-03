const NORMALIZE: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  sh: "bash",
  yml: "yaml",
  md: "markdown",
};

export function normalizeLanguageId(raw: string): string {
  const id = raw.trim().toLowerCase();
  return NORMALIZE[id] ?? id;
}

/**
 * Infer programming language from prompt when not explicitly provided.
 */
export function detectLanguageFromPrompt(prompt: string): string {
  const fence = /^```(\w+)/m.exec(prompt);
  if (fence?.[1]) {
    return normalizeLanguageId(fence[1]);
  }

  const lower = prompt.toLowerCase();
  const rules: [RegExp, string][] = [
    [/\bpython3?\b|\bpy\b/, "python"],
    [/\btypescript\b|\btsx\b/, "typescript"],
    [/\bjavascript\b|\bnode\.?js\b|\bjs\b(?!\w)/, "javascript"],
    [/\brust\b|\bcargo\b/, "rust"],
    [/\bgo\b|\bgolang\b/, "go"],
    [/\bjava\b(?!\s*script)/, "java"],
    [/\bc#\b|\bcsharp\b/, "csharp"],
    [/\bc\+\+\b|\bcpp\b/, "cpp"],
    [/\bc\b(?!\#)/, "c"],
    [/\bruby\b|\brails\b/, "ruby"],
    [/\bphp\b|\blaravel\b/, "php"],
    [/\bswift\b/, "swift"],
    [/\bkotlin\b/, "kotlin"],
    [/\bdart\b|\bflutter\b/, "dart"],
    [/\bsql\b/, "sql"],
    [/\bhtml\b/, "html"],
    [/\bcss\b|\btailwind\b/, "css"],
    [/\bshell\b|\bbash\b|\bsh\b/, "bash"],
  ];

  for (const [re, lang] of rules) {
    if (re.test(lower)) return lang;
  }

  return "plaintext";
}
