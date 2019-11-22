import { injectable, inject } from "inversify";
import Api from "./api";
import Listener from "./listener";
import * as fs from 'fs';
import { print } from "util";
import { stringLiteral } from "babel-types";
import * as base64 from 'base64-img';

@injectable()
export default class SnapshotRecorder{
    
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
                method: 'Page.captureSnapshot'
                
            }, (data, id) => {

                if(!data.result)
                    return;
                
                if(!fs.existsSync(`out/${sessionName}/snapshots`))
                    fs.mkdirSync(`out/${sessionName}/snapshots`)

               fs.writeFileSync(`out/${sessionName}/snapshots/${this.pad(id, (id + '').length)}.mthml`, data.result.data);

            })
        }, interval)

    }

    stop(){
        clearInterval(this.interval)
    }
}