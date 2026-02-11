import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log("=== COTAÇÕES ÓRFÃS (fornecedor não existe) ===");
const [orphans] = await conn.query(`
  SELECT q.id, q.supplierId, q.requisitionId 
  FROM quotes q 
  LEFT JOIN suppliers s ON q.supplierId = s.id 
  WHERE s.id IS NULL
`);
console.log(orphans);

await conn.end();
