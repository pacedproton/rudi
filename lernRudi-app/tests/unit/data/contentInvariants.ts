const DIPHTHONGS = ['au', 'eu', 'äu', 'ei', 'ai', 'ey', 'ay'];
const ONSET_CLUSTERS = ['sch', 'sp', 'st', 'pf'];

export function normalizeGerman(word: string): string {
  return word
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/oo/g, 'o');
}

export function rimeOf(word: string): string {
  const normalized = normalizeGerman(word);
  const vowel = /[aeiouy]/;
  let i = normalized.length - 1;
  while (i >= 0 && !vowel.test(normalized[i])) i -= 1;
  if (i < 0) return normalized;

  // Trailing -e is usually schwa; take the previous vowel group (Krone/Zitrone).
  if (normalized[i] === 'e' && i === normalized.length - 1) {
    i -= 1;
    while (i >= 0 && !vowel.test(normalized[i])) i -= 1;
    if (i < 0) return normalized;
  }

  if (i > 0 && DIPHTHONGS.includes(normalized.slice(i - 1, i + 1))) {
    i -= 1;
  }

  return normalized.slice(i);
}

/** Same word is not a rhyme. Boot/Brot match after collapsing oo. */
export function wordsRhyme(a: string, b: string): boolean {
  if (normalizeGerman(a) === normalizeGerman(b)) return false;
  const rime = rimeOf(a);
  return rime.length >= 2 && rime === rimeOf(b);
}

export function germanOnset(word: string): string {
  const normalized = word.toLowerCase();
  for (const cluster of ONSET_CLUSTERS) {
    if (normalized.startsWith(cluster)) return cluster;
  }
  return normalized[0] ?? '';
}

export function onsetsMatch(a: string, b: string): boolean {
  const left = germanOnset(a);
  const right = germanOnset(b);
  return left.length > 0 && left === right;
}

const VOWEL = /[aeiouyäöü]/i;

/** Count German vowel groups. ie is two vowels so Marienkaefer stays 5. */
export function countSyllables(word: string): number {
  const letters = word.toLowerCase();
  let count = 0;
  let i = 0;
  while (i < letters.length) {
    const pair = letters.slice(i, i + 2);
    if (DIPHTHONGS.includes(pair)) {
      count += 1;
      i += 2;
      continue;
    }
    if (VOWEL.test(letters[i])) {
      count += 1;
      i += 1;
      continue;
    }
    i += 1;
  }
  return count;
}
