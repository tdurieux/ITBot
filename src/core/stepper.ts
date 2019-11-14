import "reflect-metadata";

import { injectable, inject } from "inversify";
import Listener from "./listener";
import Api from "./api";

export type opcodes = 'goto' | 'sleep' | 'key' | 'focus' | 'keys'

export type Instruction = {
    opcode: opcodes, params: string[]
};

@injectable()
export default class Stepper {

    @inject(Api)
    listener: Api;

    actions: Instruction[];

    tokenize(instruction: string){

        let tokens = []

        let buffer = '';
        let startString = false;

        for(let c of instruction){

            if(c === '\'' || c === '"'){
                startString = !startString;
                continue;
            }
            if(c === ' ' || c === '\t'){
                if(!startString){
                    tokens.push(buffer)
                    buffer = ''

                    continue;
                }
            }

            buffer += c;
        }

        tokens.push(buffer);

        return tokens;
    }

    execute(actions: string){

        // Split in instructions IR

        const instructions = actions.split("\n")

        this.actions = 
        this.expand(instructions
        .map(i => i.trim())
        .filter(val => !!val)
        .map(i => {
            const tokens = this.tokenize(i);
            return {
                opcode: tokens[0] as opcodes,
                params: tokens.slice(1)
            }
        }));

        this.executeInstructions(this.actions)
    }

    // Look for complex instruction and transform them to simpler oness
    expand(instructions: Instruction[]): Instruction[]{

        for(var i = 0; i < instructions.length; i++){
            
            let code = instructions[i];
            let opcode = instructions[i].opcode;

            switch(opcode){
                case 'keys':
                    this.validateNumberOfParamsAndRaise(code.opcode, code.params.length, 2)

                    const keys = code.params[0];
                    const min = parseInt(code.params[1]);
                    const max = code.params.length > 2 ? parseInt(code.params[2]): min;

                    const newCommands: Instruction[] = [];

                    for(var c of keys){
                        newCommands.push({
                            opcode: 'key',
                            params: [c]
                        })

                        newCommands.push({
                            opcode: 'sleep',
                            params: [
                                `${ min === max? min: (Math.random()*(max - min))}`
                            ]
                        })
                    }

                    instructions = [
                        ...instructions.slice(0, i),
                        ...newCommands,
                        ...instructions.slice(i + 1)
                    ]

                break;
            }
        }
        
        return instructions;
    }

    validateNumberOfParamsAndRaise(opcode, count, assert){
        if(count < assert)
            throw `Invalid number of arguments for '${opcode}' ${assert}/${count}`
    }

    executeInstructions = (actions:Instruction[]) => {
        
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