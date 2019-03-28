// These declarations are for typescript tooling convenience.


function identity<Item>(item: Item) {
  return item;
}

// Tags

export type keep<Item> = Item & (any extends infer keep ? keep : never);
export type mut<Item> = Item & (any extends infer mut ? mut : never);
export type own<Item> = Item & (any extends infer own ? own : never);
export type take<Item> = Item & (any extends infer take ? take : never);
export type Try<Item> = Item & (any extends infer Try ? Try : never);

export const base = identity as
  (<Item>(item: keep<Item>) => Item) |
  (<Item>(item: mut<Item>) => Item);
export const disown = identity as <Item>(item: own<Item>) => Item;
export const drop = identity as <Item>(item: own<Item>) => Item;
export const give = identity as <Item>(item: own<Item>) => take<Item>;
export const keep = identity as <Item>(item: own<Item>) => Item;
export const lend = identity as
  (<Item>(item: Item) => keep<Item>) |
  (<Item>(item: own<Item>) => keep<Item>);
export const mut = identity as <Item>(item: Item) => mut<Item>;
export const own = identity as 
  (<Item>(item: Item) => own<Item>) |
  (<Item>(item: take<Item>) => own<Item>);


// Numbers

export type f32 = any extends infer f32 ? f32 : never;
export type f64 = number;

export type i8 = number;
export type i16 = number;
export type i32 = any extends infer i32 ? i32 : never;
export type i64 = number;

export type int = any extends infer int ? int : never;

export type u8 = number;
export type u16 = number;
export type u32 = number;
export type u64 = number;

export function f32(x: number) {
  return Math.fround(x) as unknown as f32;
}
f32.add = (x: f32, y: f32) => f32(toNumber(x) + toNumber(y));
f32.mul = (x: f32, y: f32) => f32(toNumber(x) * toNumber(y));

export function i32(x: f32 | number) {
  return (toNumber(x) | 0) as unknown as i32;
}
i32.add = (x: i32, y: i32) => i32(toNumber(x) + toNumber(y));
i32.mul = (x: i32, y: i32) => i32(toNumber(x) * toNumber(y));

// In js, i32 is the best representation for int, but we need different typing.
export const int = i32 as unknown as ((x: f32 | number) => int) & {
  add: (x: int, y: int) => int;
  mul: (x: int, y: int) => int;
};

export const toNumber = identity as (x: f32 | i32 | int | number) => number;


// Utility

// TODO Instead compile `console.log` itself to something else in c++.
export function trace(message: any): void {
  console.log(message);
}
