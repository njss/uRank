(function(){

    var _this = this;
    this.dsm = new datasetManager();

    var initOptions = {
        //ranking: { social: true }
    };

    var testOptionsDef = {
        docViewer : {
            misc: {
                facetsToShow: ['year']
            }
        },
        keywordExtractor :{
            maxKeywordDistance: 3,
            minRepetitionsProxKeywords: 4
        }
    }

    var testOptions1 = {
        contentList: {
            custom: true,
            customOptions: {     //  only used when contentListType.custom = true
                selectors: {
                    root:'#contentlist',
                    ul: '.test-ul',
                    liClass: '.test-li',
                    liTitle: '.test-li-title',
                    liRankingContainer: '.test-li-ranking-container',
                    watchicon: '.test-watchicon',
                    favicon: '.test-favicon'
                },
                classes: {
                    liHoverClass: '',
                    liLightBackgroundClass: '',
                    liDarkBackgroundClass: ''
                },
                misc: {
                    hideScrollbar: true
                }
            },
        },
        visCanvas : {
            module: 'default',
            customOptions: {               // use only if contentList.custom = true and background in the ranking should match different light and dark background colors
                lightBackgroundColor: '#dedede',
                darkBackgroundColor: '#efefef'
            },
        },
        keywordExtractor :{
//            minDocFrequency: 2,
//            minRepetitionsInDocument: 1,
            maxKeywordDistance: 3,
            minRepetitionsProxKeywords: 4
        }
    }


    // Fill dataset select options and bind event handler
    var datasetOptions = "";
    this.dsm.getIDsAndDescriptions().forEach(function(ds){
        datasetOptions += "<option value='" + ds.id + "'>" + ds.description + "</option>";
    });
    $("#select-dataset").html(datasetOptions)



    function buildCustomList(data) {

        $('#contentlist').empty();
        var $ul = $('<ul></ul>').appendTo($('#contentlist')).addClass('test-ul');
        data.forEach(function(d, i){
            // li element
            var $li = $('<li></li>', { id: 'test-li-' + i }).appendTo($ul).addClass('test-li');
            // ranking container
            var $rankingDiv = $("<div></div>").appendTo($li).addClass('test-li-ranking-container');
            // title container
            var $titleDiv = $("<div></div>").appendTo($li).addClass('test-li-title-container');
            $('<h3></h3>', { id: 'test-li-title-' + i, class: 'test-li-title', html: d.title, title: d.title + '\n' + d.description }).appendTo($titleDiv);
            //  buttons
            var $buttonsContainer = $('<div></div>').appendTo($li).addClass('test-buttons-container');
            $('<div></div>').appendTo($buttonsContainer).addClass('test-favicon');
            $('<div></div>').appendTo($buttonsContainer).addClass('test-watchicon');
        });
    }



    // Event handler for dataset-select change
    var selectDatasetChanged = function(){
        $('.processing-message').css('visibility', 'visible');
        var datasetId = $("#select-dataset").val();
        setTimeout(function(){
            _this.dsm.getDataset(datasetId, function(dataset){
                /*
                 *Test custom list
                 */
//                buildCustomList(dataset);
//                _this.urank.loadData(dataset, testOptions1);
                /*
                 *    Test landscape tagcloud
                 */
//                _this.urank.loadData(dataset, {tagCloud: { module: 'landscape' }});
                /*
                 *    Default call
                 */
                _this.urank.loadData(dataset, testOptionsDef);

                $('.processing-message').css('visibility', 'hidden');
            });
        }, 0);
    };

    //  uRank initialization options
    var urankOptions = {
        tagCloudRoot: '#tagcloud',
        tagBoxRoot: '#tagbox',
        contentListRoot: '#contentlist',
        visCanvasRoot: '#viscanvas',
//        onChange: function(rankingData, selectedKeywords){
//            console.log('Change');
//            console.log(rankingData);
//            console.log(selectedKeywords);
//        },
        onItemClicked: function(documentId){
            console.log('Item clicked (document visited) --> '+ documentId);
        },
//        onItemMouseEnter: function(documentId){
//            console.log('Item mourse over --> '+ documentId);
//        },
//        onItemMouseLeave: function(documentId){
//            console.log('Item mourse leave --> '+ documentId);
//        },
        onFaviconClicked: function(documentId){
            console.log('Fav icon clicked --> '+ documentId);
        },
        onWatchiconClicked: function(documentId){
            console.log('Watch icon clicked --> '+ documentId);
        },
//        onTagInCloudMouseEnter: function(tag){
//            console.log('Tag hovered');
//            console.log(tag);
//        },
        onTagInCloudMouseLeave: function(tag){},
        onTagInCloudClick: function(tag){
            console.log('Tag clicked');
            console.log(tag);
        },
        onTagDropped: function(droppedTags, dropMode){
            console.log('Tag/s dropped --> mode = ' + dropMode);
            console.log(droppedTags);
        },
        onTagDeleted: function(tag){
            console.log('Tag deleted');
            console.log(tag);
        },
        onTagWeightChanged: function(tag){
            console.log('Tag Weight changed');
            console.log(tag);
        },
        onTagInBoxMouseEnter: function(index){},
        onTagInBoxMouseLeave: function(index){},
        onTagInBoxClick: function(index){},
        onTagFrequencyChanged: function(min, max){
            console.log('Tag frequency changed --> min = ' + min + '; max = ' + max);
        },
        onKeywordEntered: function(term){
            console.log('Term searched');
            console.log(term);
        },
        onDocViewerHidden: function(){}
    };

    // uRank initialization function to be passed as callback
    var init = function(urank){

        _this.urank = urank;
        // Bind event handlers for dataset select
        $("#select-dataset").change(selectDatasetChanged);
        // Bind event handlers for urank specific buttons

//        $('#btn-reset').off().on('click', urank.reset);
        $('#btn-destroy').click(function(){ urank.destroy(); })


        $('#select-dataset').trigger('change');

    };

    //  Calling Urank
    UrankLoader(init, urankOptions);

})();

