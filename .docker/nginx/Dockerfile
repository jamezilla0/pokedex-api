# Set the base image
FROM nginx:1.11.8-alpine

# Remove default nginx configs.
RUN rm -f /etc/nginx/conf.d/* /etc/nginx/nginx.conf

# Add configuration files
COPY nginx.conf /etc/nginx/nginx.conf

# Ports
EXPOSE 80 443

# Entry point
WORKDIR /usr/local/bin/
COPY entrypoint.sh ./entrypoint
RUN chmod +x ./entrypoint
ENTRYPOINT ["./entrypoint"]
