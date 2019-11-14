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
            key k
            sleep 200
            key t
            sleep 200
            key h
            sleep 200
            
            key 'U'
            sleep 200
            
            key u
            sleep 200
            
          `)
  
  
        })
    
    })

  });

  it('parser', function() {
    
      const listener = Container.get<Listener>(Listener);
      const api = Container.get<Api>(Api);
      const stepper = Container.get<Stepper>(Stepper);


      let tokens = stepper.tokenize('goto https://www.google.com')
      expect(tokens.length).equal(2, "No correct parsing 'goto https://www.google.com'")


      tokens = stepper.tokenize('sleep 500')
      expect(tokens.length).equal(2, "No correct parsing 'sleep 500'")


      tokens = stepper.tokenize('key 1')
      expect(tokens.length).equal(2, "No correct parsing 'key 1'")


      tokens = stepper.tokenize('focus "[name=q]"')
      console.log(tokens)
      expect(tokens.length).equal(2, "No correct parsing 'focus [name=q]'")


      tokens = stepper.tokenize('keys "Javier Cabrera Arteaga" 200')
      console.log(tokens)
      expect(tokens.length).equal(3, "No correct parsisng 'keys 'Javier Cabrera Arteaga' 200'")


      tokens = stepper.tokenize('keys "Javier Cabrera Arteaga" 200 500')
      console.log(tokens)
      expect(tokens.length).equal(4, "No correct parsisng 'keys 'Javier Cabrera Arteaga' 200 500'")
  });

  it('parser2', function() {
    
    const listener = Container.get<Listener>(Listener);
    const api = Container.get<Api>(Api);
    const stepper = Container.get<Stepper>(Stepper);


    
    let tokens = stepper.expand([{
      opcode: 'keys',
      params: ['Javier Cabrera Arteaga', '400', '800']
    }])
    console.log(tokens)
});


});
