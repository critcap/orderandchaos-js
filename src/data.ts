import {Objects} from './objects'
import {Random} from './game'


 interface _config {
    elements: {
        fire: number,
        ice: number,
        lightning: number,
        holy: number,
        dark: number
    }
    damageTypes: {
        physical: number,
        magical: number,
        divine: number  
    }
}

export class Data {
    private static _fs: any = require('fs').promises
    private static _yml: any = require('js-yaml')
    private static _path: any = require('path')

    static Config: _config;
    static Skills: Array<Objects.Skill> = []
    static Items: Array<Objects.Item> = []


    static async loadDatabases(): Promise<any> {
        await this.loadConfigData()
        let skills = this.loadDataSkills()
        let items = this.loadDataItems()
        return Promise.all([skills, items])
    }

    static async loadConfigData(): Promise<void> {
        this.Config = await this.loadDataFile('config')
    }

    static async loadDataSkills(): Promise<void>{ 
        let skills = await this.loadDataFile('skills')
        this.processDataSkills(skills)
    }

    static async loadDataItems(): Promise<void> {
        let items = await this.loadDataFile('items')
        this.processDataItems(items)
    }

    static async loadDataNames(): Promise<any> {
        return this.loadDataFile('names')
    }

    static async fetchNames(count: number, type: string): Promise<Array<string>> {
        let names = await this.loadDataNames()
        let nameIndex: Array<number> = []
        while (nameIndex.length < count) {
            let rnd = Random.int(0, names[type].length - 1) 
            nameIndex.push(nameIndex.includes(rnd) ? null : rnd)
        }
        return nameIndex.map(index => names[type][index])
    }

    static processDataItems(data: Array<Objects._dataItem>): void {
        this.Items = data.map(obj => new Objects.Item(data.indexOf(obj), obj))
    }

    static getItem(ItemID: number): Objects.Item {
        return this.Items[ItemID];
    }

    static processDataSkills(data: Array<Objects._dataSkill>): void {
        this.Skills = data.map(obj => new Objects.Skill(data.indexOf(obj), obj))
    }

    static async loadDataFile(file: string, encoding: string = 'utf8'): Promise<any> {
        let path = this.getDataFilePath(file)
        let data = await this._fs.readFile(path, encoding)
        return this._yml.safeLoad(data)
    }

    static getDataFilePath(file: string): string {
        return this._path.join(__dirname, '/../data/' + file + '.yaml')
    }
}