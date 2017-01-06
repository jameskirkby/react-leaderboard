all:
	# Install Node deps
	yarn install

	# Build assets
	gulp deploy --env production

dev:
	# Install Node deps
	yarn install

	# Build assets
	gulp deploy