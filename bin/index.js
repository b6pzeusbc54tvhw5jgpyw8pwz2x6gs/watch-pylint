const cp = require('child_process')
const chokidar = require('chokidar')
const watcher = chokidar.watch('*.py', { ignoreInitial: true })

const SKIP_LIMIT = process.env.WATCH_PYLINT_SKIP_LIMIT || 7
const PYLINT_BIN = process.env.WATCH_PYLINT_PYLINT_BIN || 'packages/bin/pylint'
const PACKAGES_DIR = process.env.WATCH_PYLINT_PACKAGES_DIR || 'packages'
let skipCount = 0
let prevStdout = ''
let printed = false

const closeEventHandler = code => {
  if( code === 0 ) {
    console.log('All code is good!')
  } else if( ! printed ) {
    console.log('The same problem ' + skipCount)
  }
}
const resultHandler = (err,stdout,stderr) => {
  if (err) {
    //console.error(`exec error: ${err}`);
  }
  //console.log(`stdout: ${stdout}`);
  //console.log(`stderr: ${stderr}`);
  if( prevStdout !== stdout || skipCount >= SKIP_LIMIT) {
    prevStdout = stdout
    printed = true
    skipCount = 0
    console.log( stdout )
  } else {
    printed = false
    skipCount++
  }
}

watcher.on('all', (event, path) => {
  //console.log( event, path )
  
  cp.exec(`${PYLINT_BIN} --ignore ${PACKAGES_DIR} *.py`, resultHandler )
  .on('close', closeEventHandler )
});

cp.exec(`${PYLINT_BIN} --ignore ${PACKAGES_DIR} *.py`, resultHandler )
.on('close', closeEventHandler )

