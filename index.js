var spawn = require('child_process').spawn,
	_ = require('underscore')

/*
** Params :
** {
**   host: 'domain.com', // Required
**   username: 'Test', // Required
**   password: 'Test', // Required
**   protocol: 'sftp', // Optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
**   // protocol is added on beginning of host, ex : sftp://domain.com in this case
**   port: '22', // Optional
**   // port is added at the end of the host, ex : sftp://domain.com:28 in this case
**	 retries: 2, // Optional, defaults to 1 (1 = no retries, 0 = unlimited retries)
**	 timeout: 10, // Optional, Time before failing a connection attempt. Defaults to 10
**	 retryInterval: 5, // Optional, Time in seconds between attempts. Defaults to 5
**	 retryMultiplier: 1, // Optional, Multiplier by which retryInterval is multiplied each time new attempt fails. Defaults to 1
**	 requiresPassword: true, // Optional, defaults to true
**   autoConfirm: true // Optional, defaults to false
** }
**
** Usage :
** ftp.cd('some_directory').rm('./test.txt').exec(console.log)
*/

var FTP = function (options) {
	this.initialize(options)
	this.cmds = []
}

FTP.prototype.initialize = function (options) {
	var defaults = {
		host: '',
		username: '',
		password: '',
		escape: true,
		retries: 1, // LFTP by default tries an unlimited amount of times so we change that here
		timeout: 10, // Time before failing a connection attempt
		retryInterval: 5, // Time in seconds between attempts
		retryIntervalMultiplier: 1, // Multiplier by which retryInterval is multiplied each time new attempt fails
		requiresPassword: true, // Supports Anonymous FTP
		autoConfirm: false // Auto confirm ssl certificate
	}
	
	// Extend options with defaults
	var opts = _.pick(_.extend(defaults, options), 'host', 'username', 'password', 'port', 'escape', 'retries', 'timeout', 'retryInterval', 'retryIntervalMultiplier', 'requiresPassword', 'protocol', 'autoConfirm')
	
	// Validation
	if (!opts.host) throw new Error('You need to set a host.')
	if (!opts.username) throw new Error('You need to set an username.')
	if (opts.requiresPassword === true && !opts.password) throw new Error('You need to set a password.')
	if (options.protocol && typeof options.protocol !== 'string') throw new Error('Protocol needs to be of type string.')
	
	// Setting options
	if (options.protocol && opts.host.indexOf(options.protocol + '://') !== 0)
		opts.host = options.protocol + '://' + options.host
  	if (opts.port)
		opts.host = opts.host + ':' + opts.port

	this.options = opts
}

FTP.prototype.escapeshell = function(cmd) {
	return cmd.replace(/(["\s'$`\\])/g,'\\$1')
}
FTP.prototype._escapeshell = function(cmd) {
	if (this.options.escape) {
		return this.escapeshell(cmd)
	}
	return cmd
}

FTP.prototype.exec = function (cmds, callback) {
	if (typeof cmds === 'string')
		cmds = cmds.split(';')
	if (Array.isArray(cmds))
		this.cmds = this.cmds.concat(cmds)
	if (typeof cmds === 'function' && !callback)
		callback = cmds
	if (!callback)
		throw new Error('Callback is missing to exec() function.')
	
	var cmd = ''
	
	// Only support SFTP or FISH for ssl autoConfirm
	if((this.options.protocol.toLowerCase() === "sftp" || this.options.protocol.toLowerCase() === "fish") && this.options.autoConfirm)
		cmd += 'set ' + this.options.protocol.toLowerCase() + ':auto-confirm yes;'
	
	cmd += 'set net:max-retries ' + this.options.retries + ';'
	cmd += 'set net:timeout ' + this.options.timeout + ';'
	cmd += 'set net:reconnect-interval-base ' + this.options.retryInterval + ';'
	cmd += 'set net:reconnect-interval-multiplier ' + this.options.retryIntervalMultiplier + ';'
	
	cmd += 'open -u "'+ this._escapeshell(this.options.username) + '","' + this._escapeshell(this.options.password) + '" "' + this.options.host + '";'
	cmd += this.cmds.join(';')
	this.cmds = []

	var lftp = spawn('lftp', ['-c', cmd])
	var data = ""
	var error = ""
	lftp.stdout.on('data', function (res) {
		data += res
	})
	lftp.stderr.on('data', function (res) {
		error += res
	})
	lftp.on('error', function ( err ) {
		if (callback)
			callback(err, { error: error || null, data: data })
		callback = null // Make sure callback is only called once, whether 'exit' event is triggered or not.
	})
	lftp.on('exit', function (code) {
		if (callback)
			callback(null, { error: error || null, data: data })
	})
	return lftp
}

FTP.prototype.raw = function (cmd) {
	if (cmd && typeof cmd === 'string')
		this.cmds.push(cmd)
	return this
}

FTP.prototype.ls = function () { return this.raw('ls') }
FTP.prototype.pwd = function () { return this.raw('pwd') }
FTP.prototype.cd = function (directory) { return this.raw('cd ' + this._escapeshell(directory)) }
FTP.prototype.cat = function (path) { return this.raw('cat ' + this._escapeshell(path)) }
FTP.prototype.put = function (localPath, remotePath) {
	if (!localPath)
		return this
	if (!remotePath)
		return this.raw('put '+this._escapeshell(localPath))
	return this.raw('put '+this._escapeshell(localPath)+' -o '+this._escapeshell(remotePath))
}
FTP.prototype.addFile = FTP.prototype.put
FTP.prototype.get = function (remotePath, localPath) {
	if (!remotePath)
		return this
	if (!localPath)
		return this.raw('get '+this._escapeshell(remotePath))
	return this.raw('get '+this._escapeshell(remotePath)+' -o '+this._escapeshell(localPath))
}
FTP.prototype.getFile = FTP.prototype.get
FTP.prototype.mv = function (from, to) {
	if (!from || !to)
		return this
	return this.raw('mv ' + this._escapeshell(from) + ' ' + this._escapeshell(to))
}
FTP.prototype.move = FTP.prototype.mv
FTP.prototype.rm = function () { return this.raw('rm ' + Array.prototype.slice.call(arguments).map(this._escapeshell).join(' ')) }
FTP.prototype.remove = FTP.prototype.rm
FTP.prototype.rmdir = function () { return this.raw('rmdir ' + Array.prototype.slice.call(arguments).map(this._escapeshell).join(' ')) }

module.exports = FTP