export type ParserZodEsque<TInput, TParsedInput> = {
  _input: TInput;
  _output: TParsedInput;
};

export type ParserMyZodEsque<TInput> = {
  parse: (input: any) => TInput;
};

export type ParserSuperstructEsque<TInput> = {
  create: (input: unknown) => TInput;
};

export type ParserCustomValidatorEsque<TInput> = (
  input: unknown,
) => TInput | Promise<TInput>;

export type ParserYupEsque<TInput> = {
  validateSync: (input: unknown) => TInput;
};
export type Parser<TInput> =
  | ParserYupEsque<TInput>
  | ParserSuperstructEsque<TInput>
  | ParserCustomValidatorEsque<TInput>
  | ParserMyZodEsque<TInput>;

export type ParserWithInputOutput<TInput, TParsedInput> = ParserZodEsque<
  TInput,
  TParsedInput
>;
