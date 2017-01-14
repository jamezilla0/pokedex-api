# pokedex-api
Pokedex API written in Node, Express and MongoDB (mongoose). Served by Nginx and powered by Docker containers.

Data is imported from the [`metaunicorn/pokedex-data`](https://github.com/metaunicorn/pokedex-data) project.

## Requirements

- Linux or macOS (with wget and unzip)
- Docker (1.12.5 or greater)

## Getting Started

Once you have Docker installed in your machine, you only need to build and start the docker containers
by running `docker/bin/build` inside the project folder.

This will expose the API under the [http://localhost/](http://localhost/) URL.
It needs the port 80 free in your host OS, in case it is not free, you can change it
in the `PK_HTTP_PORT` variable of the `.env` file.

IMPORTANT: don't run `npm install` from your host machine, use `docker/bin/pm install` instead, otherwise
OS-specific package bindings and binaries may not work in the docker image.

## API Reference

List of available API endpoints:

- `/pokemon/`
- `/pokemon/:id/`
- `/pokemon/:name/`

## License

This software is copyrighted and licensed under the 
[MIT license](https://github.com/metaunicorn/pokedex-api/LICENSE).

### Disclaimer

This software comes bundled with data and graphics extracted from the
Pokémon series of video games. Some terminology from the Pokémon franchise is
also necessarily used within the software itself. This is all the intellectual
property of Nintendo, Creatures, inc., and GAME FREAK, inc. and is protected by
various copyrights and trademarks.

The author believes that the use of this intellectual property for a fan reference
is covered by fair use and that the software is significantly impaired without said
property included. Any use of this copyrighted property is at your own legal risk.

This software is not affiliated in any way with Nintendo,
Pokémon or any other game company.

A complete revision history of this software is available from
https://github.com/metaunicorn/pokedex-api