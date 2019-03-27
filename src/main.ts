import * as options from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as cpp from './cpp';
import * as py from './py';
import {Gen} from './gen';
import {resolve} from './resolve';

function main() {
  options
    .option('0.0.1', '-v, --version')
    .option('-o, --out [value]', 'Output file')
    .parse(process.argv);
  // Read and parse input.
  let scriptName = options.args[0];
  // let code = fs.readFileSync(scriptName).toString();
  // Make output parent dir.
  let out = options.out as string;
  let parent = path.dirname(out);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, {recursive: true});
  }
  // Parse and resolve.
  // let sourceNode =
  //   ts.createSourceFile(scriptName, code, ts.ScriptTarget.ES2015);
  let other = ts.createProgram([scriptName], {
    paths: {ryo: [path.resolve('./src/ryo.ts')]},
    target: ts.ScriptTarget.ES2015,
  });
  if (false) {
    console.log(other.getSourceFiles().map(node => node.fileName));
    console.log(path.resolve('./src/ryo.ts'));
    return;
  }
  let sourceNode = other.getSourceFile(scriptName)!;
  let program = resolve(sourceNode);
  if (false) {
    console.log(program.global.kids[0]);
    program.global.kids[0].kids.forEach(kid => console.log(kid));
    return;
  }
  // Find generator.
  let extension = (out.match(/\.([^.]+)$/) || [''])[1];
  let mod = ({cpp, py} as any)[extension] as {generate(gen: Gen): void};
  // Generate.
  let outFile = fs.openSync(out, 'w');
  try {
    let write = (text: string) => fs.writeSync(outFile, text);
    mod.generate({checker: other.getTypeChecker(), program, sourceNode, write});
  } finally {
    fs.closeSync(outFile);
  }
}

main();
