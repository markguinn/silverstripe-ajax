Silverstripe Ajax Framework
===========================

Foundational ajax support for Silverstripe CMS: push/pull server-side regions, trigger client-side events, modals, status messages.

See [the documentation](docs/en/index.md) for examples and documentation.


Features
--------
- Trigger jQuery events on the document from the server
- Push template regions from the server (region = template include)
- Pull template regions from the client
- Generic status messages (easy to write an adapter for almost any toast/flash/status message - includes one for toastr)
- Generic modals (easy to write an adapter - includes one for bootstrap)


Developer(s)
------------
- Mark Guinn <mark@adaircreative.com>

Contributions welcome by pull request and/or bug report.
Please follow Silverstripe code standards (tests would be nice).

I would love for someone to implement some other drivers - S3, Swift, Google, etc.
It's very easy to implement drivers - just extend CloudBucket and implement a few
methods.


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
