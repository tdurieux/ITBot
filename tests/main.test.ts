import { expect } from 'chai';

import * as fs from 'fs'
import * as path from 'path';
import Container from '../src/core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from '../src/core/listener';
import Api from '../src/core/api';
import Main from '../src/main';

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
