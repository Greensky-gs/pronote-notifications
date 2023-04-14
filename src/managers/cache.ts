import { query } from '../utils/query';
import { cache } from '../typings/db';

export class Cache {
    private _marks: string[] = [];
    private _works: string[] = [];
    private messages: string[] = []
    private _cours: string[] = [];

    constructor() {
        this.start();
    }
    public isMarkCached(id: string) {
        return this._marks.includes(id);
    }
    public addMark(id: string) {
        if (this.isMarkCached(id)) return this;
        this._marks.push(id);

        return this;
    }
    public get marks() {
        return this._marks;
    }

    public isWorkCached(id: string) {
        return this._works.includes(id)
    }
    public addWork(id: string) {
        if (this.isWorkCached(id)) return this;
        this._works.push(id);

        return this;
    }
    public get works() {
        return this._works;
    }

    public isInfoCached(id: string) {
        return this.messages.includes(id);
    }
    public addInfo(id: string) {
        if (!this.isInfoCached(id)) return this;
        this.messages.push(id)

        return this;
    }
    public get infos() {
        return this.messages;
    }
    
    public isCoursCached(id: string) {
        return this._cours.includes(id)
    }
    public addCours(id: string) {
        if (this.isCoursCached(id)) return this;
        this._cours.push(id)

        return this;
    }
    public get cours() {
        return this._cours;
    }

    private start() {
        this.fillCache();

        setInterval(() => {
            query(`UPDATE cache SET notes='${JSON.stringify(this._marks)}', devoirs='${JSON.stringify(this._works)}', messages='${JSON.stringify(this.messages)}', cours='${JSON.stringify(this._cours)}'`);
        }, 300000)
    }
    private async fillCache() {
        const results = await query<cache>(`SELECT * FROM cache`);
        if (!results) {
            throw new Error("Erreur avec la base de données")
        }

        this._marks = JSON.parse(results[0].notes);
        this._works = JSON.parse(results[0].devoirs);
        this.messages = JSON.parse(results[0].messages);
        this._cours = JSON.parse(results[0].cours)
    }
}