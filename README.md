# Sevr CLI

[![Build Status](https://travis-ci.org/ExclamationLabs/sevr-cli.svg?branch=master)](https://travis-ci.org/ExclamationLabs/sevr-cli)

---

## Usage

```
Usage: sevr [options] <command> [<args>]


Commands:

  init [project-name]     Initialize a new Sevr project
  coll <collection-name>  Create a new collection definition
  type [type-name]        Create a new type definition
  manage                  Manage the current Sevr instance
  help [cmd]              display help for [cmd]

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```


### init
Create a new Sevr project

```
Usage: sevr init [project-name]

 Options:

   -h, --help  output usage information
```


### coll
Add a new collection to an Sevr project

```
Usage: sevr coll <collection-name>

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```


### type
Add a new type to an Sevr project

```
Usage: sevr type [options] <collection-name>

Options:

  -h, --help         output usage information
  -t, --type [type]  Data type
```


### manage
Remotely manage an Sevr instance

```
Usage: sevr manage [options]

  Options:

    -h, --help                 output usage information
    -h, --host [host]          Remote host
    -p, --port [port]          Remote host port
    -U, --user [user]          Remote user
    -P, --password [password]  Remote user password
```

#### Commands
- `list`: List the available collections
- `find <collection> [query]`: Search for documents within a collection
- `create <collection>`: Create a new document for a collection
- `update [options] <collection> [query]`: Update a document within a collection
- `delete <collection> [query]`: Delete a document or documents within a collection

#### Queries
When running commands, queries can be supplied to limit the result set. Queries
are formatted in much the same way as the query string of an HTTP request.
Key/value pairs are used to represent field and value.

For example, to find documents where `name` is equal to `'John'` and `registered`
is `true`, the following query would be used:

```
name=John&registered=true
```

#### Options
`-s, --select [select]`: Available for `update`

>The fields for which to select and/or edit. The format of this option should be
the same as the string representation of [Mongoose](http://mongoosejs.com/docs/api.html#query_Query-select).
This is especially useful if you want to edit a field that is not selected
by default.

---

## Remote Connection
In order to use the `manage` CLI interface, the Sevr instance must include
the CLI plugin. By default, this is included when using `sevr init` to create
a project.

To include the plugin manually, add the following to your index.js:

```javascript
const cli = require('sevr-cli')

sevr.attach(cli, options)
```

By default, the plugin will listen for connections on port 4000.

---

## License

This project is licensed under the [MIT license](license.txt).
