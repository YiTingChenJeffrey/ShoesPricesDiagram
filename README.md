SHOES PRICES DIAGRAM

The name for this final project is called "shoes price disgram". I created this website especially for sneakers lovers. They can type the sneaker name they want to search for. Then, the website will show a list of informations, including name, photo, price range and diagram. The diagram presents 30 recently sneakers that are sold. You can see the price trend for that sneakers and decide when you should buy or sell the sneaker.  

Here is the link to my project :  https://shoeprices.herokuapp.com/

<b>Journal Entries</b><br>
04/06/2017 Researched For Ideas. Looked For API. I decided to do a price comparison site for sneakers.<br>
04/13/2017 Working with Ebay-API. Tried to grab information from ebay-api <br>
04/20/2017 Built the layout of the site using node.js <br>
04/27/2017 Successfully grab information from ebay-api <br>
05/04/2017 Build a diagram using information from ebay <br>

<b>How To build a site with Ebay-api</b>


<b>First</b>, create a layout of the website using node.js<br>
<b>Second</b>, type the following code using terminal<br>

  npm install ebay-api<br>
  var ebay = require('ebay-api');

<br>
<b>Third</b>, Makes an XML POST to an eBay API endpoints.<br>

```
ebay.xmlRequest({
    serviceName: 'Finding',
    opType: 'findItemsByKeywords',
    appId: '......................',      // FILL IN YOUR OWN APP KEY, GET ONE HERE: https://publisher.ebaypartnernetwork.com/PublisherToolsAPI
    params: params,
    parser: ebay.parseResponseJson    // (default)
  },
  // gets all the items together in a merged array
  function itemsCallback(error, itemsResponse) {
    if (error) throw error;

    var items = itemsResponse.searchResult.item;

    console.log('Found', items.length, 'items');
    
    for (var i = 0; i < items.length; i++) {
      console.log('- ' + items[i].title);
    }  
  }
);
<br>
```
