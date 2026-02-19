#!/usr/bin/env node
/**
 * Script para importar permissões da planilha para o banco de dados
 * Usa a conexão do Drizzle ORM do projeto
 */
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';
import * as schema from './drizzle/schema.ts';

const { customRoles, rolePermissions } = schema;

// Mapeamento da planilha (ABA 1 - Menu Sidebar)
const PERMISSIONS_MAP = {
  diretor: {
    dashboard: 'total',
    compras: 'total',
    autorizacoes: 'total',
    estoque: 'total',
    orcamentos: 'total',
    manutencoes: 'total',
    chat: 'total',
    financeiro: 'total',
    relatorios: 'total',
    configuracoes: 'total',
    gestao: 'total',
    banco_dados: 'total',
  },
  comprador: {
    dashboard: 'total',
    compras: 'total',
    estoque: 'total',
    orcamentos: 'total',
    financeiro: 'readonly',
    banco_dados: 'total',
  },
  almoxarife: {
    dashboard: 'total',
    compras: 'readonly',
    estoque: 'total',
  },
  manutencao: {
    dashboard: 'total',
    compras: 'readonly',
    manutencoes: 'total',
    banco_dados: 'total',
  },
  financeiro: {
    dashboard: 'total',
    compras: 'readonly',
    financeiro: 'total',
  },
};

// Submódulos específicos
const SUBMODULE_PERMISSIONS = {
  manutencao: {
    compras: {
      manutencao: 'readonly',  // Manutenção vê Compras > Manutenção
    },
    banco_dados: {
      fornecedores: 'total',
      equipamentos: 'total',
      locais: 'total',
    }
  }
};

async function main() {
  console.log('🚀 Iniciando importação de permissões...\n');
  
  // Conectar ao banco
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });
  
  try {
    for (const [roleName, modules] of Object.entries(PERMISSIONS_MAP)) {
      console.log(`📋 Processando role: ${roleName}`);
      
      // Buscar role ID
      const [role] = await db.select().from(customRoles).where(eq(customRoles.name, roleName));
      if (!role) {
        console.log(`  ⚠️  Role '${roleName}' não encontrado no banco!`);
        continue;
      }
      
      // Limpar permissões antigas
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id));
      console.log(`  🗑️  Permissões antigas removidas`);
      
      // Inserir novas permissões
      const permissionsToInsert = [];
      
      for (const [module, level] of Object.entries(modules)) {
        if (level !== 'none') {
          permissionsToInsert.push({
            roleId: role.id,
            module,
            submodule: null,
            permissionLevel: level,
          });
          console.log(`    ✅ ${module}: ${level}`);
        }
      }
      
      // Inserir permissões de submódulos específicos
      if (SUBMODULE_PERMISSIONS[roleName]) {
        for (const [module, submodules] of Object.entries(SUBMODULE_PERMISSIONS[roleName])) {
          for (const [submodule, level] of Object.entries(submodules)) {
            if (level !== 'none') {
              permissionsToInsert.push({
                roleId: role.id,
                module,
                submodule,
                permissionLevel: level,
              });
              console.log(`    ✅ ${module}/${submodule}: ${level}`);
            }
          }
        }
      }
      
      if (permissionsToInsert.length > 0) {
        await db.insert(rolePermissions).values(permissionsToInsert);
      }
      
      console.log(`  ✨ Total: ${permissionsToInsert.length} permissões inseridas\n`);
    }
    
    console.log('✅ Importação concluída com sucesso!');
    console.log('🔄 Usuários devem fazer F5 para ver as mudanças\n');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
