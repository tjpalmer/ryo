import * as ts from 'typescript';
import { write } from 'fs';

export interface Program {

  // Definitions of entities, whether types or values.
  defs: Map<ts.Node, Entity>;

  entities: Map<ts.Node, Entity>;

  global: Scope;

  // Types of entities, especially important for composite expressions.
  types: Map<ts.Node, Entity>;

}

export interface Scope {
  kids: Scope[];
  parent?: Scope;
  refs: Ref[];
  // Two different namespaces, where classes end up in both.
  types: {[name: string]: Entity};
  values: {[name: string]: Value};
}

export interface Entity {
  def?: Entity;
  isType?: boolean;
  isValue?: boolean;
  name?: string;
  node?: ts.Node;
}

export interface Ref extends Entity {
  def: Entity | undefined;
}

// export interface Type extends Entity {}

export interface Value extends Entity {
  type?: Entity;
}

export function resolve(node: ts.SourceFile): Program {
  let program: Program = {
    defs: new Map(),
    entities: new Map(),
    // TODO No new globals?? Still need console, probably.
    global: {
      kids: [],
      refs: [],
      types: {
        // f32: {name: 'f32'},
        // f64: {name: 'f64'},
        // i8: {name: 'i8'},
        // i16: {name: 'i16'},
        // i32: {name: 'i32'},
        // i64: {name: 'i64'},
        // int: {name: 'int'},
        // u8: {name: 'u8'},
        // u16: {name: 'u16'},
        // u32: {name: 'u32'},
        // u64: {name: 'u64'},
        // string: {name: 'string'},
        // void: {name: 'void'},
      },
      values: {
        // i32: {name: 'i32', type: {
        //   // TODO Plan how to describe function types.
        // }},
        // trace: {name: 'trace', type: {
        //   // TODO Plan how to describe function types.
        // }},
      },
    },
    types: new Map(),
  };
  let defWalker = new DefWalker({program});
  // TODO Save finished empty scopes for reuse to avoid useless allocation.
  // TODO Would just need to change out the parent.
  defWalker.walk(node, makeScope(program.global));
  new RefWalker().walk(program.global);
  return program;
}

type DefWalkerVars = {program: Program};

class DefWalker {

  constructor(vars: DefWalkerVars) {
    this.program = vars.program;
  }

  program: Program;

