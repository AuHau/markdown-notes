module.exports = function (context) {
    var appRoot = require('app-root-path');
    var exec = require('child_process').execSync;

    var currentCPwd = process.cwd();
    process.chdir(appRoot.toString());
    process.stdout.write('Starting building Mobile assets.');
    exec('gulp mobile:assets');
    process.stdout.write('Finished building Mobile assets!');
    process.chdir(currentCPwd);
};