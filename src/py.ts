import * as ts from 'typescript';
import {Gen, GenWalker, GenWalkerVars} from './gen';

export function generate(gen: Gen) {
  gen.write(prelude);
  let walker = new Walker({gen});
  walker.walk(gen.sourceNode);
}

let prelude = `
def trace(text: str):
    from sys import stderr
    print(text, file=stderr)

`;

class Walker extends GenWalker {

  constructor(settings: GenWalkerVars) {
    super(settings);
    // PEP8 says 4 spaces.
    this.indentText = '    ';
  }

  walk(node: ts.Node) {
    // TODO Generate. See how to combine with cpp at all?
  }

}
