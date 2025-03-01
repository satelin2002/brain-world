import { readFileSync } from "fs";
import { join } from "path";

// Mark this module as server-only
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function getCrosswordData(): Promise<CrosswordData> {
  const twoLettersJson = readFileSync(
    join(process.cwd(), "src/data/crosswords/two-letters.json"),
    "utf8"
  );
  const threeLettersJson = readFileSync(
    join(process.cwd(), "src/data/crosswords/three-letters.json"),
    "utf8"
  );
  const fourLettersJson = readFileSync(
    join(process.cwd(), "src/data/crosswords/four-letters.json"),
    "utf8"
  );
  const fiveLettersJson = readFileSync(
    join(process.cwd(), "src/data/crosswords/five-letters.json"),
    "utf8"
  );

  return {
    twoLetterWords: JSON.parse(twoLettersJson).two_letters,
    threeLetterWords: JSON.parse(threeLettersJson).three_letters,
    fourLetterWords: JSON.parse(fourLettersJson).four_letters,
    fiveLetterWords: JSON.parse(fiveLettersJson).five_letters,
  };
}
