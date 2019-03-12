
#include <cstdint>
#include <iostream>
#include <string>

#define ryo_trace(message) (::std::cerr << (message) << " (" << __FILE__ << "#" << __LINE__ << ")" << ::std::endl)

using Result = int;

struct Point;

Result main();
::std::int32_t after(const ::std::int32_t x);
double norm2(const Point& point);

struct Point {
  float x;
  float y;
};

Result main() {
  const ::std::int32_t x = 3;
  const auto y = -3.5;
  ryo_trace("Hello!");
  ryo_trace(after(x));
  ryo_trace(after(y));
  const Point point = {4, y};
  ryo_trace(norm2(point));
  return 0;
}

::std::int32_t after(const ::std::int32_t x) {
  return ::std::int32_t(x + 1);
}

double norm2(const Point& point) {
  return point.x * point.x + point.y * point.y;
}

