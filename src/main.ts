import * as fs from 'fs'
import * as path from 'path';
import Container from './core/container';

var program = require('commander');
 
function absolute(dir){
    return path.join(process.cwd(), dir);
}


program
  .version('0.0.1', '-v', '--version')
  .usage('[options] <project path>')
  //.option('-m --minumum <minimum>', 'Minimum tree size to translate')
  .parse(process.argv);
 

if(!program.target)
    throw new Error("Target script is required. -t <target>")

if(!program.coverage)
    throw new Error("Target script is required. -c <coverage>")

if(!program.workload)
    throw new Error("Target script is required. -w <workload>")



