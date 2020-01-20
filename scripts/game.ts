import Objects = require('./objects')

const PARTY_SIZE: number = 3;
var $dataNames: Array<String>;

class Game {
    static _connected: boolean;

    static actors: Array<Objects.Battler>
    static enemies: Array<Objects.Battler>

    static run(): void {
        //check internet connection
        this.loadNameDatabase()
        this.createParties()
        this.clearScreen()
        this.requestInput()
        this.requestUpdate()
    }

    static requestInput(): void {
        if(!process.stdin.isTTY){
            
        }
    }

    static shutdown(): void {
        process.exit()
    }

    static clearScreen(): void {

    }

    static clearManager(): void {

    }

    static reset(): void {

    }

    static requestUpdate(): void {

    }

    static loadNameDatabase(): void {
        //load name list from the internet
        $dataNames = ["Peter", "Franz", "Jürgen"]
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
}

export = Game