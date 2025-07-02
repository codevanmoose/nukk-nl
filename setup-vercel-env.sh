#!/bin/bash

echo "This script will help you add environment variables to Vercel"
echo "You'll need to have your API keys ready"
echo ""

# Function to add env var to all environments
add_env_var() {
    local var_name=$1
    local var_description=$2
    
    echo ""
    echo "Adding $var_name ($var_description)"
    echo "Enter the value (or press Enter to add placeholder):"
    read -r value
    
    if [ -z "$value" ]; then
        value="PLACEHOLDER_UPDATE_IN_VERCEL_DASHBOARD"
    fi
    
    # Add to all environments
    echo "$value" | vercel env add "$var_name" production
    echo "$value" | vercel env add "$var_name" preview  
    echo "$value" | vercel env add "$var_name" development
}

# Add all required environment variables
add_env_var "OPENAI_API_KEY" "OpenAI API key for GPT-4"
add_env_var "ANTHROPIC_API_KEY" "Anthropic API key for Claude"
add_env_var "XAI_API_KEY" "xAI API key for Grok (optional)"
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key"

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Next steps:"
echo "1. If you used placeholders, update them at:"
echo "   https://vercel.com/vanmooseprojects/nukk-nl/settings/environment-variables"
echo ""
echo "2. Set up Supabase:"
echo "   - Create project at https://supabase.com"
echo "   - Run database/schema.sql in SQL Editor"
echo "   - Copy connection details to Vercel"
echo ""
echo "3. Redeploy your project:"
echo "   vercel --prod"