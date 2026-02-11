import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log("=== FORNECEDORES ===");
const [suppliers] = await conn.query('SELECT id, name, cnpj FROM suppliers LIMIT 10');
console.log(suppliers);

console.log("\n=== COTAÇÕES ===");
const [quotes] = await conn.query('SELECT id, supplierId, requisitionId FROM quotes LIMIT 10');
console.log(quotes);

console.log("\n=== ARQUIVOS ===");
const [attachments] = await conn.query('SELECT id, requisitionId, fileType, fileName FROM requisition_attachments LIMIT 10');
console.log(attachments);

await conn.end();
