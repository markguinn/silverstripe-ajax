# Client Side

## Ajax Behaviours:

- Ajaxify link: class="ajax" or data-target="ajax"
- Ajaxify form: class="ajax" or data-target="ajax"
- Open in modal: data-target="modal" (not implemented yet)
- While loading, the link and the document.body will have the class ajax-loading added (and removed when loading
  finished). On forms, both the form and the button clicked will receive the loading class.


## Status Messages:

Status messages can be triggered on either the client or the server. In both cases this is triggered by a
'statusmessage' event on the document object. The event payload can be either a string or an object (for a
single message) or an array (for multiple messages). If an object is used the form is: `{content:'Operation failed', type:'bad'}`
where 'type' can be anything. For the default provider 'type' is added to the message as a CSS class.

A very basic implementation is provided which handles this event. To use it just include statusmessage.default.js
with your page. It should be very easy to write connectors for any of the many libraries and plugins out there
that display these types of messages. Just catch the 'statusmessage' event on the document and handle the
three types of input correctly (string, object, array).


## Updating Regions:

The server can push different regions of the page (denoted by SS template name). The client can also "pull"
regions by adding an X-Pull-Regions header or __regions__ GET parameter to the request. The easiest way to
do so is with the "pullRegionForURL" jQuery plugin or the data-ajax-watch and data-ajax-region attributes.

```js
$(document).pullRegionForURL({
	'/shoppingcart/*':    'SideCart',
	'/shoppingcart/add/': 'SomeOtherTemplate',
});
```

Or using data attributes:

```html
<div data-ajax-watch="/shoppingcart/*" data-ajax-region="SideCart">
	<h1>Side Cart</h1>
</div>
```

In each of these cases, any time an ajax request is to a url that starts with '/shoppingcart/' is made, it
will automatically have a header added: `X-Pull-Regions: SideCart` which will cause AjaxHTTPResponse to
automatically render the SideCart.ss template and return it in the response. The ajax framework will also
detect this region in the response and replace it. The following criteria are used for replacement:

1. If one or more regions have a data-ajax-region="SideCart" attribute, it/they will be replaced.
2. If the returned html has an id on the root element, it will look for an element on the page with the same id.
3. Finally, if the returned html has CSS classes on the root element it will replace all elements on the page with the
   same classes.
4. If all of the above come up short, it will fail silently.

#### Render Context for Regions
Finally, in some cases you may want the region to render in a different context than the current controller/page. An
example of this would be if you have a grid of products and you want to update only the product that was added to the
cart.

On the server, the controller can define zero or more additional rendering contexts by name. For example, the add
to cart action uses the following:

```php
$response->addRenderContext('PRODUCT', $product);   // this is the product we just added to the cart
$response->addRenderContext('CART', $this->Cart()); // this is the shopping cart object
```

On the client, we can then request a region by both the template name and the desired context. For exmaple:

```js
$(document).pullRegionForURL({
	'/shoppingcart/*':    'ProductGroupItem:PRODUCT'
});
```

Which will cause the added product to be updated if it's being displayed in a grid, provided the root element has
a CSS id that's unique to the product (something like `ProductGridItem_$ID`).
