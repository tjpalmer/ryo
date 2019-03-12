import * as ts from 'typescript';
import {Program} from './resolve';

export interface Gen {
  program: Program;
  sourceNode: ts.SourceFile;
  write: (text: string) => void;
}

export class GenWalker implements GenWalkerVars {

  constructor(settings: GenWalkerVars) {
    this.gen = settings.gen;
  }

  gen: Gen;

  indent() {
    for (let i = 0; i < this.indentLevel; ++i) {
      this.gen.write(this.indentText);
    }
  }

  indentLevel = 0;

  indentText = '  ';

  indented(block: () => void) {
    this.indentLevel += 1;
    try {
      block();
    } finally {
      this.indentLevel -= 1;
    }
  }

}

export interface GenWalkerVars {
  gen: Gen;
}
