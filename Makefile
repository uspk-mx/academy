# Frontend monorepo — local toolchain executed inside Docker.
# No local Bun/Node installation required.
#
# First time:   make install
# Every day:    make dev
#
# Apps:
#   web      http://localhost:5173
#   student  http://localhost:5174
#   admin    http://localhost:5175
#
# Before PR:    make check
# Fresh install: make reinstall
#
# Production deployments are handled by Vercel.

.DEFAULT_GOAL := help

COMPOSE ?= docker compose
RUN := $(COMPOSE) run --rm --no-deps app

.PHONY: help install reinstall dev down build typecheck format check shell clean

help: ## Show available commands
	@awk 'BEGIN {FS = ":.*## "}; \
		/^[a-zA-Z0-9_-]+:.*## / { \
			printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2 \
		}' $(MAKEFILE_LIST)


install: ## Install the exact dependencies from bun.lock
	$(RUN) bun install --frozen-lockfile

dev: ## Run all apps with HMR
	$(COMPOSE) up --build dev

down: ## Stop the development environment
	$(COMPOSE) down --remove-orphans

build: ## Build all apps as a pre-PR sanity check
	$(RUN) bun run build

typecheck: ## Type-check the entire workspace
	$(RUN) bun run typecheck

format: ## Format the entire workspace
	$(RUN) bun run format

check: typecheck build ## Run all non-mutating pre-PR checks

shell: ## Open a shell inside the toolchain container
	$(RUN) sh

clean: down ## Remove generated node_modules directories
	$(RUN) sh -lc \
		'find /app -type d -name node_modules -prune -exec rm -rf -- {} +'

reinstall: clean install ## Recreate node_modules from bun.lock

# NOTE: `test` / `lint` targets go here once those scripts exist in the repo.
# NOTE: `make dev` uses file-system polling so HMR works over the macOS bind
#       mount (a bit heavier on CPU). For maximum speed you can still run the
#       dev servers natively with `bun run dev` if you have bun/Node installed.
