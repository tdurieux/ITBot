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
const waitFor = parseInt(process.env.sessionTime) || 1000 ;// milliseconds
const timeout = (60 + waitFor)*1000; //10 seconds
const chromeAlias = process.env.chrome || 'chrome'
const headless = process.env.headless || ''

export default class Main{

    run(){

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
        chrome.kill()
        clearTimeout(interval)
        }, timeout)

        // Asking for opened tabs

        let interval2 = setTimeout(() => {

        const log = fs.openSync("log.txt", 'a')

        // Accessing chrome publish websocket address
        req(`http://localhost:${port}/json`,function (error, response, body) {
            
            const tab = JSON.parse(body)[0];
        
            console.log("Enabled websockets for tab 0")
            console.log(tab.id, tab.url)
        
            const url = tab.webSocketDebuggerUrl;
        
            const ws = new WebSocket(url);
        
            const listener = Container.get<Listener>(Listener);
            const api = Container.get<Api>(Api);

            listener.setup(ws, () => {
                console.log("Websocket channel opened. Enabling runtime namespace")

                listener.sendAndRegister({method: "Runtime.enable"})
                listener.sendAndRegister({method: "Page.enable"})

                api.gotoPage("https://www.google.com")   
                api.focus("[name=q]")                
                
                setTimeout(() => {

                    api.sendKey("c")
                    api.sendKey("u")
                    api.sendKey("b")
                    api.sendKey("a")
                        
                }, 4000)



            })


        });
        

            clearTimeout(interval2)
        }, waitFor)
    }

}

new Main().run()