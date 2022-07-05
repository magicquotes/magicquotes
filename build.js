const fs = require('fs');
const htmlMinifier = require('html-minifier');
const DEBUG = process.argv[2] == '--debug';

function load(path) { return fs.readFileSync(path).toString(); }

function embed(file) {
    for (let i = 0; i < file.length; ++i) {
        if (file.substr(i, 7) === `embed('`) {
            let filename = '';
            for (let ii = i + 7; ii < file.length; ++ii) {
                if (file.substr(ii, 3) === `');`) {
                    break;
                }
                filename += file[ii];
            }
            file = file.substr(0, i) + load(filename) + file.substr(i + 10 + filename.length);
        }
    }
    return file;
}

function cutout(file, name) {
    let content = '';
    const start = file.indexOf(name);
    if (start !== -1) {
        let braceCount = 1;
        for (let ii = start + name.length + 2; ii < file.length; ++ii) {
            const char = file[ii];
            if (char === '{') {
                ++braceCount;
            } else if (char === '}') {
                --braceCount;
            }
            if (braceCount === 0) {
                break;
            }
            content += char;
        }
    }
    return [content, start];
}

function combineCSS(sheets) {
    let css = '';
    let root = '';
    for (let i = 0; i < sheets.length; ++i) {
        const sheet = sheets[i];
        const rootStart = sheet.indexOf(':root');
        let rootEnd = -1;
        if (rootStart !== -1) {
            rootEnd = sheet.substr(rootStart).indexOf('}');
            root += sheet.substring(rootStart + 7, rootEnd);
        }
        css += sheet.substring(rootEnd + 1, sheet.length);
    }
    return `:root{${root}}${css}`;
}

function combineJS(scripts) {
    let js = '';
    let autorun = '';
    let onload = '';
    for (let i = 0; i < scripts.length; ++i) {
        const script = scripts[i];
        const autorunCutout = cutout(script, 'function autorun()');
        js += script.substr(0, autorunCutout[1] === -1 ? script.length : autorunCutout[1]);
        autorun += autorunCutout[0];
        onload += cutout(script, 'function onload()')[0];
    }
    return `${js}function autorun(){${autorun}}function onload(){${onload}}`;
}

// Build Client
let client = load('client/html/index.html');
let css = combineCSS([
    load('client/css/reset.css'),
    load('client/css/index.css'),
    load('client/css/landing.css'),
    load('client/css/authors.css'),
    load('client/css/contact.css'),
]);
let js = combineJS([
    load('client/js/index.js'),
    load('client/js/contact.js'),
]);

if (!fs.existsSync('out')) { fs.mkdirSync('out'); }
if (!fs.existsSync('contact')) { fs.mkdirSync('contact'); }

js += 'if(document.addEventListener){document.addEventListener(\'DOMContentLoaded\',autorun,false);window.addEventListener(\'load\',onload,false)}else if(document.attachEvent){document.attachEvent(\'onreadystatechange\',autorun);window.attachEvent(\'onload\',onload)}else{window.onload=_=>{autorun();onload()}}';
if (!DEBUG) {
    js = require("@babel/core").transformSync(js, { presets: ["@babel/preset-env"] }).code;
}
client = client.replace('</head>', `<style type="text/css">${css}</style><script type="text/javascript">${js}</script></head>`);
if (!DEBUG) {
    client = htmlMinifier.minify(client, { minifyCSS: true, minifyJS: true, removeComments: true, sortClassName: true, sortAttributes: true, collapseWhitespace: true });
}
fs.writeFileSync('out/client.html', client);

// Build Server
fs.writeFileSync('out/server.js', embed(load('server/index.js')));