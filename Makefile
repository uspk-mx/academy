# Frontend monorepo — local dev toolchain, run inside Docker for a consistent
# bun environment on any machine. No local bun/Node needed. Production builds
# run on Vercel (after a PR), NOT here.
#
# First time:   make install
# Every day:    make dev   (both apps, HMR — web :5173, student :5174)
# Before a PR:  make typecheck / make build / make format
# Fresh start:  make clean && make install

DC := docker compose run --rm app

.PHONY: help install dev build typecheck format sh clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install deps into the container's node_modules volumes
	$(DC) bun install

dev: ## Run both apps with HMR in Docker (web :5173, student :5174)
	docker compose up dev

build: ## Production build of both apps (sanity check before a PR)
	$(DC) bun run build

typecheck: ## Type-check the whole workspace (tsc --noEmit)
	$(DC) bun run typecheck

format: ## Format with Prettier
	$(DC) bun run format

sh: ## Open a shell in the toolchain container
	$(DC) bash

clean: ## Remove the node_modules volumes (next `make install` is fresh)
	docker compose down -v

# NOTE: `test` / `lint` targets go here once those scripts exist in the repo.
# NOTE: `make dev` uses file-system polling so HMR works over the macOS bind
#       mount (a bit heavier on CPU). For maximum speed you can still run the
#       dev servers natively with `bun run dev` if you have bun/Node installed.
