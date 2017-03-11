'use strict';

const fs = require('fs');
const path = require('path');

const NODE_MODULES = 'node_modules';
const PACKAGE_JSON = 'package.json';
const NO_LICENSE = 'no license';
const TYPE_DEFAULT = '0';
const TYPE_ERROR = '31';
const TYPE_SUCCESS = '32';
const TYPE_INFO = '33';

let options = {
    verbose: false,
    stat: true
};

let data = [];
let stats = {};

function print(type, message) {
    console.log(`\x1b[${type}m${message}\x1b[0m`);
}

function getNodeModulesFolder() {
    let current = process.cwd();
    let pathToNodeModules = path.join(current, NODE_MODULES);

    return pathToNodeModules;
}

function checkArgs() {
    let args = process.argv;

    if (args.length < 3) {
        return;
    }

    for (let i = 2; i < args.length; i++) {
        if (args[i] === '-v') {
            options.verbose = !options.verbose;
        } else if (args[i] === '-s') {
            options.stat = !options.stat;
        }
    }
}

function check() {
    checkArgs();

    let src = getNodeModulesFolder();
    print(TYPE_INFO, `checking ${src}`);

    if (!fs.existsSync(src)) { 
        print(TYPE_ERROR, 'Can\'t find node_modules folder');
        return; 
    }

    let modules = fs.readdirSync(src);

    modules = modules.filter(singleModule => {
        let fullPath = path.join(src, singleModule);
        let stats = fs.statSync(fullPath);

        return stats.isDirectory() && singleModule !== '.bin';
    });

    if (!modules.length) {
        print(TYPE_ERROR, 'node_modules is empty');
        return;
    }

    data = [];

    modules.forEach(file => {
        let packageJson = path.join(src, file, PACKAGE_JSON);

        if (fs.existsSync(packageJson)) {
            let obj = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
            let license = NO_LICENSE;

            if (obj.hasOwnProperty('license')) {
                let lic = obj.license;

                if (lic instanceof Object && lic.hasOwnProperty("type")) {
                    license = lic.type;
                } else {
                    license = lic;
                }
            }

            data.push({ package: file, license: license });

            if (options.verbose) {
                console.log(`[${file}] uses ${license}`);
            }
        }
    });

    if (options.stat) {
        calculateStats();
        printStats();
    }
    
    print(TYPE_SUCCESS, 'completed');
}

function calculateStats() {
    data.forEach(item => {
        if (stats[item.license]) {
            stats[item.license] += 1;
        } else {
            stats[item.license] = 1;
        }
    });
}

function printStats() {
    print(TYPE_INFO, `-- STATS [${data.length}] --`);

    for (let lic in stats) {
        mapLicense(lic);
    }
}

function mapLicense(license) {
    const mapData = {
        'MIT': TYPE_SUCCESS,

        'no license': TYPE_ERROR,
        'Unlicense': TYPE_ERROR
    };

    let found = false;

    for (let data in mapData) {
        if (data.toLowerCase() === license.toLowerCase()) {
            found = true;
            print(mapData[data], `> ${license}`);
            break;
        }
    }

    if (!found) {
        print(TYPE_DEFAULT, `> ${license}`);
    }
}

module.exports = check;
