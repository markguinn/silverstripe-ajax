(function($) {
	describe('Shop Ajax', function(){

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('links', function(){
			beforeEach(function(){
				setFixtures(
					'<a id="link1" href="/link1" class="ajax">Test Button 1</a>' +
					'<a id="link2" href="/link2" data-target="ajax">Test Button 2</a>' +
					'<a id="link3" href="/link3" data-target="modal">Test Button 3</a>' +
					'<a id="link4" href="/link4">Test Button 4</a>'
				);

				$(document.body).removeClass('global-ajax-loading');
			});

			it('should make an ajax request given a.ajax', function(){
				$('#link1').click();
				var request = mostRecentAjaxRequest();
				expect(request.url).toMatch(/link1/);
			});

			it('should make an ajax request given a[data-target=ajax]', function(){
				$('#link2').click();
				var request = mostRecentAjaxRequest();
				expect(request.url).toMatch(/link2/);
			});

			it('should add the ajax-loading class to the link and the body and take it away when completed', function(){
				// NOTE: it crashes my browser to use expect($('body')).toHaveClass(...) - or any variation i tried
				expect($('#link1')).not.toHaveClass('ajax-loading');
				expect(document.body.className).not.toMatch(/global-ajax-loading/);
				$('#link1').click();
				var request = mostRecentAjaxRequest();
				expect($('#link1')).toHaveClass('ajax-loading');
				request.response(TestResponses.generic);
				expect($('#link1')).not.toHaveClass('ajax-loading');
			});

			it('should make an ajax request and open the result in a modal given a[data-target=modal]', function(){
				// TODO (this may not make the first iteration)
			});

			it('should not arm other links', function(){
				$('#link4').click();
				expect(mostRecentAjaxRequest()).toBeNull();
			});
		});

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('forms', function(){
			beforeEach(function(){
				setFixtures(
					'<form id="form1" class="ajax" method="post" action="/contact">' +
						'<input type="hidden" name="the" value="quick">' +
						'<input type="text" name="brown" value="fox">' +
						'<input type="checkbox" name="jumps" value="over" checked>' +
						'<input type="checkbox" name="notpresent" value="hopefully">' +
						'<textarea name="thelazy">DOG</textarea>' +
						'<select name="natural"><option>selection</option><option selected>woman</option></select>' +
						'<input id="form1submit" type="submit" name="right" value="Submit">' +
						'<input type="submit" name="wrong" value="No touching">' +
					'</form>' +
					'<form id="form2" data-target="ajax" method="post" action="/contact">' +
						'<input type="text" name="brown" value="weasel">' +
						'<input id="form2submit" type="submit" name="right" value="Submit">' +
					'</form>' +
					'<form id="form3" method="post" action="/contact">' +
						'<input type="text" name="brown" value="badger">' +
						'<input id="form2submit" type="submit" name="right" value="Submit">' +
					'</form>'
				);
			});

			it('should add ajax-loading to both the form and the button and remove both when the request finishes', function(){
				expect($('#form1')).not.toHaveClass('ajax-loading');
				expect($('#form1submit')).not.toHaveClass('ajax-loading');

				$('#form1submit').trigger('click');
				var request = mostRecentAjaxRequest();
				expect($('#form1')).toHaveClass('ajax-loading');
				expect($('#form1submit')).toHaveClass('ajax-loading');
				expect($('#form2')).not.toHaveClass('ajax-loading');

				request.response(TestResponses.generic);
				expect($('#form1')).not.toHaveClass('ajax-loading');
				expect($('#form1submit')).not.toHaveClass('ajax-loading');
				expect($('#form2')).not.toHaveClass('ajax-loading');
			});

			it('should ajaxify forms with the class "ajax"', function(){
				$('#form1').trigger('submit');
				var request = mostRecentAjaxRequest();
				expect(request.params).toBe('the=quick&brown=fox&jumps=over&thelazy=DOG&natural=woman');
				expect(request.method).toBe('POST');
				expect(request.url).toMatch(/contact$/);
				request.response(TestResponses.generic);
			});

			it('should include the submit button if used', function(){
				$('#form1submit').trigger('click');
				var request = mostRecentAjaxRequest();
				expect(request.params).toBe('the=quick&brown=fox&jumps=over&thelazy=DOG&natural=woman&right=Submit');
				request.response(TestResponses.generic);
			});

			it('should ajaxify forms with data-target="ajax"', function(){
				$('#form2').trigger('submit');
				var request = mostRecentAjaxRequest();
				expect(request.params).toBe('brown=weasel');
				request.response(TestResponses.generic);
			});
		});

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('triggered events', function(){
			var request, spyEvent2;

			beforeEach(function(){
				$.ajax({url:'/'});
				request = mostRecentAjaxRequest();
				spyOnEvent(document, 'event1');
				spyEvent2 = jasmine.createSpy('event2handler');
				$(document).on('event2', spyEvent2);
			});

			it('should trigger an event on the document when the response includes __events__', function(){
				request.response(TestResponses.events);
				expect('event1').toHaveBeenTriggeredOn(document);
				expect(spyEvent2.mostRecentCall.args[1]).toEqual(['a','b','c']);
			});
		});

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('regions', function(){
			beforeEach(function(){
				setFixtures(
					'<div id="region1">Untouched:1</div>' +
					'<div id="region2" class="replaceme">Untouched:2</div>' +
					'<div id="region3" class="replaceme">Untouched:3</div>'
				);
			});

			it('should replace a region on the page when the response includes region codes', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.pushRegion);
				expect($('#region1').html()).toBe('Replaced:1');
			});

			it('should replace multiple regions if needed', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.pushManyRegions);
				expect($('#region2').html()).toBe('Replaced:<span>2+3</span>');
				expect($('#region3').html()).toBe('Replaced:<span>2+3</span>');
			});

			// I'm not 100% sure this this the right way to go, but Form::getValidationErrorResponse
			// is hardcoded to return the form html OR (given an Accept: application/json header
			// return a fair cryptic and specific response). This makes it pretty easy to catch
			// those and display something that does work.
			it('should treat a simple html response as a region', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.pushImplicitly);
				expect($('#region1').html()).toBe('Sneaky:1');
			});

		});

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('ajax pull', function(){
			beforeEach(function(){
				setFixtures(
					'<div id="region1">Untouched:1</div>' +
					'<div id="region2" class="replaceme">Untouched:2</div>' +
					'<div id="region3" class="replaceme" data-ajax-watch="/datawatch" data-ajax-region="Test3">Untouched:3</div>' +
					'<div id="region4" class="replaceme" data-ajax-watch="/datawatch" data-ajax-region="Test4:CONTEXT">Untouched:4</div>'
				);

				$(document).pullRegionForURL({
					'/cart':    'SideCart',
					'/other':   ['abc', 'def'],
					'/wild/*':  'test',
					'/*/wild2/':  'test3',
					'http://otherdomain.com/test1/': 'test2'
				});

				$('#region2').pullRegionForURL({
					'/localwatch': 'Test2'
				})

				// this will cause the data-ajax-watch to get picked up
				$(window).trigger('load');
			});

			afterEach(function(){
				$(document).clearPullRegions();
			});

			it('should add a X-Pull-Region header when requests to matching urls are made', function(){
				$.ajax({url:'/cart'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('SideCart');
			});

			it('should not add the header for non-matching urls', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBeUndefined();
			});

			it('should handle multiple regions at once', function(){
				$.ajax({url:'/other'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('abc,def');
			});

			it('should match wildcards in the url', function(){
				$.ajax({url:'/wild/cart/url'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('test');
			});

			it('should match wildcards in any part the url', function(){
				$.ajax({url:'/shopper/wild2/'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('test3');
			});

			it('should ignore the query string and hash', function(){
				$.ajax({url:'/cart?test=1#test2'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('SideCart');
			});

			it('should handle the hostname and protocol intelligently', function(){
				var request;

				$.ajax({url:'http://otherdomain.com/cart'});
				request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBeUndefined();

				// this isn't present on phantomjs (travis)
				if (document.location.host) {
					$.ajax({url:'http://' + document.location.host + '/cart'});
					request = mostRecentAjaxRequest();
					expect(request.requestHeaders['X-Pull-Regions']).toBe('SideCart');
				}

				$.ajax({url:'/test1/'});
				request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBeUndefined();

				$.ajax({url:'http://otherdomain.com/test1/'});
				request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('test2');
			});

			it('should replace the node the watch was set on if not set on the document', function(){
				$.ajax({url:'/localwatch'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('Test2');
				request.response(TestResponses.pullLocal);
				expect($('#region2').html()).toBe('Replaced:2');
				expect($('#region3').html()).not.toBe('Replaced:2');
			});

			it('should recognize data-ajax-watch and data-ajax-region attributes', function(){
				$.ajax({url:'/datawatch'});
				var request = mostRecentAjaxRequest();
				expect(request.requestHeaders['X-Pull-Regions']).toBe('Test3,Test4:CONTEXT');
				request.response(TestResponses.pullDataAttribute);
				expect($('#region2').html()).not.toBe('Replaced:3');
				expect($('#region3').html()).toBe('Replaced:3');
				expect($('#region4').html()).toBe('Replaced:4');
			});
		});

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('generic status message provider', function(){
			afterEach(function(){
				$('.statusMessage').remove();
			});

			it('should display a div when the message event is triggered', function(){
				$(document).trigger('statusmessage', {content:'Test 123'});
				expect($('body > .statusMessage')).toExist();
			});

			it('should use the specified container if present', function(){
				setFixtures('<div id="StatusMessages"></div>');
				$(document).trigger('statusmessage', {content:'Test 123'});
				expect($('#StatusMessages > .statusMessage')).toExist();
			});

			it('should hide the message when clicked on', function(){
				var done = false;
				runs(function(){
					$(document).trigger('statusmessage', {content:'Test 123'});
					$('.statusMessage').trigger('click');
					setTimeout(function(){ done=true; }, 500);
				});
				waitsFor(function(){ return done; });
				expect($('.statusMessage')).not.toExist();
			});

			it('should allow multiple messages at once', function(){
				$(document).trigger('statusmessage', {content:'Test 1'});
				$(document).trigger('statusmessage', {content:'Test 2'});
				$(document).trigger('statusmessage', {content:'Test 3'});
				expect($('.statusMessage').length).toBe(3);
			});

			it('should use different classes for different types of messages', function(){
				$(document).trigger('statusmessage', {content:'Test 1', type:'good'});
				$(document).trigger('statusmessage', {content:'Test 2', type:'bad'});
				$(document).trigger('statusmessage', {content:'Test 3', type:'ugly'});
				expect($('.statusMessage.good')).toExist();
				expect($('.statusMessage.good')).toHaveHtml('Test 1');
				expect($('.statusMessage.bad')).toExist();
				expect($('.statusMessage.bad')).toHaveHtml('Test 2');
				expect($('.statusMessage.ugly')).toExist();
			});

			it('should handle a string as the input', function(){
				$(document).trigger('statusmessage', 'Simplest form');
				expect($('.statusMessage')).toHaveHtml('Simplest form');
			});

			it('should handle an array as input', function(){
				// NOTE: when passing an array directly to trigger we have to double up the array or it will
				// be interpreted as parameters
				$(document).trigger('statusmessage', [['Simple 1', 'Simple 2', {content:'Mixed 3', type:'mixed'}]]);
				expect($('.statusMessage').length).toBe(3);
				expect($('.statusMessage.mixed')).toExist();
			});

			it('should trigger status messages from the ajax response', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.messages);
				expect($('.statusMessage.good')).toExist();
				expect($('.statusMessage.good')).toHaveHtml('Test 1');
				expect($('.statusMessage.bad')).toExist();
				expect($('.statusMessage.bad')).toHaveHtml('Test 2');
			});
		});

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		describe('ajax errors', function(){

			afterEach(function(){
				$('.statusMessage').remove();
			});

			var checkJsonForStatus = function(status) {
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				spyOnEvent(document, 'event1');
				var response = JSON.parse( JSON.stringify(TestResponses.events) );
				response.status = status;
				request.response(response);
				expect('event1').toHaveBeenTriggeredOn(document);
			};

			it('should function exactly the same if a json payload is present (400)', function(){ checkJsonForStatus(400); });
			it('should function exactly the same if a json payload is present (404)', function(){ checkJsonForStatus(404); });
			it('should function exactly the same if a json payload is present (409)', function(){ checkJsonForStatus(409); });
			it('should function exactly the same if a json payload is present (422)', function(){ checkJsonForStatus(422); });
			it('should function exactly the same if a json payload is present (500)', function(){ checkJsonForStatus(500); });

			it('should display the response body if it is a simple string', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.errorStringResponse);
				expect($('.statusMessage.error')).toHaveHtml('Test Error Message');
			});

			it('should display the response body if it is html and does not appear to be a full html page', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.errorHtmlResponse);
				expect($('.statusMessage.error')).toHaveHtml('<p>Test <strong>Error</strong> Message</p>');
			});

			it('should not display the response body if it appears to be a full page', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.errorHtmlResponse);
				expect($('.statusMessage.error').html()).not.toMatch(/Test Error Message/);
			});

			it('should display an intelligent error message if no other response is given', function(){
				$.ajax({url:'/'});
				var request = mostRecentAjaxRequest();
				request.response(TestResponses.errorEmpty);
				expect($('.statusMessage.error')).toHaveHtml('Bad Request');
			});

		});

	});
}(jQuery));
