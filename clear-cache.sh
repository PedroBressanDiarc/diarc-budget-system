#!/bin/bash

echo "🧹 Limpando cache do projeto..."

# Limpar cache do Vite
echo "  → Removendo cache do Vite..."
rm -rf client/dist
rm -rf client/.vite
rm -rf client/node_modules/.vite

# Limpar cache do navegador (instruções)
echo ""
echo "✅ Cache do build limpo!"
echo ""
echo "📝 IMPORTANTE: Limpe também o cache do navegador:"
echo ""
echo "Chrome/Edge:"
echo "  1. Pressione Ctrl+Shift+Delete"
echo "  2. Selecione 'Imagens e arquivos em cache'"
echo "  3. Clique em 'Limpar dados'"
echo ""
echo "OU simplesmente:"
echo "  → Pressione Ctrl+Shift+R (hard reload)"
echo "  → Ou Ctrl+F5"
echo ""
echo "Firefox:"
echo "  → Pressione Ctrl+Shift+R"
echo ""
echo "🚀 Agora reinicie o servidor: pnpm dev"
