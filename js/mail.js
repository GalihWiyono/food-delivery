document.querySelector('#form').addEventListener('submit', submitMessage)


function validateEmail(email) {
    const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return regex.test(email);
}

function submitMessage(e) {
    e.preventDefault();

    $('#submit-form-btn').prop('disabled', true);

    console.log("submit")
    var email = $("#email").val();
    var firstName = $.trim($("#firstName").val());
    var lastName = $.trim($("#lastName").val());
    var textArea = $.trim($("#feedback").val());

    var fullname = firstName + " " + lastName;

    if (!validateEmail(email) || firstName == "" || lastName == "" || textArea == "") {
        alert("Field Harus Sesuai");
    } else {
        sendEmail(fullname, email, textArea);
    }

}

function sendEmail(fullname, senderEmail, bodyEmail) {
    senderEmail = senderEmail.replace(/^"(.*)"$/, '$1');
    Email.send({
        Host: "smtp.gmail.com",
        Username: "akundarurat22@gmail.com",
        Password: "mlykiccynsgywulg",
        To: 'accdum0001@gmail.com',
        From: senderEmail,
        Subject: "Feedback From Mr/Ms." + fullname,
        Body: "Hello I'm " + fullname + ", " + bodyEmail,
    }).then(message => {
        alert("Thanks You Mr/Ms. " + fullname + " , Your Message Has Been Sent!");
        $("#email").removeClass('is-valid');
        $("#firstName").removeClass('is-valid');
        $("#lastName").removeClass('is-valid');
        $("#feedback").removeClass('is-valid');

        document.querySelector('#form').reset();
        $('#submit-form-btn').prop('disabled', false);
    });
}