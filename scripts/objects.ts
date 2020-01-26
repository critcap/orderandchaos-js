const faker = require('faker')

namespace Objects {
    
    export class Battler{
        name: string
        spd: number
        vit: number    
        atk: number
        
        constructor(){
            this.name = faker.name.findName()
            this.spd = 12
            this.vit = 12
            this.atk = 12
        }

        update(): void {

        }
    }  
}

export = Objects