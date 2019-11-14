import { injectable, inject } from "inversify";
import Api from "./api";
import Listener from "./listener";
import * as fs from 'fs';
import { print } from "util";
import { stringLiteral } from "babel-types";
import * as base64 from 'base64-img';

@injectable()
export default class ProfileRecorder{
    
    @inject(Listener)
    listener: Listener;

    sessionName: string;

    start(sessionName: string){

        this.sessionName = sessionName;
        this.listener.sendAndRegister({method: "Profiler.enable"}, (data) =>{
            this.listener.sendAndRegister({method: 'Profiler.start'})
        })
    }

    stop(){
        this.listener.sendAndRegister({method: 'Profiler.stop'}, (data, id) => {
            fs.writeFileSync(`out/${id}-${this.sessionName}.profile`, JSON.stringify(data, null, 4))
        })
    }
}