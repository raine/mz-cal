export declare class Tagged<N extends string> {
  protected _nominal_: N
}

export type Nominal<T, N extends string> = T & Tagged<N>
