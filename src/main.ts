import * as fs from 'fs';
import * as ts from 'typescript';

function main() {

  // let service = ts.createLanguageService({
  //   getCompilationSettings: () => ({
  //     lib: ['lib.es2015.d.ts', 'src/std.d.ryo'],
  //     strict: true,
  //     types: [],
  //   }),
  //   getCurrentDirectory: process.cwd,
  //   getScriptFileNames: () => process.argv.slice(2),
  //   getScriptSnapshot: fileName => {
  //     if (!fs.existsSync(fileName)) {
  //       return undefined;
  //     }
  //     return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
  //   },
  //   getScriptVersion: fileName => '0',
  //   getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
  // });
  // console.log(service);

  // let program = ts.createProgram({
  //   options: {
  //     lib: ['lib.es2015.d.ts'],
  //     strict: true,
  //     types: [],
  //   },
  //   rootNames: process.argv.slice(2),
  // });
  let scriptName = process.argv[2];
  console.log(scriptName);
  let code = fs.readFileSync(scriptName).toString();
  console.log(code);
  let scriptNode =
    ts.createSourceFile(scriptName, code, ts.ScriptTarget.ES2015);
  let walker = new Walker({});
  walker.walk(scriptNode);

  // let ast = ts.createSourceFile("hi", source, ts.ScriptTarget.ES2015);
  // walk(ast);

  // console.log(ast);
  // console.log(ast.statements);

  // console.log(process.argv);
}

function write(x: string) {
  return process.stdout.write(x);
}

interface WalkerVars {

  // program: ts.Program;

}

class Walker implements WalkerVars {

  constructor(settings: WalkerVars) {
    // this.program = settings.program;
  }

  // get checker() {
  //   return this.program.getTypeChecker();
  // }

  indent() {
    for (let i = 0; i < this.indentLevel; ++i) {
      write('  ');
    }
  }

  indentLevel = 0;

  indented(block: () => void) {
    this.indentLevel += 1;
    try {
      block();
    } finally {
      this.indentLevel -= 1;
    }
  }

  // program: ts.Program;

  walk(node: ts.Node) {
    // let {checker} = this;
    let walk = (node: ts.Node) => this.walk(node);
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression: {
        let call = node as ts.CallExpression;
        // console.log('yo', checker.getSymbolAtLocation(call.expression));
        // throw 'hi';
        this.walk(call.expression);
        write('(');
        call.arguments.forEach(walk);
        write(')');
        break;
      }
      case ts.SyntaxKind.EndOfFileToken: {
        // Nothing to do here.
        break;
      }
      case ts.SyntaxKind.ExpressionStatement: {
        this.indent();
        ts.forEachChild(node, walk);
        write(';\n');
        break;
      }
      case ts.SyntaxKind.FunctionDeclaration: {
        let func = node as ts.FunctionDeclaration;
        let name = func.name && func.name.escapedText;
        let typeName = '?';
        if (func.type) {
          typeName = func.type.getText();
        } else {
          // let signature = checker.getSignatureFromDeclaration(func);
          // console.log(signature);
          // if (signature) {
          //   console.log('hi', checker.signatureToString(signature));
          //   // throw 'hi';
          //   let returnType = signature.getReturnType();
          //   if (returnType.flags & ts.TypeFlags.Boolean) {
          //     typeName = 'bool';
          //   } else if (returnType.flags & ts.TypeFlags.VoidLike) {
          //     typeName = 'void';
          //   }
          // }
        }
        // console.log(node);
        write(`${typeName} ${name}() {\n`);
        if (func.body) {
          this.indented(() => {
            func.body!.statements.forEach(walk);
          });
        }
        write(`}\n\n`);
        break;
      }
      case ts.SyntaxKind.Identifier: {
        let id = node as ts.Identifier;
        // console.log('id symbol', checker.getSymbolAtLocation(node));
        // this.program.getSemanticDiagnostics()
        // console.log('id type', checker.getTypeAtLocation(node));
        write(`${id.text}`);
        break;
      }
      case ts.SyntaxKind.NumericLiteral: {
        let num = node as ts.NumericLiteral;
        write(`${num.text}`);
        break;
      }
      case ts.SyntaxKind.PropertyAccessExpression: {
        let access = node as ts.PropertyAccessExpression;
        walk(access.expression);
        // console.log('access symbol', checker.getSymbolAtLocation(access));
        write(`.${access.name.text}`);
        break;
      }
      case ts.SyntaxKind.ReturnStatement: {
        let ret = node as ts.ReturnStatement;
        this.indent();
        write('return');
        if (ret.expression) {
          write(' ');
          walk(ret.expression);
        }
        write(';\n');
        break;
      }
      case ts.SyntaxKind.SourceFile: {
        ts.forEachChild(node, walk);
        break;
      }
      case ts.SyntaxKind.StringLiteral: {
        let str = node as ts.StringLiteral;
        // TODO Escape string contents.
        write(`"${str.text}"`);
        break;
      }
      case ts.SyntaxKind.TypeAliasDeclaration: {
        let decl = node as ts.TypeAliasDeclaration;
        let typeName = decl.type.getText();
        if (typeName == 'number') {
          typeName = 'double';
        }
        this.indent();
        write(`using ${decl.name.text} = ${typeName};\n\n`)
        break;
      }
      default: {
        console.log(node.kind, node);
        ts.forEachChild(node, walk);
        break;
      }
    }
  }

}

// const source = `
//   let x: string  = 'string';
//   function hi() {
//     console.log('hi');
//   }
// `;

// let result = ts.transpileModule(source, {
//   compilerOptions: {
//     module: ts.ModuleKind.ES2015,
//     target: ts.ScriptTarget.ES2015,
//   },
// });

// console.log(JSON.stringify(result));

main();
