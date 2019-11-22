import "reflect-metadata";
import { injectable } from "inversify";


@injectable()
export default class Listener{

    static counter: number = 0;

    listeners: { [key: number]: {
        cb: (data: any, id?: number, meta?: any) => void,
        deleteOnReceive: boolean,
        meta: any
    } }

    callbacks: {
        [key: string]: ((data: any) => void)[]
    }
    
    ws = null;


    setup(ws, onOpen: () => void){
        this.listeners = {}
        this.callbacks = {}
        this.ws = ws;

        ws.on('open', onOpen);

        ws.on("message", (data: string) => {

            const obj = JSON.parse(data)

            if("error" in obj)
                console.error(obj.error.message)

            if(obj.id in this.listeners)
            {
                this.listeners[obj.id].cb(obj, obj.id, this.listeners[obj.id].meta)

                if(this.listeners[obj.id].deleteOnReceive)
                    delete this.listeners[obj.id]
            }else if("method" in obj){
                const namespace =  obj.method.split(".")[0]
                const event = obj.method.split(".")[1]
                let cbs: any[] = [];

                if(`${namespace}.${event}` in this.callbacks){
                    cbs = this.callbacks[obj.method];
                }
                else if (namespace in this.callbacks){
                    cbs = this.callbacks[namespace]
                }
                else
                    console.warn(`Message without callback ${obj.method}`)

                if(cbs){
                    for(let cb1 of cbs)
                        cb1(data)
                }
            }          

        })
    }

    addCallback(method: string, cb: (data: any) => void){
        if(!(method in this.callbacks))
            this.callbacks[method] = []

        this.callbacks[method].push(cb)
    }

    sendAndRegister(data: any, cb: (msg, id?: Number, meta?: any) => void = null, meta?:any, removeOnReceive: boolean = true){

        const id = Listener.counter++;

        if(!!cb)
            this.listeners[id] = {
                deleteOnReceive : removeOnReceive,
                cb,
                meta
            }

        this.ws.send(JSON.stringify({id, ...data}))
    }

}