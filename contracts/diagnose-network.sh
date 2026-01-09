#!/bin/bash

# Network Diagnostics Script for Mantle RPC Connection Issues

echo "🔍 MAXION Network Diagnostics"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Basic connectivity
echo -e "${BLUE}Test 1: Internet Connectivity${NC}"
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}✅ Internet connection working${NC}"
else
    echo -e "${RED}❌ No internet connection${NC}"
    echo "   Please check your network connection"
    exit 1
fi
echo ""

# Test 2: DNS resolution
echo -e "${BLUE}Test 2: DNS Resolution${NC}"
if nslookup rpc.sepolia.mantle.xyz &> /dev/null; then
    echo -e "${GREEN}✅ DNS working${NC}"
else
    echo -e "${RED}❌ DNS resolution failed${NC}"
    echo "   Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)"
fi
echo ""

# Test 3: Test RPC endpoints with curl
echo -e "${BLUE}Test 3: RPC Endpoint Connectivity${NC}"

RPC_URLS=(
    "https://rpc.sepolia.mantle.xyz"
    "https://mantle-sepolia.drpc.org"
    "https://mantle-mainnet.public.blastapi.io"
    "https://rpc.mantle.xyz"
)

for url in "${RPC_URLS[@]}"; do
    echo -n "Testing $url... "
    
    # Test with curl
    response=$(curl -s -m 5 -X POST "$url" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>&1)
    
    if echo "$response" | grep -q "result"; then
        echo -e "${GREEN}✅ Working${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        if echo "$response" | grep -q "timeout"; then
            echo -e "   ${YELLOW}⚠️  Connection timeout${NC}"
        elif echo "$response" | grep -q "Connection refused"; then
            echo -e "   ${YELLOW}⚠️  Connection refused${NC}"
        fi
    fi
done
echo ""

# Test 4: Check for proxy/VPN
echo -e "${BLUE}Test 4: Proxy/VPN Detection${NC}"
if [ ! -z "$HTTP_PROXY" ] || [ ! -z "$HTTPS_PROXY" ]; then
    echo -e "${YELLOW}⚠️  Proxy detected:${NC}"
    echo "   HTTP_PROXY: $HTTP_PROXY"
    echo "   HTTPS_PROXY: $HTTPS_PROXY"
    echo "   Try: unset HTTP_PROXY HTTPS_PROXY"
else
    echo -e "${GREEN}✅ No proxy variables set${NC}"
fi
echo ""

# Test 5: Port connectivity
echo -e "${BLUE}Test 5: HTTPS Port (443) Connectivity${NC}"
if nc -zv rpc.sepolia.mantle.xyz 443 2>&1 | grep -q "succeeded"; then
    echo -e "${GREEN}✅ Port 443 accessible${NC}"
else
    echo -e "${RED}❌ Port 443 blocked${NC}"
    echo "   Check firewall settings"
fi
echo ""

# Recommendations
echo "=============================="
echo -e "${BLUE}📋 Recommendations${NC}"
echo "=============================="
echo ""
echo "1. Run the RPC test script:"
echo "   npx ts-node scripts/test-rpc.ts"
echo ""
echo "2. Try alternative RPCs in your .env:"
echo "   MANTLE_TESTNET_RPC=https://mantle-sepolia.drpc.org"
echo ""
echo "3. If using VPN, try disabling it temporarily"
echo ""
echo "4. Check Windows Firewall / Antivirus settings"
echo ""
echo "5. Try from a different network (mobile hotspot)"
echo ""