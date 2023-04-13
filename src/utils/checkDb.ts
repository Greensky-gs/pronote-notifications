import { query } from "./query"

export const checkDatabase = async() => {
    await query(`CREATE TABLE IF NOT EXISTS cache ( notes LONGTEXT, messages LONGTEXT, devoirs LONGTEXT, cours LONGTEXT )`);
    const result = await query<{ notes: string }>(`SELECT notes FROM cache`);

    if (result.length === 0) await query(`INSERT INTO cache ( notes, messages, devoirs, cours ) VALUES ('[]', '[]', '[]', '[]')`);

    return true;
}