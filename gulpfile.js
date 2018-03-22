'use strict'

var fs = require('fs');
var gulp = require('gulp')
var GulpSSH = require('gulp-ssh')
var gulpConfig = require('./gulpfile.config.json');

var privateKey = '';
try {
  privateKey = fs.readFileSync(gulpConfig.id_rsa);
} catch (e) {
  console.log("Not found privateKey");
}

var config = {
  test: {
    host: 'private.contractium.io',
    port: 22,
    username: 'ubuntu',
    // password: 'eyeteam.vn'
    privateKey: privateKey
  },
  production: {
    
  }
}

gulp.task('deploy-test', function () {
  var gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config.test
  });
  return gulp
    .src('./dist/*')
    .pipe(gulpSSH.dest('/root/ctunetwork/ctunetwork-client/'))
});

gulp.task('deploy-production', function () {
  var gulpSSH = new GulpSSH({
    ignoreErrors: false,
    sshConfig: config.production
  });

  return gulp
    .src('./dist/*')
    .pipe(gulpSSH.dest('/root/ctunetwork/ctunetwork-client/'))
});
