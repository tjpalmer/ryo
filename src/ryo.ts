// These declarations are for typescript tooling convenience.

export type f32 = number;
export type f64 = number;

export type i8 = number;
export type i16 = number;
export type i32 = number;
export type i64 = number;

export type int = number;

export type u8 = number;
export type u16 = number;
export type u32 = number;
export type u64 = number;

export function i32(x: number): i32 {
  return x | 0;
}

export function trace(message: any): void {
  console.log(message);
}
