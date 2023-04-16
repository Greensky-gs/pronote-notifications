import { log4js } from "amethystjs";
import { cache } from "../typings/db";
import { query } from "./query"

const checkForCorrectInstance = (value: (string | Record<string, string>)[]) => {
    if (typeof value[0] === 'string') return false;
    return true;
}
export const checkDatabase = async() => {
    await query(`CREATE TABLE IF NOT EXISTS cache ( notes LONGTEXT, messages LONGTEXT, devoirs LONGTEXT, cours LONGTEXT )`);
    const result = await query<Omit<cache, 'notes' | 'devoirs' | 'messages'>>(`SELECT cours FROM cache`);

    if (result.length === 0) await query(`INSERT INTO cache ( notes, messages, devoirs, cours ) VALUES ('[]', '[]', '[]', '[]')`);

    if (result.length > 0 && !checkForCorrectInstance(JSON.parse(result[0].cours))) {
        log4js.trace(`Updating value of cache in database because of invalide type for cours`);
        await query(`UPDATE cache SET cours='[]'`);
    };
    return true;
}