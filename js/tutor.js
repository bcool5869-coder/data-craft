// Prompts for the in-browser tutor (MiniCPM5-1B). Written for a 1B model: short instructions, one job each,
// and a prefill where a fixed answer shape helps (see the Story Craft README for what small models need).
const SYSTEM =
  'You are a patient tutor teaching Python, data science and AI to beginners. Use simple words. Be short and correct. No preamble.';

// Keeps the end of a traceback: the line that failed and the error message are what matter.
const tail = (text, max) => (text.length > max ? '…' + text.slice(-max) : text);
// The last lines of a traceback hold the error type, message and any "Did you mean" hint; library frames above are noise.
const lastLines = (text, n) => tail(text.trim().split('\n').slice(-n).join('\n'), 600);

export const explainCode = (code, topic) => ({
  system: SYSTEM,
  user: `Lesson topic: ${topic}\n\nPython code:\n\`\`\`python\n${tail(code, 1500)}\n\`\`\`\n\n` +
    'Explain what this code does, step by step, in at most 5 numbered points of one short sentence each.',
  prefill: '1.',
  maxTokens: 400,
});

export const explainError = (code, error, topic) => ({
  system: SYSTEM,
  user: `Lesson topic: ${topic}\n\nA beginner ran this Python code:\n\`\`\`python\n${tail(code, 1200)}\n\`\`\`\n\n` +
    `It failed with:\n\`\`\`\n${lastLines(error, 3)}\n\`\`\`\n\n` +
    'In 2 or 3 sentences, explain what the error means and how to fix it.',
  prefill: 'This error means',
  maxTokens: 160,
});

export const ask = (question, topic) => ({
  system: SYSTEM,
  user: `Lesson topic: ${topic}\n\nQuestion: ${question}\n\nAnswer in at most 5 short sentences, for a beginner.`,
  prefill: '',
  maxTokens: 260,
});
