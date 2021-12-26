function autorun() {
    document.getElementById('contact-form').onsubmit = function() {
        fetch('/contact/submit', {
            method: 'POST',
            body: [
                document.getElementById('contact-name').value,
                document.getElementById('contact-email').value,
                document.getElementById('contact-subject').value,
                document.getElementById('contact-message').value,
            ].join('\0'),
        }).then(function(res) {
            return res.text();
        }).then(function(data) {
            alert(data === '0' ? 'Your message has been sent.' : 'You have already sent a message.');
        });
        return false;
    };
}