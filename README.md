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
ftps.put(pathToLocalFile) // alias: addFile
ftps.rm(pathToRemoteFiles)
</pre>

Execute a command on the remote server :
<pre>ftps.raw('ls -l')</pre>
To see all available commands -> http://lftp.yar.ru/lftp-man.html

For information, ls, pwd, ... rm are just some alias of raw() method.

Run the commands !
<pre>ftps.exec(function (err, res) {
  // err is stderr from lftp or null if no errors
  // res is stdout from lftp command
});</pre>

Why?
----

Just because I didn't found sftp and ftps module in node.js, it's pretty dirty to spawn `lftp` command, but sorry, it does the work for me, maybe for you too :)
Ah and sorry for tests, it's a hack, so I just do some manual tests.
