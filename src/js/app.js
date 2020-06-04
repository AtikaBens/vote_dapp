App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: 0,

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        
        if (typeof web3 !== 'undefined') {
            
            App.web3Provider = web3.currentProvider;
            window.ethereum.enable();
            web3 = new Web3(web3.currentProvider);
        } else {
            
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            window.ethereum.enable();
            web3 = new Web3(App.web3Provider);
        }
        return App.initContract();
    },

    initContract: function() {
        $.getJSON("Election.json", function(election) {
            
            App.contracts.Election = TruffleContract(election);
            
            App.contracts.Election.setProvider(App.web3Provider);

            App.listenForEvents();

            return App.render();
        });
    },

    
    listenForEvents: function() {
        App.contracts.Election.deployed().then(function(instance) {
           
            instance.votedEvent({}, {
                fromBlock: '0',
                toBlock: 'latest'
            }).watch(function(error, event) {
                console.log("event triggered", event)
                     // actualiser aprés chaque nv vote
                App.render();
            });
        });
    },

    render: function() {
        var electionInstance;
        var loader = $("#loader");
        var content = $("#content");

        loader.show();
        content.hide();

        // Charger les données du compte
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                $("#accountAddress").html("Votre compte : " + account);

            }
        });

        // Charger les données du smart contract
        App.contracts.Election.deployed().then(function(instance) {
            electionInstance = instance;
            return electionInstance.candidatesCount();
        }).then(function(candidatesCount) {
            var candidatesResults = $("#candidatesResults");
            candidatesResults.empty();

            const promises = [];
            for (var i = 1; i <= candidatesCount; i++) {
                promises.push(electionInstance.candidates(i));
            }

          
            Promise.all(promises).then((candidates) => {
                var candidatesResults = $("#candidatesResults");
                candidatesResults.empty();

                var candidatesSelect = $('#candidatesSelect');
                candidatesSelect.empty();

                candidates.forEach(candidate => {

                    var id = candidate[0];
                    var matricule = candidate[1];
                    var name = candidate[2];
                    var fname = candidate[3];
                    var voteCount = candidate[8];

                    electionInstance.voters(App.account).then(function(chosenCandidate) {

                        if (id.valueOf() == chosenCandidate.valueOf()) {
                            $('#candidateId').html("Vous avez voté pour : "+ web3.toAscii(name) +", "+web3.toAscii(fname)+". N° Matricule  : "+matricule);
                        };
                    })

                    // retourner le résultat des candidats
                    var candidateTemplate = "<tr><th>" + id + "</th><td>" + matricule + "</td><td>" + web3.toAscii(name) + "</td><td>" + web3.toAscii(fname) + "</td><td>" + voteCount + "</td></tr>"
                    candidatesResults.append(candidateTemplate);

                    // la liste des choix de candidats
                    var candidateOption = "<option value='" + id + "' >" + id + " - " + web3.toAscii(name) + "  " + web3.toAscii(fname) + "</ option>"
                    candidatesSelect.append(candidateOption);
                })
            });
            return electionInstance.voters(App.account);
        }).then(function(hasVoted) {
            // Empecher l'utilisateur a voter
            if (hasVoted != 0) {
                $('form').hide();

            }
            loader.hide();
            content.show();
        }).catch(function(error) {
            console.warn(error);
        });
    },


    castVote: function() {
        var candidateId = $('#candidatesSelect').val();
        App.contracts.Election.deployed().then(function(instance) {
            return instance.vote(candidateId, {
                from: App.account
            });
        }).then(function(result) {
             // actuallisation des votes 
        
            $("#content").hide();
            $("#loader").show();
        }).catch(function(err) {
            console.error(err);
        });
    }
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});