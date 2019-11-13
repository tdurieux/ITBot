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

}