var firebaseConfig = {
    // Your Firebase Data
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const storage = firebase.storage();
var dataHtml = "";

$(document).ready(function() {
    console.log("ready!");
    getDataMenu();
    getAllInfo();
});

document.getElementById('add-photo').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        var img = document.getElementById('upload-add-image');
        img.onload = () => {
            URL.revokeObjectURL(img.src); // no longer needed, free memory
        }
        img.src = URL.createObjectURL(this.files[0]); // set src to blob url
    }
});

document.getElementById('edit-photo').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        console.log("run edit photo")
        var img = document.getElementById('upload-edit-image');
        img.onload = () => {
            URL.revokeObjectURL(img.src); // no longer needed, free memory
        }
        img.src = URL.createObjectURL(this.files[0]); // set src to blob url
    }
});


function getDataMenu() {
    dataHtml = "";
    database.ref('data-barang').get().then(function(snapshot) {
        if (snapshot.exists()) {
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

function reWriteHtml(element) {
    dataHtml += "<div class='d-flex flex-row comment-row'>"
    dataHtml += "<div class='p-2'><img src=" + element.val().imgUrl + " alt='user' width='100' height='100' class='rounded'></div>"
    dataHtml += "<div class='comment-text active w-100'>"
    dataHtml += "<h4 class='mt-2 '>" + element.val().nama + "</h4>"
    dataHtml += "<span class='m-b-4 d-block'> IDR " + element.val().harga + " </span>"
    dataHtml += "<p>" + element.val().deskripsi + "</p>"
    dataHtml += "<div class='comment-footer float-right'>"
    dataHtml += "<button type='button' class='btn btn-cyan btn-lg' onclick='Edit(" + element.val().id + ")'>Edit</button>"
    dataHtml += "<button type='button' class='btn btn-danger btn-lg ml-2' onclick='Delete(" + element.val().id + ")'>Delete</button>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "</div>"
    dataHtml += "<hr class='col-md-11'>"
    $("#galery-menu").html(dataHtml);
}


// Delete Menu

function Delete(idMenu) {
    $('#deletemodal').modal('show');

    database.ref('data-barang').child(idMenu).once("value", function(snapshot) {
        if (snapshot.exists()) {
            var link = snapshot.val().imgUrl
            $('#hidden-link').val(link);
            $('#hidden-text').val(idMenu);
        } else {
            console.log("data not available")
        }
    }).catch((error) => {
        console.error(error);
    });
}


function deleteMenu() {
    var idMenu = $('#hidden-text').val();
    var urlImg = $('#hidden-link').val();

    var storageRef = storage.refFromURL(urlImg);

    // Delete the file
    storageRef.delete().then(() => {

        var promise = database.ref('data-barang/' + idMenu).remove()
            .catch((error) => {
                console.log(error);
            });

        promise.then(function() {
            console.log("berhasil menghapus menu dari data-barang");
            $('#deletemodal').modal('hide');
            getDataMenu();
        });

    }).catch((error) => {
        console.log(error)
    });

}

// Delete Menu


// get info

function getAllInfo() {
    var shipping = 0;

    database.ref('data-barang').get().then((snapshot) => {
        if (snapshot.exists()) {
            $('#total-menu').text(Object.values(snapshot.val()).length)
        } else {
            console.log("menu not found");
        }
    })

    database.ref('Users').get().then((snapshot) => {
        if (snapshot.exists()) {
            $('#total-user').text(Object.values(snapshot.val()).length)
        } else {
            console.log("user not found");
        }
    })

    database.ref('transaction').get().then((snapshot) => {
        if (snapshot.exists()) {
            var transaksi = Object.values(snapshot.val()).length;

            snapshot.forEach(element => {
                if (element.val().deliverStatus == "Shipping") {
                    shipping++;
                }
            })

            $('#total-transaksi').text(transaksi)
            $('#total-shipping').text(shipping)

        } else {
            console.log("transaction not found");
        }
    })

}

// get info

// edit menu

function Edit(idMenu) {
    console.log(idMenu);
    database.ref('data-barang').child(idMenu).get().then((snapshot) => {
        if (snapshot.exists()) {

            $('#edit-id').val(snapshot.val().id);
            $('#edit-name').val(snapshot.val().nama);
            $('#edit-price').val(snapshot.val().harga);

            $('#edit-category option[value="' + snapshot.val().kategori + '"]').attr('selected', true);

            $('#edit-description').val(snapshot.val().deskripsi);
            $('#upload-edit-image').attr('src', snapshot.val().imgUrl);
            $('#img-link').val(snapshot.val().imgUrl)
            $('#editmodal').modal('show');

        } else {
            console.log("No data available")
        }
    }).catch((error) => {
        console.log(error);
    });
}

function editMenu() {

    var dataMenu = {
        idMenu: $('#edit-id').val(),
        name: $.trim($('#edit-name').val()),
        price: $.trim($('#edit-price').val()),
        desc: $.trim($('#edit-description').val()),
        category: $('#edit-category').val(),
    }
    var imgAwal = $('#img-link').val();

    $('#btn-edit').prop('disabled', true);
    if (dataMenu.name != "" && dataMenu.price != "" && dataMenu.desc != "" && dataMenu.category != "") {

        if (imgAwal == $('#upload-edit-image').attr('src')) {
            console.log("sama");
            saveEdit("", dataMenu)

        } else {
            console.log("beda")
            var uploadFile = document.getElementById('edit-photo').files[0];
            //untuk mengambil extension dari img yang diupload
            let last_dot = uploadFile.name.lastIndexOf('.')
            let ext = uploadFile.name.slice(last_dot + 1)
            deletePictStorage(imgAwal);
            uploadPict(uploadFile, ext, dataMenu, "Edit");
        }

    } else {
        alert('Field Input Tidak Boleh Kosong')
        $('#btn-edit').prop('disabled', false);
    }

}

function deletePictStorage(urlImg) {

    var storageRef = storage.refFromURL(urlImg);

    // Delete the file
    storageRef.delete().then(() => {

        console.log("berhasil menghapus foto dari storage");

    }).catch((error) => {
        console.log(error)
    });

}

function saveEdit(imgUrl, dataMenu) {

    if (imgUrl == "") {

        var promise = database.ref("data-barang/" + dataMenu.idMenu).update({
            deskripsi: dataMenu.desc,
            harga: dataMenu.price,
            kategori: dataMenu.category,
            nama: dataMenu.name
        }, (error) => {
            if (error) {
                console.log(error)
            }
        });

    } else {

        var promise = database.ref("data-barang/" + dataMenu.idMenu).update({
            deskripsi: dataMenu.desc,
            harga: dataMenu.price,
            imgUrl: imgUrl,
            kategori: dataMenu.category,
            nama: dataMenu.name
        }, (error) => {
            if (error) {
                console.log(error)
            }
        });

    }

    promise.then(function() {
        console.log("Berhasil Mengupdate Menu");
        $('#editmodal').modal('hide');
        $('#btn-edit').prop('disabled', false);
    });

}



// edit menu

// add menu

function checkAdd() {

    if (document.getElementById("add-photo").files.length == 0) {
        alert('Image Tidak Boleh Kosong')
    } else {
        var uploadFile = document.getElementById('add-photo').files[0];
        //untuk mengambil extension dari img yang diupload
        let last_dot = uploadFile.name.lastIndexOf('.')
        let ext = uploadFile.name.slice(last_dot + 1)

        var dataMenu = {
            idMenu: Date.now(),
            name: $.trim($('#add-name').val()),
            price: $.trim($('#add-price').val()),
            desc: $.trim($('#add-description').val()),
            category: $('#add-category').val(),
        }

        $('#btn-add').prop('disabled', true);

        console.log(dataMenu)

        if (dataMenu.name != "" && dataMenu.price != "" && dataMenu.desc != "" && dataMenu.category != "") {
            uploadPict(uploadFile, ext, dataMenu, "Add");
        } else {
            alert('Category Salah atau Field Input Kosong')
            $('#btn-add').prop('disabled', false);
        }
    }

}

function uploadPict(file, ext, dataMenu, arah) {

    var storageRef = firebase.storage().ref();
    var namefile = Date.now();

    // Create the file metadata
    var metadata = {
        contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('pictures/' + namefile + '.' + ext).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        },
        (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/canceled':
                    // User canceled the upload
                    break;

                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
            }
        },
        () => {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('File available at', downloadURL);
                if (arah == "Add") {
                    saveAdd(downloadURL, dataMenu);
                } else if (arah == "Edit") {
                    saveEdit(downloadURL, dataMenu);
                }

            });
        }
    );
}

function saveAdd(imgUrl, dataMenu) {

    var promise = database.ref("data-barang/" + dataMenu.idMenu).set({
        deskripsi: dataMenu.desc,
        harga: dataMenu.price,
        id: dataMenu.idMenu,
        imgUrl: imgUrl,
        kategori: dataMenu.category,
        nama: dataMenu.name
    }, (error) => {
        if (error) {
            console.log(error)
        }
    });

    promise.then(function() {
        console.log("Berhasil Menambah Menu Baru");
        $('#btn-add').prop('disabled', false);
    });
}

// add menu