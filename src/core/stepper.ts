import "reflect-metadata";

import { injectable, inject } from "inversify";
import Listener from "./listener";
import Api from "./api";

export type opcodes = 'goto' | 'sleep' | 'key' | 'focus'

@injectable()
export default class Stepper {

    @inject(Api)
    listener: Api;

    actions: {
        opcode: opcodes, params: string[]
    }[];

    execute(actions: string){

        // Split in instructions IR

        const instructions = actions.split("\n")

        this.actions = instructions
        .map(i => i.trim())
        .filter(val => !!val)
        .map(i => {
            const tokens = i.split(" ")
            return {
                opcode: tokens[0] as opcodes,
                params: tokens.slice(1)
            }
        });

        this.executeInstructions(this.actions)
    }

    validateNumberOfParamsAndRaise(opcode, count, assert){
        if(count !== assert)
            throw `Invalid number of arguments for '${opcode}' ${assert}/${count}`
    }

    executeInstructions = (actions: {
        opcode: opcodes, params: string[]
    }[]) => {
        
        console.log(actions)
        for(let i = 0; i < actions.length; i++){
            let code = actions[i]


            let interrupt = false;
            console.log(code)
            switch(code.opcode){
                case 'goto':
                    this.validateNumberOfParamsAndRaise(code.opcode, code.params.length, 1)
                    this.listener.gotoPage(code.params[0])
                    break;
                case 'focus':
                    this.validateNumberOfParamsAndRaise(code.opcode, code.params.length, 1)
                    this.listener.focus(code.params[0])
                    break;
                case 'key':
                    this.validateNumberOfParamsAndRaise(code.opcode, code.params.length, 1)
                    this.listener.sendKey(code.params[0])
                    break;
                case 'sleep':
                    this.validateNumberOfParamsAndRaise(code.opcode, code.params.length, 1)
                    
                    console.log("Sleeping for...", parseInt(code.params[0]))

                    setTimeout(this.executeInstructions, parseInt(code.params[0]), 
                        actions.slice(i + 1)
                    )
                    
                    interrupt = true;
                  break;
                    
                  default:
                    console.error(`Unknown code ${code.opcode} ${code.params}`)
            }

            if(interrupt)
                break;


        }

    }

}