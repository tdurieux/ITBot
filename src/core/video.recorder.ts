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
    
    pad(num, size) {
        var s = "00000000000" + num;
        return s.substr(size);
    }

    start(sessionName: string, interval: number){



        this.interval = setInterval(() => {
            this.listener.sendAndRegister({
                method: 'Page.captureScreenshot',
                params: {
                    format: 'jpeg',
                    quality: 20,
                }
            }, (data, id) => {
                
                if(!fs.existsSync(`out/${sessionName}/screnshots`))
                    fs.mkdirSync(`out/${sessionName}/screnshots`)

               fs.writeFile(`out/${sessionName}/screnshots/${this.pad(id, (id + '').length)}.png`, 
               data.result.data, {encoding: 'base64'}, function(err) {
                });

            })
        }, interval)

    }

    stop(){
        clearInterval(this.interval)
    }
}