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
            // Restart Chrome if you are unable to receive this event
            // This is a known issue with Metamask
            // https://github.com/MetaMask/metamask-extension/issues/2393
            instance.candidateAddedEvent({}, {       
                fromBlock: '0',
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
                    // Reload when a new vote is recorded
                Admin.render();
            });
        });
    },

    render: function() {
        var electionInstance;

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                Admin.account = account;
            }
        });

        $('#stopVote').hide();
        // Load contract data
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
                    var matricule =candidate[1];
                    var name = candidate[2];
                    var fname = candidate[3];
                    var email=candidate[6];
                   

                    // Render candidate List
                    var candidateTemplate = "<tr><th>" + id +"</th><td>" + matricule + "</td><td>" + name +"</td><td>" + fname + "</td><td>"+email+"</td><tr>" 
                    candidatesList.append(candidateTemplate);

                })
            });
            return electionInstance.voters(Admin.account);
        }).then(function(hasVoted) {
            // Do not allow a user to vote
            if (hasVoted) {
                $('#stopVote').show();
                $('#runVote').hide();
                $('#addCand').hide();
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

function runVote(){

    document.location.href = "./root.html";

}

function addCand(){

    document.location.href = "./candidate.html";

}
function addelec(){
document.location.href = "./register.html";
}