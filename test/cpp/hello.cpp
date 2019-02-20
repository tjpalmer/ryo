
#include <cstdint>
#include <iostream>
#include <string>

using f32 = float;
using f64 = double;

using i8 = ::std::int8_t;
using i16 = ::std::int16_t;
using i32 = ::std::int32_t;
using i64 = ::std::int64_t;

using u8 = ::std::uint8_t;
using u16 = ::std::uint16_t;
using u32 = ::std::uint32_t;
using u64 = ::std::uint64_t;

void trace(const std::string& text) {
  std::cout << text << std::endl;
}

using Result = i32;

Result main() {
  trace("Hello!");
  return 0;
}

