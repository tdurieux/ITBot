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
import VideoRecorder from '../src/core/video.recorder';

const main = Container.get<Main>(Main)
const listener = Container.get<Listener>(Listener);
const api = Container.get<Api>(Api);
const stepper = Container.get<Stepper>(Stepper);
const recorder = Container.get<VideoRecorder>(VideoRecorder);

describe('Api test', function() {
  it('Api commands', function() {
    
    main.run("test", 1000, (tab) => {

      const url = tab.webSocketDebuggerUrl;
          
      const ws = new WebSocket(url);

      listener.setup(ws, () => {
          console.log("Websocket channel opened. Enabling runtime namespace")
        
          recorder.start("test_session", 100)

          listener.sendAndRegister({method: "Runtime.enable"})
          listener.sendAndRegister({method: "Page.enable"})
  
          


          stepper.execute(`
            goto https://www.google.com
            focus [name=q]
            sleep 2000
            
            text 'KTH Assert' 200 400

            key Enter
            
            sleep 2500

            focus [name=q]

            key Escape

            sleep 2000

            text 'assert-team.eu' 200 400

            key Enter
            
            sleep 2500
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
      opcode: 'text',
      params: ['Javier Cabrera Arteaga', '400', '800']
    }])
    console.log(tokens)
});


});
