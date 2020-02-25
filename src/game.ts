import {Objects} from './objects';
import {Scenes} from './scenes';
import {Battle} from './battle'

export const Graphics = require('terminal-kit').terminal
Graphics.grabInput(true)
Graphics.on('key', (name:any, data:any) => {
    switch (name) {
        case "z":
            Game.shutdown()
            break;
        case "u":
            Graphics.deleteLine(1)
            break;
        
        default:
            break;
    }
    
})
const PARTY_SIZE: number = 3;
const TICK_RATE: number = 20;
const hrtimeMs = function () {let time = process.hrtime(); return time[0] * 1000 / TICK_RATE}

export class Game {
    private static _previousTick = hrtimeMs()
    private static _tickLengthMs = 1000 / TICK_RATE
    private static _control: number = 0
    private static _input: any = undefined
    private static _timeToWait: number = 0;
    
    static heroes: Array<Objects.Character> = []
    static enemies: Array<Objects.Character> = []

    static run(): void {
        Graphics.clear()
        this.createHeroes()
        this.createEncounter()
        Battle.setup()
        this.requestUpdate()       
    }
    
    static update(): void {
        if(Battle.inProgress()){
            Battle.updateTurn()
        }
    }

    static createHeroes(): void {
        for (let i = 1; i <= PARTY_SIZE; i++) {
            this.heroes.push(new Objects.Character())
        } 
    }

    static createEncounter(): void {
        for (let i = 1; i <= PARTY_SIZE; i++) {
            this.enemies.push(new Objects.Character())       
        }
    }

    static requestUpdate(): void {
        setTimeout(() => this.requestUpdate(), this._tickLengthMs)
        let now = hrtimeMs()
        let delta = (now - this._previousTick) / 1000
        this._previousTick = now
        if (!this.isStopped()) {
            this.update();
        }
    }

    static isInputActive(): boolean {
        return (this._input)? true : false;
    }

    static openInput(input: any): void {
        if(!this.isInputActive()) {
            this._input = input;
        }
    }
    static overrideInput(input: any): void {
        if(this.isInputActive()) {
            this._input = input
        }
    }

    static closeInput(): void {
        this._input = undefined
    }

    static isWaiting(): boolean {
        return this._timeToWait > 0
    }

    static isStopped(): boolean {
        if(this.isInputActive()) return true;
        if(this.isWaiting()) return true;
        return false;
    }
   
    static shutdown(): void {
        Graphics.processExit()
    }
}




//export = Game