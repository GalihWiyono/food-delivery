var firebaseConfig = {
    // Your Firebase Data
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


//Initialize Variable

const database = firebase.database();
var dataHtml = "";
var filter_from_price = "";
var filter_to_price = "";
var cat = "All";
var userStatus;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        userStatus = user;
    } else {
        userStatus = null;
    }
});

$(document).ready(function() {
    checkUser();
    console.log("ready!");
    getAllMenu();
});

$(".js-range-slider").ionRangeSlider({
    onStart: function(data) {
        filter_from_price = data.from;
        filter_to_price = data.to;
    },
    onFinish: function(data) {
        filter_from_price = data.from;
        filter_to_price = data.to;
    }
});

function getAllMenu() {
    dataHtml = "";
    database.ref('data-barang').get().then(function(snapshot) {
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            snapshot.forEach(element => {
                reWriteHtml(element);
            });

        } else {
            console.log("No data available");
        }
    }).catch(function(error) {
        console.error(error);
    });
}

function addToCart(key) {
    $('#idCart').val("0");
    $('#btn-order').text('Add To Cart');
    var quantity = "0";
    console.log(key)
    if (userStatus != null) {
        database.ref("cart").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(element => {
                    if (element.val().idMenu == key) {
                        quantity = element.val().quantityMenu;
                        $('#idCart').val(element.val().idCart);
                    }
                    return
                })
            }
            detailMenu(quantity, key);
        }).catch((error) => {
            console.error(error);
        });

    } else {
        $('#loginfirst').modal('show');
        setTimeout(function() {
            $('#loginfirst').modal('hide');
        }, 2000);
    }
}

function detailMenu(quantity, key) {
    console.log(quantity);
    database.ref('data-barang').child(key).get().then((snapshot) => {
        if (snapshot.exists()) {

            $('#fotoMenu').attr('src', snapshot.val().imgUrl);
            $('#judulMenu').text(snapshot.val().nama);
            $('#deskripsiMenu').text(snapshot.val().deskripsi);
            $('.quantity').text(quantity);
            $('#hargaMenu').text("Rp " + snapshot.val().harga);
            $('#addtocartmodal').modal('show');
            $('#idMenu').val(key);

        } else {
            console.log("No data available")
        }
    }).catch((error) => {
        console.log(error);
    });
}

function order() {
    var quantityTotal = parseInt($('.quantity').text());
    var idMenu = $('#idMenu').val();
    var idCart = `${Date.now()}`;
    var totalHarga = $('#hargaMenu').text();
    totalHarga = parseInt(totalHarga.replace(/[^0-9]/g, '')) * quantityTotal;

    if (quantityTotal == 0 && $('#btn-order').text() == 'Delete From Cart') {
        console.log("masuk sini")
        deleteFromCart(idMenu)

    } else if (quantityTotal == 0) {
        $('#menuKosong').modal('show');
        setTimeout(function() {
            $('#menuKosong').modal('hide');
        }, 1000);

    } else {
        database.ref("cart").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(element => {
                    if (element.val().idMenu == idMenu) {
                        idCart = element.val().idCart;
                    }
                })
            }
            database.ref("cart/" + idCart).set({
                hargaMenu: totalHarga.toString(),
                idCart: idCart,
                idCustomer: userStatus.uid,
                idMenu: idMenu,
                namaMenu: $('#judulMenu').text(),
                quantityMenu: `${quantityTotal}`
            }, (error) => {
                if (error) {
                    console.log(error)
                } else {
                    $('#addtocartmodal').modal('hide');
                    $('#modalsuccesscart').modal('show');
                    setTimeout(function() {
                        $('#modalsuccesscart').modal('hide');
                    }, 1500);
                }
            });
        }).catch((error) => {
            console.error(error);
        });
    }
}

function deleteFromCart(idMenu) {
    database.ref('cart').orderByChild('idCustomer').equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                if (element.val().idMenu == idMenu) {
                    var idCart = element.val().idCart;
                    database.ref('cart/' + idCart).remove()
                        .catch((error) => {
                            console.error(error);
                        });
                    $('#addtocartmodal').modal('hide');
                    $('#modaldeletecart').modal('show');
                    setTimeout(function() {
                        $('#modaldeletecart').modal('hide');
                    }, 1500);
                }
                return
            });
        } else {
            console.log("No data available");
        }
    });
}

function incress() {
    var quantity = parseInt(document.getElementById("quantityMenu").innerHTML);

    if (quantity == 0 && $('#btn-order').text('Delete From Cart')) {
        quantity++;
        $('#btn-order').text('Add To Cart');
    } else {
        quantity++;
    }
    document.getElementById("quantityMenu").innerHTML = quantity;
}

