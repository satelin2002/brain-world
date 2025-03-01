declare module "word-definition" {
  export interface WordDefinition {
    word: string;
    phonetic?: string;
    meanings: {
      partOfSpeech: string;
      definitions: {
        definition: string;
        example?: string;
        synonyms?: string[];
        antonyms?: string[];
      }[];
    }[];
  }

  const wordDefinition: WordDefinition;
  export default wordDefinition;
}
