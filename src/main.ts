import "reflect-metadata";

import * as fs from 'fs'
import * as path from 'path';
import Container from './core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from './core/listener';
import Api from './core/api';
import { injectable } from 'inversify';

// To open chrome as child process
const {  spawn } = require('child_process');

const port = process.env.port || 9222;
const waitFor =  1000;// seconds
const timeout = (parseInt(process.env.sessionTime) || 5)*1000; //5 seconds by default
const chromeAlias = process.env.chrome || 'chrome'
const headless = process.env.headless || ''

@injectable()
export default class Main{

    public chromeSession: any;

    run(actionsDelay:number, onTab: (url) => void){

        this.chromeSession = spawn(chromeAlias,[
            '--remote-debugging-port='+port,
            '--user-data-dir=temp',
            headless,
            "google.com"
        ]);

        this.chromeSession.stdout.on('data', function(data) {
            console.log(data.toString());
        });


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
