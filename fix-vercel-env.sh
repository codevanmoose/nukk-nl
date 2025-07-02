#!/bin/bash

echo "🔧 Fixing Vercel Environment Variables for nukk.nl"
echo "================================================="
echo ""
echo "This script will help you configure the API keys for all environments."
echo ""

# Check if user is logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ You're not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Function to add environment variable to all environments
add_env_var() {
    local var_name=$1
    local var_value=$2
    
    echo "Adding $var_name to all environments..."
    
    # Remove existing variable if it exists
    vercel env rm "$var_name" production 2>/dev/null
    vercel env rm "$var_name" preview 2>/dev/null
    vercel env rm "$var_name" development 2>/dev/null
    
    # Add to all environments
    echo "$var_value" | vercel env add "$var_name" production preview development
}

echo "📋 Current environment variables:"
vercel env ls
echo ""

echo "🔑 Let's configure your API keys"
echo ""

# OpenAI API Key
echo "1. OpenAI API Key"
echo "   Get it from: https://platform.openai.com/api-keys"
read -p "   Enter your OpenAI API key (sk-...): " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    add_env_var "OPENAI_API_KEY" "$OPENAI_KEY"
fi

echo ""

# Anthropic API Key
echo "2. Anthropic API Key"
echo "   Get it from: https://console.anthropic.com/settings/keys"
read -p "   Enter your Anthropic API key (sk-ant-...): " ANTHROPIC_KEY
if [ ! -z "$ANTHROPIC_KEY" ]; then
    add_env_var "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY"
fi

echo ""

# Scraping Service (Optional)
echo "3. Scraping Service (Optional - for real nu.nl content)"
echo "   Choose one:"
echo "   a) ScrapingBee - https://www.scrapingbee.com"
echo "   b) Browserless - https://www.browserless.io"
echo "   c) Skip for now (use demo content)"
read -p "   Choose (a/b/c): " SCRAPING_CHOICE

case $SCRAPING_CHOICE in
    a)
        read -p "   Enter your ScrapingBee API key: " SCRAPINGBEE_KEY
        if [ ! -z "$SCRAPINGBEE_KEY" ]; then
            add_env_var "SCRAPINGBEE_API_KEY" "$SCRAPINGBEE_KEY"
        fi
        ;;
    b)
        read -p "   Enter your Browserless API key: " BROWSERLESS_KEY
        if [ ! -z "$BROWSERLESS_KEY" ]; then
            add_env_var "BROWSERLESS_API_KEY" "$BROWSERLESS_KEY"
        fi
        ;;
    *)
        echo "   Skipping scraping service setup"
        ;;
esac

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "📋 Updated environment variables:"
vercel env ls
echo ""

echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Done! Your nukk.nl site should now have working analysis!"
echo ""
echo "Test it at: https://www.nukk.nl"
echo "Try analyzing: https://www.nu.nl/politiek/6361052/asielwetten-lijken-te-stranden-in-eerste-kamer-cda-stemt-tegen.html"