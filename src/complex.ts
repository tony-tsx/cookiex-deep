import { Assigner } from "./assigner"

const complex = ( delegations: complex.Delegations ) => {
  return Assigner( ( a, b ) => {
    if ( delegations[`${complex.typeof( a )}-${complex.typeof( b )}`] )
      return delegations[`${complex.typeof( a )}-${complex.typeof( b )}`]( a, b )
    else if ( delegations[`${complex.typeof( a )}-any`] )
      return delegations[`${complex.typeof( a )}-any`]( a, b )
    else if ( delegations[`any-${complex.typeof( b )}`] )
      return delegations[`any-${complex.typeof( b )}`]( a, b )
    else if ( delegations[`any-any`] )
      return delegations[`any-any`]( a, b )
    else return b
  }, false )
}

complex.typeof = ( value: any ): complex.Types =>
  Array.isArray( value ) ? 'array' :
  value === null ? 'null' : typeof value

declare namespace complex {
  export interface Map {
    number: number
    bigint: bigint
    boolean: boolean
    function: Function
    object: object
    string: string
    symbol: symbol
    undefined: undefined
    array: any[]
    null: null
    any: any
  }
  export type Types = keyof Map
  export type A<T extends `${Types}-${Types}`> = T extends `${infer R}-${infer P}`
    ? R extends Types
      ? P extends Types
        ? ( a: Map[R], b: Map[P] ) => Map[R] | Map[P]
        : never
      : never
    : never
  export type Delegations = {
    [K in Types as `${K}-${Types}`]?: A<`${K}-${Types}`>
  }
}

export { complex }