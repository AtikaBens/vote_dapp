function addCandidate() {
        App.contracts.Election.deployed().then(function(instance) {
        	var matricule = $('#Matricule').val();
        	var name = $('#Nom').val();
        	var fname = $('#Prénom').val();
        	var date = $('#Date_de_naissance').val();
        	var address = $('#Adresse').val();
        	
        	var email = $('#email').val();
        	
        	var poste = $('#Poste').val();

            return instance.addCandidate(matricule,name,fname,date,address,email,poste);
        });
    }
