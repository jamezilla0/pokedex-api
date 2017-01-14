# Set the base image
FROM mongo:3.4.1

# process
EXPOSE 27017
# http
EXPOSE 28017

COPY entrypoint.sh /docker-entrypoint
RUN chmod +x /docker-entrypoint

ENTRYPOINT ["/docker-entrypoint"]
CMD ["mongod"]