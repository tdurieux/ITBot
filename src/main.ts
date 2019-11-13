import * as fs from 'fs'
import * as path from 'path';
import Container from './core/container';
import * as WebSocket from 'ws';
import * as req from 'request';

// To open chrome as child process
const {  spawn } = require('child_process');

const port = process.env.port || 9222;
const waitFor = parseInt(process.env.sessionTime) || 1000 ;// milliseconds
const timeout = (60 + waitFor)*1000; //10 seconds
const chromeAlias = process.env.chrome || 'chrome'


const chrome = spawn(chromeAlias,[
  '--remote-debugging-port='+port,
  '--user-data-dir=temp',
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
  
    ws.on('open', function open() {
        console.log("Websocket channel opened. Enabling runtime namespace")
         ws.send(JSON.stringify({id: 3, method: 'Runtime.enable'}))
    });
   
  
    ws.on('message', function incoming(data) {
      
      fs.writeSync(log, data + "\n")
      const obj = JSON.parse(data)
      
      if(obj.id === 3){

        // TODO Execute pipeline

        
      }
      
    });
  
  });
  

    clearTimeout(interval2)
}, waitFor)