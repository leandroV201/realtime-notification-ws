#!/bin/bash

# Script para testar o sistema de notificações
# Envia diferentes tipos de notificações para o usuário demo

API_URL="http://localhost:3001"
USER_ID="827a04a7-44f2-4a80-8ea2-fea7bea7c115"

echo "🚀 Testando Sistema de Notificações em Tempo Real"
echo "=================================================="
echo ""

# Teste 1: Notificação de informação
echo "📧 Enviando notificação de INFO..."
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"info\",
    \"title\": \"Bem-vindo!\",
    \"message\": \"Sistema de notificações em tempo real está funcionando perfeitamente.\",
    \"data\": {
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }
  }"
echo -e "\n"
sleep 2

# Teste 2: Notificação de sucesso
echo "✅ Enviando notificação de SUCESSO..."
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"success\",
    \"title\": \"Operação Concluída\",
    \"message\": \"Seu pedido #12345 foi processado com sucesso.\",
    \"data\": {
      \"orderId\": \"12345\",
      \"amount\": 299.90
    }
  }"
echo -e "\n"
sleep 2

# Teste 3: Notificação de aviso
echo "⚠️  Enviando notificação de AVISO..."
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"warning\",
    \"title\": \"Atenção Necessária\",
    \"message\": \"Seu cartão de crédito expira em 7 dias. Atualize suas informações.\",
    \"data\": {
      \"cardLast4\": \"4242\",
      \"expiryDate\": \"2026-02-28\"
    }
  }"
echo -e "\n"
sleep 2

# Teste 4: Notificação de erro
echo "❌ Enviando notificação de ERRO..."
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"error\",
    \"title\": \"Falha no Pagamento\",
    \"message\": \"Não foi possível processar o pagamento. Verifique seus dados.\",
    \"data\": {
      \"errorCode\": \"INSUFFICIENT_FUNDS\",
      \"attemptedAmount\": 1500.00
    }
  }"
echo -e "\n"
sleep 2

# Teste 5: Notificação com dados complexos
echo "📦 Enviando notificação com DADOS COMPLEXOS..."
curl -X POST "$API_URL/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"type\": \"info\",
    \"title\": \"Nova Mensagem\",
    \"message\": \"João Silva enviou uma mensagem para você.\",
    \"data\": {
      \"sender\": {
        \"id\": \"user-789\",
        \"name\": \"João Silva\",
        \"avatar\": \"https://i.pravatar.cc/150?u=joao\"
      },
      \"message\": \"Oi! Podemos conversar sobre o projeto?\",
      \"conversationId\": \"conv-456\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }
  }"
echo -e "\n"

echo ""
echo "✨ Testes concluídos!"
echo "👀 Verifique o frontend em: http://localhost:5173/demo/Notification"
echo "📊 Verifique os logs do backend para acompanhar o processamento"