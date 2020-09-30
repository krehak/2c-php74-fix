#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const argumentPath = process.argv.splice(2);

if(!argumentPath[0]) {
    console.error('Zadajte cestu k suboru composer.json');
    console.log('\x1b[0m', '');
    return;
}

const composerPath = path.resolve(argumentPath[0]);
const projectPath = path.dirname(composerPath);

if(!fs.existsSync(composerPath)) {
    console.error('Cesta k suboru composer.json je neplatna');
    console.log('\x1b[0m', '');
    return;
}

try {
    const data = JSON.parse(fs.readFileSync(composerPath, 'utf8'));
} catch($e) {
    console.error('Subor composer.json je poskodeny');
    console.log('\x1b[0m', '');
    return;
}

var newData = data;

/*
* Aktualizovanie repositories
* */
var composerRepositories = !!data['repositories'] ? data['repositories'] : (data['repositories'] = []);
var alreadyExists = false;

composerRepositories.forEach((item) => {
    if(item.type === 'package' && !!item.package && !!item.package.name && item.package.name === 'krehak/eloquent-sluggable') {
        alreadyExists = true;
    }
});

if(!alreadyExists) {
    composerRepositories.push({
        type: 'package',
        package: {
            name: 'krehak/eloquent-sluggable',
            version: '4.6.2',
            source: {
                url: 'https://github.com/krehak/eloquent-sluggable.git',
                type: 'git',
                reference: '4.6'
            }
        }
    });
    newData['repositories'] = composerRepositories;
}

/*
* Aktualizovanie autoload
* */
var composerAutoload = !!data['autoload'] ? data['autoload'] : (data['autoload'] = []);
var composerAutoloadPsr4 = !!composerAutoload['psr-4'] ? composerAutoload['psr-4'] : (composerAutoload['psr-4'] = {});
var composerAutoloadExclude = !!composerAutoload['exclude-from-classmap'] ? composerAutoload['exclude-from-classmap'] : (composerAutoload['exclude-from-classmap'] = []);

composerAutoloadPsr4["Cviebrock\\EloquentSluggable\\"] = 'vendor/krehak/eloquent-sluggable/';
if(composerAutoloadExclude.indexOf('vendor/cviebrock/eloquent-sluggable/*') === -1) composerAutoloadExclude.push('vendor/cviebrock/eloquent-sluggable/*');
newData['autoload'] = composerAutoload;

/*
* Ulozenie do composer.json
* */
fs.writeFileSync(composerPath, JSON.stringify(newData, null, 4));
console.log('\x1b[32m', 'composer.json bol aktualizovany, instalujem package...');
shell.cd(projectPath);
console.log('\x1b[0m', '');
return;

/*
* Instalacia packagu
* */
if(shell.exec('composer.phar require krehak/eloquent-sluggable:4.6.2').code !== 0) {
    console.error('Package krehak/eloquent-sluggable sa nepodarilo nainstalovat (skuste manualne zadat prikaz "composer require krehak/eloquent-sluggable:4.6.2")');
    console.log('\x1b[0m', '');
    return;
}

console.log('\x1b[32m', 'Package krehak/eloquent-sluggable bol uspesne nainstalovany - projekt bol aktualizovany');

console.log('\x1b[0m', '');
