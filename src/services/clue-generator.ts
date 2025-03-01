import nlp from "compromise";
import { generate } from "random-words";

// Clue templates for different word types
const CLUE_TEMPLATES = {
  noun: [
    (word: string) => `Common object: ${word.toLowerCase()}`,
    (word: string) => `You might find this at home: ${word.toLowerCase()}`,
    (word: string) => `A type of ${word.toLowerCase()}`,
  ],
  verb: [
    (word: string) => `To ${word.toLowerCase()}`,
    (word: string) => `Action: ${word.toLowerCase()}`,
    (word: string) => `What you might do: ${word.toLowerCase()}`,
  ],
  adjective: [
    (word: string) => `Describes something ${word.toLowerCase()}`,
    (word: string) => `Quality: ${word.toLowerCase()}`,
    (word: string) => `When something is ${word.toLowerCase()}`,
  ],
};

// Word categories with common examples
const WORD_CATEGORIES = {
  colors: ["RED", "BLUE", "GREEN", "BLACK", "WHITE"],
  animals: ["CAT", "DOG", "BIRD", "FISH", "LION"],
  actions: ["RUN", "JUMP", "WALK", "TALK", "SING"],
  objects: ["BOOK", "DESK", "LAMP", "CHAIR", "TABLE"],
  nature: ["TREE", "LEAF", "ROCK", "SAND", "STAR"],
};

// Fallback word lists by length
const FALLBACK_WORDS = {
  2: ["UP", "ON", "AT", "IN"],
  3: ["CAT", "DOG", "RUN", "EAT", "MAP", "SUN", "FUN"],
  4: ["BOOK", "GAME", "TIME", "LOVE", "HOME", "STAR"],
  5: ["HAPPY", "WATER", "MUSIC", "PHONE", "HOUSE"],
};

function getWordType(word: string): "noun" | "verb" | "adjective" {
  const doc = nlp(word);
  if (doc.verbs().length > 0) return "verb";
  if (doc.adjectives().length > 0) return "adjective";
  return "noun";
}

function generateSpecialClue(word: string): string | null {
  // Check if word belongs to any special category
  for (const [category, words] of Object.entries(WORD_CATEGORIES)) {
    if (words.includes(word.toUpperCase())) {
      switch (category) {
        case "colors":
          return `Color of many ${
            word === "GREEN"
              ? "plants"
              : word === "BLUE"
              ? "oceans"
              : word === "RED"
              ? "apples"
              : "things"
          }`;
        case "animals":
          return `A type of ${word === "FISH" ? "aquatic creature" : "animal"}`;
        case "actions":
          return `To perform this action: ${word.toLowerCase()}`;
        case "objects":
          return `Found in many rooms: ${word.toLowerCase()}`;
        case "nature":
          return `Natural element: ${word.toLowerCase()}`;
      }
    }
  }
  return null;
}

function generateClue(word: string): string {
  // Try to generate a special clue first
  const specialClue = generateSpecialClue(word);
  if (specialClue) return specialClue;

  // Fall back to template-based clue
  const wordType = getWordType(word);
  const templates = CLUE_TEMPLATES[wordType];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template(word);
}

function getRandomWord(length: number): string {
  try {
    // Try to generate random words first
    const words = generate({
      exactly: 50,
      maxLength: length + 1,
      minLength: length,
    }) as string[];
    const validWords = words.filter((word) => /^[a-zA-Z]+$/.test(word));

    if (validWords.length > 0) {
      return validWords[
        Math.floor(Math.random() * validWords.length)
      ].toUpperCase();
    }

    // Fall back to predefined words if no valid words were generated
    const fallbackList =
      FALLBACK_WORDS[length as keyof typeof FALLBACK_WORDS] || [];
    if (fallbackList.length > 0) {
      return fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }

    // If all else fails, return a simple word
    return length === 2
      ? "UP"
      : length === 3
      ? "CAT"
      : length === 4
      ? "BOOK"
      : "HAPPY";
  } catch (error) {
    console.error("Error generating random word:", error);
    // Return a default word based on length
    return length === 2
      ? "UP"
      : length === 3
      ? "CAT"
      : length === 4
      ? "BOOK"
      : "HAPPY";
  }
}

export function generateWordAndClue(length: number): {
  word: string;
  clue: string;
} {
  const word = getRandomWord(length);
  const clue = generateClue(word);
  return { word, clue };
}
