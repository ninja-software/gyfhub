```bash
  _______     ________ _    _ _    _ ____
  / ____\ \   / /  ____| |  | | |  | |  _ \
 | |  __ \ \_/ /| |__  | |__| | |  | | |_) |
 | | |_ | \   / |  __| |  __  | |  | |  _ <
 | |__| |  | |  | |    | |  | | |__| | |_) |
  \_____|  |_|  |_|    |_|  |_|\____/|____/


```

"If a picture is worth a thousand words, imagine gifs." - someone

# Development - Setup

Run instructions below when setting up dev environment

## Tooling

Make sure you are in the root folder where the makefile is located

```bash

make tools

```

## Datebase

Spin up database

```bash

make init

```

Start Server

```bash

make serve

```

## Resetting Database

```bash

make db-reset

```

## Insomnia Json

Import Insomnia file to test example requests
[Import/Export Guide](https://support.insomnia.rest/article/52-importing-and-exporting-data)

## Web

```bash
cd web
npm install
npm start
```
