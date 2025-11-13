#!/bin/bash

# ============================================
# AI Calendar Agent - Infrastructure Setup Script
# ============================================
# This script automates the setup of all infrastructure services.
# Run this after cloning the repository.
#
# Usage: ./scripts/setup-infrastructure.sh
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
main() {
    clear
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║   AI Calendar Agent - Infrastructure Setup        ║"
    echo "║   Sprint 1: Foundation Services                   ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # ============================================
    # 1. Check Prerequisites
    # ============================================
    print_header "1. Checking Prerequisites"

    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 20+ first."
        exit 1
    fi

    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm is not installed."
        exit 1
    fi

    if command_exists git; then
        print_success "Git installed"
    else
        print_warning "Git not found (optional)"
    fi

    # ============================================
    # 2. Install Dependencies
    # ============================================
    print_header "2. Installing Dependencies"

    print_info "Installing npm packages..."
    npm install

    print_success "Dependencies installed"

    # ============================================
    # 3. Environment Configuration
    # ============================================
    print_header "3. Environment Configuration"

    if [ ! -f ".env" ]; then
        print_info "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "⚠️  IMPORTANT: Edit .env file with your actual credentials!"
    else
        print_info ".env file already exists"
    fi

    # ============================================
    # 4. Database Setup
    # ============================================
    print_header "4. Database Setup (Prisma)"

    print_info "Generating Prisma Client..."
    npm run db:generate

    print_success "Prisma Client generated"

    echo ""
    read -p "Do you want to push the schema to the database now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Pushing schema to database..."
        npm run db:push
        print_success "Database schema synced"
    else
        print_warning "Skipped database push. Run 'npm run db:push' later."
    fi

    # ============================================
    # 5. Service Setup Checklist
    # ============================================
    print_header "5. Service Setup Checklist"

    echo "Please complete the following manual steps:"
    echo ""

    echo "📦 Database (Supabase/PostgreSQL):"
    echo "   1. Create a Supabase project: https://supabase.com/dashboard"
    echo "   2. Copy the connection string to DATABASE_URL in .env"
    echo "   3. Enable Prisma pooling (optional)"
    echo ""

    echo "🔐 Authentication (Google OAuth):"
    echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
    echo "   2. Create OAuth 2.0 Client ID"
    echo "   3. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google"
    echo "   4. Copy Client ID and Secret to .env"
    echo ""

    echo "📨 Upstash Redis (Rate Limiting & Caching):"
    echo "   1. Create database: https://console.upstash.com/"
    echo "   2. Copy REST URL and Token to .env"
    echo ""

    echo "⚙️  Inngest (Background Jobs):"
    echo "   1. Sign up: https://app.inngest.com/"
    echo "   2. Create new app"
    echo "   3. Copy Event Key and Signing Key to .env"
    echo ""

    echo "🔄 Pusher (Real-time WebSocket):"
    echo "   1. Create app: https://dashboard.pusher.com/"
    echo "   2. Copy App ID, Key, Secret, and Cluster to .env"
    echo ""

    echo "🐛 Sentry (Error Tracking):"
    echo "   1. Create project: https://sentry.io/"
    echo "   2. Copy DSN to .env"
    echo "   3. Get auth token for source maps"
    echo ""

    echo "🤖 OpenAI (AI Scheduling):"
    echo "   1. Get API key: https://platform.openai.com/api-keys"
    echo "   2. Add to .env as OPENAI_API_KEY"
    echo ""

    # ============================================
    # 6. Generate NextAuth Secret
    # ============================================
    print_header "6. Generating Secrets"

    if command_exists openssl; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        print_success "Generated NEXTAUTH_SECRET (add to .env):"
        echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
        echo ""
    else
        print_warning "OpenSSL not found. Generate NEXTAUTH_SECRET manually:"
        echo "  Run: openssl rand -base64 32"
        echo ""
    fi

    # ============================================
    # 7. Test Connections
    # ============================================
    print_header "7. Testing Connections"

    echo ""
    read -p "Do you want to test infrastructure connections now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Testing connections..."
        echo ""
        npm run dev &
        DEV_PID=$!
        sleep 5

        # Test health endpoint (you'll need to create this)
        print_info "Run: npm run dev"
        print_info "Then visit: http://localhost:3000/api/health"

        kill $DEV_PID 2>/dev/null || true
    else
        print_info "Skipped connection tests"
    fi

    # ============================================
    # 8. Summary
    # ============================================
    print_header "8. Setup Complete! 🎉"

    echo "Next steps:"
    echo "  1. Edit .env file with your actual credentials"
    echo "  2. Run: npm run db:push (if not done already)"
    echo "  3. Run: npm run dev"
    echo "  4. Visit: http://localhost:3000"
    echo ""
    echo "Documentation:"
    echo "  • Setup Guide: ./SETUP.md"
    echo "  • Technical Plan: ./.speckit/plan"
    echo "  • Task Breakdown: ./.speckit/tasks/"
    echo ""
    echo "Useful commands:"
    echo "  • npm run dev          - Start development server"
    echo "  • npm run db:studio    - Open Prisma Studio"
    echo "  • npm run db:migrate   - Create migration"
    echo "  • npm run lint         - Run linter"
    echo ""

    print_success "Setup complete! Happy coding! 🚀"
    echo ""
}

# Run main function
main "$@"
