Result = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        return Result.initWeb3();
    },

    initWeb3: function() {
        // TODO: refactor conditional
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            Result.web3Provider = web3.currentProvider;
            window.ethereum.enable();
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            Result.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            window.ethereum.enable();
            web3 = new Web3(Result.web3Provider);
        }
        return Result.initContract();
    },

    initContract: function() {
        $.getJSON("Election.json", function(election) {
            // Instantiate a new truffle contract from the artifact
            Result.contracts.Election = TruffleContract(election);
            // Connect provider to interact with contract
            Result.contracts.Election.setProvider(Result.web3Provider);

            return Result.render();
        });
    },

    style: function(){
		//loop 
		$("[name='poll_bar'").each(
				function(i){			
				  //get poll value 	
					var bar_width = (parseFloat($("[name='poll_val'").eq(i).text()));							
					
					//Define rules.
					if(bar_width >= 60){$("[name='poll_bar'").eq(i).addClass("progress progress-success active")} //Green
					if(bar_width <= 45){$("[name='poll_bar'").eq(i).addClass("progress progress-info active")} //Blue
					if(bar_width <= 35){$("[name='poll_bar'").eq(i).addClass("progress progress-warning active")} //Yellow
					if(bar_width < 10){$("[name='poll_bar'").eq(i).addClass("progress progress-danger active")} //Red
	  });
	},

    render: function() {
        var electionInstance;

        // Load account data
        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                Result.account = account;
            }
        });

        // Load contract data
        Result.contracts.Election.deployed().then(function(instance) {
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

                var total_vote = 0;

                candidates.forEach(candidate => {
                    total_vote += parseInt(candidate[8]);
                });
                
                candidates.forEach(candidate => {

                    var id = candidate[0];
                    var matricule = candidate[1];
                    var name = candidate[2];
                    var fname = candidate[3];
                    var email = candidate[6];
                    var voteCount = candidate[8];
                    // Render candidate List
                    var candidateTemplate = "<strong>"+matricule+" "+web3.toAscii(name)+" "+" "+web3.toAscii(fname)+"</strong><span name=\"poll_val\" class=\"pull-right\">"+(parseInt(voteCount)/total_vote*100).toFixed(2)+"%</span><div name=\"poll_bar\">\
                							 <div class=\"bar\" style=\"width: "+(parseInt(voteCount)/total_vote*100).toFixed(2)+"%;\"></div>\
              								 </div>";

                    candidatesList.append(candidateTemplate);

                });
                Result.style();
            });
        });
    },

};

$(function() {
    $(window).load(function() {
        Result.init();
    });
});


function déconnexion() {

    document.location.href = "./index.html";

}