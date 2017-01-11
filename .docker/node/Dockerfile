FROM node:boron

# Set environment variables
ENV NODE_ENV=development

# Mount to make caches persistent
VOLUME /root/.npm

# Change working dir
WORKDIR /usr/local/bin/

# Expose port
EXPOSE 5000

# Entry point
COPY entrypoint.sh ./entrypoint
RUN chmod +x ./entrypoint
ENTRYPOINT ["./entrypoint"]
