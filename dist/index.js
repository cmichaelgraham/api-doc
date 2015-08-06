'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _path = require('path');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var meta = {};
var IGNORED = {};

exports['default'] = function (babel) {
  var Transformer = babel.Transformer;
  var t = babel.types;

  var skipper = {
    enter: function enter(node) {
      if (!skip()) {
        meta.moduleExports.push(node);
      }

      enterSkip(node);
    },

    exit: function exit(node) {
      exitSkip(node);
    }
  };

  return new Transformer('aurelia-babel-plugin', {
    Program: {
      enter: function enter(node, parent) {
        meta = {};
        var _state$opts = this.state.opts;
        var filename = _state$opts.filename;
        var moduleRoot = _state$opts.moduleRoot;
        var _state$opts$extra$dts = _state$opts.extra.dts;
        var packageName = _state$opts$extra$dts.packageName;
        var typings = _state$opts$extra$dts.typings;
        var _state$opts$extra$dts$suppressModulePath = _state$opts$extra$dts.suppressModulePath;
        var suppressModulePath = _state$opts$extra$dts$suppressModulePath === undefined ? false : _state$opts$extra$dts$suppressModulePath;
        var _state$opts$extra$dts$suppressComments = _state$opts$extra$dts.suppressComments;
        var suppressComments = _state$opts$extra$dts$suppressComments === undefined ? false : _state$opts$extra$dts$suppressComments;
        var _state$opts$extra$dts$ignoreMembers = _state$opts$extra$dts.ignoreMembers;
        var ignoreMembers = _state$opts$extra$dts$ignoreMembers === undefined ? /^_.*/ : _state$opts$extra$dts$ignoreMembers;

        var moduleId = packageName + '/' + (0, _path.relative)(moduleRoot, filename).replace('.js', '');
        meta.root = packageName;
        meta.moduleId = moduleId;
        meta.moduleExports = [];
        meta.moduleImports = [];
        meta.interfaces = [];
        meta.skipStack = [];
        meta.outpath = (0, _path.join)(typings, moduleId + '.d.ts');
        meta.suppressModulePath = suppressModulePath;
        meta.suppressComments = suppressComments;
        meta.ignoreMembers = ignoreMembers;
      },

      exit: function exit(node, parent) {
        var code = generate(meta);
        //console.log(code);
        ensureDir(meta.outpath);
        _fs2['default'].writeFileSync(meta.outpath, code);
        meta = {};
      }
    },

    ExportAllDeclaration: function ExportAllDeclaration(node) {
      meta.moduleExports.push(node);
    },

    ExportNamedDeclaration: skipper,

    ExportDefaultDeclaration: skipper,

    ClassDeclaration: skipper,

    ImportDeclaration: function ImportDeclaration(node) {
      meta.moduleImports.push(node);
    },

    InterfaceDeclaration: function InterfaceDeclaration(node) {
      meta.interfaces.push(node);
    }
  });

  function skip() {
    return meta.skipStack.length > 0;
  }

  function enterSkip(node) {
    meta.skipStack.push(node);
  }

  function exitSkip(node) {
    if (node !== meta.skipStack.pop()) {
      throw new Error('skipStack unballance');
    }
  }
};

