var firebaseConfig = {
    // Your Firebase Data
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
var Auth = firebase.auth();
var userUid;


$(document).ready(function() {
    console.log("ready!");
    checkUser();
});

function checkUser() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            userUid = user.uid;
            $('#failLogin').removeClass('d-block');
            database.ref("Users").orderByChild("idUser").equalTo(userUid).on("value", function(snapshot) {
                if (snapshot.exists()) {
                    snapshot.forEach(element => {
                        $('#loginModal').modal('hide');
                        console.log(element.val());
                        $('#btnLogin').addClass("button-hide");
                        $('#btnLogin').hide();
                        $('#btnAccount').show();
                        $('#btnAccount').html("<i class='fas fa-user mr-3'></i>Account");
                        $('#btnAccount').removeClass("button-hide");
                    });
                } else {
                    console.log("No data available");
                }
            });

        } else {
            $('#btnLogin').show();
            $('#btnAccount').hide();
        }
    });
}


function logout() {
    firebase.auth().signOut().then(() => {
        console.log("logout sukses");
        $('#btnAccount').hide();
        $('#btnLogin').removeClass("button-hide");
        $('#btnLogin').show();
    }).catch((error) => {
        window.alert(error);
    });
}

function alphabet(e) {
    var regex = new RegExp("^[a-zA-Z ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
}


function validateEmail(email) {
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return regex.test(email);
}

(function() {
    'use strict';
    window.addEventListener('load', function() {
        // fetch all the forms we want to apply custom style
        var inputs = document.getElementsByClassName('form1');

        // loop over each input and watch blur event
        var validation = Array.prototype.filter.call(inputs, function(input) {

            input.addEventListener('blur', function(event) {

                var email = $.trim($("#email").val());

                // reset
                input.classList.remove('is-invalid');
                input.classList.remove('is-valid');

                var inputval = $.trim(input.value);

                if (input.type == "email") {
                    if (email.length == 0 || email === "") {
                        $('#email').addClass('is-invalid');
                        $('#emailError').text("Don't let this field empty :(");
                    } else {
                        if (!validateEmail(email)) {
                            $('#email').removeClass('is-invalid');
                            $('#email').addClass('is-invalid');
                            $('#emailError').text("Your Email Not Valid :(");
                        } else {
                            $('#email').removeClass('is-invalid');
                            $('#email').addClass('is-valid');
                        }
                    }
                } else {
                    if (input.checkValidity() === false || inputval.length == 0) {
                        input.classList.add('is-invalid');
                    } else {
                        input.classList.remove('is-invalid')
                        input.classList.add('is-valid');
                    }
                }

            }, false);
        });
    }, false);
})()

function tologin() {
    $('#modallogin').modal('show');
    $('#modalregister').modal('hide');
}


function toregist() {
    $('#modalregister').modal('show');
    $('#modallogin').modal('hide');
}

// maps

var map;

function initMap() {

    // init Map
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: {
            lat: -6.362119785289351,
            lng: 106.82492243758078
        },
    });


    // marker our location
    const marker = new google.maps.Marker({
        position: {
            lat: -6.362119785289351,
            lng: 106.82492243758078
        },
        map: map,
    });

}

// maps