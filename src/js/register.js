Electeur = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Electeur.initWeb3();
    },

    initWeb3: function() {
        
        if (typeof web3 !== 'undefined') {
            
            Electeur.web3Provider = web3.currentProvider;
            window.ethereum.enable();
            web3 = new Web3(web3.currentProvider);
        } else {
            
            Electeur.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            window.ethereum.enable();
            web3 = new Web3(Electeur.web3Provider);
        }
        return Electeur.initContract();
    },

    initContract: function() {
        $.getJSON("Election.json", function(election) {
           
            Electeur.contracts.Election = TruffleContract(election);
            
            Electeur.contracts.Election.setProvider(Electeur.web3Provider);

            Electeur.listenForEvents();

            return Electeur.render();
        });
    },

    
    listenForEvents: function() {
        Electeur.contracts.Election.deployed().then(function(instance) {
            
            instance.electeurAddedEvent({}, {       
                fromBlock: '0',
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
                    // actualiser aprés chaque nv vote
                Electeur.render();
            });
        });
    },

    render: function() {
        var electionInstance;

        // Charger les données du compte
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                Electeur.account = account;
            }
        });

    
        // Charger les données du smart contract
        Electeur.contracts.Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.electeursCount();
        }).then(function(electeursCount) {

            
            const promises = [];
            for (var i = 1; i <= electeursCount; i++) {
                promises.push(electionInstance.electeurs(i));
            }

            
            Promise.all(promises).then((electeurs) => {

                var electeursList = $('#electeursList');
                electeursList.empty();

                electeurs.forEach(electeur => {

                    var id = electeur[0];
                    var matricule =electeur[1];
                    var email = electeur[2];
                    var password = electeur[3];
                    
                   

                    // retourner la liste des candidats
                    var electeurTemplate = "<tr><th>" + id +"</th><td>" + matricule+ "</td><td>" + email +"</td><tr>" 

                    electeursList.append(electeurTemplate);

                })
            });
            
        });
    },

};

$(function() {
    $(window).load(function() {
        Electeur.init();
    });
});

//récuperer les cordonnées des électeurs et les ajouter a la blockchain

function addElecteur() {
        App.contracts.Election.deployed().then(function(instance) {
        	var Matricule = $('#Matricule').val();
            var email = $('#email').val();
            var password = $('#password').val();
            

            if (confirm("êtes vous d’accord")) {
                 return instance.addElecteur(Matricule,email,password);
                }
                else{
                   document.location.href = "./register.html";
                }
        });
    }
  