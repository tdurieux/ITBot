import * as fs from 'fs'
import * as path from 'path';
import Container from './core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from './core/listener';
import Api from './core/api';

// To open chrome as child process
const {  spawn } = require('child_process');

const port = process.env.port || 9222;
const waitFor =  1000;// seconds
const timeout = (parseInt(process.env.sessionTime) || 5)*1000; //5 seconds by default
const chromeAlias = process.env.chrome || 'chrome'
const headless = process.env.headless || ''

export default class Main{

    run(sessionTime, actionsDelay, onTab: (url) => void, onFinish?: () => void){

        const chrome = spawn(chromeAlias,[
            '--remote-debugging-port='+port,
            '--user-data-dir=temp',
            headless,
            "google.com"
        ]);

        chrome.stdout.on('data', function(data) {
            console.log(data.toString());
        });

        let interval = setTimeout(()=>{
            
            console.log("Finishing session...")

            chrome.kill()
            clearTimeout(interval)

            if(onFinish)
                onFinish()

        }, sessionTime)

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
