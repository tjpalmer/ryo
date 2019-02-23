
#include <cstdint>
#include <iostream>
#include <string>

#define ryo_trace(message) (::std::cerr << (message) << " (" << __FILE__ << "#" << __LINE__ << ")" << ::std::endl)

using Result = int;

::std::int32_t after(::std::int32_t x) {
  return x + 1;
}

Result main() {
  ::std::int32_t x = 3;
  ryo_trace("Hello!");
  ryo_trace(after(x));
  return 0;
}

