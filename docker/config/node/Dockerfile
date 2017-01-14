FROM node:boron

# Expose port
EXPOSE 5000

# Entry point
COPY entrypoint.sh /docker-entrypoint
RUN chmod +x /docker-entrypoint

ENTRYPOINT ["/docker-entrypoint"]
CMD ["start"]