  walk(node: ts.Node, scope: Scope) {
    // Unchanged scope by default.
    let walk = (node: ts.Node) => this.walk(node, scope);
    switch (node.kind) {
      case ts.SyntaxKind.Block: {
        let block = node as ts.Block;
        let parent = makeScope(scope);
        block.statements.forEach(kid => this.walk(kid, parent));
        break;
      }
      case ts.SyntaxKind.ClassDeclaration: {
        let decl = node as ts.ClassDeclaration;
        this.putDef(scope, {
          isType: true, isValue: true, name: decl.name!.text, node,
        });
        break;
      }
      case ts.SyntaxKind.EndOfFileToken:
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.PlusToken:
      case ts.SyntaxKind.StringLiteral: {
        // Nothing to do here.
        break;
      }
      case ts.SyntaxKind.FunctionDeclaration: {
        let decl = node as ts.FunctionDeclaration;
        let kidScope: Scope;
        let parent = scope;
        if (decl.parameters.length || decl.typeParameters) {
          parent = makeScope(parent);
          if (decl.typeParameters) {
            decl.typeParameters.forEach(param => {
              this.putDef(parent, {
                isType: true, name: param.name.text, node: param,
              });
            });
          }
          decl.parameters.forEach(param => {
            if (param.name.kind == ts.SyntaxKind.Identifier) {
              let name = param.name as ts.Identifier;
              // TODO Parameter type.
              this.putDef(parent, {
                isValue: true, name: name.text, node: param,
              });
            }
            if (param.type) {
              walk(param.type);
            }
          });
        }
        // let type: Entity | undefined = undefined;
        if (decl.type) {
          // TODO We don't return or store the reference in an accessible way.
          // TODO Figure out the plan.
          this.walk(decl.type, parent);
          // type = this.program.defs.get(decl.type);
        }
        this.putDef(scope, {
          isValue: true, name: decl.name!.text, node, type: {node: decl},
        });
        if (decl.body) {
          this.walk(decl.body, parent);
        }
        break;
      }
      case ts.SyntaxKind.Identifier: {
        let id = node as ts.Identifier;
        // Type references should be handled elsewhere, so these should be
        // value references.
        this.putRef(scope, {
          def: undefined, isValue: true, name: id.text, node,
        });
        break;
      }
      case ts.SyntaxKind.ImportSpecifier: {
        let spec = node as ts.ImportSpecifier;
        // TODO Track imports in a separate collection?
        // TODO Track propertyName there, too.
        this.putDef(scope, {
          // Claim both type and value, but we don't actually know without
          // inspection.
          // TypeScript knows how to make the distinction.
          isType: true, isValue: true, name: spec.name.text, node,
        });
        break;
      }
      // case ts.SyntaxKind.PropertyAccessExpression: {
      //   // TODO Change the scope to that of the object being accessed.
      //   break;
      // }
      case ts.SyntaxKind.TypeAliasDeclaration: {
        let decl = node as ts.TypeAliasDeclaration;
        // TODO Walk to define members for inline struct definitions?
        // walk(decl.type);
        this.putDef(scope, {isType: true, name: decl.name.text, node});
        break;
      }
      case ts.SyntaxKind.TypeReference: {
        let ref = node as ts.TypeReferenceNode;
        // TODO QualifiedName support.
        let name = ref.typeName as ts.Identifier;
        this.putRef(scope, {
          def: undefined, isType: true, name: name.text, node,
        });
        break;
      }
      case ts.SyntaxKind.VariableStatement: {
        let statement = node as ts.VariableStatement;
        statement.declarationList.declarations.forEach(decl => {
          // TODO Destructuring.
          if (decl.name.kind == ts.SyntaxKind.Identifier) {
            let name = decl.name as ts.Identifier;
            this.putDef(scope, {isValue: true, name: name.text, node: decl});
            // TODO Assign the type somehow.
            if (decl.type) {
              walk(decl.type);
            }
            if (decl.initializer) {
              walk(decl.initializer);
            }
          }
        });
        break;
      }
      default: {
        // TODO Eventually remove this switch.
        switch (node.kind) {
          case ts.SyntaxKind.BinaryExpression:
          case ts.SyntaxKind.CallExpression:
          case ts.SyntaxKind.ExpressionStatement:
          case ts.SyntaxKind.ImportClause:
          case ts.SyntaxKind.ImportDeclaration:
          case ts.SyntaxKind.NamedImports:
          case ts.SyntaxKind.PrefixUnaryExpression:
          case ts.SyntaxKind.ReturnStatement:
          case ts.SyntaxKind.SourceFile: {
            // These need no special treatment, but keeping here to track which
            // we've sanitized.
            break;
          }
          default: {
            console.log(`unhandled def ${ts.SyntaxKind[node.kind]}`);
            // console.log(node);
            break;
          }
        }
        // Walk kids.
        ts.forEachChild(node, walk);
        break;
      }
    }
  }

  putDef(scope: Scope, entity: Entity | Value) {
    this.program.defs.set(entity.node!, entity);
    this.program.entities.set(entity.node!, entity);
    this.putInScope(scope, entity);
  }

  putRef(scope: Scope, ref: Ref) {
    this.program.entities.set(ref.node!, ref);
    scope.refs.push(ref);
  }

  putInScope(scope: Scope, entity: Entity) {
    if (entity.isType) {
      scope.types[entity.name!] = entity;
    }
    if (entity.isValue) {
      scope.values[entity.name!] = entity;
    }
  }

  putType(scope: Scope, entity: Entity) {
    this.program.types.set(entity.node!, entity);
    this.putInScope(scope, entity);
  }

}

class RefWalker {

  walk(scope: Scope) {
    scope.refs.forEach(ref => {
      findDef(scope, ref);
    });
    scope.kids.forEach(kid => {
      this.walk(kid);
    });
  }

}

function findDef(scope: Scope, ref: Ref) {
  // Branch once up front instead of at each recursion.
  let def = ref.isType ? findDefType(scope, ref) : findDefValue(scope, ref);
  ref.def = def;
  // console.log(ref);
  return def;
}

function findDefType(scope: Scope, ref: Ref): Entity | undefined {
  let def = scope.types[ref.name!];
  if (def) {
    return def;
  } else if (scope.parent) {
    return findDefType(scope.parent, ref);
  } else {
    return undefined;
  }
}

function findDefValue(scope: Scope, ref: Ref): Entity | undefined {
  let def = scope.values[ref.name!];
  if (def) {
    return def;
  } else if (scope.parent) {
    return findDefValue(scope.parent, ref);
  } else {
    return undefined;
  }
}

function makeScope(parent: Scope) {
  let scope = {parent, kids: [], refs: [], types: {}, values: {}};
  parent.kids.push(scope);
  return scope;
}