function generate(data) {
  var moduleId = data.moduleId;
  var moduleExports = data.moduleExports;
  var moduleImports = data.moduleImports;
  var interfaces = data.interfaces;
  var root = data.root;
  var suppressModulePath = data.suppressModulePath;

  var str = '';
  if (suppressModulePath) {
    str = 'declare module \'' + root + '\' {\n';
  } else {
    str = 'declare module \'' + moduleId + '\' {\n';
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = moduleImports[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var i = _step.value;

      var importStr = generateDts(i);
      if (importStr) {
        importStr = importStr.split('\n').map(function (s) {
          return '  ' + s;
        }).join('\n');
        str += importStr + '\n';
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = interfaces[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var i = _step2.value;

      var interfaceStr = generateDts(i);
      if (interfaceStr) {
        interfaceStr = interfaceStr.split('\n').map(function (s) {
          return '  ' + s;
        }).join('\n');
        str += interfaceStr + '\n';
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = moduleExports[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var e = _step3.value;

      var exportStr = generateDts(e);
      if (exportStr) {
        exportStr = exportStr.split('\n').map(function (s) {
          return '  ' + s;
        }).join('\n');
        str += exportStr + '\n';
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  str += '}';
  return str;
}

var exportGenerators = {
  ExportAllDeclaration: function ExportAllDeclaration(node) {
    return generateComment(node.leadingComments) + 'export * from \'' + getSource(node.source) + '\';';
  },

  ExportNamedDeclaration: function ExportNamedDeclaration(node) {
    if (node.declaration) {
      var classString = generateDts(node.declaration);
      if (classString) {
        if (classString === IGNORED) {
          return '';
        } else {
          return generateComment(node.leadingComments) + 'export ' + classString;
        }
      } else {
        if (!shouldExcludeMember(node.declaration.id.name)) {
          console.log('Unsupported node type ' + node.declaration.type + ' - id: ' + node.declaration.id.name);
        }
      }
    } else if (node.source != null) {
      var objectExports = node.specifiers.filter(function (s) {
        return s.type === 'ExportSpecifier';
      }).map(function (s) {
        var importName = s.exported.name;
        var localName = s.local.name;

        if (!localName || localName === importName) return importName;else return '' + generateComment(node.leadingComments) + importName + ' as ' + localName;
      }).join(', ');

      return generateComment(node.leadingComments) + 'export { ' + objectExports + ' } from \'' + getSource(node.source) + '\';';
    }
  },

  ExportDefaultDeclaration: function ExportDefaultDeclaration(node) {
    var value = generateDts(node.declaration);
    if (!value) {
      console.log('Can\'t generate ' + node.declaration.type + '.');
    }

    return generateComment(node.leadingComments) + 'export default ' + value + ';';
  },

  ImportDeclaration: function ImportDeclaration(node) {
    var objectImports = node.specifiers.filter(function (s) {
      return s.type === 'ImportSpecifier';
    }).map(function (s) {
      var importName = s.imported.name;
      var localName = s.local.name;

      if (!localName || localName === importName) return importName;else return importName + ' as ' + localName;
    }).join(', ');
    var defaultImports = node.specifiers.filter(function (s) {
      return s.type === 'ImportDefaultSpecifier';
    }).map(function (s) {
      var localName = s.local.name;

      return localName;
    });
    var namespaceImports = node.specifiers.filter(function (s) {
      return s.type === 'ImportNamespaceSpecifier';
    }).map(function (s) {
      var localName = s.local.name;

      return '* as ' + localName;
    });

    var parts = [].concat(_toConsumableArray(defaultImports), _toConsumableArray(namespaceImports));
    if (objectImports.length) {
      parts.push('{ ' + objectImports + ' } ');
    }

    return generateComment(node.leadingComments) + 'import ' + parts.join(', ') + ' from \'' + getSource(node.source) + '\';';
  },

  VariableDeclaration: function VariableDeclaration(node) {
    var kind = node.kind;
    var hasDecl = false;
    var declarations = node.declarations.map(function (d) {
      var name = d.id.name;
      var typeAnnotation = d.typeAnnotation;

      if (shouldExcludeMember(name)) {
        return '';
      }

      hasDecl = true;

      var type = 'any';
      if (typeAnnotation) {
        type = getTypeAnnotation(typeAnnotation);
      }

      return name + ': ' + type;
    }).join(', ');

    if (hasDecl) {
      return '' + generateComment(node.leadingComments) + kind + ' ' + declarations + ';';
    } else {
      return IGNORED;
    }
  },

  ClassDeclaration: function ClassDeclaration(node) {
    var name = node.id.name;
    var superClass = node.superClass;
    var body = node.body;

    if (shouldExcludeMember(name)) {
      return IGNORED;
    }

    var str = generateComment(node.leadingComments) + 'class ' + name + ' ';
    if (superClass) {
      str += 'extends ' + superClass.name + ' ';
    }
    str += '{\n';

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = body.body[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var member = _step4.value;

        var memberStr = generateDts(member);
        if (memberStr) {
          memberStr = memberStr.split('\n').map(function (s) {
            return '  ' + s;
          }).join('\n');
          str += memberStr + '\n';
        } else {
          if (!shouldExcludeMember(member.key.name)) {
            console.warn('missing member type: ', member.type, ' name: ', member.key.name);
          }
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
          _iterator4['return']();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return str + '}';
  },

  InterfaceDeclaration: function InterfaceDeclaration(node) {
    var name = node.id.name;
    var _node$body = node.body;
    var indexers = _node$body.indexers;
    var properties = _node$body.properties;
    var callProperties = _node$body.callProperties;
    var e = node['extends'];

    var extendsStr = undefined;
    if (e.length) {
      extendsStr = ' extends ' + e.map(function (_ref) {
        var name = _ref.id.name;

        return name;
      }).join(', ') + ' ';
    } else {
      extendsStr = '';
    }
    var str = generateComment(node.leadingComments) + 'export interface ' + name + extendsStr + ' {\n';

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = properties[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var property = _step5.value;

        var memberStr = generateDts(property);
        if (memberStr) {
          memberStr = memberStr.split('\n').map(function (s) {
            return '  ' + s;
          }).join('\n');
          str += memberStr + '\n';
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
          _iterator5['return']();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = indexers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var indexer = _step6.value;

        var memberStr = generateDts(indexer);
        if (memberStr) {
          memberStr = memberStr.split('\n').map(function (s) {
            return '  ' + s;
          }).join('\n');
          str += memberStr + '\n';
        }
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6['return']) {
          _iterator6['return']();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }

    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = callProperties[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var method = _step7.value;

        var memberStr = generateDts(method);
        if (memberStr) {
          memberStr = memberStr.split('\n').map(function (s) {
            return '  ' + s;
          }).join('\n');
          str += memberStr + '\n';
        }
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7['return']) {
          _iterator7['return']();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    str += '}';
    //console.log(str);
    return str;
  },

  ObjectTypeIndexer: function ObjectTypeIndexer(node) {
    var name = node.id.name;
    var value = node.value;
    var key = node.key;

    var type = 'any';
    var keyType = 'any';

    if (value) {
      type = getTypeAnnotationString(value);
    }

    if (key) {
      keyType = getTypeAnnotationString(key);
    }

    var staticStr = node['static'] ? 'static ' : '';
    return '' + generateComment(node.leadingComments) + staticStr + '[' + name + ': ' + keyType + ']: ' + type + ';';
  },

  ObjectTypeProperty: function ObjectTypeProperty(node) {
    var name = node.key.name;
    var value = node.value;

    var staticStr = node['static'] ? 'static ' : '';
    var optionalStr = node.optional ? '?' : '';

    if (shouldExcludeMember(name)) {
      return '';
    }

    if (value.type === 'FunctionTypeAnnotation') {
      var returnType = 'any';
      if (value.returnType) {
        returnType = getTypeAnnotationString(value.returnType);
      }

      var params = value.params.map(getFunctionTypeAnnotationParameter).join(', ');
      return '' + staticStr + name + '(' + params + '): ' + type + ';';
    }

    var type = 'any';

    if (value) {
      type = getTypeAnnotationString(value);
    }

    return '' + generateComment(node.leadingComments) + staticStr + name + optionalStr + ': ' + type + ';';
  },

  MethodDefinition: function MethodDefinition(node) {
    var args = getArgs(node.value).join(', ');
    if (node.kind === 'constructor') {
      return generateComment(node.leadingComments) + 'constructor(' + args + ');';
    } else {
      var _name = node.key.name;
      var returnType = node.value.returnType;

      var _type = 'any';
      var prefix = '';

      if (shouldExcludeMember(_name)) {
        return '';
      }

      if (returnType) {
        _type = getTypeAnnotation(returnType);
      }

      if (node['static']) {
        prefix = 'static ';
      }

      return '' + generateComment(node.leadingComments) + prefix + _name + '(' + args + '): ' + _type + ';';
    }
  },

  ClassProperty: function ClassProperty(node) {
    var name = node.key.name;
    var typeAnnotation = node.typeAnnotation;

    var type = 'any';
    var prefix = '';

    if (shouldExcludeMember(name)) {
      return '';
    }

    if (node['static']) {
      prefix = 'static ';
    }

    if (typeAnnotation) {
      type = getTypeAnnotation(typeAnnotation);
    }

    return '' + generateComment(node.leadingComments) + prefix + name + ': ' + type + ';';
  },

  NewExpression: function NewExpression(node) {
    var args = generateArgs(node.arguments);
    return generateComment(node.leadingComments) + 'new ' + node.callee.name + '(' + args + ')';
  },

  FunctionDeclaration: function FunctionDeclaration(node) {
    var name = node.id.name;
    var returnType = node.returnType;

    var args = getArgs(node).join(', ');
    var type = 'any';

    if (shouldExcludeMember(name)) {
      return '';
    }

    if (returnType) {
      type = getTypeAnnotation(returnType);
    }

    return generateComment(node.leadingComments) + 'function ' + name + '(' + args + '): ' + type + ';';
  },

  Literal: function Literal(node) {
    return node.raw;
  }
};

function generateComment(node) {
  if (meta.suppressComments || !node) {
    return '';
  }

  return '\n' + node.map(function (s) {
    switch (s.type) {
      case 'CommentLine':
        return '// ' + s.value;
        break;

      case 'CommentBlock':
        return '/*' + s.value + '*/';
        break;

      default:
        return '';
    }
  }).join('\n') + '\n';
}

function generateDts(node) {
  var fn = exportGenerators[node.type];
  if (fn) {
    return fn(node);
  } else {
    console.warn(node.type + ' not supported');
  }
}

function getSource(node) {
  var value = node.value;

  if (value.substring(0, 2) === './') {
    value = meta.root + value.substring(1);
  }
  return value;
}

function generateArgs(args) {
  return args.map(function (arg) {
    var str = generateDts(arg);
    if (str) return str;

    return '"Unsupported argument type ' + arg.type + '"';
  }).join(', ');
}

function getArg(p) {
  var name = undefined,
      typeAnnotation = undefined,
      type = 'any';
  switch (p.type) {
    case 'Identifier':
      if (p.optional) {
        name = p.name + '?';
      } else {
        name = p.name;
      }
      typeAnnotation = p.typeAnnotation;
      if (typeAnnotation) {
        type = getTypeAnnotation(typeAnnotation);
      }

      return name + ': ' + type;

    case 'AssignmentPattern':
      name = p.left.name;
      typeAnnotation = p.left.typeAnnotation;
      if (typeAnnotation) {
        type = getTypeAnnotation(typeAnnotation);
      }

      return name + '?: ' + type;

    case 'RestElement':
      name = p.argument.name;
      typeAnnotation = p.argument.typeAnnotation;
      type = 'any[]';
      if (typeAnnotation) {
        type = getTypeAnnotation(typeAnnotation);
      }

      return '...' + name + ': ' + type;

    default:
      console.log(p);
      throw new Error('Parameter type ' + p.type + ' not implemented');
  }
}

function getArgs(node) {
  var params = node.params;

  return params.map(getArg);
}

function getTypeAnnotation(annotated) {
  return getTypeAnnotationString(annotated.typeAnnotation);
}

function getTypeAnnotationString(annotation) {
  switch (annotation.type) {
    case 'GenericTypeAnnotation':
      var name = annotation.id.name;

      if (annotation.typeParameters) {
        var typeParameters = annotation.typeParameters.params.map(getTypeAnnotationString).join(', ');
        return name + '<' + typeParameters + '>';
      }

      return name;

    case 'VoidTypeAnnotation':
      return 'void';

    case 'NumberTypeAnnotation':
      return 'number';

    case 'StringTypeAnnotation':
      return 'string';

    case 'AnyTypeAnnotation':
      return 'any';

    case 'BooleanTypeAnnotation':
      return 'boolean';

    case 'UnionTypeAnnotation':
      return annotation.types.map(getTypeAnnotationString).join(' | ');

    case 'FunctionTypeAnnotation':
      var params = annotation.params.map(getFunctionTypeAnnotationParameter).join(', ');
      var returnType = getTypeAnnotationString(annotation.returnType);
      return '((' + params + ') => ' + returnType + ')';

    case 'ArrayTypeAnnotation':
      var elementType = getTypeAnnotationString(annotation.elementType);
      return elementType + '[]';

    default:
      throw new Error('Unsupported type annotation type: ' + annotation.type);
  }
}

function getFunctionTypeAnnotationParameter(node) {
  var name = node.name.name;
  var typeAnnotation = node.typeAnnotation;
  var optional = node.optional;

  var type = 'any';

  if (typeAnnotation) {
    type = getTypeAnnotationString(typeAnnotation);
  }
  if (optional) {
    name = name + '?';
  }

  return name + ': ' + type;
}

function ensureDir(p) {
  var dn = (0, _path.dirname)(p);
  if (!_fs2['default'].existsSync(dn)) {
    ensureDir(dn);
    try {
      _fs2['default'].mkdirSync(dn);
    } catch (e) {}
  }
}

function shouldExcludeMember(memberName) {
  // memberObjectFilter falsy means include all members
  if (!meta.ignoreMembers) {
    return false;
  }

  var memberType = typeof meta.ignoreMembers;
  if (memberType != 'function' && memberType != 'string') {
    if (meta.ignoreMembers instanceof RegExp) {
      memberType = 'regexp';
    }
  }

  switch (memberType) {
    case 'function':
      // memberObjectFilter is function means call function passing memberName and exclude if truthy
      return meta.ignoreMembers(memberName);

    case 'regexp':
      // memberObjectFilter is regex means check regex, exclude if match
      return memberName.match(meta.ignoreMembers);

    case 'string':
      // memberObjectFilter is string means check create regex from string, exclude if match
      return memberName.match(new RegExp(meta.ignoreMembers));

    default:
      console.log('warning: ignoreMembers ignored, expected type function, regexp, or string, but received type ' + memberType);
      meta.ignoreMembers = null;
      return false;
  }
}
module.exports = exports['default'];