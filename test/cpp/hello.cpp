
#include <cstdint>
#include <iostream>
#include <string>

namespace ryo {

void trace(const std::string& text) {
  ::std::cerr << text << ::std::endl;
}

}  // namespace ryo

using Result = int;

Result main() {
  ::ryo::trace("Hello!");
  return 0;
}

