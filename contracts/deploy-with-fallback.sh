#!/bin/bash

# Deployment script with automatic RPC fallback

echo "🚀 MAXION Deployment with Auto-Retry"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# RPC endpoints to try (in order)
RPC_ENDPOINTS=(
    "https://mantle-sepolia.drpc.org"
    "https://rpc.sepolia.mantle.xyz"
)

MAX_ATTEMPTS=3

for endpoint in "${RPC_ENDPOINTS[@]}"; do
    echo -e "${YELLOW}Trying RPC: $endpoint${NC}"
    
    for attempt in $(seq 1 $MAX_ATTEMPTS); do
        echo -e "${YELLOW}Attempt $attempt/$MAX_ATTEMPTS...${NC}"
        
        # Update .env temporarily
        sed -i.bak "s|MANTLE_TESTNET_RPC=.*|MANTLE_TESTNET_RPC=$endpoint|g" .env
        
        # Try deployment
        npm run deploy:testnet
        
        # Check if successful
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
            rm -f .env.bak
            exit 0
        fi
        
        echo -e "${RED}❌ Attempt failed${NC}"
        
        if [ $attempt -lt $MAX_ATTEMPTS ]; then
            wait_time=$((attempt * 5))
            echo -e "${YELLOW}Waiting ${wait_time} seconds before retry...${NC}"
            sleep $wait_time
        fi
    done
    
    echo -e "${RED}Failed with RPC: $endpoint${NC}"
    echo ""
done

echo -e "${RED}❌ All deployment attempts failed${NC}"
echo ""
echo "🔧 Troubleshooting:"
echo "1. Check your balance: npm run check-balance"
echo "2. Wait a few minutes and try again"
echo "3. Try deploying during off-peak hours"
echo "4. Contact support if issue persists"

# Restore original .env
if [ -f .env.bak ]; then
    mv .env.bak .env
fi

exit 1