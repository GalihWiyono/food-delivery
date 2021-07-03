var firebaseConfig = {
    // Your Firebase Data
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
var dataHtml = "";

$(document).ready(function() {
    getDataTransaction();
});

function getDataTransaction() {
    dataHtml = "";


    database.ref('transaction').orderByChild("deliverStatus").equalTo("Shipping").once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                getnama(element.val());
            });
        } else {
            console.log("data not available")
            $("#gallery-kurir").html("");
        }
    }).catch((error) => {
        console.error(error);
    });

    // database.ref('transaction').get().then(function(snapshot) {
    //     if (snapshot.exists()) {
    //         snapshot.forEach(element => {
    //             if (element.val().deliverStatus == 'Shipping') {
    //                 getnama(element.val());
    //             } else {
    //                 $("#gallery-kurir").html("");
    //             }
    //         });
    //     } else {
    //         console.log("Gagal");
    //     }
    // });
}

function getnama(valueTransaction) {
    database.ref('Users').orderByChild('idUser').equalTo(valueTransaction.idCustomer).once("value", function(snapshot) {
        if (snapshot.exists()) {
            snapshot.forEach(element => {
                reWriteHtml(element.val(), valueTransaction);
            })
        }
    });
}

function reWriteHtml(valueUsers, valueTransaction) {
    dataHtml += "<div class='kotakan'>"
    dataHtml += "<div class='d-flex justify-content-between tanggal-history'>"
    dataHtml += "<p>9 Juni 2021</p>"
    dataHtml += "<p>" + valueTransaction.idTransaksi + "</p>"
    dataHtml += "</div>"
    dataHtml += "<div class='d-flex history-content'>"
    dataHtml += "<div class='d-flex w-100'>"
    dataHtml += "<div class='d-flex flex-column nama-menu'>"
    dataHtml += "<h6>" + valueUsers.fullname + "</h6>"
    dataHtml += "<a href='' id='jalan'>" + valueTransaction.location + "</a>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "<div class='d-flex harga justify-content-end align-items-end'>"
    dataHtml += "<button type='button' class='adjust btn btn-outline-danger d-flex justify-content-center align-items-center ml-2 batal' onclick='deliverFailed(" + valueTransaction.idTransaksi + ")' data-toggle='modal' data-target='#modalDeliverFailed'><i class='fas fa-times'></i></button>"
    dataHtml += "<button type='button' class='adjust btn btn-outline-success d-flex justify-content-center align-items-center ml-2 confirm' onclick='deliverSuccess(" + valueTransaction.idTransaksi + ")' data-toggle='modal' data-target='#modalDeliverSuccess'><i class='fas fa-check'></i></button>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "<hr>"
    $("#gallery-kurir").html(dataHtml);
}

function deliverFailed(idTransaksi) {
    $('#hidden-text').val(idTransaksi);
}

function deliverSuccess(idTransaksi) {
    $('#hidden-text').val(idTransaksi);
}

function deliverCancel() {
    var idTransaksi = $('#hidden-text').val();

    var promise = database.ref('transaction/' + idTransaksi).update({
        'deliverStatus': 'Failed',
    });

    promise.then(function() {
        console.log("berhasil mengupdate status failed");
        $('#modalDeliverFailed').modal("hide");
        getDataTransaction();
    });
}

function delivered() {
    var idTransaksi = $('#hidden-text').val();

    var promise = database.ref('transaction/' + idTransaksi).update({
        'deliverStatus': 'Delivered',
    });

    promise.then(function() {
        console.log("berhasil mengupdate status delivered");
        $('#modalDeliverSuccess').modal("hide");
        getDataTransaction();
    });
}