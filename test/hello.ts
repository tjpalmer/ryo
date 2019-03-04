import {f64, i32, int, trace} from "../src/ryo";

type Result = int;

class Point {
  x: f64 = 0;
  y: f64 = 0;
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
  // let point: Point = {y: something(), x: other};
  // const Point point = ([]() {double y = 2; double x = y + 1; return Point {x, y};})();
  trace(norm2(point));
  return 0;
}

function after(x: i32): i32 {
  return x + 1;
}

function norm2(point: Point): f64 {
  return point.x * point.x + point.y * point.y;
}

main();
