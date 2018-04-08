var audio;
var articlePlayer;
var playButton = $("#play-button");
var pauseButton = $("#pause-button");

var newsResultsArray = [
    {
      "id": "owazs",
      "media": "https://static01.nyt.com/images/2018/04/05/briefing/05evening-promo/05evening-promo-thumbStandard.jpg",
      "headline": "Iraq, Trump, Pruitt: Your Thursday Evening Briefing",
      "abstract": "Here’s what you need to know at the end of the day.",
      "publisher": "By KAREN ZRAICK and SANDRA STEVENSON"
    },
    {
      "id": "H71SV",
      "media": "https://static01.nyt.com/images/2018/04/05/briefing/06ambriefing-asia-promo/06ambriefing-asia-slide-0PJF-thumbStandard.jpg",
      "headline": "Trade War, Tiger Woods, Islamic State: Your Friday Briefing",
      "abstract": "Here’s what you need to know to start your day.",
      "publisher": "By CHARLES McDERMID"
    },
    {
      "id": "2o3Nl",
      "media": "https://static01.nyt.com/images/2018/04/06/us/politics/06dc-tariffs-TRUMP/merlin_136439370_4d6d9393-6437-42f3-939a-9689d035d2b6-thumbStandard.jpg",
      "headline": "Trump Doubles Down on Potential Trade War With China",
      "abstract": "President Trump said he would consider imposing tariffs on an additional $100 billion worth of Chinese goods in retaliation for China’s plan to impose its own tariffs on American products.",
      "publisher": "By ANA SWANSON and KEITH BRADSHER"
    },
    {
      "id": "7nu03",
      "media": "https://static01.nyt.com/images/2018/04/05/world/06china-trade-1/merlin_136408791_46d801f8-8247-4055-a55e-6c7cb09bff1d-thumbStandard.jpg",
      "headline": "Why China Is Confident It Can Beat Trump in a Trade War",
      "abstract": "Beijing has a strong grip on banks, the news media and politics, and it seems willing to take advantage of vulnerabilities in the American political system.",
      "publisher": "By STEVEN LEE MYERS"
    },
    {
      "id": "ZVS7f",
      "media": "https://static01.nyt.com/images/2018/04/06/us/politics/06reg-epa4/06reg-epa4-thumbStandard.jpg",
      "headline": "E.P.A. Officials Sidelined After Questioning Scott Pruitt",
      "abstract": "At least five agency officials were reassigned or demoted, or requested new jobs after raising concerns about the administrator’s security demands and spending.",
      "publisher": "By ERIC LIPTON, KENNETH P. VOGEL and LISA FRIEDMAN"
    }
  ];

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

function addToQueue(img) {
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

    var newsCoverToAdd = '<li id="'+newsObject.id +'"><a href="#"><img style="width:60px;" src="' + newsObject.media + '" alt=""><div style="display:inline-block; margin-left:.5rem;"><div style="font-size:0.75rem;"class="queue-news-meta1">' + newsObject.publisher + '</div><div style="font-size:0.55rem;"class="queue-news-meta2">' + newsObject.publisher + '</div></div><div style="margin-top:1rem;font-size:0.75rem;"class="queue-news-headline">' + newsObject.headline + '</div></a></li>';

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
    $("#time").html(weekday[today.getDay()] + " " + month[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear() + " - " + 5 + " ARTICLES");


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