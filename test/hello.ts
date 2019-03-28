import {f32, i32, int, own, trace} from 'ryo';

type Result = int;

class Point {
  // TODO Remove the need for explicit types here.
  x: f32 = f32(0);
  y: f32 = f32(0);
}

function main(): Result {
  let x = i32(3);
  let y = f32(-3.5);
  trace('Hello!');
  trace(after(x));
  trace(after(i32(y)));
  let point: Point = {x: f32(4), y};
  // Way to embed an object literal as an expression with out of order properties.
  // Of course, if we are sure about no side effects, we can reorder operations.
  // let point: Point = {y: something(), x: other()};
  // const Point point = ([](){float y = something(); float x = other(); return Point {x, y};})();
  // const Point point = ([](){float y = something(); return Point {other(), y};})();
  trace(norm2(point));
  // let p2 = own({x: f32(4), y} as Point);
  // handOff(give(point));
  return int(0);
}

function after(x: i32): i32 { // TODO No need for explicit return type!
  return i32.add(x, i32(1));
}

// function handOff(point: take<Point>) {}

function norm2(point: Point): f32 { // TODO No need for explicit return type!
  return f32.add(f32.mul(point.x, point.x), f32.mul(point.y, point.y));
}

main();
