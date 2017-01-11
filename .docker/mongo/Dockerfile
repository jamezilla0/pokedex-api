# Set the base image
FROM mongo:3.4.1

COPY entrypoint.sh /entrypoint

RUN chmod +x /entrypoint
ENTRYPOINT ["/entrypoint"]

# process
EXPOSE 27017
# http
EXPOSE 28017
CMD ["mongod"]