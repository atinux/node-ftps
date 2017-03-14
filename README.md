node-ftps
=========
<p>
  <a href="https://travis-ci.org/Atinux/node-ftps"><img src="https://travis-ci.org/Atinux/node-ftps.svg?branch=master" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/ftps"><img src="https://img.shields.io/npm/v/ftps.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/ftps"><img src="https://img.shields.io/npm/dt/ftps.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/ftps"><img src="https://img.shields.io/npm/l/ftps.svg" alt="License"></a>
</p>

FTP, FTPS and SFTP client for node.js, mainly a `lftp` wrapper.

Requirements
------------

You need to have the executable `lftp` installed on your computer.

[LFTP Homepage](http://lftp.yar.ru/)

**Windows** ([Chocolatey](https://chocolatey.org/))
```cmd
C:\> choco install lftp
```
**OSX** ([Homebrew](http://brew.sh/))
```bash
sudo brew install lftp
```
**Linux**
```bash
sudo apt-get install lftp
# or
sudo yum install lftp
```

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
  username: 'Test', // Optional. Use empty username for anonymous access.
  password: 'Test', // Required if username is not empty, except when requiresPassword: false
  protocol: 'sftp', // Optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
  // protocol is added on beginning of host, ex : sftp://domain.com in this case
  port: 22, // Optional
  // port is added to the end of the host, ex: sftp://domain.com:22 in this case
  escape: true, // optional, used for escaping shell characters (space, $, etc.), default: true
  retries: 2, // Optional, defaults to 1 (1 = no retries, 0 = unlimited retries)
  timeout: 10, // Optional, Time before failing a connection attempt. Defaults to 10
  retryInterval: 5, // Optional, Time in seconds between attempts. Defaults to 5
  retryMultiplier: 1, // Optional, Multiplier by which retryInterval is multiplied each time new attempt fails. Defaults to 1
  requiresPassword: true, // Optional, defaults to true
  autoConfirm: true, // Optional, is used to auto confirm ssl questions on sftp or fish protocols, defaults to false
  cwd: '', // Optional, defaults to the directory from where the script is executed
  additionalLftpCommands: '', // Additional commands to pass to lftp, splitted by ';'
  requireSSHKey:  true, //  Optional, defaults to false, This option for SFTP Protocol with ssh key authentication
  sshKeyPath: '/home1/phrasee/id_dsa' // Required if requireSSHKey: true , defaults to empty string, This option for SFTP Protocol with ssh key authentication
});
// Do some amazing things
ftps.cd('some_directory').addFile(__dirname + '/test.txt').exec(console.log);
```

Documentation
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

For using the stream, use the `execAsStream()` command which returns a stream.
```js
var ftps = new lftp(config)
var stream = ftps.raw('find').execAsStream()
stream.pipe(process.stdout)
```



Note on Using LFPT Commands
------------------

Normally in the lfpt cli you would make a file of `set` commands and pass that file name into lfpt with the `-c` option. However, ftps will do that for you with the `additionalLftpCommands` option.

For instance, to connect to a legacy sftp server you can do:

```JS

const ftps = new FTPS({
  // ...
  additionalLftpCommands: 'set sftp:connect-program "ssh -a -x -o KexAlgorithms=diffie-hellman-group1-sha1"', 
  // Additional commands to pass to lftp, splitted by ';' 
  requireSSHKey: false,
});

// this is helpful for people getting the DH GEX group out of range error

```

This is also instead of making a `~/.lftprc` file. As you can see, you just put anything that would go into the command file into the option separated by a `;`.

Additional command can be found [here](http://lftp.tech/lftp-man.html) or by running `man lftp`.

-----



PS: Any pull requests are welcome :-)
