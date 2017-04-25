'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Path = require('path');
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
var ebay = require('ebay-api');
var _ = require('lodash');

module.exports = _.extend({},
    require('./lib/xml-request'),
    require('./lib/xml-converter'),
    require('./lib/json-parser'),
    require('./lib/errors')
);

function search(keywords, func) {
    var params = {
        keywords: [keywords],

        // add additional fields
        outputSelector: ['PictureURLSuperSize'],

        paginationInput: {
            entriesPerPage: 100
        },

        domainFilter: [
            {
                name: 'domainName',
                value: 'basketballshoes'
            }
  ]
    };
    
    var it;

    ebay.xmlRequest({
            serviceName: 'Finding',
            opType: 'findItemsByKeywords',
            appId: 'YiTingCh-DynamicD-PRD-2090738eb-589abf11	', // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
            params: params,
            parser: ebay.parseResponseJson // (default)
        },
        // gets all the items together in a merged array
        function itemsCallback(error, itemsResponse) {
            if (error) throw error;

            var items = itemsResponse.searchResult.item;
            func(items);
            console.log('Found', items.length, 'items');
            it = items[0];
            for (var i = 0; i < items.length; i++) {
                    console.log(items[i]);
            }  
        }
    );
    return it;
}

const server = new Hapi.Server({

    connections: {

        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }

});

server.connection({
    port: 3000,
    host: 'localhost'
});

server.register([Blipp, Inert, Vision], () => {});

server.views({
    engines: {
        html: Handlebars
    },
    path: 'views',
    layoutPath: 'views/layout',
    layout: 'layout',
    helpersPath: 'views/helpers'


});


server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: {
            template: 'index'
        }
    }
});

server.route({
    method:'GET',
    path:'/curryone',
    handler:function(request, reply){
//        console.log("Result:\n");
        search("Curry one", function(d){
            reply(JSON.stringify(d));
        });
    }
}
);

server.route({
    method: 'POST',
    path: '/form',
    handler: function(request,reply){
        var shoename = request.payload.search;
        console.log(shoename);
        search(shoename, function(d){
            reply.view('listshoes',{
            shoename:JSON.stringify(d)
        });
        
        
        //console.log("Result:\n");
//        search("Curry one", function(d){
//            reply(JSON.stringify(d));
        });
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './',
            listing: true,
            index: false
        }
    }
});




server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});