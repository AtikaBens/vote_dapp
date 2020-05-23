Electeur = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Electeur.initWeb3();
    },

    initWeb3: function() {
        // TODO: refactor conditional
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            Electeur.web3Provider = web3.currentProvider;
            window.ethereum.enable();
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            Electeur.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            window.ethereum.enable();
            web3 = new Web3(Electeur.web3Provider);
        }
        return Electeur.initContract();
    },

    initContract: function() {
        $.getJSON("Election.json", function(election) {
            // Instantiate a new truffle contract from the artifact
            Electeur.contracts.Election = TruffleContract(election);
            // Connect provider to interact with contract
            Electeur.contracts.Election.setProvider(Electeur.web3Provider);

            Electeur.listenForEvents();

            return Electeur.render();
        });
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        Electeur.contracts.Election.deployed().then(function(instance) {
            // Restart Chrome if you are unable to receive this event
            // This is a known issue with Metamask
            // https://github.com/MetaMask/metamask-extension/issues/2393
            instance.electeurAddedEvent({}, {       
                fromBlock: '0',
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
                // Reload when a new vote is recorded
                Electeur.render();
            });
        });
    },

    render: function() {
        var electionInstance;

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                Electeur.account = account;
            }
        });

    
        // Load contract data
        Electeur.contracts.Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.electeursCount();
        }).then(function(electeursCount) {

            // Store all promised to get candidate info
            const promises = [];
            for (var i = 1; i <= electeursCount; i++) {
                promises.push(electionInstance.electeurs(i));
            }

            // Once all candidates are received, add to dom
            Promise.all(promises).then((electeurs) => {

                var electeursList = $('#electeursList');
                electeursList.empty();

                electeurs.forEach(electeur => {
                    console.log(electeur);
                    var id = electeur[0];
                    var matricule =electeur[1];
                    var email = electeur[2];
                    var password = electeur[3];
                    
                   

                    // Render candidate List
                    var electeurTemplate = "<tr><th>" + id +"</th><td>" + matricule+ "</td><td>" + email +"</td><tr>" 

                    electeursList.append(electeurTemplate);

                })
            });
            return electionInstance.voters(Electeur.account);
        });
    },

};

$(function() {
    $(window).load(function() {
        Electeur.init();
    });
});












function addElecteur() {
        App.contracts.Election.deployed().then(function(instance) {
        	var Matricule = $('#Matricule').val();
            var email = $('#email').val();
            var password = $('#password').val();
            
            
            return instance.addElecteur(Matricule,email,password);
        });
    }
  