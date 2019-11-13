import { expect } from 'chai';

import * as fs from 'fs'
import * as path from 'path';
import Container from '../src/core/container';
import * as WebSocket from 'ws';
import * as req from 'request';
import Listener from '../src/core/listener';
import Api from '../src/core/api';
import Main from '../src/main';
import Stepper from '../src/core/stepper';

const main = new Main();


describe('Api test', function() {
  it('Api commands', function() {
    
    main.run(5000, 1000, (tab) => {

      const url = tab.webSocketDebuggerUrl;
          
      const ws = new WebSocket(url);
  
      const listener = Container.get<Listener>(Listener);
      const api = Container.get<Api>(Api);
      const stepper = Container.get<Stepper>(Stepper);

      listener.setup(ws, () => {
          console.log("Websocket channel opened. Enabling runtime namespace")
  
          listener.sendAndRegister({method: "Runtime.enable"})
          listener.sendAndRegister({method: "Page.enable"})
  
          


          stepper.execute(`
            goto https://www.google.com
            focus [name=q]
            sleep 2000
            key c
            sleep 1000
          `)
  
  
        })
    
    })

  });


});
