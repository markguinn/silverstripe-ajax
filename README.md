Silverstripe Frontent Ajax Framework
====================================

Foundational framework-agnostic frontend ajax support for Silverstripe CMS: push/pull server-side regions, trigger
client-side events, modals, status messages.

[build status](https://travis-ci.org/markguinn/silverstripe-ajax)

See [the documentation](docs/en/index.md) for examples and documentation.

Use Case: Add to Shopping Cart
------------------------------
I want to progressively enhance the "add to cart" button on an ecommerce website.  Every page has an summary of the cart
(how many items etc) that needs to be kept up to date.  Some pages have more extensive visual changes (removing rows from
a larger table on the "view cart" page for example).

1. I isolate any regions (such as the side cart) into template includes.
2. I add the "ajax" class to any forms or links that perform the action I want to enhance.
3. The add to cart action on the controller will "push" that sidecart template transparently.
4. Specific pages can "pull" other templates either via data- attributes or javascript.
5. The server can trigger an event such as "cartempty" on the document.body element. I may want to listen for that event
   and redirect away from the checkout page or display a message.

This covers the vast majority of progressive enhancement cases I've come across working on Silverstripe sites, but gives
a lot of flexibility for more complicated stuff.


Features
--------
- Common ajax behaviours are as simple as adding a class
- Trigger jQuery events on the document from the server
- Push template regions from the server (region = template include)
- Pull template regions from the client
- Generic status messages (easy to write an adapter for almost any toast/flash/status message - includes one for toastr)
- Generic modals (easy to write an adapter - includes one for bootstrap)


Installation
------------

```
composer require markguinn/silverstripe-ajax:dev-master
```

Include base.js, base.css, and any status message and/or modal adapters.


Requires
--------
- Silverstripe 3.1+
- jQuery 1.7+ (including current, 2.x etc)


Developer(s)
------------
- Mark Guinn <mark@adaircreative.com>

Contributions welcome by pull request and/or bug report.
Please follow Silverstripe code standards (tests would be nice).


License (MIT)
-------------
Copyright (c) 2014 Mark Guinn

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so, subject
to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
