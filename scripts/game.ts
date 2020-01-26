import Objects = require('./objects')

const PARTY_SIZE: number = 3;
const TICK_RATE: number = 20;
const hrtimeMs = function() {
    let time = process.hrtime();
    return time[0] * 1000 / TICK_RATE
}

const readline = require('readline')

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
//const readline = require('readline-sync')

class Game {
    private static _previousTick = hrtimeMs()
    private static _tick = 0;
    private static _tickLengthMs = 1000/TICK_RATE
    
    static control: number = 0
    static message: string = "hallo"
    static inputing: boolean = false
    static actors: Array<Objects.Battler>
    static enemies: Array<Objects.Battler>

    static run(): void {
        // this.loadNameDatabase()
        // this.createParties()
        // this.clearScreen()
        this.requestInput()
        this.requestUpdate()
        
    }

    static update(delta:number): void {
        console.log(this.message);
        
    }


    static requestUpdate(): void {
        if(this.control >= 100) {
            this.shutdown()
        }
        setTimeout(() => this.requestUpdate(), this._tickLengthMs)
        let now = hrtimeMs()
        let delta = (now - this._previousTick) / 1000
        //if(delta > 0){
        this.update(delta);//}
        this._previousTick = now
        this._tick++
        this.control++
    }

    static requestInput(): void {
        if(!this.isInputActive()){
            rl.question("blalalsaldalsda", (answer: any) => {
                this.message = "penis"
                rl.close()
            })
        }
    }

    static isInputActive(): boolean {
        return this.inputing
    }

    static createParties(): void {
        this.actors = this.createBattler(PARTY_SIZE)
        this.enemies = this.createBattler(PARTY_SIZE)
    }

    static createBattler(size: number): Array<Objects.Battler> {
        let party = []
        for (let i = 0; i < size; i++) {
            party.push(new Objects.Battler())
        }
        return party
    }

    static clearScreen(): void {

    }

    static clearManager(): void {

    }

    static reset(): void {

    }

    static shutdown(): void {
        process.exit()
    }
}

class Battle{
    static status: string = "start"
    static turnCount: number = 0
    static turnQueue: Array<number>

    static isBusy(): boolean {
        return false
    }
    
    static update(): void {
        if(!this.isBusy()){
            this.updateTurn()
        }
    }
    static setup(): void {

    }

    static createTurnOrder(): void {

    }

    static startBattle(): void {
        this.status = "start"
    }

    static updateTurn(): void {
        switch (this.status) {
            case 'start':
                break;
            case 'turnStart':
                break;
            case 'input':
                break;
            case 'turnEnd':
                break;
            case 'End':
                break;   
            default:  break    
        }
    }

}

export = Game