#!/bin/bash

###############################################################################
# VIBRA - Script de Inicialização Completa
#
# Este script inicia toda a aplicação usando Docker Compose
###############################################################################

set -e

echo "========================================="
echo "   VIBRA - Iniciando Aplicação Completa  "
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo "Por favor, instale o Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verifica se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo "Por favor, instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${BLUE}🐳 Docker e Docker Compose encontrados!${NC}"
echo ""

# Para containers antigos (se existirem)
echo -e "${YELLOW}🛑 Parando containers antigos...${NC}"
docker-compose down 2>/dev/null || true
echo ""

# Remove volumes antigos (CUIDADO: apaga dados!)
read -p "Deseja remover volumes antigos? (limpa banco de dados) [s/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}🗑️  Removendo volumes antigos...${NC}"
    docker-compose down -v
    echo ""
fi

# Build das imagens
echo -e "${BLUE}🔨 Construindo imagens Docker...${NC}"
docker-compose build --parallel
echo ""

# Inicia os serviços
echo -e "${GREEN}🚀 Iniciando todos os serviços...${NC}"
docker-compose up -d
echo ""

# Aguarda serviços ficarem saudáveis
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
echo ""

check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo -n "   ${service}: "

    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T $service wget --no-verbose --tries=1 --spider $url 2>/dev/null; then
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done

    echo -e "${RED}✗ FALHOU${NC}"
    return 1
}

# Aguarda bancos de dados
echo "Verificando bancos de dados..."
sleep 10

# Verifica saúde dos serviços
echo "Verificando saúde dos microserviços..."
check_health "users-service" "http://localhost:3001/health" || true
check_health "events-service" "http://localhost:3002/health" || true
check_health "functions-service" "http://localhost:3003/health" || true
check_health "bff-gateway" "http://localhost:3000/health" || true
check_health "frontend" "http://localhost:5173" || true

echo ""
echo "========================================="
echo -e "${GREEN}✅ Aplicação iniciada com sucesso!${NC}"
echo "========================================="
echo ""
echo "📦 Serviços disponíveis:"
echo ""
echo -e "  ${BLUE}Frontend:${NC}           http://localhost:5173"
echo -e "  ${BLUE}BFF Gateway:${NC}        http://localhost:3000"
echo -e "  ${BLUE}Users Service:${NC}      http://localhost:3001"
echo -e "  ${BLUE}Events Service:${NC}     http://localhost:3002"
echo -e "  ${BLUE}Functions Service:${NC}  http://localhost:3003"
echo ""
echo "🗄️  Bancos de Dados:"
echo ""
echo -e "  ${BLUE}MongoDB:${NC}            localhost:27017"
echo -e "    - User: admin / Pass: admin123"
echo -e "  ${BLUE}SQL Server:${NC}         localhost:1433"
echo -e "    - User: sa / Pass: YourStrong@Passw0rd"
echo ""
echo "📨 Message Broker:"
echo ""
echo -e "  ${BLUE}RabbitMQ:${NC}           http://localhost:15672"
echo -e "    - User: vibra / Pass: vibra123"
echo ""
echo "📚 Documentação API (Swagger):"
echo ""
echo -e "  ${BLUE}Users:${NC}    http://localhost:3001/api-docs"
echo -e "  ${BLUE}Events:${NC}   http://localhost:3002/api-docs"
echo -e "  ${BLUE}Functions:${NC} http://localhost:3003/api-docs"
echo -e "  ${BLUE}BFF:${NC}      http://localhost:3000/api-docs"
echo ""
echo "📊 Logs:"
echo ""
echo "  docker-compose logs -f               # Todos os serviços"
echo "  docker-compose logs -f frontend      # Apenas frontend"
echo "  docker-compose logs -f bff-gateway   # Apenas BFF"
echo ""
echo "🛑 Para parar:"
echo ""
echo "  docker-compose down                  # Para tudo"
echo "  docker-compose down -v               # Para e remove volumes"
echo ""
echo "========================================="
