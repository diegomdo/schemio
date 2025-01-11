import { parseExpression } from "../../templater/ast";
import { ASTAssign, ASTFunctionDeclaration, ASTLocalVariable, ASTMultiExpression, ASTVarRef } from "../../templater/nodes";
import { ASTStructNode } from "../../templater/struct";
import {syntaxTree} from "@codemirror/language";

const keywords = `
    local for while if else func struct this
`.split(/\s+/).filter(name => name).map(name => {return {
    label: name, type: 'keyword'
}});

const functions = `
  acos
  asin
  atan
  ceil
  cos
  debugItem
  duplicate
  findChildItemByName
  findChildItemsByTag
  findItemById
  findItemByName
  findParent
  floor
  getAngle
  getEventArg
  getEventName
  getHeight
  getId
  getName
  getOpacity
  getPos
  getPosX
  getPosY
  getScaleX
  getScaleY
  getSelfOpacity
  getShape
  getTags
  getValue
  getVar
  getWidth
  getWorldPos
  hide
  ifcond
  isVisible
  List
  localPoint
  log
  log10
  log2
  logn
  Map
  matchWorld
  min
  mount
  mountChild
  mountRoot
  parseFloat
  parseInt
  PI
  pow
  remove
  removeChildItemsByTag
  rgba
  rnd
  round
  sendEvent
  setAngle
  setHeight
  setOpacity
  setPos
  setPosX
  setPosY
  setScaleX
  setScaleY
  setSelfOpacity
  setText
  setTextColor
  setTextSize
  setValue
  setVar
  setWidth
  setWorldPos
  show
  sin
  sqrt
  tag
  tan
  uid
  worldPoint
`.split(/\s+/).filter(name => name).map(name => {return {
    label: name, type: 'function', detail: ''
}});


function extractCompletionsFromScript(script) {
    if (!script) {
        return [];
    }
    const completions = [];
    const visitNode = (node) => {
        if (node instanceof ASTAssign) {
            if (node.a instanceof ASTVarRef) {
                completions.push({
                    label: node.a.varName, type: (node.b instanceof ASTFunctionDeclaration) ? 'function' : 'variable'
                });
            }
        } else if (node instanceof ASTLocalVariable) {
            completions.push({
                label: node.varName, type: 'variable'
            });
        } else if (node instanceof ASTStructNode) {
            completions.push({
                label: node.name, type: 'function', detail: 'struct'
            })
        }
    };
    try {
        const ast = parseExpression(script);
        if (ast instanceof ASTMultiExpression) {
            ast.nodes.forEach(visitNode);
        } else {
            visitNode(ast);
        }
    } catch(err) {
    }
    return completions;
}

/**
 * @param {SchemeContainer} schemeContainer
 * @param {Array<String>} previousScripts
 */
export function createCompletions(schemeContainer, previousScripts) {
    let completions = keywords.concat(functions);

    previousScripts.forEach(script => {
        completions = completions.concat(extractCompletionsFromScript(script));
    });

    const itemNames = schemeContainer.getItemNames();
    const externalReferenceCompletions = itemNames.map(name => {
        const completion = {label: name, type: 'object', detail: 'object'};
        if (!name.match(/^[0-9a-zA-Z_]+$/)) {
            completion.apply = `"${name}"`;
        }
        return completion;
    });

    const externalReferenceCompletionsWithPrefix = itemNames.map(name => {
        const completion = {label: '@' + name, type: 'object', detail: 'object'};
        if (!name.match(/^[0-9a-zA-Z_]+$/)) {
            completion.apply = `@"${name}"`;
        }
        return completion;
    });

    return (context) => {
        const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
        if (!nodeBefore) {
            return null;
        }
        const before = context.matchBefore(/(\w+|@)/);
        if (!before) {
            return null;
        }
        if (!context.explicit && !before) return null;

        if (nodeBefore.name === 'ExternalObjectReference') {
            if (before && before.text === '@') {
                return {
                    from: before ? before.from : context.pos,
                    options: externalReferenceCompletionsWithPrefix,
                    validFor: /^(@\w*)?$/
                };
            }
            return {
                from: before ? before.from : context.pos,
                options: externalReferenceCompletions,
                validFor: /^(@\w*)?$/
            };
        } else if (nodeBefore.name === 'VariableName') {
            return {
                from: before ? before.from : context.pos,
                options: completions,
                validFor: /^\w*$/
            };
        }

        return null;
    };
}
