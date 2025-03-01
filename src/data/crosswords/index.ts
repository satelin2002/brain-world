// Type definitions for crossword data
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
