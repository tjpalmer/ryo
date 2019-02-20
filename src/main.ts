import * as fs from 'fs';
import * as ts from 'typescript';
import * as cpp from './cpp';

function main() {

  let scriptName = process.argv[2];
  // console.log(scriptName);
  let code = fs.readFileSync(scriptName).toString();
  // console.log(code);
  let sourceNode =
    ts.createSourceFile(scriptName, code, ts.ScriptTarget.ES2015);
  // console.log(scriptNode.text);
  cpp.generate({sourceNode, write});

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

  // let ast = ts.createSourceFile("hi", source, ts.ScriptTarget.ES2015);
  // walk(ast);

  // console.log(ast);
  // console.log(ast.statements);

  // console.log(process.argv);
}

export function write(x: string) {
  return process.stdout.write(x);
}

main();
