/* eslint-disable */
const fs = require('fs');
const path = require('path');

const BASE_DIR = './temp/samples/code/';
const TEMPL_DIR = './samples/templates/';
const COMPILED_DIR = './temp/samples/compiled/';

processDirectory(BASE_DIR);

function processDirectory(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) throw err;

        files.forEach(f => {
            const fileName = path.join(dir, f);
            fs.stat(fileName, (err, stats) => {
                if (stats.isDirectory()) {
                    processDirectory(fileName);
                } else {
                    processFile(fileName, f);
                }
            });
        });
    })
}

function processFile(f, rawFileName) {
    fs.readFile(f, 'utf8', function(err, jsCode) {
        let templateMatch = jsCode.match(/\/\/\/ Template:\s*"([a-z0-9_.]+)"/i);
        if (!templateMatch || templateMatch.length < 2) throw new Error(`Template name not found for file ${f}`);
        let templateName = templateMatch[1];

        let titleMatch = jsCode.match(/\/\/\/ Title:\s*"(.+)"/i);
        let title = titleMatch && titleMatch[1] || rawFileName.replace('_', ' ').replace('.js', '');

        fs.readFile(path.join(TEMPL_DIR, templateName), 'utf8', function(err, templateCode) {
            let output = templateCode.replace('%TITLE%', title).replace('%FILENAME%', path.relative(BASE_DIR, f));
            let outputFileName = path.join(COMPILED_DIR, path.basename(path.relative(BASE_DIR, f), '.js') + '.html');

            ensureDirectoryExistence(outputFileName);
            fs.writeFile(outputFileName, output, 'utf8', (err) => {
                if (err) throw err;
            });
        });

    });
}

function ensureDirectoryExistence(filePath) {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}