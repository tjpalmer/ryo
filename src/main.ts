import * as ts from "typescript";

const source = `
  let x: string  = 'string';
  function hi() {
    console.log('hi');
  }
`;

// let result = ts.transpileModule(source, {
//   compilerOptions: {
//     module: ts.ModuleKind.ES2015,
//     target: ts.ScriptTarget.ES2015,
//   },
// });

// console.log(JSON.stringify(result));

let program = ts.createProgram({
  options: {
    lib: ['lib.es2015.d.ts'],
    strict: true,
    types: [],
  },
  rootNames: process.argv.slice(2),
});
program.getSourceFiles().forEach(file => {
  console.log(file.fileName);
  if (!file.isDeclarationFile) {
    walk(file);
  }
});

// let ast = ts.createSourceFile("hi", source, ts.ScriptTarget.ES2015);
// walk(ast);

// console.log(ast);
// console.log(ast.statements);

console.log("Hi");
console.log(process.argv);

function write(x: string) {
  return process.stdout.write(x);
}

function walk(node: ts.Node) {
  switch (node.kind) {
    case ts.SyntaxKind.CallExpression: {
      let call = node as ts.CallExpression;
      walk(call.expression);
      write('(');
      call.arguments.forEach(node => walk(node));
      write(')');
      break;
    }
    case ts.SyntaxKind.ExpressionStatement: {
      ts.forEachChild(node, walk);
      write(';\n');
      break;
    }
    case ts.SyntaxKind.FunctionDeclaration: {
      let func = node as ts.FunctionDeclaration;
      let name = func.name && func.name.escapedText;
      let type = func.type || 'void';
      console.log(node);
      write(`${type} ${name}() {\n`);
      if (func.body) {
        // console.log(func.body);
        func.body.statements.forEach(node => walk(node));
      }
      write(`}\n`);
      break;
    }
    case ts.SyntaxKind.StringLiteral: {
      let str = node as ts.StringLiteral;
      // TODO Escape string contents.
      write(`"${str.text}"`);
      break;
    }
    default: {
      console.log(node);
      ts.forEachChild(node, walk);
      break;
    }
  }
}
