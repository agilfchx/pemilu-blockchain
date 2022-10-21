var Election = artifacts.require('./Election.sol');

contract('Election', function (accounts) {
  var electionInstance;
  // Test 1 -> Check dengan membuat dua kandidat
  it('inisialisasi dengan dua kandidat', function () {
    return Election.deployed()
      .then(function (instance) {
        return instance.kandidatCount();
      })
      .then(function (count) {
        assert.equal(count, 2);
      });
  });

  // Test 2 -> Check dengan membuat kandidat dengan value yang benar
  it('inisialisasi dengan kandidat value yang benar', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.kandidat(1);
      })
      .then(function (kandidat) {
        assert.equal(kandidat[0], 1, 'berisi id yang benar');
        assert.equal(kandidat[1], 'Jaka Sembung', 'berisi nama yang benar');
        assert.equal(kandidat[2], 0, 'berisi vote yang benar');
        return electionInstance.kandidat(2);
      })
      .then(function (kandidat) {
        assert.equal(kandidat[0], 2, 'berisi id yang benar');
        assert.equal(kandidat[1], 'Joko Keren', 'berisi nama yang benar');
        assert.equal(kandidat[2], 0, 'berisi vote yang benar');
      });
  });

  // Test 3 -> Check dengan membuat voters untuk memilih kandidat
  it('cek pemilih untuk memilih kandidat', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        kandidatId = 1;
        return electionInstance.vote(kandidatId, { from: accounts[0] });
      })
      .then(function (receipt) {
        return electionInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, 'pemilih telah memilih');
        return electionInstance.kandidat(kandidatId);
      })
      .then(function (kandidat) {
        var voteCount = kandidat[2];
        assert.equal(voteCount, 1, 'menambahkan jumlah vote');
      });
  });

  // Test 4 -> Check voter untuk memberikan suara
  it('cek pemilih untuk memberikan suara', function () {
    return Election.deployed()
      .then(function (i) {
        electionInstance = i;
        kandidatId = 1;
        return electionInstance.vote(kandidatId, { from: accounts[0] });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, 'an event was triggered');
        assert.equal(
          receipt.logs[0].event,
          'votedEvent',
          'the event type is correct'
        );
        assert.equal(
          receipt.logs[0].args._candidateId.toNumber(),
          candidateId,
          'the candidate id is correct'
        );
        return electionInstance.voters(accounts[0]);
      })
      .then(function (voted) {
        assert(voted, 'pemilih telah memilih');
        return electionInstance.kandidat(kandidatId);
      })
      .then(function (kandidat) {
        var voteCount = kandidat[2];
        assert.equal(voteCount, 1, 'menambahkan jumlah vote');
      });
  });

  // Test 5 -> Check dengan membuat voters memilih kandidat yang salah
  it('check execption voters memilih kandidat yang salah', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        // Melakukan vote dengan kandidat yg salah
        return electionInstance.vote(99, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function (error) {
        // error message
        assert(
          error.message.indexOf('revert') >= 0,
          'error message must contain revert'
        );
        return electionInstance.kandidat(1);
      })
      .then(function (candidate1) {
        var voteCount = candidate1[2];
        assert.equal(voteCount, 1, 'candidate 1 did not receive any votes');
        return electionInstance.kandidat(2);
      })
      .then(function (candidate2) {
        var voteCount = candidate2[2];
        assert.equal(voteCount, 0, 'candidate 2 did not receive any votes');
      });
  });

  // Test 6 -> check double voting
  it('check exception untuk double voting', function () {
    return Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        kandidatId = 2;
        // Melakukan vote dengan kandidat yg benar
        electionInstance.vote(kandidatId, { from: accounts[1] });
        return electionInstance.kandidat(kandidatId);
      })
      .then(function (candidate) {
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, 'accepts first vote');
        // Mencoba vote lagi
        return electionInstance.vote(kandidatId, { from: accounts[1] });
      })
      .then(assert.fail)
      .catch(function (error) {
        // error message
        assert(
          error.message.indexOf('revert') >= 0,
          'error message must contain revert'
        );
        return electionInstance.kandidat(1);
      })
      .then(function (candidate1) {
        var voteCount = candidate1[2];
        assert.equal(voteCount, 1, 'candidate 1 did not receive any votes');
        return electionInstance.kandidat(2);
      })
      .then(function (candidate2) {
        var voteCount = candidate2[2];
        assert.equal(voteCount, 1, 'candidate 2 did not receive any votes');
      });
  });
});
