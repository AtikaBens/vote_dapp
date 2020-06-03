Admin = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Admin.initWeb3();
    },

    initWeb3: function() {
        // TODO: refactor conditional
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            Admin.web3Provider = web3.currentProvider;
            window.ethereum.enable();
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            Admin.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            window.ethereum.enable();
            web3 = new Web3(Admin.web3Provider);
        }
        return Admin.initContract();
    },

    initContract: function() {
        $.getJSON("Election.json", function(election) {
            // Instantiate a new truffle contract from the artifact
            Admin.contracts.Election = TruffleContract(election);
            // Connect provider to interact with contract
            Admin.contracts.Election.setProvider(Admin.web3Provider);

            Admin.listenForEvents();

            return Admin.render();
        });
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        Admin.contracts.Election.deployed().then(function(instance) {
            
            instance.candidateAddedEvent({}, {
                fromBlock: '0',
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
                    // actualiser aprés chaque nv vote
                Admin.render();
            });
        });
    },

    render: function() {
        var electionInstance;

        // Charger les données du compte
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                Admin.account = account;
            }
        });

        $('#stopVote').hide();
        // Charger les données du smart contract
        Admin.contracts.Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then(function(candidatesCount) {

            // Store all promised to get candidate info
            const promises = [];
            for (var i = 1; i <= candidatesCount; i++) {
                promises.push(electionInstance.candidates(i));
            }

            // Once all candidates are received, add to dom
            Promise.all(promises).then((candidates) => {

                var candidatesList = $('#candidatesList');
                candidatesList.empty();

                candidates.forEach(candidate => {

                    var id = candidate[0];
                    var matricule = candidate[1];
                    var name = candidate[2];
                    var fname = candidate[3];
                    var email = candidate[6];
                    

                    // retourner la luste des candidats
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + matricule + "</td><td>" + web3.toAscii(name) + "</td><td>" + web3.toAscii(fname) + "</td><td>" + web3.toAscii(email) + "</td></tr>"

                    candidatesList.append(candidateTemplate);

                })
            });
            return electionInstance.voters(Admin.account);
        }).then(function(hasVoted) {
            // Empecher l'utilisateur a voter 
            console.log("has voted:  " + hasVoted);
            if (hasVoted != 0) {
                electionState = Admin.contracts.Election.deployed().then(function(instance) {
                    electionInstance = instance;
                    return electionInstance.electionState(1);
                });
                electionState.then((electionState) => {
                    if (electionState[1] != 2) {
                        $('#stopVote').show();
                    }
                });
                $('#runVote').hide();
                $('#addCand').hide();
                $('#addelec').hide();

            }
        }).catch(function(error) {
            console.warn(error);
        });
    },

};

$(function() {
    $(window).load(function() {
        Admin.init();
    });
});
// Lancer le vote 
function runVote() {
    if (confirm("êtes vous d’accord")) {
       
    Admin.contracts.Election.deployed().then(function(instance) {
        return instance.initState(1);
         document.location.href = "./root.html";
    });
    document.location.href = "./root.html";
    }
    else{
    document.location.href = "./admin.html";
    }

}
// arrêter le vote une fois le temps écoulé 

function stopVote() {

     if (confirm("êtes vous d’accord")) {
   
    Admin.contracts.Election.deployed().then(function(instance) {
        return instance.initState(2);
                       
    });
     $('#stopVote').hide(); 
}


else{
    document.location.href = "./admin.html";
                }

    
}
//ajouter un candidat

function addCand() {

    document.location.href = "./candidate.html";

}
//ajouter un électeur

function addelec() {
    document.location.href = "./register.html";
}