function decress() {

    var quantity = parseInt(document.getElementById("quantityMenu").innerHTML);
    var idMenu = $('#idMenu').val();
    var idCart = $('#idCart').val();

    if (quantity == 1 && idCart != "0") {
        quantity--;
        $('#btn-order').text('Delete From Cart');
    } else if (quantity > 0 && idCart != "0") {
        quantity--;
    } else if (quantity > 0) {
        quantity--;
    }

    document.getElementById("quantityMenu").innerHTML = quantity;

    // database.ref('cart').orderByChild('idCustomer').equalTo(userStatus.uid).once("value", function(snapshot) {
    //     if (snapshot.exists()) {
    //         snapshot.forEach(element => {
    //             if (element.val().idMenu == idMenu) {
    //                 onCart = true;
    //             }
    //         });

    //         if (quantity == 1 && onCart) {
    //             quantity--;
    //             $('#btn-order').text('Delete From Cart');
    //         } else if (quantity > 0) {
    //             quantity--;
    //         }
    //     } else {
    //         console.log("No data available");
    //         if (quantity > 0) {
    //             quantity--;
    //         }
    //     }

    //     document.getElementById("quantityMenu").innerHTML = quantity;
    // });
}

function categori(categori) {
    cat = categori;
    if (categori == "All") {
        getAllMenu();
    } else {
        database.ref('data-barang').orderByChild('kategori').equalTo(categori).on("value", function(snapshot) {
            if (snapshot.exists()) {
                dataHtml = "";
                snapshot.forEach(element => {
                    reWriteHtml(element);
                });

            } else {
                console.log("No data available");
            }

        });
    }
}

function filterRange() {

    console.log(filter_from_price);
    console.log(filter_to_price);

    database.ref('data-barang').get().then(function(snapshot) {
        if (snapshot.exists()) {
            dataHtml = "";
            snapshot.forEach(element => {
                if (cat == 'All') {
                    if (parseInt(element.val().harga) >= filter_from_price && parseInt(element.val().harga) <= filter_to_price) {
                        reWriteHtml(element);
                    } else {
                        console.log("Menu Diluar Range Harga 1");
                    }
                } else {
                    if (parseInt(element.val().harga) >= filter_from_price && parseInt(element.val().harga) <= filter_to_price && element.val().kategori == cat) {
                        reWriteHtml(element);
                    } else {
                        console.log("Menu Diluar Range Harga 2");
                    }
                }
            })
        } else {
            // $('#menuKosong').modal('show');
            // setTimeout(function() {
            //     $('#menuKosong').modal('hide');
            // }, 2000);
            console.log("No data available");
        }

    }).catch(function(error) {
        console.error(error);
    });

}

function reWriteHtml(element) {
    dataHtml += "<div class='card mb-4 col-lg-3 col-5'>"
    dataHtml += "<div class='card-content'>"
    dataHtml += "<a>" + element.val().kategori + "</a>"
    dataHtml += "<h1>" + element.val().nama + "</h1>"
    dataHtml += "<div>"
    dataHtml += "<img class='fotonya d-flex justify-content-center' src=" + element.val().imgUrl + "/>"
    dataHtml += "</div>"
    dataHtml += "<div class='tulisannya'>"
    dataHtml += "<h2> IDR " + element.val().harga + "</h2>"
    dataHtml += "<button type='button' onclick='addToCart(" + element.key + ")' class='btn btn-outline-danger add d-flex justify-content-center align-items-center'><i class='fa fa-plus' aria-hidden='true'></i></button>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    $("#gallery-menu").html(dataHtml);
}

//check user
function checkUser() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            $('#failLogin').removeClass('d-block');
            database.ref("Users").orderByChild("idUser").equalTo(userStatus.uid).on("value", function(snapshot) {
                if (snapshot.exists()) {
                    $('#loginModal').modal('hide');
                    console.log(snapshot.val());
                    $('#btnLogin').addClass("button-hide");
                    $('#btnLogin').hide();
                    $('#btnAccount').show();
                    $('#btnAccount').html("<i class='fas fa-user mr-3'></i>Account");
                    $('#btnAccount').removeClass("button-hide");
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

function alphabet(e) {
    var regex = new RegExp("^[a-zA-Z ]+$");
    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (regex.test(str)) {
        return true;
    }
    e.preventDefault();
    return false;
}

function submit() {
    const email = $("#email").val();
    const firstName = $.trim($("#firstName").val());
    const lastName = $.trim($("#lastName").val());
    const textArea = $("feedback").val();

    if (!validateEmail(email) || firstName === "" || lastName === "" || textArea === "") {
        console.log("Some Field Error");
    } else {
        $("#form")[0].reset();
        alert("Thanks You Mrs/Ms. " + firstName + " " + lastName + " , Your Message Has Been Sent!");
        $('#exampleModal').modal('hide');
    }

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


function seeCart() {
    database.ref("cart").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                console.log(element.val());
            });
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

$('button[name="All"], button[name="Chicken"], button[name="Burger"], button[name="Pasta"], button[name="Side-Dish"], button[name="Coffee"], button[name="Drink"], button[name="Desert"]').click(function() {
    $('button[name="All"], button[name="Chicken"], button[name="Burger"], button[name="Pasta"], button[name="Side-Dish"], button[name="Coffee"], button[name="Drink"], button[name="Desert"]').removeClass('active');
    $(this).addClass('active');
})

function tologin() {
    $('#modallogin').modal('show');
    $('#modalregister').modal('hide');
}


function toregist() {
    $('#modalregister').modal('show');
    $('#modallogin').modal('hide');
}

$('#addtocartmodal').on('hide.bs.modal', function(e) {
    $('body').css('padding-right', '0');
});

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