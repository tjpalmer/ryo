
#include <cstdint>
#include <iostream>
#include <string>

#define ryo_trace(message) (::std::cerr << (message) << " (" << __FILE__ << "#" << __LINE__ << ")" << ::std::endl)

using Result = int;

Result main() {
  ::std::int32_t x = 3;
  ryo_trace("Hello!");
  ryo_trace(x);
  return 0;
}

