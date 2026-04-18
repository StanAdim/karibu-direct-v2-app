# Variables
APP_NAME=staging-karibcon-app
ECOSYSTEM=ecosystem.config.cjs

# Install dependencies
install:
	yarn install

# Development server
dev:
	yarn run dev

# Build Nuxt app
build:
	yarn build


# Start with PM2
start:
	pm2 start $(ECOSYSTEM)

# Restart app
restart:
	pm2 restart $(APP_NAME)

# Stop app
stop:
	pm2 stop $(APP_NAME)

# Delete app from PM2
delete:
	pm2 delete $(APP_NAME)

# Reload (zero-downtime)
reload:
	pm2 reload $(ECOSYSTEM)

# Logs
logs:
	pm2 logs $(APP_NAME)

# Monitor
monitor:
	pm2 monit

# Save PM2 process list
save:
	pm2 save

# Setup PM2 startup script
startup:
	pm2 startup

# Full deploy flow
deploy: install build start save