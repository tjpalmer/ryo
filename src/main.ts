import * as options from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as cpp from './cpp';
import * as py from './py';
import {Gen} from './gen';

function main() {
  options
    .option('0.0.1', '-v, --version')
    .option('-o, --out [value]', 'Output file')
    .parse(process.argv);
  // Read and parse input.
  let scriptName = options.args[0];
  let code = fs.readFileSync(scriptName).toString();
  let sourceNode =
    ts.createSourceFile(scriptName, code, ts.ScriptTarget.ES2015);
  // Make output parent dir.
  let out = options.out as string;
  let parent = path.dirname(out);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, {recursive: true});
  }
  // Find generator.
  let extension = (out.match(/\.([^.]+)$/) || [''])[1];
  let mod = ({cpp, py} as any)[extension] as {generate(gen: Gen): void};
  // Generate.
  let outFile = fs.openSync(out, 'w');
  try {
    let write = (text: string) => fs.writeSync(outFile, text);
    mod.generate({sourceNode, write});
  } finally {
    fs.closeSync(outFile);
  }
}

main();
