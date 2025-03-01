"use server";

import fs from "fs";
import { join } from "path";

export type WordEntry = {
  word: string;
  clues: string[];
};

export type CrosswordData = {
  twoLetterWords: WordEntry[];
  threeLetterWords: WordEntry[];
  fourLetterWords: WordEntry[];
  fiveLetterWords: WordEntry[];
};

function readJsonFile(filePath: string): string {
  const fullPath = join(process.cwd(), filePath);
  console.log(`Reading file: ${fullPath}`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(fullPath, "utf8");
}

function parseJsonContent(content: string): WordEntry[] {
  try {
    const data = JSON.parse(content);
    const key = Object.keys(data)[0];
    const words = data[key];

    if (!Array.isArray(words)) {
      throw new Error("Invalid JSON structure: words array not found");
    }

    return words.map((entry: { word: string; clues: string[] }) => {
      if (!entry.word || !Array.isArray(entry.clues)) {
        throw new Error("Invalid word entry structure");
      }
      return {
        word: entry.word,
        clues: entry.clues,
      };
    });
  } catch (error) {
    console.error("Error parsing JSON content:", error);
    throw error;
  }
}

export async function getCrosswordData(): Promise<CrosswordData> {
  try {
    const files = {
      two: "src/data/crosswords/two-letters.json",
      three: "src/data/crosswords/three-letters.json",
      four: "src/data/crosswords/four-letters.json",
      five: "src/data/crosswords/five-letters.json",
    };

    console.log("Reading JSON files...");

    const twoLettersJson = readJsonFile(files.two);
    const threeLettersJson = readJsonFile(files.three);
    const fourLettersJson = readJsonFile(files.four);
    const fiveLettersJson = readJsonFile(files.five);

    console.log("Parsing JSON data...");

    const data = {
      twoLetterWords: parseJsonContent(twoLettersJson),
      threeLetterWords: parseJsonContent(threeLettersJson),
      fourLetterWords: parseJsonContent(fourLettersJson),
      fiveLetterWords: parseJsonContent(fiveLettersJson),
    };

    // Validate data structure
    if (
      !Array.isArray(data.twoLetterWords) ||
      !Array.isArray(data.threeLetterWords) ||
      !Array.isArray(data.fourLetterWords) ||
      !Array.isArray(data.fiveLetterWords)
    ) {
      console.error("Invalid data structure:", data);
      throw new Error("Invalid data structure in JSON files");
    }

    // Validate each word entry
    for (const [key, list] of Object.entries(data)) {
      console.log(`Validating ${key}...`);
      for (const entry of list) {
        if (!entry.word || !Array.isArray(entry.clues)) {
          console.error("Invalid entry in", key, ":", entry);
          throw new Error(`Invalid word entry structure in ${key}`);
        }
      }
    }

    console.log("Successfully loaded crossword data");
    console.log("Sample data:", {
      twoLetterCount: data.twoLetterWords.length,
      threeLetterCount: data.threeLetterWords.length,
      fourLetterCount: data.fourLetterWords.length,
      fiveLetterCount: data.fiveLetterWords.length,
    });

    return data;
  } catch (error) {
    console.error("Error reading crossword data:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to read crossword data: ${error.message}`
        : "Failed to read crossword data"
    );
  }
}
