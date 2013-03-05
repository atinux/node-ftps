node-ftps
=========

FTP, FTPS and SFTP client for node.js, mainly a `lftp` wrapper.

Requirements
------------

You need to have the executable `lftp` installed on your computer.

Installation
-----------

<pre>npm install ftps</pre>

Usage
-----

<pre>
var FTPS = require('ftps');
var ftps = new FTPS({
  host: 'domain.com', // required
  username: 'Test', // required
  password: 'Test', // required
  protocol: 'sftp', // optional, values : 'ftp', 'sftp', 'ftps',... default is 'ftp'
  // protocol is added on beginning of host, ex : sftp://domain.com in this case
});
// Do some amazing things
ftps.cd('myDir').addFile(__dirname + '/test.txt').exec(console.log);
</pre>

Some documentation
------------------

Here are chainable fonctions :

<pre>
ftps.ls()
ftps.pwd()
ftps.cd(directory)
ftps.cat(pathToRemoteFiles)
ftps.put(pathToLocalFile, [pathToRemoteFile]) // alias: addFile
ftps.get(pathToRemoteFile, [pathToLocalFile]) // download remote file and save to local path (if not given, use same name as remote file), alias: getFile
ftps.mv(from, to) // alias move
ftps.rm(file1, file2, ...) // alias remove
</pre>

Execute a command on the remote server:
<pre>ftps.raw('ls -l')</pre>
To see all available commands -> http://lftp.yar.ru/lftp-man.html

For information, ls, pwd, ... rm are just some alias of raw() method.

Run the commands !
<pre>ftps.exec(function (err, res) {
  // err will be null (to respect async convention)
  // res is an hash with { error: stderr || null, data: stdout }
});</pre>

For information, if somes commands fails, it will don't stop the next commands, example:
<pre>ftps.cd('non-existing-dir/').affFile('./test.txt').exec(console.log);
// Will add file on ~/ and give: { error: 'cd: L\'accès a échoué : 550 /nian: No such file or directory\n',
  data: '' }
// So...be cautious :)</pre>

Why?
----

Just because I didn't found sftp and ftps module in node.js, it's pretty dirty to spawn `lftp` command, but sorry, it does the work for me, maybe for you too :)
Ah and sorry for tests, it's a hack, so I just do some manual tests.
