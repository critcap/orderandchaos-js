const faker = require('faker')

namespace Objects {
    
    export class Character{
        name: string
        spd: number
        vit: number    
        atk: number
        
        constructor(){
            this.name = faker.name.findName()
            this.spd = Math.floor((Math.random() * 32) + 32)
            this.vit = Math.floor((Math.random() * 64)+32)
            this.atk = Math.floor((Math.random() * 64)+32)
        }

        update(): void {

        }

    }  
    export class Battler {
        name: string
        spd: number
        vit: number
        atk: number
        
        qt: number
        alive: boolean

        constructor(data: Character){
            this.name = data.name 
            this.spd = data.spd 
            this.vit = data.vit 
            this.atk = data.atk 
            this.qt = null
            this.alive = this.checkLifeStatus(data)
        }

        checkLifeStatus(data:Character): boolean {
            return data.vit > 0;
        }
    }

    export class SceneBattle{
        constructor(){

        }
        start(): void {

        }

        update(): void {

        }

        end(): void {

        }
    }
}

export = Objects