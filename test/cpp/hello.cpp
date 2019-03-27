
#include <cstdint>
#include <iostream>
#include <string>

#define ryo_trace(message) (::std::cerr << (message) << " (" << __FILE__ << "#" << __LINE__ << ")" << ::std::endl)

using Result = int;

struct Point;

Result main();
::std::int32_t after(const ::std::int32_t x);
float norm2(const Point& point);

struct Point {
  float x = float(0);
  float y = float(0);
};

Result main() {
  const auto x = ::std::int32_t(3);
  const auto y = float(-3.5);
  ryo_trace("Hello!");
  ryo_trace(after(x));
  ryo_trace(after(::std::int32_t(y)));
  const Point point = {float(4), y};
  ryo_trace(norm2(point));
  return int(0);
}

::std::int32_t after(const ::std::int32_t x) {
  return ::std::int32_t.add(x, ::std::int32_t(1));
}

float norm2(const Point& point) {
  return float.add(float.mul(point.x, point.x), float.mul(point.y, point.y));
}

