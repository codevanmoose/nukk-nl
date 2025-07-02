#!/bin/bash

# Quick script to update Vercel environment variables
# Usage: ./update-env.sh VARIABLE_NAME "actual_value"

if [ $# -ne 2 ]; then
    echo "Usage: $0 VARIABLE_NAME 'actual_value'"
    echo ""
    echo "Example:"
    echo "$0 OPENAI_API_KEY 'sk-proj-abc123...'"
    echo ""
    echo "Variables to update:"
    echo "- OPENAI_API_KEY"
    echo "- ANTHROPIC_API_KEY" 
    echo "- XAI_API_KEY"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

VARIABLE_NAME=$1
VARIABLE_VALUE=$2

echo "Updating $VARIABLE_NAME in Vercel..."

# Remove old variable
vercel env rm "$VARIABLE_NAME" production --yes 2>/dev/null || true

# Add new variable
printf "%s\n" "$VARIABLE_VALUE" | vercel env add "$VARIABLE_NAME" production

echo "✅ Updated $VARIABLE_NAME"