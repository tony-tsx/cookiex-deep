import { Assigner } from './assigner'

const deep: deep = Assigner( ( a, b ) => {
  if ( typeof b === 'object' || typeof a === 'object' )
    if ( Array.isArray( a ) )
      if ( Array.isArray( b ) ) return [ ...a, ...b ]

      else if ( Object.keys( b ).every( key => typeof key === 'number' ) )
        return deep( a, b )

      else return [ ...a, b ]

    else if ( Array.isArray( b ) )
      return [ a, ...b ]

    else if ( typeof b === 'object' && typeof a === 'object' )
      return deep( a, b )

  return b
} ) as any

const deepers: { [K in keyof deep.methods<any, any>]: ( target: any, ...args: any[] ) => any } = {
  default: deep
}

deep.register = <
  K extends keyof deep.methods<any, any>,
  L = any,
  R = any,
  T extends ( left: L, right: R ) => any = ( left: L, right: R ) => any
>( method: K, assigner: T ) => {
  return deepers[method] = Assigner( assigner )
}

deep.invoke = <
  K extends keyof deep.methods<any, any>,
  T,
  A extends any[]
>( method: K, target: T, ...args: A ) => {
  if ( method in deepers )
    return deepers[method]( target, ...args )
  throw new Error( `${method} not exists to call ( ${Object.keys( deepers )} )` );
  }

interface deep {
  <T, A extends any[]>( target: T, ...args: A ): deep.Deep<[ T, ...A ]>
  register<
    K extends keyof deep.methods<any, any>,
    L = any,
    R = any,
    T extends ( left: L, right: R ) => any = ( left: L, right: R ) => any
  >( method: K, deeper: T ): <T, A extends any[]>( target: T, ...args: A ) => deep.DeepCall<K, [T, ...A]>
  invoke<
    K extends keyof deep.methods<any, any>,
    T,
    A extends any[]
  >( method: K, target: T, ...args: A ): deep.DeepCall<K, [T, ...A]>
}

declare namespace deep {
  type DefaultFutureIndex = [1,2,3,4,5,6,7,8,9,10,-1]

  export interface methods<L, R> extends DeepMethods<L, R> {
    default: L extends any[] | readonly any[]
      ? R extends any[] | readonly any[] ? [ ...L, ...R ] : [ ...L, R ]
      : R extends any[] | readonly any[] ? [ L, ...R ] :
        L extends { [key: string]: any }
          ? R extends { [key: string]: any } ?
            & { [K in keyof L]: K extends keyof R ? methods<L[K], R[K]>['default'] : L[K] }
            & { [K in keyof R]: K extends keyof L ? methods<L[K], R[K]>['default'] : R[K] }
            : R
          : R
  }

  export type DeepCall<
    K extends keyof methods<any, any>,
    T extends any[],
    I extends number = 0,
    F extends number[] = DefaultFutureIndex
  > = I extends F[I] ? never :
    F[I] extends -1 ? T[I] :
    T[F[I]] extends undefined ? T[I] :
    methods<T[I], DeepCall<K, T, F[I], F>>[K]
    
  export type Deep<T extends any[], I extends number = 0, F extends number[] = DefaultFutureIndex> = 
    DeepCall<'default', T, I, F>
}

declare global {
  /**
   * properties in this interface are the registered methods.
   * If you use typescript and don't register the methods here, you will receive an error!
   */
  export interface DeepMethods<L, R> {}
}

export { deep, Assigner }
export default deep
