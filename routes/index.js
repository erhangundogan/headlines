var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async');

exports.index = function(req, res){
  res.render('index');
};

function processRequest(address, callback) {
  request.get(address, function (error, response, body) {
    if (error) {
      callback(error);
    } else {
      if (response.statusCode == 200) {
        var $ = cheerio.load(body, { ignoreWhitespace: true, xmlMode: true}),
            items = $('item'),
            results = [];

        for (var c = 0; c < items.length && c < 10; c++) {
          var resultItem = {};

          for (var i = 0; i < $(items[c]).children().length; i++) {
            var item = $(items[c]).children()[i];
            switch(item.name) {
              case 'title':
                resultItem = {};
                resultItem.title = $(item).text();
                break;
              case 'description':
                resultItem.description = $(item).text();
                break;
              case 'link':
                resultItem.link = $(item).text();
                results.push(resultItem);
                break;
            }
          }
        }

        callback(null, results);
      } else {
        callback(response.statusCode);
      }
    }
  });
}

exports.getHeadlines = function(req, res) {

  async.parallel({
      bbc: function(callback){
        processRequest('http://feeds.bbci.co.uk/news/rss.xml', callback);
      },
      sky: function(callback){
        processRequest('http://news.sky.com/feeds/rss/home.xml', callback);
      }
  },
  function(err, results) {
    res.render('headlines', { bbcHeadlines:results.bbc, skyHeadlines:results.sky });
  });
};
