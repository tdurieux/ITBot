import "reflect-metadata";
import { injectable } from "inversify";


@injectable()
export default class Listener{

    static counter: number = 42;

    listeners: { [key: number]: {
        cb: (data: any) => void,
        deleteOnReceive: boolean
    } }
    
    ws = null;


    setup(ws, onOpen: () => void){
        this.listeners = {}
        this.ws = ws;

        ws.on('open', onOpen);

        ws.on("message", (data: string) => {

            const obj = JSON.parse(data)

            if("error" in obj)
                console.error(obj.error.message)

            if(obj.id in this.listeners)
            {
                this.listeners[obj.id].cb(data)

                if(this.listeners[obj.id].deleteOnReceive)
                    delete this.listeners[obj.id]
            }          

        })
    }

    sendAndRegister(data: any, cb: (msg) => void = null,  removeOnReceive: boolean = true){

        const id = Listener.counter++;

        if(!!cb)
            this.listeners[id] = {
                deleteOnReceive : removeOnReceive,
                cb
            }

        this.ws.send(JSON.stringify({id, ...data}))
    }

}