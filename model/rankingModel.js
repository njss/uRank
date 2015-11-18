
var RankingModel = (function(){
    'use strict';

    var _this;

    function RankingModel() {
        _this = this;
        this.cbRS = new RSContent();
        this.tuRS = new RSTagUser();
        this.clear();
    }


    /*******************************************
    * Functions
    *******************************************/
    var assignRankingPositionsAndShift = function(_data, _score){
        var currentScore = Number.MAX_VALUE;
        var currentPos = 1;
        var itemsInCurrentPos = 0;
        _data.forEach(function(d, i){
            if(d.ranking[_score] > 0){
                if( d.ranking[_score] < currentScore ){
                    currentPos = currentPos + itemsInCurrentPos;
                    currentScore = d.ranking[_score];
                    itemsInCurrentPos = 1;
                } else{
                    itemsInCurrentPos++;
                }
                d.ranking.pos = currentPos;
            } else{
                d.ranking.pos = 0;
            }
            // shift computation
            d.ranking.posChanged = d.ranking.prevPos > 0 ? d.ranking.prevPos - d.ranking.pos : 1000;
        });
        return _data;
    };


    /**
     *	Creates the ranking items with default values and calculates the weighted score for each selected keyword (tags in tag box)
     * */
    var updateRanking =  function(opt){
        var score = opt.mode;
        var cbWeight = (score == RANKING_MODE.overall.attr) ? opt.rWeight : 1;
        var tuWeight = (score == RANKING_MODE.overall.attr) ? (1- opt.rWeight) : 1;

        var ranking = _this.ranking.slice();
        ranking.forEach(function(d){ d.ranking.prevPos = d.ranking.pos; });
        if(opt.ranking.content)
            ranking = _this.cbRS.getCBScores({ data: ranking, keywords: opt.query, options: { rWeight: cbWeight } });
        if(opt.ranking.social)
            ranking = _this.tuRS.getTagUserScores({ user: opt.user, keywords: opt.query, data: ranking, options: { rWeight: tuWeight } });
        ranking.forEach(function(d){
            d.ranking.overallScore = 0;
            if(opt.ranking.content)
                d.ranking.overallScore += d.ranking.cbScore;
            if(opt.ranking.social)
                d.ranking.overallScore += d.ranking.tuScore;
        });

        var secScore = undefined;
        if(opt.mode === RANKING_MODE.by_CB.attr && RANKING_MODE.by_TU.active) secScore = RANKING_MODE.by_TU.attr;
        else if(opt.mode == RANKING_MODE.by_TU.attr && RANKING_MODE.by_CB.active) secScore = RANKING_MODE.by_CB.attr;
        //var secScore = opt.mode == RANKING_MODE.by_CB.attr ? RANKING_MODE.by_TU.attr : (opt.mode == RANKING_MODE.by_TU ? RANKING_MODE.by_CB : undefined)
        ranking = ranking.sort(function(d1, d2){
            if(d1.ranking[score] > d2.ranking[score]) return -1;
            if(d1.ranking[score] < d2.ranking[score]) return 1;
            if(d1.ranking[secScore] && d1.ranking[secScore] > d2.ranking[secScore]) return -1;
            if(d1.ranking[secScore] && d1.ranking[secScore] < d2.ranking[secScore]) return 1;
            return 0;
        });
        ranking = assignRankingPositionsAndShift(ranking, score);
        return ranking;
    };



    var updateStatus =  function() {

        if(_this.ranking.length === 0)
            return RANKING_STATUS.no_ranking;

        if(_this.status === RANKING_STATUS.no_ranking)
            return RANKING_STATUS.new;

        for(var i in _this.ranking) {
            if(_this.ranking[i].ranking.posChanged > 0)
                return RANKING_STATUS.update;
        }
        return RANKING_STATUS.unchanged;
    };



/****************************************************************************************************
 *
 *   RankingModel Prototype
 *
 ****************************************************************************************************/
    RankingModel.prototype = {

        setData: function(data) {
            this.status = RANKING_STATUS.no_ranking;
            this.data = data.slice() || [];
            this.ranking = this.data.slice();
            this.ranking.forEach(function(d){
                d.ranking = {
                    pos: 0,
                    posChanged: 0,
                    prevPos: 0,
                    overallScore: 0,
                    cbScore: 0,
                    cbMaxScore: 0,
                    cbKeywords: [],
                    tuScore: 0,
                    tuMisc: {}
                };
            });
            return this;
        },

        update: function(options) {
            var opt = $.extend(true, {
                user: 'NN',
                query: [],
                mode: window.RANKING_MODE.by_CB.attr,
                rWeight: 0.5,
                ranking: { content: true, social: false }
            }, options);
            this.query = opt.query;
            this.mode = options.mode;
            this.rWeight = options.rWeight;
            this.ranking = this.query.length > 0 ? updateRanking(opt) : [];
            this.status = updateStatus();
            return this;
        },

        reset: function() {
            this.previousRanking = [];
            this.ranking = [];
            this.status = updateStatus();
            this.query = [];
            return this;
        },

        clear: function() {
            this.ranking = [];
            this.data = [];
            this.query = [];
            this.status = RANKING_STATUS.no_ranking;
            this.mode = RANKING_MODE.by_CB.attr;
            return this;
        },

        getRanking: function() {
            return this.ranking;
        },

        getStatus: function() {
            return this.status;
        },

        getOriginalData: function() {
            return this.data;
        },

        getMode: function() {
            return this.mode;
        },

        getQuery: function() {
            return this.query;
        },

        getRankingDict: function(){
            var dict = {};
            this.ranking.forEach(function(d){ dict[d.id] = d; });
            return dict;
        },

        getMaxTagFrequency: function(){
            return this.tuRS.getmaxSingleTagFrequency();
        },

        getActualIndex: function(index){
            if(this.status == RANKING_STATUS.no_ranking)
                return index;
            return this.ranking[index].originalIndex;
        },
        getDocumentById: function(id) {
            var getId = function(d){ return d.id === id };
            return this.status === RANKING_STATUS.no_ranking ? this.data[_.findIndex(this.data, getId)] : this.ranking[_.findIndex(this.ranking, getId)];
        },
        getDocumentByIndex: function(index) {
            return this.status === RANKING_STATUS.no_ranking ? this.data[index] : this.ranking[index];
        }
    };

    return RankingModel;
})();




