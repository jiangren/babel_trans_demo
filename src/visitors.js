const t = require('@babel/types');

const Program = function(path) {
    // 文件对象，list里包含js问价里的所有js语句
    const list = path.node.body;
    let removePath = null;

    // 在Program下的变量，通过referencePaths找到调用的地方，统一修改
    const scopeBindings = path.scope.bindings;

    list.forEach((node, index) => {
        const type = node.type;
        const curPath = path.get(`body.${index}`);
        // 通过type判断是import语句
        if (type === 'ImportDeclaration') {
            // 处理import, 通过https://astexplorer.net/ 可以直观看到对应的node结构
            node.specifiers.forEach((specifier) => {
                // 获取import的名字
                const name = specifier.local.name;
                if (name === 'divide') {
                    // TODO 通过path.scope 来处理 所有涉及到这个import名称变动的node
                    const referencePaths = scopeBindings[name].referencePaths;
                    referencePaths.forEach((referencePath) => {
                        // divide 是一个函数
                        const fnCallPath = referencePath.parentPath;
                        if (fnCallPath.isCallExpression()) {
                            // 处理函数入参
                            fnCallPath.node.arguments.splice(0, 1);
                        }
                        // 处理函数名
                        referencePath.node.name = 'divide10'
                        // 处理调用入参
                    });
                    // 直接修改import 名称
                    specifier.local.name = 'divide10';
                }
            })
        } else if (type === 'VariableDeclaration') {
            node.declarations.forEach((declaration) => {
                // 获取声明的名字
                if ( declaration.id.name === 'removeFn') {
                    // 不能直接通过path.remove直接删除对应语句，会使得list遍历时遗漏
                    removePath = curPath;
                }
            })
        } else if (type === 'ExportDefaultDeclaration') {
            // 在export语句前  通过path.insertBefore插入。
            // 如果要塞入的path前不是最后一个，也需要再forEach外进行处理
            curPath.insertBefore(t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('addNum2'), t.numericLiteral(11))
            ]))
        }
    });
    
    // 也可以直接通过list 插入语句 const addNum = 10; 
    const newVariableDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('addNum'), t.numericLiteral(10))
    ]);
    // 直接添加到list里
    list.splice(list.length - 1, 0, newVariableDeclaration);
    if (removePath) {
        removePath.remove();
    }
}

// 处理函数
const FunctionDeclaration = function(path) {
    const name = path.node.id.name;
    if (name === 'sum') {
        // 处理变量名
        path.node.id.name = 'sumNew';
        // 嵌套traverse，进行内部处理
        path.traverse({
            BinaryExpression: (path1) => {
                const { left, right} = path1.node;
                if (t.isIdentifier(left) && t.isIdentifier(right)) {
                    if (left.name === 'a' && right.name === 'b') {
                        // 找到语句，通过parentPath去修改运算符
                        if (t.isBinaryExpression(path1.parent)) {
                            path1.parent.operator = '/';
                        }
                    }
                }
            },
            MemberExpression: (path2) => {
                const { object, property } = path2.node;
                if (t.isIdentifier(object) && object.name === 'multiplierObj') {
                    // 修改对象的属性名称
                    property.name ='multiplier20';
                }
            }
        })
    }
    // 内部语句处理

    // 处理删除函数
}

// 处理export
const ExportDefaultDeclaration = function(path) {
    const node = path.node;
    // 改变export的名称
    const declaration = node.declaration;
    let beforeName = '';
    // 需要判断type类型
    if (declaration.type === 'Identifier') {
        beforeName = declaration.name;
        declaration.name = 'sumNew';
    }
    // 增加一行注释
    node.trailingComments = [];
    node.trailingComments.push({
        type: 'CommentLine',
        value: `改变了export的值， 原先为${beforeName}`
    })
}

module.exports = {
    Program,
    FunctionDeclaration,
    ExportDefaultDeclaration
};