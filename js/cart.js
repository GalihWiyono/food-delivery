var firebaseConfig = {
    // Your Firebase Data
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
var dataHtml = "";
var userStatus;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        userStatus = user;
        console.log(userStatus);
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
                    getAllData();
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


function getAllData() {
    dataHtml = "";
    $('span[name="total-price"]').text(0)
    $('#total-cart').text(0);
    $('#total-cart').text(0);

    database.ref("cart").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                getMenuData(element.val().idMenu, element.val().quantityMenu, element.val().idCart);
            })
            getTotalHarga();
        } else {
            console.log("Cart Empty")
            $("#my-cart").html("");
        }
    }).catch((error) => {
        console.error(error);
    });
}

function getMenuData(idMenu, quantity, idCart) {
    database.ref('data-barang').get().then(function(snapshot) {
        if (snapshot.exists()) {
            // console.log(snapshot.val());
            snapshot.forEach(element => {
                if (element.val().id == idMenu) {
                    rewriteData(element, quantity, idCart);
                }
            });
        } else {
            console.log("No data available");
        }
    }).catch(function(error) {
        console.error(error);
    });
}


function rewriteData(element, quantity, idCart) {
    dataHtml += "<div class='d-flex'>"
    dataHtml += "<div class='d-flex justify-content-start col-3 col-sm-3 col-md-4 col-lg-2 col-xl-2'>"
    dataHtml += "<img class='foto-cart' src='" + element.val().imgUrl + "' />"
    dataHtml += "</div>"
    dataHtml += "<div class='tulisannya d-flex flex-column ml-2 mt-1 col-8 col-sm-7 col-md-6 col-lg-8 col-xl-8'>"
    dataHtml += "<h5>" + element.val().nama + "</h5>"
    dataHtml += "<p class='harga-menu'>IDR " + element.val().harga + "</p>"
    dataHtml += "</div>"
    dataHtml += "<div class='d-flex justify-content-end align-items-end container-button col-1 col-sm-2 col-md-2 col-lg-2 col-xl-2 ml-3'>"
    dataHtml += "<a href='' onclick='getIdCart(" + idCart + ")' data-toggle='modal' data-target='#modalDeleteCart'><i class='delete fas fa-trash'></i></a>"
    dataHtml += "<button type='button' class='adjust btn btn-outline-danger d-flex justify-content-center align-items-center ml-5 kurang' data-harga='" + element.val().harga + "' value='" + idCart + "'><span class='symbol'>-</span></button>"
    dataHtml += "<span id='quantityMenu' class='quantity ml-2'>" + quantity + "</span>"
    dataHtml += "<button type='button' class='adjust btn btn-outline-danger d-flex justify-content-center align-items-center ml-2 tambah' data-harga='" + element.val().harga + "' value='" + idCart + "'><span class='symbol'>+</span></button>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "<div class='d-flex flex-column'>"
    dataHtml += "<hr class='col-lg-12 col-md-12 col-sm-12 col-12'/>"
    dataHtml += "</div>"
    $("#my-cart").html(dataHtml);
}


// untuk mengurangkan menu
$(document).on('click', '.kurang', function() {
    var harga = parseInt($(this).attr("data-harga"));
    var idCart = $(this).val()
    var quantity = parseInt($(this).next($(".kurang")).text());

    if (quantity > 1) {
        quantity--;
        harga = quantity * harga;

        console.log(harga + " " + quantity + " " + idCart)
        $(this).next($(".kurang")).text(quantity);

        var promise = database.ref('cart/' + idCart).update({
            'hargaMenu': harga,
            'quantityMenu': quantity
        });

        promise.then(function() {
            console.log("berhasil mengupdate");
            getTotalHarga();
        });

    } else {
        console.log("data tidak bisa kurang dari 1")
    }
});

//untuk menambahkan menu
$(document).on('click', '.tambah', function(event) {

    var harga = parseInt($(this).attr("data-harga"));
    var idCart = $(this).val();
    var quantity = parseInt($(this).prev($(".kurang")).text());

    quantity++;
    harga = quantity * harga;

    console.log(harga + " " + quantity + " " + idCart)
    $(this).prev($(".kurang")).text(quantity);

    var promise = database.ref('cart/' + idCart).update({
        'hargaMenu': harga,
        'quantityMenu': quantity
    });

    promise.then(function() {
        console.log("berhasil mengupdate");
        getTotalHarga();
    });
});


function getTotalHarga() {
    var totalQuantity = 0;
    var totalHarga = 0;

    database.ref("cart").orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                totalQuantity = totalQuantity + parseInt(element.val().quantityMenu);
                totalHarga = totalHarga + parseInt(element.val().hargaMenu);
                console.log(totalHarga)
            });
            $('span[name="total-price"]').text(totalHarga)
            $('#total-cart').text(totalQuantity);
        } else {
            console.log("data not available")

        }
    }).catch((error) => {
        console.error(error);
    });
}

function getIdCart(idCart) {
    $('#hidden-text').val(idCart);
}

function deleteCart() {
    var idCart = $('#hidden-text').val();
    console.log(idCart);

    var promise = database.ref('cart/' + idCart).remove()
        .catch((error) => {
            console.log(error);
        });

    promise.then(function() {
        console.log("berhasil menghapus");
        $('#modalDeleteCart').modal('hide');
        getAllData();
    });
}


