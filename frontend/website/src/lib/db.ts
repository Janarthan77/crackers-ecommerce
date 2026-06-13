import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), '../../data/db.json');

export const readDB = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.admin) {
            parsed.admin = { username: 'admin', password: 'password' };
        }
        return parsed;
    } catch (err) {
        return { categories: [], products: [], orders: [], admin: { username: 'admin', password: 'password' } };
    }
};

export const writeDB = (data: any) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};
