import "reflect-metadata";

import * as fs from 'fs'
import * as path from 'path';
import Container from './core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from './core/listener';
import Api from './core/api';
import { injectable } from 'inversify';
import * as util from 'util';
import * as fkill from 'fkill';

// To open chrome as child process
import {  spawn, execFile, exec, fork, ChildProcess } from 'child_process';

const port = process.env.chromePort || 9222;
const waitFor =  1000;// seconds
const chromeAlias = process.env.chrome || 'chrome'

const unbufferAlias = process.env.unbuffer || 'unbuffer'
const headless = process.env.headless || ''

@injectable()
export default class Main{

    public chromeSession: ChildProcess;

    close(){
        console.log("Killing...", this.chromeSession.pid)
        this.chromeSession.kill("SIGKILL")
        fkill(this.chromeSession.pid).catch(err => {
            console.log(err)
        })
    }

    run(timeout: number, sessionName: string, actionsDelay:number, onTab: (url) => void){


        if(!fs.existsSync("out"))
            fs.mkdirSync("out")

        if(!fs.existsSync(`out/${sessionName}`))
            fs.mkdirSync(`out/${sessionName}`)

        async function call(){
            this.chromeSession = exec(`'${chromeAlias}' --headless --remote-debugging-port=${port} --window-size=1920,1080 --user-data-dir=temp --js-flags="--print-bytecode" > out/${sessionName}/${sessionName}.bytecode`, {
                maxBuffer: 1 << 30
                
            }, (err, stdout, stderr) => {
                if(stderr)
                    console.error(stderr)

                console.log(stdout)
            });
        }

        call.bind(this)();



        // Asking for opened tabs

        let interval2 = setTimeout(() => {

            // Accessing chrome publish websocket address
            req(`http://localhost:${port}/json`,function (error, response, body) {
                
                const tab = JSON.parse(body)[0];
            
                console.log("Enabled websockets for tab 0")
                console.log(tab.id, tab.url)
            
                onTab(tab)
            });
            

            clearTimeout(interval2)
        }, actionsDelay)
    }

}
