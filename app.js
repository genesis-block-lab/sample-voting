function watchTransaction(hash) {
  return new Promise(function(resolve, _) {
    const intervalId = setInterval(function() {
      web3.eth.getTransaction(hash, function(err, tx) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          console.log("Tx ", tx.blockNumber, blockNumber);

          if (blockNumber - tx.blockNumber >= 0) {
            setTimeout(function() {
              clearInterval(intervalId);
              console.log("Watch done");
              hideMessage();
              resolve(tx);
            }, 2000);
          }
        });
      });
    }, 2000);
  })
}

function makeSendMethod(method, params, options) {
  showMessage("Please confirm new transaction.");
  return makeContractMethod(method, params, 'send', options)
  .then(function(resp) {
    showMessage("Your transaction has been submitted. Please wait.");
    return resp;
  })
}

function makeCallMethod(method, params, options) {
  return makeContractMethod(method, params, 'call', options);
}

function makeContractMethod(method, params, methodType, options) {
  return Voting.then(function (contractInstance) {
    const m = contractInstance[method];
    const methodAlias = methodType === 'send' ? 'sendTransaction' : 'call';

    return new Promise((resolve, reject) => {
      const cb = (err, resp) => {
        if (err) {
          return reject(err);
        }
        console.log(`Contract Execute: method:${method} `, resp);
        resolve(resp);
      }

      if (options) {
        return m[methodAlias](...params,options, cb);
      }

      return m[methodAlias](...params, cb);
    });
  });
}

function Contract(address) {
  return new Promise((resolve, reject) => {
    var abi = CONFIGURATION.abi;

    if (!address) {
      return reject('Contract configuration invalid');
    }

    const metaMaskWeb3 = window.web3;
    if (!metaMaskWeb3) {
      return reject('Need MetaMask installed');
    }

    const web3js = metaMaskWeb3;

    web3js.version.getNetwork((err, netId) => {
      if (err) {
        return reject(err);
      }

      switch (netId) {
        case "1":
          console.log('This is mainnet')
          break
        case "2":
          console.log('This is the deprecated Morden test network.')
          break
        case "3":
          console.log('This is the ropsten test network.')
          break
        case "4":
          console.log('This is the Rinkeby test network.')
          break
        case "42":
          console.log('This is the Kovan test network.')
          break
        default:
          console.log('This is an unknown network.')
      }

      // if (netId != net_id) {
      //   return reject(`Incorrect eth network, expected network id is ${net_id}, actual is ${netId}`);
      // }
      let Contract, instance;
      try {
        Contract = web3js.eth.contract(abi);
        instance = Contract.at(address);
        console.log('OK OK OK');
      } catch (e) {
        return reject(e);
      }

      if (!instance) {
        return reject(new Error('Cannot init contract'));
      }

      console.log('OK OK OK');

      setInterval(function() {
        if (web3js.eth.accounts[0] !== web3js.eth.defaultAccount) {
          web3js.eth.defaultAccount = web3js.eth.accounts[0];
          console.log("Default ethAddress change ", web3js.eth.defaultAccount);
        }

      }, 100);
      console.log(123, instance);
      resolve(instance);
    });
  })
}


let Voting = null;
let candidates = {"Hulk": "candidate-1", "Captain": "candidate-2", "Stark": "candidate-3"}

window.initContract = function(address) {
  console.log("INIT CONTRACT ", address);
  if (!address) {
    return alert("Missing contract address");
  }
  try {
    Voting = Contract(address);
    Voting.then(function (contractInstance) {
      updateListVote();
      Promise.all([makeCallMethod('isEnded', []), makeCallMethod('owner', [])])
      .then(function (responses) {
        const isEnded = responses[0];
        const owner = responses[1];
        if (isEnded) {
          $('button[type=submit]').attr('disabled', true);
        }

        if (owner == web3.eth.accounts[0] && !isEnded) {
          $("#btn-end-vote").show();
        }

        if (owner !== web3.eth.accounts[0]) {
          $("#btn-end-vote").hide();
        }

        if (isEnded) {
          $("#btn-end-vote").show().text('VOTE ENDED').attr('disabled', true);
        }
      })
    }).catch(e => {
      showMessage(e.message);
    })
  } catch (e) {
    showMessage(e.message);
  }


}

window.isInited = function() {
  return !!Voting;
}

window.updateListVote = function() {
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    makeCallMethod('totalVotesFor', [name]).then(function(v) {
      $("#" + candidates[name]).html(v.toString());
    });
  }
}

window.voteForCandidate = function(candidate) {
  if (!isInited()) {
    return alert("Contract is not initialized");
  }

  let candidateName = $("#candidate-name").val();

  console.log(candidateName);
  if (!candidateName) {
    return this.alert("Please enter candidate name");
  }

  Voting.then(function(contractInstance) {

    makeSendMethod('voteForCandidate', [candidateName], {gas: 140000, from: web3.eth.accounts[0]}).then(function(hash) {
      watchTransaction(hash).then(function() {
        let div_id = candidates[candidateName];

        return makeCallMethod('totalVotesFor', [candidateName]).then(function(v) {
          $("#" + div_id).html(v.toString());
          hideMessage()
        });
      });

    }).catch(function(err) {
      if (err.message.indexOf("Error: VM Exception while processing transaction: revert") > -1) {
        hideMessage()
        alert("You cannot vote");
      }
    });
  });
}

window.changeVote = function() {
  if (!isInited()) {
    return alert("Contract is not initialized");
  }

  let candidateName = $("#change-vote-candidate-name").val();

  console.log(candidateName);
  if (!candidateName) {
    return this.alert("Please enter candidate name");
  }


  makeSendMethod('changeVoting', [candidateName], {gas: 140000, from: web3.eth.accounts[0]}).then(function(hash) {

    watchTransaction(hash).then(function() {
      updateListVote();
    })

  }).catch(function(err) {
    if (err.message.indexOf("Error: VM Exception while processing transaction: revert") > -1) {
      hideMessage()
      alert("You cannot vote");
    }
  });
}

window.endVote = function() {
  console.log("END VOTE");
  if (!isInited()) {
    return alert("Contract is not initialized");
  }

  makeSendMethod('endVoting', [], {gas: 140000, from: web3.eth.accounts[0]}).then(function(hash) {

    watchTransaction(hash).then(function() {
      $("#btn-end-vote").show().text('VOTE ENDED').attr('disabled', true);
    })

  }).catch(function(err) {
    if (err.message.indexOf("Error: VM Exception while processing transaction: revert") > -1) {
      hideMessage()
      alert("You cannot vote");
    }
  });
}

window.submitContractAddress = function() {
  var address = $('#txt-address').val();
  localStorage.setItem('address', address);
  initContract(address);
}

function hideMessage() {
  $("#msg").css('visibility', 'hidden');
}

function showMessage(msg) {
  $("#msg").css('visibility', 'visible').html(`<strong>${msg}</strong>`).show();
}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  if (localStorage.getItem('address')) {
    var address = localStorage.getItem('address');
    $('#txt-address').val(address);
    submitContractAddress();
  }
  hideMessage();
});
