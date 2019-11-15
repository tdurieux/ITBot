import { injectable, inject } from "inversify";
import Api from "./api";
import Listener from "./listener";
import * as fs from 'fs';
import { print } from "util";
import { stringLiteral } from "babel-types";
import * as base64 from 'base64-img';
const request = require("request")
import {spawn} from 'child_process';

@injectable()
export default class ProfileRecorder{
    
    @inject(Listener)
    listener: Listener;

    start(){
        this.listener.sendAndRegister({method: "Profiler.enable"}, (data) =>{
            this.listener.sendAndRegister({method: 'Profiler.start'})
        })
    }

    fetchScript(url, sessionName, id){


        try{
            const curl = spawn("curl", [url])
            let buffer = '';

            curl.stdout.on("data", (data) => {
                buffer += data
                console.log(1)
            })

            curl.on("close", (code) => {
                console.log(1)
                fs.readFileSync(`out/${sessionName}/profiling/${id}.js`)
            })
        }
        catch(e){
            console.error('Error', e, url)
        }
    }

    stop(sessionName: string, cb: () => void){
        this.listener.sendAndRegister({method: 'Profiler.stop'}, (data, id) => {
            
            if(!fs.existsSync(`out/${sessionName}/profiling`))
                fs.mkdirSync(`out/${sessionName}/profiling`)

            console.log("Nodes count ...", data.result.profile.nodes.length)

            fs.writeFileSync(`out/${sessionName}/profile.json`, JSON.stringify(data.result.profile, null, 4));
            
            // Saving function script file
            for(let node of data.result.profile.nodes){
                if("callFrame" in node && "url" in node.callFrame && "functionName" in node.callFrame 
                && !!node.callFrame.url 
                && node.callFrame.url.startsWith("http")
                && !!node.callFrame.functionName){
                    // this.fetchScript(node.callFrame.url, sessionName, node.callFrame.scriptId)
                }
            }

            // Write samples as STRAC input
            const fd = fs.openSync(`out/${sessionName}/profile.STRAC.samples`, "w");

            for(let sample of data.result.profile.samples)
                fs.writeSync(fd, `${sample}\n`)
            fs.closeSync(fd)

            cb();
        })
    }
}