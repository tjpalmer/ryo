import * as ts from "typescript";

const source = `
  let x: string  = 'string';
  function hi() {
    console.log('hi');
  }
`;

let result = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2015,
    target: ts.ScriptTarget.ES2015,
  },
});

console.log(JSON.stringify(result));

let ast = ts.createSourceFile("hi", source, ts.ScriptTarget.ES2015);
console.log(ast);
console.log(ast.statements);

function process(node: ts.Node) {
  switch (node.kind) {
    case ts.SyntaxKind.FunctionDeclaration: {
      let func = node as ts.FunctionDeclaration;
      let name = func.name && func.name.escapedText;
      console.log(`Found a function: ${name}`);
      console.log(node);
      break;
    }
    case ts.SyntaxKind.NeverKeyword: {
      console.log('Aha!');
      break;
    }
    default: {
      console.log('Ignoring');
      break;
    }
  }
  ts.forEachChild(node, process);
}

process(ast);
