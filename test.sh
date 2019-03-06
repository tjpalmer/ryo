time (
  node ./dist/src/main.js test/hello.ts -o ./test/cpp/hello.cpp && \
  mkdir -p ./test/cpp/bin && \
  c++ -std=c++17 ./test/cpp/hello.cpp -o ./test/cpp/bin/hello && \
  ./test/cpp/bin/hello 2> ./test/cpp/out/hello.txt)
