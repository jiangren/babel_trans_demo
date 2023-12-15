const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const visitors = require('./visitors');

const dirname = path.resolve(__dirname, '../');

const translate = (resourcePath) => {
    const data = fs.readFileSync(resourcePath);
    const source = data.toString();

    const resourceAst = parser.parse(source, {
        sourceType: 'module'
    });

    traverse(resourceAst, {
        ...visitors
    });

    const {
        code
    } = generate(resourceAst, {
        quotes: 'single',
        retainLines: true
    });

    fs.writeFileSync(path.resolve(__dirname, '../output/index.js'), code);
}

translate(`${dirname}/resource/demo1.js`)