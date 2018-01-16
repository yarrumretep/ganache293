/* eslint-disable*/
var FakeCoin = artifacts.require('./FakeCoin.sol');

web3._extend({
    property: 'miner',
    methods:
    [
        new web3._extend.Method({
            name: 'start',
            call: 'miner_start',
            params: 1,
            inputFormatter: [web3._extend.formatters.formatInputInt],
            outputFormatter: web3._extend.formatters.formatOutputBool
        }),
        new web3._extend.Method({
            name: 'stop',
            call: 'miner_stop',
            params: 0
        }),
        new web3._extend.Method({
            name: 'mine',
            call: 'evm_mine',
            params: 0
        })
      ]});

const promise = (func) => new Promise((resolve, reject) => {
  try {
    func((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  } catch (e) {
    reject(e)
  }
})

function pauseAutoMining() {
  console.log('pausing...');
  return promise(cb => web3.miner.stop(cb))
}
function resumeAutoMining(threads=1) {
  console.log('resuming...');
  return promise(cb => web3.miner.start(threads, cb))
}
function mine() {
  console.log("Mining...");
  return promise(cb => web3.miner.mine(cb))
  .catch(error => {
    if(error.message.indexOf('Invalid JSON RPC response') < 0) {
      throw error;
    }
  })
}
function advanceClock(seconds) {
  return promise(cb => web3.miner.advanceClock(seconds, cb))
}

contract('FakeCoin', function(accounts) {
  var A;
  var B;

  beforeEach(() => {
    return Promise.all([
      FakeCoin.new(1000, {from: accounts[1]}),
      FakeCoin.new(1100, {from: accounts[2]})
    ]).then(([a, b]) => {
      A = a;
      B = b;
    })
  })

  afterEach(()=>{
    return resumeAutoMining();
  })

  it('should handle manual mining', () => {
    return Promise.resolve()
    .then(pauseAutoMining)
    .then(()=>A.transfer.sendTransaction(accounts[2], 30, {from:accounts[1]}).then(result=>console.log("Thing1: " + result)))
    .then(()=>A.transfer.sendTransaction(accounts[3], 30, {from:accounts[1]}).then(result=>console.log("Thing2: " + result)))
    .then(()=>B.transfer.sendTransaction(accounts[4], 200, {from:accounts[2]}).then(result=>console.log("Thing3: " + result)))
    .then(mine)
    .then(mine)
    .then(mine)
    .then(console.log)
  })
})
