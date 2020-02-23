import {Objects} from './objects';
import {Scenes} from './scenes';
import {Battle} from './battle'

export const Graphics = require('terminal-kit').terminal
const ATTACK_TIME = 50;
const PARTY_SIZE: number = 2;
const TICK_RATE: number = 20;
const hrtimeMs = function () {
    let time = process.hrtime();
    return time[0] * 1000 / TICK_RATE
}

const readline = require('readline-sync')

export class Game {
    private static _previousTick = hrtimeMs()
    private static _tick = 0;
    private static _tickLengthMs = 1000 / TICK_RATE
    private static control: number = 0

    static inputing: boolean = false
    static heroes: Array<Objects.Character> = []
    static enemies: Array<Objects.Character> = []

    static timeToWait: number = 0;
    static stopped: boolean = false;

    static run(): void {
        Graphics.clear()
        
        this.createHeroes()
        this.createEncounter()
        let x= new Scenes.Scene()
        Battle.setup()
        this.requestUpdate()       
    }

    static update(): void {
        (this.control >= 100)? this.shutdown(): this.control++
        if(Battle.status !== 'standby'){
            Battle.updateTurn()
        }
    }

    static createHeroes(): void {
        for (let i = 1; i <= PARTY_SIZE; i++) {
            let name: string = this.requestInput(`Whats the Name of the ${i}. Hero?`) 
            this.heroes.push(new Objects.Character(name))
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
        this._tick++
        if (!this.isStopped()) {
            this.update();
        }
    }

    static requestInput(message: string): any {
        if (!this.isInputActive()) {
            this.inputing = true
            let input = readline.question(message)
            this.inputing = false;
            return input
        }
    }

    static isInputActive(): boolean {
        return this.inputing
    }

    static isWaiting(): boolean {
        return this.timeToWait > 0
    }

    static isStopped(): boolean {
        if(this.isInputActive()) return true;
        if(this.isWaiting()) return true;
        return false;
    }
   
    static shutdown(): void {
        process.exit()
    }
}




//export = Game