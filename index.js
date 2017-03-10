'use strict';

const fs = require('fs');
const path = require('path');

// let src = path.join(__dirname, 'node_modules');
let src = path.join(__dirname, '../invo/website/node_modules');

// let options = {
//     verbose: true,
//     stat: true
// };

let data = [];

function check() {
    if (!fs.existsSync(src)) { return; }
    let folders = fs.readdirSync(src);

    folders = folders.filter(file => {
        let filePath = path.join(src, file);
        let stats = fs.statSync(filePath);

        return stats.isDirectory() && file !== '.bin';
    });

    data = [];

    folders.forEach(file => {
        let packageJson = path.join(src, file, 'package.json');

        if (fs.existsSync(packageJson)) {
            let obj = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
            let license = 'no license';

            if (obj.hasOwnProperty('license')) {
                let lic = obj.license;

                if (lic instanceof Object && lic.hasOwnProperty("type")) {
                    license = lic.type;
                } else {
                    license = lic;
                }
            }

            data.push({ package: file, license: license });

            console.log(`[${file}] license: ${license}`);
            //console.log(`\x1b[33m[${file}] license: ${license}\x1b[0m`);
        }
    });

    //console.log(JSON.stringify(data));
    printStat();

    return data;
}

function printStat() {
    let stat = {};

    data.forEach(item => {
        if (stat[item.license]) {
            stat[item.license] += 1;
        } else {
            stat[item.license] = 1;
        }
    });

    console.log('-- STAT --');

    for (let lic in stat) {
        console.log(lic);
    }
}

module.exports = check;
