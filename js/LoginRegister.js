var dbRef = firebase.database();
var Auth = firebase.auth();

function login() {
    var email = $('#emailLogin').val();
    var password = $('#passwordLogin').val();

    $('#failLogin').removeClass('d-block');

    console.log(email + " " + password)

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("login berhasil")
            $('#failLogin').removeClass('d-block');
            window.location.href = 'menu.html';
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            $('#emailLogin').addClass('is-invalid');
            $('#passwordLogin').addClass('is-invalid');
            $('#loginError').addClass('d-block');
            console.log(errorCode + " " + errorMessage);
        });
}

function validateEmail(email) {
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return regex.test(email);
}

(function() {
    'use strict';
    window.addEventListener('load', function() {
        // fetch all the forms we want to apply custom style
        var inputs = document.getElementsByClassName('formRegis');

        var validation2 = Array.prototype.filter.call(inputs, function(input) {

            input.addEventListener('blur', function(event) {

                var inputval = $.trim(input.value);
                var emailVal = $.trim($('#emailRegister').val());
                var passwordVal = $('#passwordRegister').val();
                // reset
                input.classList.remove('is-invalid');
                input.classList.remove('is-valid');

                if (input.type == "email") {
                    if (emailVal.length == 0 || emailVal === "") {
                        $('#emailRegister').addClass('is-invalid');
                        $('#emailError').text("Don't let this field empty :(");
                    } else {
                        if (!validateEmail(emailVal)) {
                            $('#emailRegister').removeClass('is-invalid');
                            $('#emailRegister').addClass('is-invalid');
                            $('#emailError').text("Your Email Not Valid :(");
                        } else {
                            $('#emailRegister').removeClass('is-invalid');
                            $('#emailRegister').addClass('is-valid');
                            $('#emailError').removeClass('d-block');
                        }
                    }
                } else if (input.type == "password") {
                    if (passwordVal.length < 6) {
                        $('#passwordRegister').removeClass('is-invalid');
                        $('#passwordRegister').addClass('is-invalid');
                        $('#passwordError').text("Password character should be more than 6");
                    } else {
                        $('#passwordRegister').removeClass('is-invalid');
                        $('#passwordRegister').addClass('is-valid');
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

function alphabet(e) {
    var regex = new RegExp("^[a-zA-Z ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
}

function register() {
    var fullnameVal = $('#fullnameRegister').val();
    var emailVal = $('#emailRegister').val();
    var passwordVal = $('#passwordRegister').val();
    var phonenumberVal = $('#phoneRegister').val();
    var imgUrlVal = "https://firebasestorage.googleapis.com/v0/b/project-android-19de2.appspot.com/o/userPicture%2Fdefault_profile_picture.png?alt=media&token=f9bd96de-f45b-4cef-a3b3-ed82c3c160ce"

    Auth.createUserWithEmailAndPassword(emailVal, passwordVal)
        .then((userCredential) => {
            // Signed in 
            var user = Auth.currentUser.uid;
            console.log(user)

            dbRef.ref("Users/" + user).set({
                email: emailVal,
                fullname: fullnameVal,
                idUser: user,
                password: passwordVal,
                phoneNumber: phonenumberVal,
                profileImage: imgUrlVal
            }, (error) => {
                if (error) {
                    console.log(error)
                } else {
                    $('#modalregister').modal('hide');
                    $('#exampleModal').modal('show');
                    setTimeout(function() {
                        $('#exampleModal').modal('hide');
                        window.location.href = 'menu.html';
                    }, 2000);

                }
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("gagal register");
            $('#emailRegister').addClass('is-invalid');
            $('#emailError').text("Email is already in use :(");
            $('#emailError').addClass('d-block');
            $("#emailError").focus();
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