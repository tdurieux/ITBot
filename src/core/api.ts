import "reflect-metadata";

import { injectable, inject } from "inversify";
import Listener from "./listener";


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

    sendKey(key: string){
        this.listener.sendAndRegister({method: "Input.dispatchKeyEvent", params: {
            type: 'keyDown',
            text: key
        }})
    }

}