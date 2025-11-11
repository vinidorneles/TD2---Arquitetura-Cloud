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

# Detecta comando docker compose (v2) ou docker-compose (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${BLUE}🐳 Docker Compose v2 encontrado!${NC}"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${BLUE}🐳 Docker Compose v1 encontrado!${NC}"
else
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo "Por favor, instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo ""

# Para containers antigos (se existirem)
echo -e "${YELLOW}🛑 Parando containers antigos...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true
echo ""

# Remove volumes antigos (CUIDADO: apaga dados!)
read -p "Deseja remover volumes antigos? (limpa banco de dados) [s/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}🗑️  Removendo volumes antigos...${NC}"
    $DOCKER_COMPOSE down -v
    echo ""
fi

# Build das imagens
echo -e "${BLUE}🔨 Construindo imagens Docker...${NC}"
$DOCKER_COMPOSE build --parallel 2>/dev/null || $DOCKER_COMPOSE build
echo ""

# Inicia os serviços
echo -e "${GREEN}🚀 Iniciando todos os serviços...${NC}"
$DOCKER_COMPOSE up -d
echo ""

# Aguarda serviços ficarem saudáveis
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
echo ""

check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    echo -n "   ${service}: "

    while [ $attempt -le $max_attempts ]; do
        # Checa se container está healthy
        local health_status=$($DOCKER_COMPOSE ps --format json 2>/dev/null | grep -o "\"Health\":\"[^\"]*\"" | grep $service | cut -d'"' -f4)

        if [[ "$health_status" == "healthy" ]]; then
            echo -e "${GREEN}✓ Healthy${NC}"
            return 0
        elif [[ "$health_status" == "starting" ]]; then
            echo -n "."
        else
            # Tenta ping direto se não tiver health check
            if curl -f -s http://localhost:${2} > /dev/null 2>&1; then
                echo -e "${GREEN}✓ OK${NC}"
                return 0
            fi
            echo -n "."
        fi

        sleep 2
        ((attempt++))
    done

    echo -e "${YELLOW}⚠ Timeout${NC}"
    return 1
}

# Aguarda bancos de dados
echo "Verificando bancos de dados e serviços..."
sleep 15

# Verifica saúde dos serviços
echo ""
echo "Status dos serviços:"
check_health "mongodb" "27017" || true
check_health "sqlserver" "1433" || true
check_health "rabbitmq" "15672" || true
check_health "users-service" "3001" || true
check_health "events-service" "3002" || true
check_health "functions-service" "3003" || true
check_health "bff-gateway" "3000" || true
check_health "frontend" "5173" || true

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
echo "  $DOCKER_COMPOSE logs -f               # Todos os serviços"
echo "  $DOCKER_COMPOSE logs -f frontend      # Apenas frontend"
echo "  $DOCKER_COMPOSE logs -f bff-gateway   # Apenas BFF"
echo ""
echo "🛑 Para parar:"
echo ""
echo "  $DOCKER_COMPOSE down                  # Para tudo"
echo "  $DOCKER_COMPOSE down -v               # Para e remove volumes"
echo ""
echo "📊 Ver status dos containers:"
echo ""
echo "  $DOCKER_COMPOSE ps                    # Lista containers"
echo ""
echo "========================================="
