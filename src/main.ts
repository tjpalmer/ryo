import * as fs from 'fs';
import * as ts from 'typescript';

function main() {

  let service = ts.createLanguageService({
    getCompilationSettings: () => ({
      lib: ['lib.es2015.d.ts'],
      strict: true,
      types: [],
    }),
    getCurrentDirectory: process.cwd,
    getScriptFileNames: () => process.argv.slice(2),
    getScriptSnapshot: fileName => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getScriptVersion: fileName => '0',
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
  });
  console.log(service);

  // let program = ts.createProgram({
  //   options: {
  //     lib: ['lib.es2015.d.ts'],
  //     strict: true,
  //     types: [],
  //   },
  //   rootNames: process.argv.slice(2),
  // });
  let program = service.getProgram()!;
  program.getSourceFiles().forEach(file => {
    console.log(file.fileName);
    let walker = new Walker({program});
    walker.program = program;
    if (!file.isDeclarationFile) {
      let def = service.getDefinitionAtPosition(file.fileName, 39);
      console.log('def', def);
      throw 'hi';
      walker.walk(file);
    }
  });

  // let ast = ts.createSourceFile("hi", source, ts.ScriptTarget.ES2015);
  // walk(ast);

  // console.log(ast);
  // console.log(ast.statements);

  console.log("Hi");
  console.log(process.argv);
}

function write(x: string) {
  return process.stdout.write(x);
}

interface WalkerVars {

  program: ts.Program;

}

class Walker implements WalkerVars {

  constructor(settings: WalkerVars) {
    this.program = settings.program;
  }

  get checker() {
    return this.program.getTypeChecker();
  }

  program: ts.Program;

  walk(node: ts.Node) {
    let {checker} = this;
    let walk = (node: ts.Node) => this.walk(node);
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression: {
        let call = node as ts.CallExpression;
        this.walk(call.expression);
        write('(');
        call.arguments.forEach(walk);
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
        let typeName = func.type || 'void';
        let signature = checker.getSignatureFromDeclaration(func);
        console.log(signature);
        if (signature) {
          let returnType = checker.signatureToString(signature);
          // console.log('hi', returnType);
          // throw 'hi';
        }
        ts.forEachChild(node, walk);
        if (func.type) {
          // checker.ref
          // let hi = ts.GoToDefinition.getDefinitionAtPosition(this.program, node.getSourceFile(), func.type.pos);
          console.log('hi', checker.getSymbolAtLocation(func.type));
          console.log(func.getChildren());
          // throw 'hi';
          let type = checker.getTypeFromTypeNode(func.type);
          console.log(func.type);
          console.log(type);
          if (type.flags & ts.TypeFlags.Boolean) {
            typeName = 'bool';
          } else {
            typeName = (func.type as any).typeName.escapedText;
          }
        } else {
          typeName = 'void';
        }
        console.log(node);
        write(`${typeName} ${name}() {\n`);
        if (func.body) {
          // console.log(func.body);
          // func.body.statements.forEach(walk);
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
      case ts.SyntaxKind.TypeReference: {
        let ref = node as unknown as ts.TypeReference;
        console.log(node);
        console.log('hi', ref.target, ref.aliasSymbol, ref.symbol, checker.getSymbolAtLocation(node));
        console.log(node.getText());
        throw 'hi';
        break;
      }
      default: {
        console.log(node);
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
