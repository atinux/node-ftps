var spawn = require('child_process').spawn,
	_ = require('underscore');

var escapeshell = function(cmd) {
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

/*
** Params :
** {
**   host: 'domain.com', // required
**   username: 'Test', // required
**   password: 'Test', // required
**   protocol: 'sftp', // optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
**   // protocol is added on beginning of host, ex : sftp://domain.com in this case
** }
**
** Usage :
** ftp.cd('to_maleamassage').rm('./test.txt').exec(console.log);
*/

var FTP = function (options) {
	this.initialize(options);
	this.cmds = [];
};

FTP.prototype.initialize = function (options) {
	var defaults = {
		host: '',
		username: '',
		password: ''
	};
	var opts = _.pick(_.extend(defaults, options), 'host', 'username', 'password');
	if (!opts.host) throw new Error('You need to set a host.');
	if (!opts.username) throw new Error('You need to set an username.');
	if (!opts.password) throw new Error('You need to set a password.');
	if (typeof options.protocol === 'string' && options.protocol && opts.host.indexOf(options.protocol) !== 0)
		opts.host = options.protocol + '://' + options.host;
	else
		opts.host = 'ftp://' + options.host;
	this.options = opts;
};

FTP.prototype.exec = function (cmds, callback) {
	if (typeof cmds === 'string')
		cmds = cmds.split(';');
	if (Array.isArray(cmds))
		this.cmds = this.cmds.concat(cmds);
	if (typeof cmds === 'function' && !callback)
		callback = cmds;
	if (!callback)
		throw new Error('callback is missing to exec() function.')
	var cmd = '';
	cmd += 'open -u '+ escapeshell(this.options.username) + ',' + escapeshell(this.options.password) + ' ' + this.options.host + ';';
	cmd += this.cmds.join(';');
	this.cmds = [];

	var lftp = spawn('lftp', ['-c', cmd]);
	var data = "";
	var error = false;
	lftp.stdout.on('data', function (res) {
		data += res;
	});
	lftp.stderr.on('data', function (res) {
		if (!error) {
			error = true;
			callback({ error: res.toString(), data: data });
		}
	});
	lftp.on('exit', function (code) {
		if (!code && !error)
			callback(null, data);
		else if (!error)
			callback({ data: data });
	});
	return this;
};

FTP.prototype.raw = function (cmd) {
	if (cmd && typeof cmd === 'string')
		this.cmds.push(cmd);
	return this;
};

FTP.prototype.ls = function () { return this.raw('ls'); };
FTP.prototype.pwd = function () { return this.raw('pwd'); };
FTP.prototype.cd = function (directory) { return this.raw('cd ' + directory); };
FTP.prototype.cat = function (path) { return this.raw('cat ' + path); };
FTP.prototype.put = function (path) { return this.raw('put ' + path); };
FTP.prototype.addFile = FTP.prototype.put;
FTP.prototype.rm = function (path) { return this.raw('rm ' + path); };

module.exports = FTP;