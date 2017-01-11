# Set the base image
FROM mongo:3.4.1

# Add config
COPY mongo.conf /etc/mongo.conf

# Expose ports.
#   - 27017: process
#   - 28017: http
EXPOSE 27017
EXPOSE 28017

# Entry point
WORKDIR /usr/local/bin/
COPY entrypoint.sh ./entrypoint
RUN chmod +x ./entrypoint
ENTRYPOINT ["./entrypoint"]