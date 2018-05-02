var audio;
var articlePlayer;
var playButton = $("#play-button");
var pauseButton = $("#pause-button");
var newsResultsArray = [];

function playArticle(img) {
    if (audio != null) { audio.pause(); }
    articlePlayer.currentStatus = "notplaying";
    var targetID = img.id;
    var newsObject = {
        "id": newsResultsArray[targetID.substring(11, targetID.length)].id, 
        "headline": newsResultsArray[targetID.substring(11, targetID.length)].headline,
        "abstract": newsResultsArray[targetID.substring(11, targetID.length)].abstract,
        "publisher": newsResultsArray[targetID.substring(11, targetID.length)].publisher,
        "media": newsResultsArray[targetID.substring(11, targetID.length)].media
    };

    articlePlayer.addToQueue(newsObject);
    addToQueueVisuals(newsObject);


    if (articlePlayer.currentStatus == "notplaying") {
        articlePlayer.currentStatus = "playing";
        startPlayer(articlePlayer.getLast(), true);
    }

    console.log(articlePlayer.getQueue());
}

function addToQueue(element) {

	var img = element.childNodes[0].childNodes[0];

	console.dir(img);
    var targetID = img.id;
    
    console.log(targetID.substring(19, targetID.length));
    console.log(newsResultsArray);
    var newsObject = {
        "id": newsResultsArray[targetID.substring(19, targetID.length)].id, 
        "headline": newsResultsArray[targetID.substring(19, targetID.length)].headline,
        "abstract": newsResultsArray[targetID.substring(19, targetID.length)].abstract,
        "publisher": newsResultsArray[targetID.substring(19, targetID.length)].publisher,
        "media": newsResultsArray[targetID.substring(19, targetID.length)].media
    };
    articlePlayer.addToQueue(newsObject);
    addToQueueVisuals(newsObject);

    if (articlePlayer.currentStatus == "notplaying") {
        articlePlayer.currentStatus = "playing";

        startPlayer(articlePlayer.getNextFromQueue(), false);
    }

}



function startPlayer(articleToPlay, playOnce) {console.log(articleToPlay);
    articlePlayer.setCurrentPlayingID(articleToPlay.id);
    updateQueueVisuals();
    fetch('/api/text-to-speech/token')
        .then(function (response) {
            return response.text();
        }).then(function (token) {
            audio = WatsonSpeech.TextToSpeech.synthesize({
                text: articleToPlay.headline,
                token: token,
                autoPlay: false,
                accept: 'audio/wav'
            });
            updatePlayerVisuals();
            audio.play();

            audio.onended = function () {
                articlePlayer.removeFromQueue(0);
                articlePlayer.currentStatus = "notplaying";
                updatePlayerVisuals();

                if (!playOnce) {
                    var playNext = articlePlayer.getNextFromQueue();
                    if (playNext != null) {
                        articlePlayer.currentStatus = "playing";
                        startPlayer(playNext, playOnce);
                    }
                }


                if (articlePlayer.currentStatus == "notplaying"){
                	$("#player-bar").toggleClass("playerbar-active");







                	
                }
            }

            audio.ontimeupdate = function () {
                var duration = audio.duration;

                //TODO. setting duration to a static 10 but can be dynamically changed based on the number of words in the line
                if (audio.duration > 10) {
                    duration = 10;
                }

                $(".audio-progress-bar").css({
                    "width": audio.currentTime / duration * 100 + "%"
                });
            }
        });
}

function addToQueueVisuals(newsObject) {
    var sidebarQueue = $(".components");
    console.log("mediaobject " + JSON.stringify(newsObject));

    var newsCoverToAdd = '<li id="'+newsObject.id +'"><a href="#"><img class="sidebar-news-cover" style="width:60px;" src="' + newsObject.media + '" alt=""><div style="display:inline-block;"><div style="font-size:0.75rem;"class="queue-news-meta1">' + newsObject.publisher + '</div><div style="font-size:0.55rem;"class="queue-news-meta2">' + newsObject.publisher + '</div></div><div style="margin-top:1rem;font-size:0.75rem;"class="queue-news-headline">' + newsObject.headline + '</div></a></li>';

    sidebarQueue.append(newsCoverToAdd);


}

function updateQueueVisuals(){
    for (let i = 0; i < newsResultsArray.length; i++) {
        const element = newsResultsArray[i];
        $("#"+element.id).removeClass("queue-news-selected");
        
    }
    $("#"+articlePlayer.currentPlayingID).addClass("queue-news-selected");
}

