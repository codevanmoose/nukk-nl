#!/bin/bash

echo "🔑 nukk.nl API Keys Setup Script"
echo "================================"
echo ""
echo "This script will help you configure the API keys for nukk.nl"
echo ""

# Function to prompt for API key
prompt_for_key() {
    local key_name=$1
    local key_desc=$2
    local current_value=$3
    
    echo "----------------------------------------"
    echo "📌 $key_desc"
    if [ -n "$current_value" ] && [[ ! "$current_value" =~ "fake" ]] && [[ ! "$current_value" =~ "dummy" ]]; then
        echo "✅ Currently configured (hidden for security)"
        read -p "Keep existing key? (Y/n): " keep_key
        if [[ "$keep_key" =~ ^[Nn]$ ]]; then
            read -p "Enter new $key_desc: " new_key
            echo "$new_key"
        else
            echo "$current_value"
        fi
    else
        echo "❌ Not configured or using demo key"
        read -p "Enter $key_desc (or press Enter to skip): " new_key
        echo "$new_key"
    fi
}

# Check if logged into Vercel
if ! vercel whoami >/dev/null 2>&1; then
    echo "❌ Not logged into Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Logged into Vercel"
echo ""

# Prompt for each API key
echo "🤖 AI API Keys Configuration"
echo "============================"
echo ""
echo "nukk.nl uses AI to analyze articles. You need at least ONE of these:"
echo ""

# OpenAI
OPENAI_KEY=$(prompt_for_key "OPENAI_API_KEY" "OpenAI API Key (gpt-4-turbo)" "$OPENAI_API_KEY")

# Anthropic
ANTHROPIC_KEY=$(prompt_for_key "ANTHROPIC_API_KEY" "Anthropic API Key (Claude 3)" "$ANTHROPIC_API_KEY")

# xAI (optional)
XAI_KEY=$(prompt_for_key "XAI_API_KEY" "xAI API Key (Grok) - Optional" "$XAI_API_KEY")

echo ""
echo "🌐 Scraping Service (Optional)"
echo "=============================="
echo "For real nu.nl content extraction (optional - demo content works without this):"
echo ""

# ScrapingBee
SCRAPINGBEE_KEY=$(prompt_for_key "SCRAPINGBEE_API_KEY" "ScrapingBee API Key" "$SCRAPINGBEE_API_KEY")

# Check if at least one AI key is provided
if [ -z "$OPENAI_KEY" ] && [ -z "$ANTHROPIC_KEY" ]; then
    echo ""
    echo "⚠️  WARNING: No AI API keys provided!"
    echo "The platform will use mock/demo analysis only."
    echo ""
    read -p "Continue anyway? (y/N): " continue_anyway
    if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

echo ""
echo "📝 Configuring Vercel Environment Variables..."
echo ""

# Function to set Vercel env var
set_vercel_env() {
    local key=$1
    local value=$2
    
    if [ -n "$value" ]; then
        echo -n "Setting $key... "
        if echo "$value" | vercel env add "$key" production development preview --yes >/dev/null 2>&1; then
            echo "✅"
        else
            # Try to update if already exists
            vercel env rm "$key" production development preview --yes >/dev/null 2>&1
            if echo "$value" | vercel env add "$key" production development preview --yes >/dev/null 2>&1; then
                echo "✅ (updated)"
            else
                echo "❌ Failed"
            fi
        fi
    fi
}

# Set all environment variables
set_vercel_env "OPENAI_API_KEY" "$OPENAI_KEY"
set_vercel_env "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY"
set_vercel_env "XAI_API_KEY" "$XAI_KEY"
set_vercel_env "SCRAPINGBEE_API_KEY" "$SCRAPINGBEE_KEY"

echo ""
echo "🚀 Triggering new deployment..."
echo ""

# Trigger a new deployment
if vercel --prod --yes >/dev/null 2>&1; then
    echo "✅ Deployment started!"
    echo ""
    echo "📊 Summary:"
    echo "=========="
    if [ -n "$OPENAI_KEY" ]; then echo "✅ OpenAI API configured"; fi
    if [ -n "$ANTHROPIC_KEY" ]; then echo "✅ Anthropic API configured"; fi
    if [ -n "$XAI_KEY" ]; then echo "✅ xAI (Grok) API configured"; fi
    if [ -n "$SCRAPINGBEE_KEY" ]; then echo "✅ ScrapingBee API configured"; fi
    echo ""
    echo "🌐 Your site will be live at: https://www.nukk.nl"
    echo "⏳ Deployment usually takes 1-2 minutes"
    echo ""
    echo "💡 Next steps:"
    echo "1. Wait for deployment to complete"
    echo "2. Test at: https://www.nukk.nl"
    echo "3. Try the URL redirect: nukk.nl/[any-nu.nl-path]"
    echo ""
else
    echo "❌ Deployment failed. Please check your Vercel configuration."
fi