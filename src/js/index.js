$(function() {

    $('#login-form-link').click(function(e) {
        $("#login-form").delay(100).fadeIn(100);
        $("#register-form").fadeOut(100);
        $('#register-form-link').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });
    $('#register-form-link').click(function(e) {
        $("#register-form").delay(100).fadeIn(100);
        $("#login-form").fadeOut(100);
        $('#login-form-link').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });

});

function voterClick() {

    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    //Load Election state
    electionState = Admin.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.electionState(1);
    });

    // Load contract data
    promises = Admin.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.electeursCount();
    });

    promises.then(function(electeursCount) {
        // Store all promised to get candidate info
        const promises = [];
        var found = null;
        for (var i = 1; i <= electeursCount; i++) {
            promises.push(electionInstance.electeurs(i));
        }
        // Once all candidates are received, add to dom
        Promise.all(promises).then((electeurs) => {
            found = electeurs.find(electeur => electeur[2] == username & electeur[3] == password);
            if (found != undefined) {
                electionState.then((electionState) => {
                    if (electionState[1] == 1) {
                        document.location.href = "./root.html";
                    } else if (electionState[1] == 2) {
                        alert("Le vote est terminé");
                        document.location.href = "./result.html";
                    } else {
                        alert("Le vote n\'a pas encore débuté");
                    }
                });
            } else {
                document.getElementById("voter_login-submit").style.background = '#C25E5E';
                alert("Le nom d'utilisateur ou le mot de passe est incorrect. Veuillez essayer à nouveau.");
            }
        });
    });

};

function adminClick() {

    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    // Load contract data
    promises = Admin.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.electeursCount();
    });

    promises.then(function(electeursCount) {
        // Store all promised to get candidate info
        const promises = [];
        var found = null;
        for (var i = 1; i <= electeursCount; i++) {
            promises.push(electionInstance.electeurs(i));
        }
        // Once all candidates are received, add to dom
        Promise.all(promises).then((electeurs) => {
            found = electeurs.find(electeur => electeur[0] == 1 & electeur[2] == username & electeur[3] == password);
            if (found != undefined) {
                document.location.href = "./admin.html";
            } else {
                document.getElementById("admin_login-submit").style.background = '#C25E5E';
                alert("Le nom d'utilisateur ou le mot de passe est incorrect. Veuillez essayer à nouveau.");

            }
        });
    });
}