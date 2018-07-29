function articlePlayer() {
    this.articleQueue = [];
    this.currentPlayingIndex = -1;
    this.currentPlayingID;
    this.currentStatus = "notplaying";

    this.addToQueue = function(newsArticle) {
        var result = false;
        this.articleQueue.push (newsArticle);
        //check if audio already exists
        return result;
    };
 this.getCurrentPlaying = function() {
        return this.articleQueue[0];
    };

    this.setCurrentPlayingID = function(currentPlayingID) {
        for (let i = 0; i < this.articleQueue.length; i++) {
            const element = this.articleQueue[i];
            if (element.id == currentPlayingID){
                this.currentPlayingIndex = i;
            }
        }
        this.currentPlayingID = currentPlayingID;
    };

    this.getQueue = function() {
        return this.articleQueue;
    };
    this.removeFromQueue = function(pos) {
        //remove from queue
        this.articleQueue.splice(pos, 1);
    };

    this.getNextFromQueue = function() {
        if (this.articleQueue.length > 0) {
            return this.articleQueue[0];
        } else { return null; }
    };
   this.getLast = function(pos) {
        if (this.articleQueue.length > 0) {
            return this.articleQueue[this.articleQueue.length-1];
        } else { return null; }
    };
}


$(function() {
});