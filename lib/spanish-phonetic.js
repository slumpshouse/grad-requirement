/**
 * Converts a Spanish word (or short phrase) into an approximate
 * English-style phonetic guide so learners know how to pronounce it.
 *
 * Examples:
 *   como    → koh-moh
 *   hablar  → ah-blahr
 *   beber   → beh-behr
 *   mañana  → mah-nyah-nah
 *   gente   → hen-teh
 */

function phoneticWord(text) {
  let w = text.toLowerCase().replace(/[¡!¿?.,;:'"«»\-]/g, '').trim();
  if (!w) return '';

  let result = '';
  let i = 0;

  while (i < w.length) {
    const ch = w[i];
    const next = w[i + 1] || '';
    const next2 = w[i + 2] || '';

    // ── Multi-character patterns (longest match first) ──────────
    if (ch === 'r' && next === 'r') { result += 'rr'; i += 2; continue; }
    if (ch === 'l' && next === 'l') { result += 'y'; i += 2; continue; }
    if (ch === 'c' && next === 'h') { result += 'ch'; i += 2; continue; }
    // qu + e/i → k (the u is silent)
    if (ch === 'q' && next === 'u') { result += 'k'; i += 2; continue; }
    // gü + e/i → gw
    if (ch === 'g' && next === 'ü') { result += 'gw'; i += 2; continue; }
    // gu + e/i → g (u is silent)
    if (ch === 'g' && next === 'u' && (next2 === 'e' || next2 === 'i' || next2 === 'é' || next2 === 'í')) {
      result += 'g'; i += 2; continue;
    }

    // ── Single-character rules ───────────────────────────────────
    switch (ch) {
      case 'a': case 'á': result += 'ah'; break;
      case 'e': case 'é': result += 'eh'; break;
      case 'i': case 'í': result += 'ee'; break;
      case 'o': case 'ó': result += 'oh'; break;
      case 'u': case 'ú': case 'ü': result += 'oo'; break;
      case 'h': break; // silent in Spanish
      case 'j': result += 'h'; break;
      case 'ñ': result += 'ny'; break;
      case 'v': result += 'b'; break;
      case 'z': result += 's'; break;
      case 'c':
        if (next === 'e' || next === 'i' || next === 'é' || next === 'í') result += 's';
        else result += 'k';
        break;
      case 'g':
        if (next === 'e' || next === 'i' || next === 'é' || next === 'í') result += 'h';
        else result += 'g';
        break;
      case 'x': result += 'ks'; break;
      case 'y':
        // standalone or end-of-word "y" sounds like "ee"
        if (!next || !/[aeiouáéíóúü]/.test(next)) result += 'ee';
        else result += 'y';
        break;
      default: result += ch;
    }
    i++;
  }

  // ── Add syllable dashes ──────────────────────────────────────
  // Insert a dash after a vowel cluster only when it's followed by
  // consonant(s) and then another vowel cluster (i.e., more syllables coming).
  result = result.replace(
    /(ah|eh|ee|oh|oo)(?=[bcdfghjklmnpqrstvwxyz]+(?:ah|eh|ee|oh|oo))/g,
    '$1-'
  );

  return result;
}

/**
 * Convert a Spanish word or short phrase to a phonetic guide string.
 * Multi-word input is processed word by word.
 *
 * @param {string} text  Spanish word(s)
 * @returns {string}     Phonetic approximation, e.g. "koh-moh"
 */
export function spanishPhonetic(text) {
  if (!text) return '';
  return text
    .split(/\s+/)
    .map(phoneticWord)
    .filter(Boolean)
    .join(' ');
}
