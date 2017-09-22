
let xml2js = require('xml2js');

exports.buildXML = function(json){
    let builder = new xml2js.Builder();
	return builder.buildObject(json);
};

exports.parseXML = function(xml, fn){
    let parser = new xml2js.Parser({ trim:true, explicitArray:false, explicitRoot:false });
	parser.parseString(xml, fn || function (){});
};

exports.pipe = function(stream, fn){
    let buffers = [];
	stream.on('data', function (trunk) {
		buffers.push(trunk);
	});
	stream.on('end', function () {
		fn(null, Buffer.concat(buffers));
	});
	stream.once('error', fn);
};

exports.mix = function(){
    let root = arguments[0];
	if (arguments.length === 1) { return root; }
	for (let i = 1; i < arguments.length; i++) {
		for (let k in arguments[i]) {
            if (!arguments[i].hasOwnProperty(k)) {
                continue;
            }
			root[k] = arguments[i][k];
		}
	}
	return root;
};

exports.generateNonceString = function(length){
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let maxPos = chars.length;
    let noceStr = '';
	for (let i = 0; i < (length || 32); i++) {
		noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return noceStr;
};