import { expect } from 'chai';

import * as fs from 'fs'
import * as path from 'path';
import Container from '../src/core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from '../src/core/listener';
import Api from '../src/core/api';
import { isMainThread } from 'worker_threads';
import Main from '../src/main';
import { mixedTypeAnnotation } from 'babel-types';

// To open chrome as child process
const {  spawn } = require('child_process');

const port = process.env.port || 9222;
const waitFor = parseInt(process.env.sessionTime) || 30000 ;// milliseconds
const timeout = waitFor; //10 seconds
const chromeAlias = process.env.chrome || 'chrome'
const headless = process.env.headless || ''


describe('machine', function() {
  it('First test', function() {
    
    const main = new Main();

    main.run((tab) => {

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
              
          }, 500)
  
  
  
        })
    
    })

  });

});
