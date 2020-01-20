namespace Objects {
    
    export class Battler{
        name: string
        spd: number
        vit: number    
        atk: number
        
        constructor(name: string = "unnamed"){
            this.name = name
            this.spd = 12
            this.vit = 12
            this.atk = 12
        }

        update(): void {

        }
    }  
}

export = Objects