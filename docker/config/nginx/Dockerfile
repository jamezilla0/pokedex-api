# Set the base image
FROM nginx:1.11.8-alpine

# Remove default nginx configs.
RUN rm -f /etc/nginx/conf.d/* /etc/nginx/nginx.conf

# Add configuration files
COPY nginx.conf /etc/nginx/nginx.conf

# Ports
EXPOSE 80 443

# Entry point
COPY entrypoint.sh /docker-entrypoint
RUN chmod +x /docker-entrypoint

ENTRYPOINT ["/docker-entrypoint"]
CMD ["start"]
