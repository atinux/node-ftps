node-ftps
=========

FTP, FTPS and SFTP client for node.js, mainly a `lftp` wrapper.

Requirements
------------

You need to have the executable `lftp` installed on your computer.

[LFTP Homepage](http://lftp.yar.ru/)

[LFTP For Windows](https://nwgat.ninja/lftp-for-windows/)

OSX install [brew](http://brew.sh/) then `brew install lftp`

Installation
-----------

``` sh
npm install ftps
```

Usage
-----

``` js
var FTPS = require('ftps');
var ftps = new FTPS({
  host: 'domain.com', // required
  username: 'Test', // required
  password: 'Test', // required
  protocol: 'sftp', // optional, values : 'ftp', 'sftp', 'ftps',... default is 'ftp'
  // protocol is added on beginning of host, ex : sftp://domain.com in this case
  port: 22, // optional
  // port is added to the end of the host, ex: sftp://domain.com:22 in this case
  escape: true, // optional, used for escaping shell characters (space, $, etc.), default: true
  retries: 2, // Optional, defaults to 1 (1 = no retries, 0 = unlimited retries)
  timeout: 10,
  requiresPassword: true, // Optional, defaults to true
  autoConfirm: true, // Optional, is used to auto confirm ssl questions on sftp or fish protocols, defaults to false
  cwd: '' // Optional, defaults to the directory from where the script is executed
});
// Do some amazing things
ftps.cd('some_directory').addFile(__dirname + '/test.txt').exec(console.log);
```

Some documentation
------------------

Here are some of the chainable functions :

``` js
ftps.ls()
ftps.pwd()
ftps.cd(directory)
ftps.cat(pathToRemoteFiles)
ftps.put(pathToLocalFile, [pathToRemoteFile]) // alias: addFile
ftps.get(pathToRemoteFile, [pathToLocalFile]) // download remote file and save to local path (if not given, use same name as remote file), alias: getFile
ftps.mv(from, to) // alias move
ftps.rm(file1, file2, ...) // alias remove
ftps.rmdir(directory1, directory2, ...)
ftps.mirror({
  remoteDir: '.', // optional, default: .
  localDir: '.', // optional: default: .
  filter: /\.pdf$/, // optional, filter the files synchronized
  parallel: true / Integer, // optional, default: false
  upload: true, // optional, default: false, to upload the files from the locaDir to the remoteDir
})
```

If you want to escape some arguments because you used "escape: false" in the options:
```js
ftps.escapeshell('My folder');
// Return 'My\\ \\$folder'
```

Execute a command on the remote server:
```js
ftps.raw('ls -l')
```

To see all available commands: [LFTP Commands](http://lftp.yar.ru/lftp-man.html)

For information, ls, pwd, ... rm are just some alias of raw() method.

Run the commands
``` js
ftps.exec(function (err, res) {
  // err will be null (to respect async convention)
  // res is an hash with { error: stderr || null, data: stdout }
});
// exec() return the child process of the spwan() method
```

Also, take note that if a command fails it will not stop the next commands from executing, for example:
``` js
ftps.cd('non-existing-dir/').addFile('./test.txt').exec(console.log);
/*
Will add file on ~/ and give:
{
  error: 'cd: non-existing-dir: No such file or directory\n',
  data: ''
}
So...be cautious because ./test.txt has been added
*/

```

Why?
----

Because I didn't find an sftp and ftps module in node.js, this is just a pretty simple spawn of the `lftp` command, but it works for me, and hopefully for you too :)

Currently it has no tests but pull requests are welcome.
