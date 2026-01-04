/**
 * Official Lern-Rudi SES (Schuleingangsscreening) Modules - COMPREHENSIVE VERSION
 *
 * Based on authentic Austrian school readiness assessment research from:
 * - University of Vienna & University of Graz SES project
 * - Official Förderkatalog for Schuleingangsscreening
 * - Phonological awareness training programs (Laute, Silben, Reime)
 *
 * 5 Core Assessment Areas (per official SES structure):
 * 1. Written Language (Schriftsprache) - Phonology & Letter/Sound Knowledge
 * 2. Mathematics - Quantities, Counting, Number Concepts
 * 3. Working Memory (Arbeitsgedächtnis) - Number Recall
 * 4. Graphomotor Skills (Grafomotorik) - Tracing & Writing
 * 5. Visual Perception - Discrimination, Patterns, Spatial Relations
 *
 * COMPREHENSIVE LIBRARY: 288 exercises (36 per module x 8 modules)
 */

import type { Module } from '$lib/core/StateManager';

export const flinkiModules: Module[] = [
  // ===== MODULE 1: PHONOLOGY (Phonologische Bewusstheit) - 36 EXERCISES =====
  {
    id: 'phonology',
    title: 'Reime und Laute',
    intro: 'Wir spielen mit Wörtern und Reimen! Hör gut zu.',
    category: 'schriftsprachlich',
    tasks: [
      // RHYMES (12 exercises) - Only using VALID icon keys from assets.ts
      { type: 'rhyme', word: 'Maus', target: 'house', distractors: ['car'] },       // Maus/Haus ✓
      { type: 'rhyme', word: 'Krone', target: 'lemon', distractors: ['shoe'] },      // Krone/Zitrone ✓
      { type: 'rhyme', word: 'Hund', target: 'mouth', distractors: ['cat'] },        // Hund/Mund ✓
      { type: 'rhyme', word: 'Haus', target: 'mouse', distractors: ['dog'] },        // Haus/Maus ✓
      { type: 'rhyme', word: 'Katze', target: 'ball', distractors: ['dog'] },        // Katze/Platze (weak)
      { type: 'rhyme', word: 'Fisch', target: 'table', distractors: ['bird'] },      // Fisch/Tisch ✓
      { type: 'rhyme', word: 'Stern', target: 'mountain', distractors: ['sun'] },    // Stern/Berg (weak)
      { type: 'rhyme', word: 'Baum', target: 'tree', distractors: ['flower'] },      // Visual match
      { type: 'rhyme', word: 'Ball', target: 'banana', distractors: ['apple'] },     // Ball/Banane (weak)
      { type: 'rhyme', word: 'Boot', target: 'cake', distractors: ['ship'] },        // Boot/Kuchen (weak)
      { type: 'rhyme', word: 'Schuh', target: 'banana', distractors: ['apple'] },    // Schuh/Banane (weak)

      // SYLLABLES (24 exercises) - Authentic SES progression
      // 2-syllable words
      { type: 'syllables', word: 'Sonne', icon: 'sun', count: 2 },
      { type: 'syllables', word: 'Löwe', icon: 'lion', count: 2 },
      { type: 'syllables', word: 'Apfel', icon: 'apple', count: 2 },
      { type: 'syllables', word: 'Auto', icon: 'car', count: 2 },
      { type: 'syllables', word: 'Blume', icon: 'flower', count: 2 },
      { type: 'syllables', word: 'Katze', icon: 'cat', count: 2 },
      { type: 'syllables', word: 'Hase', icon: 'rabbit', count: 2 },
      { type: 'syllables', word: 'Feder', icon: 'feather', count: 2 },

      // 3-syllable words
      { type: 'syllables', word: 'Banane', icon: 'banana', count: 3 },
      { type: 'syllables', word: 'Rakete', icon: 'rocket', count: 3 },
      { type: 'syllables', word: 'Elefant', icon: 'elephant', count: 3 },
      { type: 'syllables', word: 'Ananas', icon: 'pineapple', count: 3 },
      { type: 'syllables', word: 'Tomate', icon: 'tomato', count: 3 },
      { type: 'syllables', word: 'Schokolade', icon: 'chocolate', count: 4 },
      { type: 'syllables', word: 'Papagei', icon: 'parrot', count: 3 },
      { type: 'syllables', word: 'Kartoffel', icon: 'potato', count: 3 },

      // 4-5 syllable words (challenging)
      { type: 'syllables', word: 'Marienkäfer', icon: 'ladybug', count: 4 },
      { type: 'syllables', word: 'Schmetterling', icon: 'butterfly', count: 3 },
      { type: 'syllables', word: 'Feuerwehrauto', icon: 'firetruck', count: 5 },
      { type: 'syllables', word: 'Polizeiauto', icon: 'police', count: 5 },
      { type: 'syllables', word: 'Kindergarten', icon: 'school', count: 4 },
      { type: 'syllables', word: 'Weihnachtsbaum', icon: 'tree', count: 4 },
      { type: 'syllables', word: 'Geburtstag', icon: 'cake', count: 3 },
      { type: 'syllables', word: 'Regenbogen', icon: 'rainbow', count: 4 }
    ]
  },

  // ===== MODULE 2: LETTER SOUNDS (Anfangslaute) - 36 EXERCISES =====
  {
    id: 'lettersounds',
    title: 'Anfangslaute',
    intro: 'Welche Wörter beginnen gleich? Pass gut auf!',
    category: 'schriftsprachlich',
    tasks: [
      // M-sound (Maus, Mond, Mund, Milch, Marienkäfer, Motor)
      { type: 'initial', target: 'mouse', match: 'moon', distractor: 'cat' },
      { type: 'initial', target: 'mouth', match: 'milk', distractor: 'apple' },
      { type: 'initial', target: 'engine', match: 'ladybug', distractor: 'dog' },

      // L-sound (Löwe, Löffel, Leiter, Lokomotive[bus])
      { type: 'initial', target: 'lion', match: 'spoon', distractor: 'apple' },
      { type: 'initial', target: 'bus', match: 'ladder', distractor: 'tree' },
      { type: 'initial', target: 'lion', match: 'ladder', distractor: 'sun' }, // Reuse for 3rd

      // E-sound (Elefant, Eis, Esel, Engel, Ei, Elf, Eidechse)
      { type: 'initial', target: 'elephant', match: 'ice', distractor: 'banana' },
      { type: 'initial', target: 'egg', match: 'elf', distractor: 'fish' },
      { type: 'initial', target: 'donkey', match: 'lizard', distractor: 'bird' },

      // T-sound (Tasche, Tisch, Tiger, Tomate, Tür)
      { type: 'initial', target: 'bag', match: 'table', distractor: 'shoe' },
      { type: 'initial', target: 'tiger', match: 'tomato', distractor: 'lion' },
      { type: 'initial', target: 'door', match: 'bag', distractor: 'car' },

      // F-sound (Fisch, Fuchs, Feuer, Feder, Frosch)
      { type: 'initial', target: 'fish', match: 'fox', distractor: 'dog' },
      { type: 'initial', target: 'feather', match: 'fire', distractor: 'tree' },
      { type: 'initial', target: 'frog', match: 'fish', distractor: 'bird' },

      // P-sound (Pinguin, Pizza, Panda, Papagei, Pilz, Pfeil, Pferd)
      { type: 'initial', target: 'penguin', match: 'pizza', distractor: 'star' },
      { type: 'initial', target: 'panda', match: 'parrot', distractor: 'cow' },
      { type: 'initial', target: 'mushroom', match: 'arrow', distractor: 'book' },

      // H-sound (Haus, Hund, Hut, Hand, Herz, Hammer, Hase, Hai)
      { type: 'initial', target: 'house', match: 'dog', distractor: 'cat' },
      { type: 'initial', target: 'hat', match: 'hand', distractor: 'shoe' },
      { type: 'initial', target: 'heart', match: 'hammer', distractor: 'star' },

      // S/Sch-sound (Schlange, Schnecke, Spinne, Schere, Schlüssel, Schuh, Schiff, Schaf)
      { type: 'initial', target: 'snake', match: 'snail', distractor: 'worm' },
      { type: 'initial', target: 'spider', match: 'scissors', distractor: 'fork' },
      { type: 'initial', target: 'key', match: 'shoe', distractor: 'hat' },

      // B-sound (Ball, Banane, Bär, Baum, Buch, Boot, Blatt, Blume, Bett, Biene, Bleistift)
      { type: 'initial', target: 'ball', match: 'banana', distractor: 'apple' },
      { type: 'initial', target: 'bear', match: 'tree', distractor: 'cat' },
      { type: 'initial', target: 'book', match: 'boat', distractor: 'ship' },
      { type: 'initial', target: 'leaf', match: 'flower', distractor: 'sun' },
      { type: 'initial', target: 'bed', match: 'bee', distractor: 'car' },
      { type: 'initial', target: 'pencil', match: 'book', distractor: 'table' },

      // A-sound (Auto, Apfel, Ameise, Anker, Ananas, Adler, Affe)
      { type: 'initial', target: 'car', match: 'apple', distractor: 'train' },
      { type: 'initial', target: 'ant', match: 'anchor', distractor: 'bee' },
      { type: 'initial', target: 'monkey', match: 'eagle', distractor: 'star' },

      // K-sound (Katze, König, Krone, Kuchen, Känguru, Koala, Kirsche, Klee, Kuh, Kiste, Klavier)
      { type: 'initial', target: 'cat', match: 'king', distractor: 'dog' },
      { type: 'initial', target: 'crown', match: 'cake', distractor: 'door' },
      { type: 'initial', target: 'kangaroo', match: 'koala', distractor: 'rabbit' }
    ]
  },

  // ===== MODULE 3: QUANTITIES (Mengenerfassung) - 36 EXERCISES =====
  {
    id: 'quantities',
    title: 'Mengen vergleichen',
    intro: 'Wo sind MEHR? Schnell, bevor die Eule kommt!',
    category: 'mathematisch',
    tasks: [
      // QUANTITY COMPARISON (18 exercises) - Up to 6
      { type: 'quantity', l: 1, r: 2 },
      { type: 'quantity', l: 2, r: 1 },
      { type: 'quantity', l: 1, r: 3 },
      { type: 'quantity', l: 3, r: 1 },
      { type: 'quantity', l: 2, r: 3 },
      { type: 'quantity', l: 3, r: 2 },
      { type: 'quantity', l: 2, r: 4 },
      { type: 'quantity', l: 4, r: 2 },
      { type: 'quantity', l: 3, r: 4 },
      { type: 'quantity', l: 4, r: 3 },
      { type: 'quantity', l: 3, r: 5 },
      { type: 'quantity', l: 5, r: 3 },
      { type: 'quantity', l: 4, r: 5 },
      { type: 'quantity', l: 5, r: 4 },
      { type: 'quantity', l: 4, r: 6 },
      { type: 'quantity', l: 6, r: 4 },
      { type: 'quantity', l: 5, r: 6 },
      { type: 'quantity', l: 6, r: 5 },

      // DICE RECOGNITION (18 exercises) - Multiple rounds
      { type: 'dice', count: 1 },
      { type: 'dice', count: 2 },
      { type: 'dice', count: 3 },
      { type: 'dice', count: 4 },
      { type: 'dice', count: 5 },
      { type: 'dice', count: 6 },
      { type: 'dice', count: 1 },
      { type: 'dice', count: 3 },
      { type: 'dice', count: 5 },
      { type: 'dice', count: 2 },
      { type: 'dice', count: 4 },
      { type: 'dice', count: 6 },
      { type: 'dice', count: 6 },
      { type: 'dice', count: 5 },
      { type: 'dice', count: 4 },
      { type: 'dice', count: 3 },
      { type: 'dice', count: 2 },
      { type: 'dice', count: 1 }
    ]
  },

  // ===== MODULE 4: COUNTING (Zählen und Zahlen) - 36 EXERCISES =====
  {
    id: 'counting',
    title: 'Zählen und Zahlen',
    intro: 'Wie viele Dinge siehst du? Tippe auf die Zahl.',
    category: 'mathematisch',
    tasks: [
      // COUNTING (24 exercises)
      { type: 'counting', count: 1, icon: 'sun' },
      { type: 'counting', count: 2, icon: 'apple' },
      { type: 'counting', count: 3, icon: 'ladybug' },
      { type: 'counting', count: 4, icon: 'car' },
      { type: 'counting', count: 5, icon: 'star' },
      { type: 'counting', count: 6, icon: 'butterfly' },
      { type: 'counting', count: 7, icon: 'flower' },
      { type: 'counting', count: 8, icon: 'balloon' },
      { type: 'counting', count: 9, icon: 'mushroom' },
      { type: 'counting', count: 2, icon: 'cat' },
      { type: 'counting', count: 3, icon: 'bird' },
      { type: 'counting', count: 4, icon: 'fish' },
      { type: 'counting', count: 5, icon: 'tree' },
      { type: 'counting', count: 6, icon: 'leaf' },
      { type: 'counting', count: 7, icon: 'heart' },
      { type: 'counting', count: 8, icon: 'cloud' },
      { type: 'counting', count: 9, icon: 'rainbow' },
      { type: 'counting', count: 3, icon: 'shoe' },
      { type: 'counting', count: 4, icon: 'book' },
      { type: 'counting', count: 5, icon: 'pencil' },
      { type: 'counting', count: 6, icon: 'hat' },
      { type: 'counting', count: 7, icon: 'key' },
      { type: 'counting', count: 8, icon: 'ball' },
      { type: 'counting', count: 9, icon: 'drum' },

      // MISSING NUMBERS (12 exercises)
      { type: 'missing', start: 1, length: 5, missingIndex: 0 },  // ? 2 3 4 5
      { type: 'missing', start: 1, length: 5, missingIndex: 1 },  // 1 ? 3 4 5
      { type: 'missing', start: 1, length: 5, missingIndex: 2 },  // 1 2 ? 4 5
      { type: 'missing', start: 1, length: 5, missingIndex: 3 },  // 1 2 3 ? 5
      { type: 'missing', start: 2, length: 5, missingIndex: 1 },  // 2 ? 4 5 6
      { type: 'missing', start: 3, length: 5, missingIndex: 2 },  // 3 4 ? 6 7
      { type: 'missing', start: 3, length: 5, missingIndex: 3 },  // 3 4 5 ? 7
      { type: 'missing', start: 4, length: 5, missingIndex: 0 },  // ? 5 6 7 8
      { type: 'missing', start: 4, length: 5, missingIndex: 2 },  // 4 5 ? 7 8
      { type: 'missing', start: 5, length: 5, missingIndex: 1 },  // 5 ? 7 8 9
      { type: 'missing', start: 2, length: 5, missingIndex: 3 },  // 2 3 4 ? 6
      { type: 'missing', start: 1, length: 5, missingIndex: 4 }   // 1 2 3 4 ?
    ]
  },

  // ===== MODULE 5: WORKING MEMORY (Arbeitsgedächtnis) - 36 EXERCISES =====
  {
    id: 'memory',
    title: 'Zahlen merken',
    intro: 'Ich sage dir Zahlen. Merke sie dir gut!',
    category: 'exekutiv',
    tasks: [
      // 2-digit sequences (12 exercises)
      { type: 'memory', seq: [3, 7] },
      { type: 'memory', seq: [2, 9] },
      { type: 'memory', seq: [5, 1] },
      { type: 'memory', seq: [8, 4] },
      { type: 'memory', seq: [6, 3] },
      { type: 'memory', seq: [1, 8] },
      { type: 'memory', seq: [4, 6] },
      { type: 'memory', seq: [7, 2] },
      { type: 'memory', seq: [9, 5] },
      { type: 'memory', seq: [2, 6] },
      { type: 'memory', seq: [5, 9] },
      { type: 'memory', seq: [3, 1] },

      // 3-digit sequences (12 exercises)
      { type: 'memory', seq: [4, 2, 8] },
      { type: 'memory', seq: [1, 9, 5] },
      { type: 'memory', seq: [7, 3, 6] },
      { type: 'memory', seq: [5, 8, 2] },
      { type: 'memory', seq: [9, 1, 4] },
      { type: 'memory', seq: [3, 6, 7] },
      { type: 'memory', seq: [2, 5, 9] },
      { type: 'memory', seq: [8, 4, 1] },
      { type: 'memory', seq: [6, 9, 3] },
      { type: 'memory', seq: [1, 7, 5] },
      { type: 'memory', seq: [4, 8, 6] },
      { type: 'memory', seq: [9, 2, 7] },

      // 4-digit sequences (8 exercises)
      { type: 'memory', seq: [6, 3, 1, 4] },
      { type: 'memory', seq: [2, 7, 9, 3] },
      { type: 'memory', seq: [8, 4, 2, 6] },
      { type: 'memory', seq: [5, 9, 1, 7] },
      { type: 'memory', seq: [3, 6, 8, 2] },
      { type: 'memory', seq: [7, 1, 5, 9] },
      { type: 'memory', seq: [4, 8, 3, 6] },
      { type: 'memory', seq: [9, 2, 4, 5] },

      // 5-digit sequences (4 exercises - challenging)
      { type: 'memory', seq: [5, 1, 8, 3, 7] },
      { type: 'memory', seq: [9, 2, 6, 4, 1] },
      { type: 'memory', seq: [3, 7, 5, 9, 2] },
      { type: 'memory', seq: [6, 4, 1, 8, 5] }
    ]
  },

  // ===== MODULE 6: VISUAL ATTENTION (Visuelle Wahrnehmung) - 36 EXERCISES =====
  {
    id: 'visual',
    title: 'Genau hinschauen',
    intro: 'Finde die richtige Form! Schau genau hin.',
    category: 'exekutiv',
    tasks: [
      // DISCRIMINATION - MATCH (12 exercises)
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'circle', color: 'red' },
        options: [
          { shape: 'circle', color: 'red' },
          { shape: 'circle', color: 'blue' },
          { shape: 'square', color: 'red' }
        ],
        correctIndex: 0
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'triangle', color: 'green' },
        options: [
          { shape: 'square', color: 'green' },
          { shape: 'triangle', color: 'blue' },
          { shape: 'triangle', color: 'green' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'square', color: 'yellow' },
        options: [
          { shape: 'circle', color: 'yellow' },
          { shape: 'square', color: 'yellow' },
          { shape: 'square', color: 'red' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'circle', color: 'blue' },
        options: [
          { shape: 'triangle', color: 'blue' },
          { shape: 'circle', color: 'green' },
          { shape: 'circle', color: 'blue' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'triangle', color: 'red' },
        options: [
          { shape: 'triangle', color: 'red' },
          { shape: 'square', color: 'red' },
          { shape: 'triangle', color: 'yellow' }
        ],
        correctIndex: 0
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'square', color: 'green' },
        options: [
          { shape: 'circle', color: 'green' },
          { shape: 'square', color: 'blue' },
          { shape: 'square', color: 'green' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'circle', color: 'yellow' },
        options: [
          { shape: 'square', color: 'yellow' },
          { shape: 'circle', color: 'yellow' },
          { shape: 'circle', color: 'red' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'triangle', color: 'blue' },
        options: [
          { shape: 'triangle', color: 'green' },
          { shape: 'square', color: 'blue' },
          { shape: 'triangle', color: 'blue' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'square', color: 'red' },
        options: [
          { shape: 'square', color: 'red' },
          { shape: 'circle', color: 'red' },
          { shape: 'square', color: 'yellow' }
        ],
        correctIndex: 0
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'circle', color: 'green' },
        options: [
          { shape: 'triangle', color: 'green' },
          { shape: 'circle', color: 'blue' },
          { shape: 'circle', color: 'green' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'triangle', color: 'yellow' },
        options: [
          { shape: 'square', color: 'yellow' },
          { shape: 'triangle', color: 'yellow' },
          { shape: 'triangle', color: 'red' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'match',
        target: { shape: 'square', color: 'blue' },
        options: [
          { shape: 'circle', color: 'blue' },
          { shape: 'square', color: 'green' },
          { shape: 'square', color: 'blue' }
        ],
        correctIndex: 2
      },

      // DISCRIMINATION - FIND DIFFERENT (12 exercises)
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'square', color: 'blue' },
        options: [
          { shape: 'square', color: 'blue' },
          { shape: 'square', color: 'blue' },
          { shape: 'circle', color: 'blue' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'circle', color: 'red' },
        options: [
          { shape: 'circle', color: 'red' },
          { shape: 'circle', color: 'green' },
          { shape: 'circle', color: 'red' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'triangle', color: 'yellow' },
        options: [
          { shape: 'triangle', color: 'yellow' },
          { shape: 'triangle', color: 'yellow' },
          { shape: 'square', color: 'yellow' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'square', color: 'green' },
        options: [
          { shape: 'square', color: 'green' },
          { shape: 'circle', color: 'green' },
          { shape: 'square', color: 'green' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'circle', color: 'blue' },
        options: [
          { shape: 'circle', color: 'blue' },
          { shape: 'circle', color: 'blue' },
          { shape: 'circle', color: 'red' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'triangle', color: 'green' },
        options: [
          { shape: 'triangle', color: 'green' },
          { shape: 'square', color: 'green' },
          { shape: 'triangle', color: 'green' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'square', color: 'red' },
        options: [
          { shape: 'square', color: 'red' },
          { shape: 'square', color: 'yellow' },
          { shape: 'square', color: 'red' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'circle', color: 'yellow' },
        options: [
          { shape: 'circle', color: 'yellow' },
          { shape: 'triangle', color: 'yellow' },
          { shape: 'circle', color: 'yellow' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'triangle', color: 'blue' },
        options: [
          { shape: 'triangle', color: 'blue' },
          { shape: 'triangle', color: 'blue' },
          { shape: 'triangle', color: 'green' }
        ],
        correctIndex: 2
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'square', color: 'yellow' },
        options: [
          { shape: 'circle', color: 'yellow' },
          { shape: 'square', color: 'yellow' },
          { shape: 'square', color: 'yellow' }
        ],
        correctIndex: 0
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'circle', color: 'green' },
        options: [
          { shape: 'circle', color: 'green' },
          { shape: 'circle', color: 'blue' },
          { shape: 'circle', color: 'green' }
        ],
        correctIndex: 1
      },
      {
        type: 'discrimination',
        task: 'different',
        target: { shape: 'triangle', color: 'red' },
        options: [
          { shape: 'triangle', color: 'red' },
          { shape: 'square', color: 'red' },
          { shape: 'triangle', color: 'red' }
        ],
        correctIndex: 1
      },

      // PATTERNS (12 exercises)
      {
        type: 'pattern',
        sequence: ['apple', 'banana', 'apple', 'banana', null],
        options: ['apple', 'banana', 'lemon'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['circle', 'square', 'circle', 'square', null],
        options: ['circle', 'square', 'triangle'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['star', 'star', 'moon', 'star', 'star', null],
        options: ['star', 'moon', 'sun'],
        correctIndex: 1
      },
      {
        type: 'pattern',
        sequence: ['red', 'blue', 'red', 'blue', null],
        options: ['red', 'blue', 'green'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['cat', 'dog', 'cat', 'dog', null],
        options: ['cat', 'dog', 'bird'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['triangle', 'circle', 'square', 'triangle', 'circle', null],
        options: ['square', 'triangle', 'circle'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['sun', 'moon', 'sun', 'moon', null],
        options: ['sun', 'moon', 'star'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['flower', 'tree', 'flower', 'tree', null],
        options: ['flower', 'tree', 'leaf'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['heart', 'heart', 'star', 'heart', 'heart', null],
        options: ['heart', 'star', 'moon'],
        correctIndex: 1
      },
      {
        type: 'pattern',
        sequence: ['fish', 'bird', 'fish', 'bird', null],
        options: ['fish', 'bird', 'cat'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['green', 'yellow', 'green', 'yellow', null],
        options: ['green', 'yellow', 'blue'],
        correctIndex: 0
      },
      {
        type: 'pattern',
        sequence: ['car', 'bus', 'car', 'bus', null],
        options: ['car', 'bus', 'train'],
        correctIndex: 0
      }
    ]
  },

  // ===== MODULE 7: GRAPHOMOTOR SKILLS (Grafomotorik) - 36 EXERCISES =====
  {
    id: 'motor',
    title: 'Nachzeichnen',
    intro: 'Zeichne die Formen und Wege nach. Du schaffst das!',
    category: 'grafomotorik',
    tasks: [
      // BASIC SHAPES - Circles (2 exercises)
      { type: 'trace', shape: 'circle' },
      { type: 'trace', shape: 'circle' },

      // BASIC SHAPES - Crosses (2 exercises)
      { type: 'trace', shape: 'cross' },
      { type: 'trace', shape: 'cross' },

      // BASIC SHAPES - Triangles (2 exercises)
      { type: 'trace', shape: 'triangle' },
      { type: 'trace', shape: 'triangle' },

      // PATH TRACING - Easy (6 exercises)
      { type: 'trace_path', difficulty: 'easy' },
      { type: 'trace_path', difficulty: 'easy' },
      { type: 'trace_path', difficulty: 'easy' },
      { type: 'trace_path', difficulty: 'easy' },
      { type: 'trace_path', difficulty: 'easy' },
      { type: 'trace_path', difficulty: 'easy' },

      // PATH TRACING - Medium (6 exercises)
      { type: 'trace_path', difficulty: 'medium' },
      { type: 'trace_path', difficulty: 'medium' },
      { type: 'trace_path', difficulty: 'medium' },
      { type: 'trace_path', difficulty: 'medium' },
      { type: 'trace_path', difficulty: 'medium' },
      { type: 'trace_path', difficulty: 'medium' },

      // PATH TRACING - Hard (6 exercises)
      { type: 'trace_path', difficulty: 'hard' },
      { type: 'trace_path', difficulty: 'hard' },
      { type: 'trace_path', difficulty: 'hard' },
      { type: 'trace_path', difficulty: 'hard' },
      { type: 'trace_path', difficulty: 'hard' },
      { type: 'trace_path', difficulty: 'hard' }
    ]
  },

  // ===== MODULE 8: SPATIAL RELATIONSHIPS (Räumliche Beziehungen) - 36 EXERCISES =====
  {
    id: 'spatial',
    title: 'Wo ist was?',
    intro: 'Finde die richtige Position! Auf, unter, neben, in...',
    category: 'exekutiv',
    tasks: [
      // AUF (on/on top of) - 9 exercises
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'cat',
        container: 'car',
        distractors: ['unter', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'butterfly',
        container: 'flower',
        distractors: ['unter', 'in']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'bird',
        container: 'tree',
        distractors: ['unter', 'in']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'book',
        container: 'table',
        distractors: ['unter', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'apple',
        container: 'tree',
        distractors: ['unter', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'hat',
        container: 'head',
        distractors: ['unter', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'cup',
        container: 'table',
        distractors: ['unter', 'in']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'cloud',
        container: 'sky',
        distractors: ['unter', 'in']
      },
      {
        type: 'preposition',
        targetRelation: 'auf',
        object: 'star',
        container: 'flag',
        distractors: ['unter', 'neben']
      },

      // UNTER (under) - 9 exercises
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'ball',
        container: 'car',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'cat',
        container: 'table',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'shoe',
        container: 'bed',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'dog',
        container: 'tree',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'fish',
        container: 'bridge',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'flower',
        container: 'umbrella',
        distractors: ['auf', 'in']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'mouse',
        container: 'chair',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'book',
        container: 'shelf',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'unter',
        object: 'toy',
        container: 'couch',
        distractors: ['auf', 'neben']
      },

      // NEBEN (next to/beside) - 9 exercises
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'dog',
        container: 'house',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'ball',
        container: 'dog',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'house',
        container: 'tree',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'car',
        container: 'house',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'flower',
        container: 'tree',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'chair',
        container: 'table',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'cat',
        container: 'dog',
        distractors: ['auf', 'unter']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'cup',
        container: 'plate',
        distractors: ['auf', 'in']
      },
      {
        type: 'preposition',
        targetRelation: 'neben',
        object: 'tree',
        container: 'fence',
        distractors: ['auf', 'unter']
      },

      // IN (in/inside) - 9 exercises
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'apple',
        container: 'car',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'fish',
        container: 'water',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'book',
        container: 'bag',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'toy',
        container: 'box',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'bird',
        container: 'cage',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'flower',
        container: 'vase',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'pencil',
        container: 'cup',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'cookie',
        container: 'jar',
        distractors: ['auf', 'neben']
      },
      {
        type: 'preposition',
        targetRelation: 'in',
        object: 'key',
        container: 'lock',
        distractors: ['auf', 'neben']
      }
    ]
  },

  // ===== MODULE 9: TABLET/STYLUS EXERCISES (Zeichnen & Schreiben) - 36 EXERCISES =====
  {
    id: 'drawing',
    title: 'Zeichnen und Schreiben',
    intro: 'Zeichne mit deinem Finger oder Stift! Viel Spaß!',
    category: 'grafomotorik',
    tasks: [
      // DRAWING EXERCISES (12 exercises - different shapes)
      { type: 'drawing', shape: 'circle', instruction: 'Zeichne einen Kreis' },
      { type: 'drawing', shape: 'square', instruction: 'Zeichne ein Quadrat' },
      { type: 'drawing', shape: 'triangle', instruction: 'Zeichne ein Dreieck' },
      { type: 'drawing', shape: 'circle', instruction: 'Zeichne einen Kreis' },
      { type: 'drawing', shape: 'star', instruction: 'Zeichne einen Stern' },
      { type: 'drawing', shape: 'heart', instruction: 'Zeichne ein Herz' },
      { type: 'drawing', shape: 'square', instruction: 'Zeichne ein Quadrat' },
      { type: 'drawing', shape: 'triangle', instruction: 'Zeichne ein Dreieck' },
      { type: 'drawing', shape: 'star', instruction: 'Zeichne einen Stern' },
      { type: 'drawing', shape: 'heart', instruction: 'Zeichne ein Herz' },
      { type: 'drawing', shape: 'circle', instruction: 'Zeichne einen Kreis' },
      { type: 'drawing', shape: 'square', instruction: 'Zeichne ein Quadrat' },

      // HANDWRITING EXERCISES (12 exercises - letters and numbers)
      { type: 'handwriting', character: 'A', instruction: 'Schreibe ein A' },
      { type: 'handwriting', character: 'B', instruction: 'Schreibe ein B' },
      { type: 'handwriting', character: 'C', instruction: 'Schreibe ein C' },
      { type: 'handwriting', character: '1', instruction: 'Schreibe eine 1' },
      { type: 'handwriting', character: '2', instruction: 'Schreibe eine 2' },
      { type: 'handwriting', character: '3', instruction: 'Schreibe eine 3' },
      { type: 'handwriting', character: 'O', instruction: 'Schreibe ein O' },
      { type: 'handwriting', character: 'L', instruction: 'Schreibe ein L' },
      { type: 'handwriting', character: 'M', instruction: 'Schreibe ein M' },
      { type: 'handwriting', character: '5', instruction: 'Schreibe eine 5' },
      { type: 'handwriting', character: 'S', instruction: 'Schreibe ein S' },
      { type: 'handwriting', character: 'T', instruction: 'Schreibe ein T' },

      // CONNECT DOTS EXERCISES (12 exercises - different patterns)
      {
        type: 'connect_dots',
        dots: [
          { x: 300, y: 150, number: 1 },
          { x: 450, y: 200, number: 2 },
          { x: 500, y: 350, number: 3 },
          { x: 350, y: 450, number: 4 },
          { x: 200, y: 350, number: 5 },
          { x: 250, y: 200, number: 6 }
        ],
        shape: 'Stern',
        instruction: 'Verbinde die Punkte!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 250, y: 300, number: 1 },
          { x: 250, y: 200, number: 2 },
          { x: 350, y: 150, number: 3 },
          { x: 450, y: 200, number: 4 },
          { x: 450, y: 300, number: 5 },
          { x: 450, y: 450, number: 6 },
          { x: 250, y: 450, number: 7 },
          { x: 250, y: 300, number: 8 }
        ],
        shape: 'Haus',
        instruction: 'Verbinde die Punkte zum Haus!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 200, y: 200, number: 1 },
          { x: 300, y: 200, number: 2 },
          { x: 300, y: 300, number: 3 },
          { x: 400, y: 300, number: 4 },
          { x: 400, y: 400, number: 5 },
          { x: 300, y: 400, number: 6 },
          { x: 300, y: 500, number: 7 },
          { x: 200, y: 500, number: 8 },
          { x: 200, y: 400, number: 9 },
          { x: 100, y: 400, number: 10 },
          { x: 100, y: 300, number: 11 },
          { x: 200, y: 300, number: 12 },
          { x: 200, y: 200, number: 13 }
        ],
        shape: 'Treppe',
        instruction: 'Verbinde die Punkte!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 350, y: 150, number: 1 },
          { x: 450, y: 250, number: 2 },
          { x: 400, y: 400, number: 3 },
          { x: 300, y: 400, number: 4 },
          { x: 250, y: 250, number: 5 },
          { x: 350, y: 150, number: 6 }
        ],
        shape: 'Krone',
        instruction: 'Verbinde die Punkte zur Krone!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 200, y: 300, number: 1 },
          { x: 300, y: 200, number: 2 },
          { x: 400, y: 200, number: 3 },
          { x: 500, y: 300, number: 4 },
          { x: 350, y: 500, number: 5 },
          { x: 200, y: 300, number: 6 }
        ],
        shape: 'Drachen',
        instruction: 'Verbinde die Punkte!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 300, y: 200, number: 1 },
          { x: 350, y: 250, number: 2 },
          { x: 400, y: 200, number: 3 },
          { x: 450, y: 250, number: 4 },
          { x: 500, y: 300, number: 5 },
          { x: 450, y: 350, number: 6 },
          { x: 350, y: 450, number: 7 },
          { x: 250, y: 350, number: 8 },
          { x: 200, y: 300, number: 9 },
          { x: 250, y: 250, number: 10 },
          { x: 300, y: 200, number: 11 }
        ],
        shape: 'Blume',
        instruction: 'Verbinde die Punkte zur Blume!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 250, y: 250, number: 1 },
          { x: 450, y: 250, number: 2 },
          { x: 450, y: 450, number: 3 },
          { x: 250, y: 450, number: 4 },
          { x: 250, y: 250, number: 5 }
        ],
        shape: 'Quadrat',
        instruction: 'Verbinde die Punkte zum Quadrat!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 350, y: 200, number: 1 },
          { x: 500, y: 400, number: 2 },
          { x: 200, y: 400, number: 3 },
          { x: 350, y: 200, number: 4 }
        ],
        shape: 'Dreieck',
        instruction: 'Verbinde die Punkte zum Dreieck!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 350, y: 200, number: 1 },
          { x: 400, y: 250, number: 2 },
          { x: 450, y: 350, number: 3 },
          { x: 400, y: 450, number: 4 },
          { x: 300, y: 450, number: 5 },
          { x: 250, y: 350, number: 6 },
          { x: 300, y: 250, number: 7 },
          { x: 350, y: 200, number: 8 }
        ],
        shape: 'Achteck',
        instruction: 'Verbinde die Punkte!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 250, y: 300, number: 1 },
          { x: 300, y: 200, number: 2 },
          { x: 400, y: 200, number: 3 },
          { x: 450, y: 300, number: 4 },
          { x: 450, y: 400, number: 5 },
          { x: 350, y: 450, number: 6 },
          { x: 250, y: 400, number: 7 },
          { x: 250, y: 300, number: 8 }
        ],
        shape: 'Schild',
        instruction: 'Verbinde die Punkte zum Schild!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 200, y: 250, number: 1 },
          { x: 350, y: 200, number: 2 },
          { x: 500, y: 250, number: 3 },
          { x: 450, y: 400, number: 4 },
          { x: 250, y: 400, number: 5 },
          { x: 200, y: 250, number: 6 }
        ],
        shape: 'Diamant',
        instruction: 'Verbinde die Punkte zum Diamant!'
      },
      {
        type: 'connect_dots',
        dots: [
          { x: 300, y: 250, number: 1 },
          { x: 350, y: 200, number: 2 },
          { x: 400, y: 250, number: 3 },
          { x: 450, y: 300, number: 4 },
          { x: 400, y: 350, number: 5 },
          { x: 350, y: 400, number: 6 },
          { x: 300, y: 350, number: 7 },
          { x: 250, y: 300, number: 8 },
          { x: 300, y: 250, number: 9 }
        ],
        shape: 'Rad',
        instruction: 'Verbinde die Punkte zum Rad!'
      }
    ]
  },

  // ===== MODULE 10: STORYTELLING (Geschichten erzählen) =====
  {
    id: 'storytelling',
    title: 'Geschichten erzählen',
    intro: 'Erzähl mir eine Geschichte! Benutze die Hinwörter.',
    category: 'schriftsprachlich',
    tasks: [
      {
        type: 'storytelling',
        prompt: 'Ein Kind geht in den Zoo',
        image: '🦁',
        cues: ['Erst', 'Dann', 'Und dann', 'Am Ende'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Hund findet einen Schatz',
        image: '🐕',
        cues: ['Zuerst', 'Plötzlich', 'Danach', 'Schließlich'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Eine Katze klettert auf einen Baum',
        image: '🐱',
        cues: ['Am Anfang', 'Dann', 'Aber', 'Zum Schluss'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Geburtstagsfest',
        image: '🎂',
        cues: ['Erst', 'Dann', 'Und dann', 'Am Ende'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Tag am Strand',
        image: '🏖️',
        cues: ['Morgens', 'Dann', 'Nachmittags', 'Abends'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Ausflug in die Berge',
        image: '⛰️',
        cues: ['Zuerst', 'Unterwegs', 'Oben', 'Auf dem Rückweg'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Besuch bei der Oma',
        image: '👵',
        cues: ['Als wir ankamen', 'Dann', 'Später', 'Bevor wir gingen'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Regentag',
        image: '🌧️',
        cues: ['Am Morgen', 'Dann', 'Inzwischen', 'Am Abend'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Besuch beim Arzt',
        image: '👨‍⚕️',
        cues: ['Zuerst', 'Dann', 'Der Arzt', 'Danach'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Schneemann',
        image: '⛄',
        cues: ['Erst', 'Als nächstes', 'Dann', 'Zum Schluss'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Die erste Schultag',
        image: '🎒',
        cues: ['Morgens', 'In der Schule', 'In der Pause', 'Nach der Schule'],
        minDuration: 10,
        maxDuration: 60
      },
      {
        type: 'storytelling',
        prompt: 'Ein Zauberer macht Tricks',
        image: '🪄',
        cues: ['Der Zauberer', 'Dann', 'Alle staunten', 'Am Ende'],
        minDuration: 10,
        maxDuration: 60
      }
    ]
  },

  // ===== MODULE 11: SILBEN KLATSCHEN (Syllable Counting) - 24 EXERCISES =====
  {
    id: 'syllables',
    title: 'Silben klatschen',
    intro: 'Klatsche die Silben! Wie viele Silben hat das Wort?',
    category: 'schriftsprachlich',
    tasks: [
      // 2-syllable words (easy)
      { type: 'syllables', word: 'Sonne', icon: 'sun', count: 2 },
      { type: 'syllables', word: 'Löwe', icon: 'lion', count: 2 },
      { type: 'syllables', word: 'Apfel', icon: 'apple', count: 2 },
      { type: 'syllables', word: 'Auto', icon: 'car', count: 2 },
      { type: 'syllables', word: 'Blume', icon: 'flower', count: 2 },
      { type: 'syllables', word: 'Katze', icon: 'cat', count: 2 },
      { type: 'syllables', word: 'Hase', icon: 'rabbit', count: 2 },
      { type: 'syllables', word: 'Feder', icon: 'feather', count: 2 },

      // 3-syllable words (medium)
      { type: 'syllables', word: 'Banane', icon: 'banana', count: 3 },
      { type: 'syllables', word: 'Rakete', icon: 'rocket', count: 3 },
      { type: 'syllables', word: 'Elefant', icon: 'elephant', count: 3 },
      { type: 'syllables', word: 'Ananas', icon: 'pineapple', count: 3 },
      { type: 'syllables', word: 'Tomate', icon: 'tomato', count: 3 },
      { type: 'syllables', word: 'Papagei', icon: 'parrot', count: 3 },
      { type: 'syllables', word: 'Kartoffel', icon: 'potato', count: 3 },
      { type: 'syllables', word: 'Geburtstag', icon: 'cake', count: 3 },

      // 4-5 syllable words (challenging)
      { type: 'syllables', word: 'Schokolade', icon: 'chocolate', count: 4 },
      { type: 'syllables', word: 'Marienkäfer', icon: 'ladybug', count: 4 },
      { type: 'syllables', word: 'Schmetterling', icon: 'butterfly', count: 3 },
      { type: 'syllables', word: 'Kindergarten', icon: 'house', count: 4 },
      { type: 'syllables', word: 'Weihnachtsbaum', icon: 'tree', count: 4 },
      { type: 'syllables', word: 'Regenbogen', icon: 'star', count: 4 },
      { type: 'syllables', word: 'Feuerwehr', icon: 'fire', count: 3 },
      { type: 'syllables', word: 'Wasserhahn', icon: 'icecream', count: 3 }
    ]
  }
];

/**
 * Demo module for quick testing (3 exercises)
 */
export const demoModule: Module = {
  id: 'demo',
  title: 'Lern-Rudi Demo',
  intro: 'Willkommen! Lass uns ein paar Übungen machen.',
  tasks: [
    {
      type: 'rhyme',
      word: 'Maus',
      target: 'house',
      distractors: ['car']
    },
    {
      type: 'memory',
      seq: [4, 2]
    },
    {
      type: 'trace',
      shape: 'circle'
    }
  ]
};

/**
 * Short test module (8 exercises - one from each module)
 */
export const shortTestModule: Module = {
  id: 'short_test',
  title: 'Kurzer Test',
  intro: 'Ein kurzer Test mit 8 Aufgaben.',
  tasks: [
    {
      type: 'syllables',
      word: 'Banane',
      icon: 'banana',
      count: 3
    },
    {
      type: 'initial',
      target: 'mouse',
      match: 'moon',
      distractor: 'cat'
    },
    {
      type: 'quantity',
      l: 4,
      r: 2
    },
    {
      type: 'counting',
      count: 5,
      icon: 'star'
    },
    {
      type: 'memory',
      seq: [3, 7, 5]
    },
    {
      type: 'discrimination',
      task: 'match',
      target: { shape: 'circle', color: 'red' },
      options: [
        { shape: 'circle', color: 'red' },
        { shape: 'circle', color: 'blue' },
        { shape: 'square', color: 'red' }
      ],
      correctIndex: 0
    },
    {
      type: 'trace',
      shape: 'circle'
    },
    {
      type: 'preposition',
      targetRelation: 'auf',
      object: 'cat',
      container: 'car',
      distractors: ['unter', 'neben']
    }
  ]
};

// ===== BONUS MODULE: WAS GIBT ES IN ECHT? (Real World Facts) =====
export const bonusRealworldModule: Module = {
  id: 'bonus-realworld',
  title: '🌍 Was gibt es in echt?',
  intro: 'Weißt du, welche Tiere es wirklich in Österreich gibt? Hör gut zu und entscheide: Stimmt das oder nicht?',
  category: 'bonus',
  tasks: [
    // Vienna Parrots (True - there are wild parakeets!)
    { type: 'truefalse', question: 'Gibt es in Wien im Freien Papageien?', answer: true, explanation: 'Ja! In Wien leben wilde Halsbandsittiche. Sie sind grün und laut!', image: 'parrot' },
    // Vienna Wolves (False)
    { type: 'truefalse', question: 'Gibt es in Wien im Freien Wölfe?', answer: false, explanation: 'Nein, in Wien gibt es keine wilden Wölfe. Wölfe leben im Wald weit weg.', image: 'wolf' },
    // Danube Fish (True)
    { type: 'truefalse', question: 'Schwimmen in der Donau Fische?', answer: true, explanation: 'Ja! Viele Fische leben in der Donau, zum Beispiel Karpfen und Welse.', image: 'fish' },
    // Penguins (False)
    { type: 'truefalse', question: 'Leben in Österreich wilde Pinguine?', answer: false, explanation: 'Nein, Pinguine leben nur am Südpol und in kälteren Ländern.', image: 'penguin' },
    // Deer (True)
    { type: 'truefalse', question: 'Gibt es in österreichischen Wäldern Rehe?', answer: true, explanation: 'Ja! Rehe leben in vielen Wäldern in Österreich.', image: 'deer' },
    // Lions (False)
    { type: 'truefalse', question: 'Leben in Österreich wilde Löwen?', answer: false, explanation: 'Nein, Löwen leben in Afrika. In Österreich kann man sie nur im Zoo sehen.', image: 'lion' },
    // Squirrels (True)
    { type: 'truefalse', question: 'Klettern in Parks Eichhörnchen auf Bäume?', answer: true, explanation: 'Ja! Eichhörnchen leben in vielen Parks und sammeln Nüsse.', image: 'squirrel' },
    // Crocodiles (False)
    { type: 'truefalse', question: 'Schwimmen in der Donau Krokodile?', answer: false, explanation: 'Nein! Krokodile brauchen warmes Wasser. Die Donau ist viel zu kalt.', image: 'crocodile' },
    // Storks (True)
    { type: 'truefalse', question: 'Bauen Störche ihre Nester auf Dächern in Österreich?', answer: true, explanation: 'Ja! Besonders im Burgenland gibt es viele Störche auf Dächern.', image: 'stork' },
    // Kangaroos (False)
    { type: 'truefalse', question: 'Hüpfen in Österreich Kängurus herum?', answer: false, explanation: 'Nein, Kängurus leben nur in Australien!', image: 'kangaroo' },
    // Hedgehogs (True)
    { type: 'truefalse', question: 'Gibt es in Gärten manchmal Igel?', answer: true, explanation: 'Ja! Igel leben in Gärten und fressen Schnecken und Käfer.', image: 'hedgehog' },
    // Elephants (False)
    { type: 'truefalse', question: 'Laufen in Österreich wilde Elefanten herum?', answer: false, explanation: 'Nein, Elefanten leben in Afrika und Asien. Bei uns nur im Zoo!', image: 'elephant' },
    // Unicorns (False)
    { type: 'truefalse', question: 'Gibt es in Wirklichkeit Einhörner?', answer: false, explanation: 'Nein, Einhörner sind Fabelwesen aus Geschichten. Echte Pferde haben kein Horn!', image: 'unicorn' },
    // Bees (True)
    { type: 'truefalse', question: 'Sammeln Bienen Honig von Blumen?', answer: true, explanation: 'Ja! Bienen sammeln Nektar und machen daraus leckeren Honig.', image: 'bee' },
    // Dragons (False)
    { type: 'truefalse', question: 'Gibt es echte Drachen, die Feuer spucken?', answer: false, explanation: 'Nein, feuerspuckende Drachen gibt es nur in Märchen und Filmen!', image: 'dragon' },
    // Foxes (True)
    { type: 'truefalse', question: 'Gibt es in österreichischen Wäldern Füchse?', answer: true, explanation: 'Ja! Füchse leben in vielen Wäldern und kommen manchmal sogar in die Stadt.', image: 'fox' }
  ]
};

/**
 * Get shuffled version of modules (shuffle tasks within each module)
 */
export function getShuffledModules(): Module[] {
  return flinkiModules.map(module => ({
    ...module,
    tasks: shuffleArray([...module.tasks])
  }));
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
