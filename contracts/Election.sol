pragma solidity 0.4.25;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string matricule;
        bytes32 name;
        bytes32 fname;
        bytes32 date;
        string adresss;
        bytes32 email;
        bytes32 poste;
        uint voteCount;
    }
     // Model a voters
    struct Electeur {
    uint id;
        string matricule_ele;
        string email;
        string password;
       
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
      mapping(uint => Electeur) public electeurs;
    // Store Candidates Count
    uint public candidatesCount;
    uint public electeursCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    // candidate added event
    event candidateAddedEvent();
    event electeurAddedEvent();

    constructor () public {
    //    addCandidate(12,"Candidate 1","Candidate 2",25653,"Candidate 2","Candidate 2","Candidate 2");
    //    addCandidate(12,"Candidate 1","Candidate 2",25653,"Candidate 2","Candidate 2","Candidate 2");
   }

    function addCandidate (string _matricule,bytes32 _name,bytes32 _fname,bytes32 _date,string _adresss, bytes32 _email,bytes32 _poste) public {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount,_matricule,_name,_fname,_date,_adresss,_email,_poste, 0);

        // trigger candidate added event
        emit candidateAddedEvent();
    }
    function addElecteur( string matricule_ele,string email,string password )public{
        electeursCount++;
        electeurs[electeursCount]= Electeur(electeursCount,matricule_ele ,email,password);

emit electeurAddedEvent();
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
