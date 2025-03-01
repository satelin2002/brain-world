declare module "word-definition" {
  interface WordDefinition {
    getDef(
      word: string,
      lang: string,
      options: any,
      callback: (err: Error | null, def: { definition: string } | null) => void
    ): void;
  }

  const wordDefinition: WordDefinition;
  export default wordDefinition;
}
