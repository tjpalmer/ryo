time \
  node ./dist/main.js test/hello.ryo -o ./test/cpp/hello.cpp && \
  c++ -std=c++17 ./test/cpp/hello.cpp -o ./test/cpp/bin/hello && \
  ./test/cpp/bin/hello 2> ./test/cpp/out/hello.txt
