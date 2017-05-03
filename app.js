'use strict';

const Hapi = require('hapi');
const Blipp = require('blipp');
const Path = require('path');
const Inert = require('inert');
const Vision = require('vision');
const Handlebars = require('handlebars');
var ebay = require('ebay-api');
var _ = require('lodash');
const Fetch = require ("node-fetch");

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
        outputSelector: ['PictureURLLarge'],


        itemFilter: {
            name: "Condition",
            value: 1000
            
            
        },
        
          itemFilter: {
            name: "SoldItemsOnly",
            value: true
            
            
        },

        categoryId: 158971,
        
        

        paginationInput: {
            entriesPerPage: 30
        },

    };


    var it;




    ebay.xmlRequest({
            serviceName: 'Finding',
            opType: 'findCompletedItems',
            appId: 'YiTingCh-DynamicD-PRD-2090738eb-589abf11', // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
            params: params,
            parser: ebay.parseResponseJson // (default)
        },
        // gets all the items together in a merged array
        function itemsCallback(error, itemsResponse) {
            if (error) throw error;

            var items = itemsResponse.searchResult.item;
            console.log(items);
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
    port: (process.env.PORT || 3000)
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
    method: 'GET',
    path: '/{keywords}',
    handler: function (request, reply) {
        //        console.log("Result:\n");
        search(request.params.keywords, function (d) {
            reply(JSON.stringify(d));
        });
    }
});

server.route({
    method: 'POST',
    path: '/form',
    handler: function (request, reply) {
        var shoename = request.payload.search;
        console.log(shoename);
        search(shoename, function (d) {
            
            var shoeshoe = JSON.stringify(d);
            var parsing = JSON.parse(shoeshoe);
            var minPrice = parsing[0].sellingStatus.currentPrice.amount;
            var maxPrice = parsing[0].sellingStatus.currentPrice.amount;
            var priceData = [parsing[0].sellingStatus.currentPrice.amount];
            var overTime = [parsing[0].listingInfo.endTime];
            for(var i=1;i<parsing.length;i++){
                overTime.push(parsing[i].listingInfo.endTime);
                priceData.push(parsing[i].sellingStatus.currentPrice.amount);
                if(parsing[i].sellingStatus.currentPrice.amount>maxPrice)
                    maxPrice =parsing[i].sellingStatus.currentPrice.amount;
                if(parsing[i].sellingStatus.currentPrice.amount<minPrice)
                    minPrice =parsing[i].sellingStatus.currentPrice.amount;
            }
//            console.log("prices",JSON.stringify(priceData));
            console.log('otttt',JSON.stringify(overTime));
            reply.view('listshoes', {
                shoename: parsing,
                min:minPrice,
                max:maxPrice,
                priceData:JSON.stringify(priceData),
                overTime:JSON.stringify(overTime)
            });

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