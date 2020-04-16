function addCandidate() {
        App.contracts.Election.deployed().then(function(instance) {
        	var name = $('#Nom').val();
            return instance.addCandidate(name);
        });
    }
