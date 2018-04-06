var audio;
var articlePlayer;
var playButton = $("#play-button");
var pauseButton = $("#pause-button");

var newsResultsArray = [
    {
      "id": "LMEG2",
      "media": "https://static01.nyt.com/images/2018/04/06/sports/06masters-finau/06masters-finau-thumbStandard.jpg",
      "headline": "Tony Finau Steals Masters Spotlight After Dislocating Ankle",
      "abstract": "Finau had nearly withdrawn from the tournament after his injury on Wednesday, but he played and was tied for second after a wild first round on Thursday.",
      "publisher": "By BILL PENNINGTON"
    },
    {
      "id": "G584P",
      "media": "https://static01.nyt.com/images/2018/04/06/sports/06tiger-weary/merlin_136421637_fefc647c-76d7-42bc-93ca-d5ca3fd6b888-thumbStandard.jpg",
      "headline": "Tiger Woods Is More Dogged Than Dazzling in His Return to the Masters",
      "abstract": "Woods, appearing in his first major tournament since 2015, shot a one-over-par 73 that required him to repeatedly dig out of trouble.",
      "publisher": "By KAREN CROUSE"
    },
    {
      "id": "yUHQj",
      "media": "https://static01.nyt.com/images/2018/04/06/sports/06kyrie-pic/06kyrie-pic-thumbStandard.jpg",
      "headline": "Celtics’ Kyrie Irving Will Miss the N.B.A. Playoffs",
      "abstract": "His knee injury is a big blow to Boston, which had hopes of contending for the championship. That now seems highly unlikely.",
      "publisher": "By SCOTT CACCIOLA"
    },
    {
      "id": "UuH3k",
      "media": "https://static01.nyt.com/images/2018/04/06/sports/06tebow/merlin_136443171_eb2bbfbb-7aee-4ed5-980b-0b1638bf12df-thumbStandard.jpg",
      "headline": "Tim Tebow Hits Home Run in First At-Bat. Sound Familiar?",
      "abstract": "In his first at-bat in Class A, he homered. Same in the instructional league. And on Thursday, he did it in Class AA.",
      "publisher": "By JAMES WAGNER"
    },
    {
      "id": "0OgAt",
      "media": "https://static01.nyt.com/images/2018/04/05/sports/05KEPNERprint1/05KEPNERprint1-thumbStandard.jpg",
      "headline": "Want to See the Starting Pitcher? Don’t Arrive Late",
      "abstract": "At Citi Field, the Mets’ Noah Syndergaard was gone after four innings. His counterpart, Philadelphia’s Aaron Nola, lasted five. Both surrendered only two runs.",
      "publisher": "By TYLER KEPNER"
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