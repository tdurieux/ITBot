import "reflect-metadata";

import { injectable, inject } from "inversify";
import Listener from "./listener";
import { print } from "util";


@injectable()
export default class Api {

    @inject(Listener)
    listener: Listener;

    gotoPage(page: string){
        this.listener.sendAndRegister({method: "Page.navigate", params: { url: page}})
    }


    focus(cssSelector: string){
        this.listener.sendAndRegister({method: "Runtime.evaluate", params: {
            expression: `document.querySelector("${cssSelector}").focus()`
        }})
    }

    blur(cssSelector: string){
        this.listener.sendAndRegister({method: "Runtime.evaluate", params: {
            expression: `document.querySelector("${cssSelector}").blur()`
        }})
    }

    sendChar(key: string){
        this.listener.sendAndRegister({method: "Input.dispatchKeyEvent", params: {
            type: 'char',
            text: key
        }})
    }
    
    sendKey(key: string, number: number, text: string, code: string){

        this.listener.sendAndRegister({method: "Input.dispatchKeyEvent", params: {
            type: 'keyDown',
            nativeVirtualKeyCode: number,
            key,
            location: 0,
            text,
            code

        }})
    }

}