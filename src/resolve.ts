import * as ts from 'typescript';

export interface Program {

  // Definitions of entities, whether types or values.
  defs: Map<ts.Node, Entity>;

  // Types of entities, especially important for composite expressions.
  types: Map<ts.Node, Entity>;

}

export interface Scope {
  parent?: Scope;
  types: {[name: string]: Entity};
  values: {[name: string]: Value};
}

export interface Entity {
  name?: string;
  node?: ts.Node;
}

// export interface Type extends Entity {}

export interface Value extends Entity {
  type?: Entity;
}

export let globals: Scope = {
  types: {
    f32: {name: 'f32'},
    f64: {name: 'f64'},
    i8: {name: 'i8'},
    i16: {name: 'i16'},
    i32: {name: 'i32'},
    i64: {name: 'i64'},
    int: {name: 'int'},
    u8: {name: 'u8'},
    u16: {name: 'u16'},
    u32: {name: 'u32'},
    u64: {name: 'u64'},
    string: {name: 'string'},
    void: {name: 'void'},
  },
  values: {
    trace: {name: 'trace', type: {}},
  },
};

export function resolve(node: ts.SourceFile): Program {
  let program: Program = {defs: new Map(), types: new Map()};
  let walker = new ResolveWalker({program});
  // TODO Save finished empty scopes for reuse to avoid useless allocation.
  // TODO Would just need to change out the parent.
  walker.walk(node, {parent: globals, types: {}, values: {}});
  return program;
}

type ResolveWalkerVars = {program: Program};

class ResolveWalker {

  constructor(vars: ResolveWalkerVars) {
    this.program = vars.program;
  }

  program: Program;

  walk(node: ts.Node, scope: Scope) {
    // Unchanged scope by default.
    let walk = (node: ts.Node) => this.walk(node, scope);
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile: {
        ts.forEachChild(node, walk);
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
