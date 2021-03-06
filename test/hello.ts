import {f32, i32, int, trace} from 'ryo';

type Result = int;

class Point {
  x: f32 = 0;
  y: f32 = 0;
}

function main(): Result {
  let x: i32 = 3;
  let y = -3.5;
  trace('Hello!');
  trace(after(x));
  trace(after(y));
  let point: Point = {x: 4, y};
  // Way to embed an object literal as an expression with out of order properties.
  // Of course, if we are sure about no side effects, we can reorder operations.
  // let point: Point = {y: something(), x: other()};
  // const Point point = ([](){double y = something(); double x = other(); return Point {x, y};})();
  // const Point point = ([](){double y = something(); return Point {other(), y};})();
  trace(norm2(point));
  return 0;
}

function after(x: i32): i32 {
  return i32(x + 1);
}

function norm2(point: Point): number {
  return point.x * point.x + point.y * point.y;
}

main();
