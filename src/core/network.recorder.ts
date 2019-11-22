import { injectable, inject } from "inversify";
import Api from "./api";
import Listener from "./listener";
import * as fs from 'fs';
import { print } from "util";
import { stringLiteral } from "babel-types";
import * as base64 from 'base64-img';
const request = require("request")
import {spawn, exec} from 'child_process';

@injectable()
export default class NetworkRecorder{
    
    @inject(Listener)
    listener: Listener;

    sessiongName: string;
    fd: number;
    
    start(sessionName: string){
        
        this.sessiongName = sessionName;

        this.listener.sendAndRegister({method: "Network.enable"}, (data) =>{
            
            this.fd = fs.openSync(`out/${sessionName}/network.raw.json`, 'w')

            fs.writeSync(this.fd, "[\n")

            this.listener.addCallback("Network", data => {
                fs.writeSync(this.fd, `${data},\n`)
            })
        })
    }

    stop(){
        fs.writeSync(this.fd, `]`)

        fs.closeSync(this.fd)
    }
}