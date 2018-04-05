var audio;

$(function () {
    $("#load").click(function () {
        fetch('/api/text-to-speech/token')
            .then(function (response) {
                return response.text();
            }).then(function (token) {
                audio = WatsonSpeech.TextToSpeech.synthesize({
                    text: $("#text").val(),
                    token: token,
                    autoPlay: false,
                    accept: 'audio/wav'
                });
            });
    });

    $("#play").click(function () {
        audio.play();
    });

    $("#pause").click(function () {
        audio.pause();
    });
    
    $(".play-cover-button").click(function (event) {
        location.href = "/discover?section="+event.target.id;   
             console.log(event);
    });
});