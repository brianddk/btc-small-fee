// [rights]  Copyright Dan B. (brianddk) 2017 https://github.com/brianddk
// [license] Licensed under Apache 2.0 https://www.apache.org/licenses/LICENSE-2.0
// [repo]    https://github.com/brianddk/btc-small-fee
// [tips]    LTC: LQjSwZLigtgqHA3rE14yeRNbNNY2r3tXcA
//
var rp = require('request-promise');
var szLimit = 500;
var avgCount = 18;
var prevCount = 10;
var blockuri = 'https://blockchain.info/rawblock/'

function jsonReq(url) {
    return rp({
        uri: url,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    });
} 

function blockinfo(hash) {
    return jsonReq(blockuri + hash)
        .then(function(block){
            var txs = block.tx
            var segWits = 0; // offset for coinbase, no tx        
            var smallFee = 999999;
            var minFee = 999999;
            for(var i in txs) {
                var tx=txs[i];
                if(!tx.inputs[0].prev_out ) {
                    cbIdx = i;
                    continue;
                }
                tx.segwit = false;
                tx.fee = 0;            
                for(var j in tx.inputs) {
                    var input = tx.inputs[j];
                    var witness = input.witness;
                    tx.segwit = tx.segwit || witness.length;
                    tx.fee += input.prev_out.value;                
                }
                for(var j in tx.out) {
                    var out = tx.out[j];
                    tx.fee -= out.value;                
                }
                
                segWits += (tx.segwit) ? 1 : 0;
            }
                    
            txs.splice(cbIdx,1);
            txs.sort(function(a,b){
                return a.fee - b.fee;
            });

            var sumSize = 0;
            var sumFee = 0;
            var swCount = 0;
            for(var i in txs) {
                if(i >= avgCount) { break; }
                var tx = txs[i];
                tx.segwit = (tx.segwit) ? true : false;
                sumFee  += tx.fee;
                sumSize += tx.size;
                swCount += (tx.segwit) ? 1 : 0;
                var msg = tx.size.toString();
                msg += "\t" + tx.fee;
                msg += "\t" + tx.segwit;
                msg += "\t" + tx.hash;
                console.log(msg);
            }
            
            var msg = Number(sumFee / sumSize).toFixed(2).toString();
            msg += "\t" + swCount;
            msg += "\t" + Number(100.0 * segWits / txs.length).toFixed(2).toString() + "%";
            msg += "\t" + block.hash;
            console.log(msg);
            
            if(prevCount--) {
                return blockinfo(block.prev_block);    
            }
            else {
                return true;
            }
        });
}

var latestblock = jsonReq('https://blockchain.info/latestblock')
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

tx.hash
tx.fee
tx.size
tx.segwit

*/