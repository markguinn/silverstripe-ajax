# Ajax Framework

## Documentation and Examples

- [Client Side](client-side.md)
- [Server Side](server-side.md)


## Goals

- Progressive enhancement is a must (i.e. everything should work with or without js)
- Following wider SS guidelines here: http://doc.silverstripe.com/framework/en/topics/javascript
  and http://doc.silverstripe.org/framework/en/trunk/misc/coding-conventions
- Should be easy (ideally automatic) to make the output of a controller action consumable by ajax
- Server can trigger various behaviours in response to a request
  * open new modal (e.g. requiring login to add to wishlist)
  * close modal (e.g. after registration, login, add to cart)
  * redirect page (e.g. to a landing page after ajax login)
  * replace multiple page elements (e.g. sidecart, buttons)
  * trigger jquery events on the document (or some other pub/sub system)


## Conventions

In addition to the Silverstripe javascript conventions:

- CSS classes can be used to specify behaviours (i.e. “addToCart” class on a button) - this fits the html5 spec which
  says that class is used to add semantic information, rather than strictly for presentation.
- Loading indication should be handled via CSS as much as possible
- Should use the HTTP status code for error responses (see 400, 409, 422, 500)
- Should generally return json (but be smart enough to handle html if its mistakenly given)
- Anything beyond jquery, like a modal dialog if needed, should be easily interchangeable (i.e. you can tell it to use
  jqueryUI, foundation, bootstrap, fancybox, or write your own adapter for any modal plugin)
