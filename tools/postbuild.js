'use strict';

const { writeFileSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json')).toString());

delete packageJson.scripts.prebuild;
delete packageJson.scripts.build;
delete packageJson.scripts.prerelease;
delete packageJson.scripts.release;
delete packageJson.scripts.test;
delete packageJson.scripts.lint;
delete packageJson.jest;
delete packageJson.devDependencies;

writeFileSync(resolve(__dirname, '../dist/package.json'), JSON.stringify(packageJson, null, '\t'));
