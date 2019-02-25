
#include <cstdint>
#include <iostream>
#include <string>

#define ryo_trace(message) (::std::cerr << (message) << " (" << __FILE__ << "#" << __LINE__ << ")" << ::std::endl)

using Result = int;

::std::int32_t after(const ::std::int32_t x) {
  return x + 1;
}

Result main() {
  const ::std::int32_t x = 3;
  const auto y = -3;
  ryo_trace("Hello!");
  ryo_trace(after(x));
  ryo_trace(after(y));
  return 0;
}

