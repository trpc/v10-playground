/**
 * @internal
 */
export interface Params<
  TContextIn = unknown,
  TContextOut = unknown,
  TInputIn = unknown,
  TInputOut = unknown,
  TOutputIn = unknown,
  TOutputOut = unknown,
> {
  /**
   * @internal
   */
  _ctx_in: TContextIn;
  /**
   * @internal
   */
  _ctx_out: TContextOut;
  /**
   * @internal
   */
  _output_in: TOutputIn;
  /**
   * @internal
   */
  _output_out: TOutputOut;
  /**
   * @internal
   */
  _input_in: TInputIn;
  /**
   * @internal
   */
  _input_out: TInputOut;
}
