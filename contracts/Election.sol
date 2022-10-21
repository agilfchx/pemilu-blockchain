// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Election {
    // Membuat model kandidat
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public kandidat; // Menyimpan kandidat yang terdaftar
    mapping(address => bool) public voters; // Menyimpan pemilih yang sudah memilih

    uint256 public kandidatCount; // Menyimpan jumlah kandidat

    event votedEvent(uint indexed _kandidatId);

    constructor() public {
        tambahKandidat("Jaka Sembung");
        tambahKandidat("Joko Keren");
    }

    function tambahKandidat(string memory _name) private {
        kandidatCount++;
        kandidat[kandidatCount] = Candidate(kandidatCount, _name, 0);
    }

    function vote(uint _kandidatID) public {
        // Pastikan pemilih belum memilih
        require(!voters[msg.sender]);

        // Pastikan kandidat yang dipilih valid
        require(_kandidatID > 0 && _kandidatID <= kandidatCount);

        // Mengubah kondisi voters menjadi true
        voters[msg.sender] = true;

        // Update kandidat voteCount
        kandidat[_kandidatID].voteCount++;

        // Trigger voted event
        emit votedEvent(_kandidatID);
    }
}

// Smoke test (truffle console) => Election.deployed().then(function(i) { app=i })