function updatePlayerVisuals() {
    var newsHeadlinePlayerBar = $(".news-headline-player-bar");
    var newsPublisherPlayerBar = $(".news-publisher-player-bar");


    if (articlePlayer.currentStatus == "playing") {

        var currentPlaying = articlePlayer.getCurrentPlaying();

        if (currentPlaying != null) {
            newsHeadlinePlayerBar.html(currentPlaying.headline.split(/\s+/).slice(0, 6).join(" ") + "....");
            newsPublisherPlayerBar.html(currentPlaying.publisher);
        }

        playButton.hide();
        pauseButton.show();
    } else {
        playButton.show();
        pauseButton.hide();
    }
}

function GetMediaImage(result) {
    if (result.multimedia.length > 0) {
        return result.multimedia[0].url;
    } else {
        return "images/sample-3.jpg";
    }
}

function randomID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  function playAll(element) {


  }

$(function () {
    $(".play-cover-button").click(function (event) {
        location.href = "/discover?section=" + event.target.id;
        console.log(event);
    });

    articlePlayer = new articlePlayer();
    var url = "https://api.nytimes.com/svc/topstories/v2/" + $("#news-section").text().replace(/\n|\r|\s/g, "").toLowerCase() + ".json";

    url += '?' + $.param({
        'api-key': "2c9cc4b44f294ebd952e98a69c93118d"
    });

    $.ajax({
        url: url,
        method: 'GET'
    }).done(function (result) {
        var today = new Date();

        var weekday = new Array(7);
        weekday[0] = "MONDAY";
        weekday[1] = "TUESDAY";
        weekday[2] = "WEDNESDAY";
        weekday[3] = "THURSDAY";
        weekday[4] = "FRIDAY";
        weekday[5] = "SATURDAY";
        weekday[6] = "SUNDAY";

        var month = new Array(12);
        month[0] = "JANUARY";
        month[1] = "FEBRUARY";
        month[2] = "MARCH";
        month[3] = "APRIL";
        month[4] = "MAY";
        month[5] = "JUNE";
        month[6] = "JULY";
        month[7] = "AUGUST";
        month[8] = "SEPTEMBER";
        month[9] = "OCTOBER";
        month[10] = "NOVEMBER";
        month[11] = "DECEMBER";
        $("#time").html(weekday[today.getDay()] + " " + month[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear() + " - " + result.num_results + " ARTICLES");

        for (var i = 0; i < Math.min(result.num_results,5); i++) {

            var media;

            if ((result.results[i]).multimedia.length > 0) {
                media = (result.results[i]).multimedia[0].url;
            }

            var headline = (result.results[i]).title;
            var abstract = (result.results[i]).abstract;
            var publisher = (result.results[i]).byline;

            if ((media != null) & (headline != null) & (abstract != null) & (publisher != null)) {
                var newsSectionDiv = '<div class="news-section-content"><div class="row"><div class="col-md-12"><div class="left-float section-news-album-cover-container"><img class="section-news-album" src="' + media + '" id="media' + i + '" style="height:110px;width:110px;" alt="Avatar" class="image"><div class="news-album-overlay play-cover-button" id="home"><img class="news-album-overlay-content play-cover-button" onclick="playArticle(this)" id="play-button' + i + '" src="images/play.png" alt="" style=""></div></div><div style="margin-left:8rem;"><h3 class="news-block-title" id="title' + i + '">' + headline + '</h3><p class="news-block-byline" id="byline' + i + '">' + publisher + '</p></div><div style="margin-left:8rem;"><div class="row zero-margin"><div class="add-to-playlist-container" onclick="addToQueue(this)" ><div class="add-to-playlist-container-box"><img class="add-to-playlist-button" id="add-to-queue-button' + i + '" src="/images/add-button.png"><div class="add-to-playlist-button-text" style=""><div>Add to Playlist</div></div></div></div></div></div></div></div>'
                $('.news-container').append(newsSectionDiv);

                var newsResult = {
                    "id": randomID(),
                    "media": media,
                    "headline": headline,
                    "abstract": abstract,
                    "publisher": publisher                    
                };
                newsResultsArray.push(newsResult);
            }
        }
    }).fail(function (err) {
        throw err;
    });

    $("#play-button").click(function (event) {
        audio.play();
        articlePlayer.currentStatus = "playing";
        updatePlayerVisuals();

    });
    $("#pause-button").click(function (event) {
        audio.pause();
        articlePlayer.currentStatus = "notplaying";
        updatePlayerVisuals();

    });

    $("#time-button").click(function (event) {

        var duration = audio.duration;
        if (audio.duration > 2500) {
            duration = 2500;
        }

        $("audio-progress-bar").css({
            "width": audio.currentTime / duration + "%"
        });
    });


    $(".play-cover-button").click(function (event) {
        location.href = "/discover?section=" + event.target.id;
        console.log(event);
    });





});