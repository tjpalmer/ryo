import * as ts from 'typescript';

export interface Gen {
  sourceNode: ts.SourceFile;
  write: (text: string) => void;
}
