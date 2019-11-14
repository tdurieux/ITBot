import { injectable, inject } from "inversify";
import Api from "./api";
import Listener from "./listener";
import * as fs from 'fs';
import { print } from "util";
import { stringLiteral } from "babel-types";
import * as base64 from 'base64-img';

@injectable()
export default class VideoRecorder{
    
    @inject(Listener)
    listener: Listener;

    interval: any;

    start(sessionName: string, interval: number){



        this.interval = setInterval(() => {
            this.listener.sendAndRegister({
                method: 'Page.captureScreenshot',
                params: {
                    format: 'png'
                }
            }, (data, id) => {
                
                if(!fs.existsSync("out"))
                    fs.mkdirSync("out")

                if(!fs.existsSync(`out/${sessionName}`))
                    fs.mkdirSync(`out/${sessionName}`)

               fs.writeFile(`out/${sessionName}/${id}.png`, data.result.data, {encoding: 'base64'}, function(err) {
                });

            })
        }, interval)

    }

    stop(){
        clearInterval(this.interval)
    }
}