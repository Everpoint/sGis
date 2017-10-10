/* eslint-disable */
let fs = require('fs')

fs.readFile('./source/sGis.ts', 'utf8', function(err, data) {
    if (err) {
        return console.error(err);
    }

    let version = process.env.npm_package_version;
    let result = data.replace(/version\s*=\s*".+"/, 'version = "' + version + '"').replace(/releaseDate\s*=\s*".+"/, 'releaseDate = "' + today() + '"');

    fs.writeFile('./source/sGis.ts', result, 'utf8', function (err) {
        if (err) return console.log(err);
    });
});

function today() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1;
    let yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}