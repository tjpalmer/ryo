import * as ts from 'typescript';
import {Gen, GenWalker, GenWalkerVars} from './gen';

export function generate(gen: Gen) {
  gen.write(prelude);
  let walker = new CppGenWalker({gen});
  walker.walk(gen.sourceNode);
}

let prelude = `
#include <cstdint>
#include <iostream>
#include <string>

#define ryo_trace(message) (::std::cerr << (message) << " (" << __FILE__ << "#" << __LINE__ << ")" << ::std::endl)

`;

let std = new Map<string, string>(Object.entries({
  f32: 'float',
  f64: 'double',
  i8: '::std::int8_t',
  i16: '::std::int16_t',
  i32: '::std::int32_t',
  i64: '::std::int64_t',
  int: 'int',
  u8: '::std::uint8_t',
  u16: '::std::uint16_t',
  u32: '::std::uint32_t',
  u64: '::std::uint64_t',
  string: '::std::string',
  trace: 'ryo_trace',
}));

class CppGenWalker extends GenWalker {

  constructor(settings: GenWalkerVars) {
    super(settings);
  }

  walk(node: ts.Node) {
    let walk = this.walk.bind(this);
    let write = this.gen.write;
    switch (node.kind) {
      case ts.SyntaxKind.BinaryExpression: {
        let expr = node as ts.BinaryExpression;
        walk(expr.left);
        // console.log(expr.operatorToken);
        write(' ');
        switch (expr.operatorToken.kind) {
          case ts.SyntaxKind.PlusToken: {write('+'); break;}
          case ts.SyntaxKind.AsteriskToken: {write('*'); break;}
        }
        write(' ');
        walk(expr.right);
        break;
      }
      case ts.SyntaxKind.CallExpression: {
        let call = node as ts.CallExpression;
        this.walk(call.expression);
        write('(');
        call.arguments.forEach(walk);
        write(')');
        break;
      }
      case ts.SyntaxKind.ClassDeclaration: {
        let decl = node as ts.ClassDeclaration;
        // TODO Type parameters.
        write(`struct ${decl.name!.text} {\n`);
        this.indented(() => {
          // TODO Check for private.
          decl.members.forEach(walk);
        });
        write('};\n\n');
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
        write(` ${name}(`);
        func.parameters.forEach((param, index) => {
          // TODO Destructuring.
          if (param.name.kind == ts.SyntaxKind.Identifier) {
            if (index) {
              write(', ');
            }
            walk(param);
          }
        });
        write(') {\n');
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
        write(std.get(id.text) || id.text);
        break;
      }
      case ts.SyntaxKind.NumericLiteral: {
        let num = node as ts.NumericLiteral;
        write(`${num.text}`);
        break;
      }
      case ts.SyntaxKind.ObjectLiteralExpression: {
        let expr = node as ts.ObjectLiteralExpression;
        write('{');
        expr.properties.forEach((prop, index) => {
          if (index) {
            write(', ');
          }
          switch (prop.kind) {
            case ts.SyntaxKind.PropertyAssignment: {
              let assign = prop as ts.PropertyAssignment;
              walk(assign.initializer);
              break;
            }
          }
        });
        write('}');
        break;
      }
      case ts.SyntaxKind.Parameter:
      case ts.SyntaxKind.VariableDeclaration: {
        let decl = node as ts.ParameterDeclaration | ts.VariableDeclaration;
        if (decl.name.kind == ts.SyntaxKind.Identifier) {
          write('const ');
          if (decl.type) {
            walk(decl.type);
          } else {
            write('auto');
          }
          let name = decl.name as ts.Identifier;
          write(` ${name.escapedText}`);
          if (decl.initializer) {
            write(' = ');
            walk(decl.initializer);
          }
        }
        break;
      }
      case ts.SyntaxKind.PrefixUnaryExpression: {
        let expr = node as ts.PrefixUnaryExpression;
        switch (expr.operator) {
          case ts.SyntaxKind.MinusToken: {
            write('-');
            break;
          }
        }
        walk(expr.operand);
        break;
      }
      case ts.SyntaxKind.PropertyAccessExpression: {
        let access = node as ts.PropertyAccessExpression;
        walk(access.expression);
        write(`.${access.name.text}`);
        break;
      }
      case ts.SyntaxKind.PropertyDeclaration: {
        let decl = node as ts.PropertyDeclaration;
        let name = decl.name as ts.Identifier;
        this.indent();
        walk(decl.type!);
        write(` ${name.text};\n`);
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
      case ts.SyntaxKind.VariableStatement: {
        let statement = node as ts.VariableStatement;
        statement.declarationList.declarations.forEach(decl => {
          // TODO Destructuring.
          if (decl.name.kind == ts.SyntaxKind.Identifier) {
            this.indent();
            walk(decl);
            write(';\n');
          }
        });
        break;
      }
      default: {
        console.log(`unhandled gen ${ts.SyntaxKind[node.kind]}`);
        ts.forEachChild(node, walk);
        break;
      }
    }
  }

}
