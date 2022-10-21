App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  // inisialisasi metamask (pop up confirm)
  initMetaMask: function () {
    async function enableUser() {
      const accounts = await ethereum.enable();
      const account = accounts[0];
      App.account = account;
    }
    enableUser();
  },

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545'
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Election.json', function (data) {
      // Buat instance baru untuk truffle contract dari artifact
      App.contracts.Election = TruffleContract(data);
      // Connect provider
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0,
            toBlock: 'latest',
          }
        )
        .watch(function (error, event) {
          console.log('event triggered', event);
          // Reload when a new vote is recorded
          App.render();
        });
    });
  },

  render: function () {
    var electionInstance;
    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html('Your Account: ' + account);
      } else {
        console.log(err);
      }
    });

    // Load contract data
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.kandidatCount();
      })
      .then(function (kandidatCount) {
        var hasil = $('#hasil');
        hasil.empty();
        var pilihan = $('#pilihan');
        pilihan.empty();

        for (var i = 1; i <= kandidatCount; i++) {
          electionInstance.kandidat(i).then(function (kandidat) {
            var id = kandidat[0];
            var nama = kandidat[1];
            var voteCount = kandidat[2];

            // Render hasilnya
            var kandidatTemplate =
              '<tr><th>' +
              id +
              '</th><td>' +
              nama +
              '</td><td>' +
              voteCount +
              '</td></tr>';
            hasil.append(kandidatTemplate);

            var pilihanTemplate =
              '<option value="' + id + '">' + nama + '</option>';
            pilihan.append(pilihanTemplate);
          });
        }
        return electionInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        if (hasVoted) {
          $('form').hide();
        }
        loader.hide();
        content.show();
      })
      .catch(function (err) {
        console.warn(err);
      });
  },

  castVote: function () {
    var candidateId = $('#pilihan').val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function (result) {
        // Wait for votes to update
        $('#content').hide();
        $('#loader').show();
      })
      .catch(function (err) {
        console.error(err);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.initMetaMask();
    App.init();
  });
});