function orderAllMenu() {

    var idTransaction = Date.now();

    var trans = new Map();
    // trans.set('Location', "Dirumah");
    // trans.set('buktiPembayaran', "Test2");
    // trans.set('deliverStatus', "Delivered");
    // trans.set('idCart', {
    //     idCart1: "1234567",
    //     idCart2: "23241231"
    // });
    // trans.set('idCustomer', "23123123");
    // trans.set('idTransaksi', "231231231");
    // trans.set('paymentStatus', "Verified");
    // trans.set('totalHarga', "250000");
    // var trans = {
    //     Location: "Dirumah",
    //     buktiPembayaran: "Test2",
    //     deliverStatus: "Delivered",
    //     idCart: {
    //         idCart1: "1234567",
    //         idCart2: "23241231"
    //     },
    //     idCustomer: "23123123",
    //     idTransaksi: "231231231",
    //     paymentStatus: "Verified",
    //     totalHarga: "250000"
    // };

    var i = 1;
    var allCart = {};
    database.ref('cart').orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                allCart["IdCart" + i] = element.val().idCart;
                i++;
            });
            getData(allCart, $('#totalHarga').text())
        } else {
            console.log("data not available")
            alert("Tidak ada menu yang dibeli")
        }
    }).catch((error) => {
        console.error(error);
    });


    // const obj = Object.fromEntries(allCart);

    // console.log(obj)

    // var trans = {
    //     Location: "Dirumah",
    //     buktiPembayaran: "Test2",
    //     deliverStatus: "Delivered",
    //     idCart: tranac.,
    //     idCustomer: "23123123",
    //     idTransaksi: "231231231",
    //     paymentStatus: "Verified",
    //     totalHarga: "250000"
    // };

    // var objects = {
    // };

    // for (var x = 0; x < 100; x++) {
    //     objects[idCart+x]
    // }


    // console.log(objects)

    // var promise = database.ref("transaction/" + idTransaction).set({
    //     Location: "Dirumah",
    //     buktiPembayaran: "Test2",
    //     deliverStatus: "Delivered",
    //     idCart: allCart,
    //     idCustomer: "23123123",
    //     idTransaksi: "231231231",
    //     paymentStatus: "Verified",
    //     totalHarga: "250000"
    // }, (error) => {
    //     if (error) {
    //         console.log(error)
    //     }
    // });

    // promise.then(function() {
    //     console.log("berhasil")
    // });
}

function getData(allCart, totalPrice) {
    var obj = Object.values(allCart);
    var idTransaction = Date.now();

    var alamat;

    var today = new Date();
    var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    if ($(window).width() < 768) {
        alamat = $('#alamat-kecil').val();
        $('#alamat-gede').val("")
    } else {
        alamat = $('#alamat-gede').val();
        $('#alamat-kecil').val("")
    }

    if (alamat.trim() && alamat) {
        paymentGateway();
        var promise = database.ref("transaction/" + idTransaction).set({
            deliverStatus: "Shipping",
            idCart: allCart,
            idCustomer: userStatus.uid,
            idTransaksi: `${idTransaction}`,
            location: alamat,
            paymentStatus: "Verified",
            totalHarga: totalPrice,
            tanggalPembelian: dateTime
        }, (error) => {
            if (error) {
                console.log(error)
            }
        });

        promise.then(function() {
            console.log("berhasil")
            moveCartToHistory(allCart);
        });
    } else {
        alert("Tidak Boleh Kosong")
    }
}

function paymentGateway() {
    $('#modalBeli').modal('show');
    $('.text-payment').text('Please Wait, Connecting To Payment Gateway')
    $('.img-payment').css('display', 'block');
    $('.text-payment').removeClass('p-5');

    var i = 0;
    setTimeout(function() {
        var interval = setInterval(function() {
            $('.text-payment').text('Payment Gateway, Gathering Information....(' + i + '/9)')
            i++;
            if (i == 10) {
                clearInterval(interval)
            }
        }, 800);
        setTimeout(function() {
            $('.text-payment').text('Payment Gateway Connected')
            setTimeout(function() {
                $('.img-payment').css('display', 'none');
                $('.text-payment').addClass('p-5');
                $('.text-payment').text('Payment Accepted ✔️')
                setTimeout(function() {
                    $('#modalBeli').modal('hide');
                    $('.alamat').val("");
                    getAllData();
                    $("#my-cart").html("");
                }, 1500);
            }, 3000);
        }, 8800);
    }, 3000);
}

function moveCartToHistory(allCart) {
    var Mycart = Object.values(allCart);

    database.ref('cart').orderByChild("idCustomer").equalTo(userStatus.uid).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                var promise = database.ref("history/" + element.val().idCart).set({
                    hargaMenu: element.val().hargaMenu,
                    idCart: element.val().idCart,
                    idCustomer: element.val().idCustomer,
                    idMenu: element.val().idMenu,
                    namaMenu: element.val().namaMenu,
                    quantityMenu: element.val().quantityMenu
                }, (error) => {
                    if (error) {
                        console.log(error)
                    }
                });

                promise.then(function() {
                    console.log("berhasil memindahkan cart ke history")
                    deleteDataCart(element.val().idCart);
                });
            });
        } else {
            console.log("data not available")
        }
    }).catch((error) => {
        console.error(error);
    });
}

function deleteDataCart(idCart) {

    var promise = database.ref('cart/' + idCart).remove()
        .catch((error) => {
            console.log(error);
        });

    promise.then(function() {
        console.log("berhasil menghapus setelah memindahkan data");
    });
}


function tologin() {
    $('#modallogin').modal('show');
    $('#modalregister').modal('hide');
}


function toregist() {
    $('#modalregister').modal('show');
    $('#modallogin').modal('hide');
}