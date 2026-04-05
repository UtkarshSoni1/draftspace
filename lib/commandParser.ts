export type CommandType = 'text' | 'image' | 'code' | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  prompt: string;
  raw: string;
  language?: string;
}

export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();

  // Pattern: { ai: ... }
  const aiMatch = raw.match(/^\s*{\s*ai\s*:\s*(.*?)\s*}\s*$/i);
  if (aiMatch) {
    return {
      type: 'text',
      prompt: aiMatch[1].trim(),
      raw,
    };
  }

  // Pattern: { img: ... }
  const imgMatch = raw.match(/^\s*{\s*img\s*:\s*(.*?)\s*}\s*$/i);
  if (imgMatch) {
    return {
      type: 'image',
      prompt: imgMatch[1].trim(),
      raw,
    };
  }

  // Pattern: { code: ... } or { code[language]: ... }
  const codeMatch = raw.match(/^\s*{\s*code(?:\[(\w+)\])?\s*:\s*(.*?)\s*}\s*$/i);
  if (codeMatch) {
    return {
      type: 'code',
      prompt: codeMatch[2].trim(),
      raw,
      language: codeMatch[1]?.toLowerCase(),
    };
  }

  return {
    type: 'unknown',
    prompt: '',
    raw,
  };
}
