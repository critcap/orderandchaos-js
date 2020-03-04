import {Objects} from './objects'

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
    static Items: Array<any>

    static async loadDatabases(): Promise<any> {
        await this.loadConfigData()
        let skills = this.loadDataSkills()
        return Promise.all([skills])
    }

    static async loadConfigData(): Promise<void> {
        this.Config = await this.loadDataFile('config')
    }

    static  async loadDataSkills(): Promise<void>{ 
        let skills = await this.loadDataFile('skills')
        this.processDataSkills(skills)
    }

    static processDataSkills(data: Array<Objects._dataSkill>): void {
        this.Skills = data.map(obj => {
            return new Objects.Skill(data.indexOf(obj), obj)
        })
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