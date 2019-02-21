import * as ts from 'typescript';
import {Gen, GenWalker, GenWalkerVars} from './gen';

export function generate(gen: Gen) {
  gen.write(prelude);
  let walker = new Walker({gen});
  walker.walk(gen.sourceNode);
}

let prelude = `
#include <cstdint>
#include <iostream>
#include <string>

// TODO Need to namespace these, but then need to qualify accesses.
using f32 = float;
using f64 = double;

using i8 = ::std::int8_t;
using i16 = ::std::int16_t;
using i32 = ::std::int32_t;
using i64 = ::std::int64_t;

using u8 = ::std::uint8_t;
using u16 = ::std::uint16_t;
using u32 = ::std::uint32_t;
using u64 = ::std::uint64_t;

void trace(const std::string& text) {
  std::cerr << text << std::endl;
}

`;

class Walker extends GenWalker {

  constructor(settings: GenWalkerVars) {
    super(settings);
  }

  walk(node: ts.Node) {
    let walk = this.walk.bind(this);
    let write = this.gen.write;
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression: {
        let call = node as ts.CallExpression;
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
        if (func.type) {
          walk(func.type);
        } else {
          write('void');
        }
        write(` ${name}() {\n`);
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
        write(id.text);
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
        // TODO Walk type instead.
        let typeName = (decl.type as any).typeName.escapedText;
        if (typeName == 'number') {
          typeName = 'double';
        }
        this.indent();
        write(`using ${decl.name.text} = `);
        walk(decl.type);
        write(";\n\n");
        break;
      }
      case ts.SyntaxKind.TypeReference: {
        let ref = node as ts.TypeReferenceNode;
        walk(ref.typeName);
        // TODO Type arguments?
        // TODO QualifiedName
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
