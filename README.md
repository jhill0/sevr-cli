# Ichabod CLI
---

## Usage

```
Usage: ich [options] <command> [<args>]


Commands:

  init [project-name]     Initialize a new Ichabod project
  coll <collection-name>  Create a new collection definition
  type [type-name]        Create a new type definition
  manage                  Manage the current Ichabod instance
  help [cmd]              display help for [cmd]

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```


### init
Create a new Ichabod project

```
Usage: ich init [project-name]

 Options:

   -h, --help  output usage information
```


### coll
Add a new collection to an Ichabod project

```
Usage: ich coll <collection-name>

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```


### type
Add a new type to an Ichabod project

```
Usage: ich type [options] <collection-name>

Options:

  -h, --help         output usage information
  -t, --type [type]  Data type
```


### manage
Remotely manage an Ichabod instance

```
Usage: ich manage [options]

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
In order to use the `manage` CLI interface, the Ichabod instance must include
the CLI plugin. By default, this is included when using `ich init` to create
a project.

To include the plugin manually, add the following to your index.js:

```javascript
const cli = require('ichabod-cli')

ichabod.attach(cli, options)
```

By default, the plugin will listen for connections on port 4000.

---

## License

This project is licensed under the [MIT license](license.txt).
