var firebaseConfig = {
    // Your Firebase Data
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Initialize Variable
const database = firebase.database();
var dataHtml = "";
var dataCart = "";
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
});

function checkUser() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            $('#failLogin').removeClass('d-block');
            database.ref("Users").orderByChild("idUser").equalTo(userStatus.uid).on("value", function(snapshot) {
                if (snapshot.exists()) {
                    $('#loginModal').modal('hide');
                    console.log(snapshot.val());
                    getAccountData();
                    getTransactionData();
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


function getTransactionData() {

    dataHtml = ""
    database.ref("transaction").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                getMenuData(element.val());
            })
        } else {
            console.log("Transaction Empty")
        }
    }).catch((error) => {
        console.error(error);
    });
}

function rewriteData(menuValue, cartLength, transactionValue) {
    var minCart = parseInt(cartLength);
    minCart = minCart - 1;

    var tanggalbeli = transactionValue.tanggalPembelian.substr(0, transactionValue.tanggalPembelian.indexOf(' '));

    dataHtml += "<div class='kotakan mt-3'>"
    dataHtml += "<div class='d-flex justify-content-between tanggal-history'>"
    if (transactionValue.deliverStatus == 'Delivered') {
        dataHtml += "<img class='status' src='images/Succees.png'>"
    } else if (transactionValue.deliverStatus == 'Failed') {
        dataHtml += "<img class='status' src='images/failed.png'>"
    } else if (transactionValue.deliverStatus == 'Shipping') {
        dataHtml += "<img class='status' src='images/shipping.png'>"
    }
    dataHtml += "<p>" + tanggalbeli + "</p>"
    dataHtml += "<p>" + transactionValue.idTransaksi + "</p>"
    dataHtml += "</div>"
    dataHtml += "<div class='d-flex history-content mt-1'>"
    dataHtml += "<div class='d-flex w-100'>"
    dataHtml += "<img class='foto-cart' src='" + menuValue.imgUrl + "'>"
    dataHtml += "<div class='d-flex flex-column nama-menu ml-3'>"
    dataHtml += "<h6>" + menuValue.nama + "</h6>"
    dataHtml += "<p><span>1</span> barang x <span>" + menuValue.harga + "</span> </p>"
    dataHtml += "<p>+ <span>" + minCart + "</span> barang</p>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "<div class='garis'></div>"
    dataHtml += "<div class='d-flex harga flex-column'>"
    dataHtml += "<p>Total Harga</p>"
    dataHtml += "<p>IDR " + transactionValue.totalHarga + "</p>"
    dataHtml += "<button class='btn btn-danger buton-detail ml-2' onclick='detailTransaction(" + transactionValue.idTransaksi + ")'>Detail</button>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    $("#list-history").html(dataHtml);
}

function getMenuData(value_transaction) {
    var cart = Object.values(value_transaction.idCart);
    console.log(cart)

    database.ref("history").orderByChild("idCart").equalTo(cart[0]).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                database.ref('data-barang').orderByChild("id").equalTo(element.val().idMenu).once('value', function(snapshot) {
                    if (snapshot.exists()) {
                        snapshot.forEach(menu_value => {
                            rewriteData(menu_value.val(), cart.length, value_transaction)
                        })
                    } else {
                        console.log("data empty")
                    }
                }).catch((error) => {
                    console.log(error);
                })
            })
        } else {
            console.log("History Empty")
        }
    }).catch((error) => {
        console.error(error);
    });
}

function getAccountData() {
    database.ref("Users").orderByChild("idUser").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                $('#name-acc').val(element.val().fullname);
                $('#email-acc').val(element.val().email);
                $('#phone-acc').val(element.val().phoneNumber);
            })
        } else {
            console.log("History Empty")
        }
    }).catch((error) => {
        console.error(error);
    });
}


function detailTransaction(idTransaksi) {
    $('#detailhistory').modal('show');
    dataCart = "";
    database.ref("transaction").orderByChild("idTransaksi").equalTo(idTransaksi).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                $('#id-transaction').text(element.val().idTransaksi);
                $('#id-status').text(element.val().deliverStatus);
                $('#id-tanggal').text(element.val().tanggalPembelian);
                getDataFromCart(element.val().idCart);
            })
        } else {
            console.log("History Empty")
        }
    }).catch((error) => {
        console.error(error);
    });
}

function getDataFromCart(userCart) {
    var usCart = Object.values(userCart);
    database.ref("history").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                for (var i = 0; i < usCart.length; i++) {
                    if (element.val().idCart == usCart[i]) {
                        database.ref('data-barang').orderByChild("id").equalTo(element.val().idMenu).once('value', function(snapshot) {
                            if (snapshot.exists()) {
                                snapshot.forEach(menu_value => {
                                    rewriteListTransaction(menu_value.val(), element.val());
                                })
                            } else {
                                console.log("data empty")
                            }
                        }).catch((error) => {
                            console.log(error);
                        });

                        i++;
                    }
                }
            })
        } else {
            console.log("History Empty")
        }
    }).catch((error) => {
        console.error(error);
    });
}

function rewriteListTransaction(menu_value, cart_value) {
    dataCart += "<div class='d-flex'>"
    dataCart += "<div class='d-flex w-100'>"
    dataCart += "<img class='foto-cart' src='" + menu_value.imgUrl + "'>"
    dataCart += "<div class='d-flex flex-column nama-menu ml-3'>"
    dataCart += "<h6>" + menu_value.nama + "</h6>"
    dataCart += "<p><span>" + cart_value.quantityMenu + "</span> Barang x <span>" + menu_value.harga + "</span></p>"
    dataCart += "</div>"
    dataCart += "</div>"
    dataCart += "<div class='garis'></div>"
    dataCart += "<div class='d-flex hargamodal flex-column'>"
    dataCart += "<p>IDR " + cart_value.hargaMenu + "</p>"
    dataCart += "</div>"
    dataCart += "</div>"
    dataCart += "<hr class='col-11'>"
    $("#cart-list").html(dataCart);
}

function akun() {
    $('#akun').modal('show');
}

function tologin() {
    $('#modallogin').modal('show');
    $('#modalregister').modal('hide');
}

function toregist() {
    $('#modalregister').modal('show');
    $('#modallogin').modal('hide');
}