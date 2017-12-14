// [rights]  Copyright Dan B. (brianddk) 2017 https://github.com/brianddk
// [license] Licensed under Apache 2.0 https://www.apache.org/licenses/LICENSE-2.0
// [repo]    https://github.com/brianddk/btc-small-fee
// [tips]    LTC: LQjSwZLigtgqHA3rE14yeRNbNNY2r3tXcA
//
var rp = require('request-promise');
var Promise = require('bluebird');
var btcPrice = 16290.00;
var genTxSize = 200;
var avgCount = 10;
var prevCount = 6;
var blockuri = 'https://blockchain.info/rawblock/';
var latestblock = 'https://blockchain.info/latestblock';
var bBBCode = false;
var bMarkdown = false;
var printTxn = true;
var printBlk = true;
var bSegwitOnly = true;
var timestamp = Date.now();
var msDelay = 20;

function delay(ms) {
    var now = Date.now();
    ms -= now - timestamp;
    timestamp = now;
    if(ms <= 0) {
        return Promise.resolve(true);
    }
    else {
        return Promise.delay(ms);
    }
}

function printHash(hash, type) {
    if(bBBCode) {
        return '[url=https://blockchain.info/'+type+'/'+hash+']'+hash+'[/url]';
    }
    else if(bMarkdown) {
        return '['+hash+'](https://blockchain.info/'+type+'/'+hash+')';
    }
    else {
        return hash;
    }
} 

function jsonReq(url, bDelay) {
    var bDelay = (typeof bDelay !== 'undefined') ?  bDelay  : true;
    ms = (bDelay) ? msDelay : 0;
    return delay(ms)
        .then(function(nothing) {
            return rp({
                uri: url,
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true
            })
        });
} 

function blockinfo(hash) {
    return jsonReq(blockuri + hash)
        .then(function(block){
            var txs = block.tx;
            block.inputs = [];
            block.outputs = [];
            var segWits = 0; // offset for coinbase, no tx        
            var smallFee = 999999;
            var minFee = 999999;
            for(var i in txs) {
                var tx=txs[i];
                tx.related = false;
                if(!tx.inputs[0].prev_out ) {
                    cbIdx = i;
                    continue;
                }
                tx.segwit = false;
                tx.fee = 0;            
                for(var j in tx.inputs) {
                    var input = tx.inputs[j];
                    var prev_out = input.prev_out || {};
                    var address = prev_out.addr || {};
                    var witness = input.witness;
                    tx.segwit = tx.segwit || witness.length;
                    tx.fee += prev_out.value;
                    if(address) { block.inputs.push(address); }
                }
                for(var j in tx.out) {
                    var out = tx.out[j];
                    var address = out.addr;
                    tx.fee -= out.value;                
                    if(address) { block.outputs.push(address); }
                }
                
                segWits += (tx.segwit) ? 1 : 0;
            }
                    
            txs.splice(cbIdx,1);
            txs.sort(function(a,b){
                return a.fee - b.fee;
            });
            
            if(bBBCode) {
                var tbo='[table]'
                var tbc='[/table]'
                var tho='[th]'
                var thc='[/th]'
                var tro='[tr]'
                var trc='[/tr]'
                var tdo='[td]'
                var tdc='[/td]'
            }
            else if(bMarkdown) {
                var tbo=''
                var tbc=''
                var tho=''
                var thc=''
                var tro='|'
                var trc=''
                var tdo=''
                var tdc='|'
            }
            else {
                var tbo=''
                var tbc=''
                var tho=''
                var thc=''
                var tro=''
                var trc=''
                var tdo=''
                var tdc='\t'
            }
            
            block.sumSize = 0;
            block.sumFee = 0;
            block.swCount = 0;
            block.avgCount = avgCount;
            var i = 0;
            for(var i in txs) {
                if(i >= block.avgCount) { break; }
                var tx = txs[i];
                tx.segwit = (tx.segwit) ? true : false;
                
                for(var j in tx.inputs) {
                    var input = tx.inputs[j];
                    var prev_out = input.prev_out || {};
                    var address = prev_out.addr || 'na';
                    if(block.outputs.indexOf(address) >= 0) { tx.related = true; }
                }
                
                for(var j in tx.out) {
                    if(tx.related) {break;}
                    var out = tx.out[j];
                    var address = out.addr || 'na';
                    if(block.inputs.indexOf(address) >= 0) { tx.related = true; }
                }
                
                if(tx.related) { 
                    block.avgCount++;
                    continue;
                }
                
                var exclude = (bSegwitOnly) ? !tx.segwit : tx.segwit;
                if(exclude) { 
                    block.avgCount++;
                    continue;
                }
                
                block.sumFee  += tx.fee;
                block.sumSize += tx.size;
                block.swCount += (tx.segwit) ? 1 : 0;
                if(printTxn) {
                    var msg = tdo + tx.size.toString() + tdc;
                    msg += tdo + tx.fee + tdc;
                    msg += tdo + tx.segwit + tdc;
                    msg += tdo + tx.related + tdc;
                    msg += tdo + printHash(tx.hash, 'tx') + tdc;
                    console.log(tro + msg + trc);
                }
            }
            
            if(printBlk) {
                var msg = tdo + Number(block.sumFee / block.sumSize).toFixed(2).toString() + tdc;
                msg += tdo + '$' + Number(block.sumFee / block.sumSize * genTxSize * btcPrice / 100000000).toFixed(2).toString() + tdc;
                msg += tdo + Number(100.0 * segWits / txs.length).toFixed(2).toString() + "%" + tdc;
                msg += tdo + printHash(block.hash, 'block') + tdc;
                console.log(tro + msg + trc);
            }
            
            if(prevCount--) {
                return blockinfo(block.prev_block);    
            }
            else {
                return true;
            }
        });
}

jsonReq(latestblock, false)
    .then(function(lastblockid){
        // return blockinfo('000000000000000000c4f5b25ab623106eac117c1f1218fd995b263cddf988ae');
        return blockinfo(lastblockid.hash);
    })
    .catch(function(ex){
        ex.name = ex.name || 'NA';
        ex.error = ex.error || 'NA';
        ex.options = ex.options || {};
        ex.options.uri = ex.options.uri || 'NA'
        var msg = ex.name;
        msg += "\n\t" + ex.error;
        msg += "\n\t\t" + ex.options.uri;
        console.log(msg);
    });

/*
Note:

BlockDate = new Date(block.received_time * 1000);
hourPrevBD = new Date(BlockDate - 60*60*1000);
btcPrice = getGDAXquote(hourPrevBD, BlockDate, 60*60).close;

block.inputs
block.outputs

tx.hash
tx.fee
tx.size
tx.segwit
tx.related
*/