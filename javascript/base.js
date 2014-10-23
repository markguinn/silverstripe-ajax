/**
 * Basic javascript functionality for ajax with the silverstripe framework.
 *
 * NOTE: the funny syntax below allows the module to
 * be loaded with or without RequireJS/AMD.
 * See: https://github.com/umdjs/umd/blob/master/jqueryPlugin.js
 *
 * @author Mark Guinn <mark@adaircreative.com>
 * @date 04.03.2014
 * @package silverstripe-ajax
 * @subpackage javascript
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals
		factory(root.jQuery);
	}
}(this, function ($) {

	// Plugins and configuration ///////////////////////////////////////////////////////////////////////////////////////

	// TODO: there needs to be an easy way to override these globally
	var config = {
		EVENTS_KEY:     'events',
		REGIONS_KEY:    'regions',
		MESSAGES_KEY:   'messages',

		checkForFullPage: /<html|<body|<!doctype|<script/i,

		statusCodes: {
			100: 'Continue',
			101: 'Switching Protocols',
			200: 'OK',
			201: 'Created',
			202: 'Accepted',
			203: 'Non-Authoritative Information',
			204: 'No Content',
			205: 'Reset Content',
			206: 'Partial Content',
			301: 'Moved Permanently',
			302: 'Found',
			303: 'See Other',
			304: 'Not Modified',
			305: 'Use Proxy',
			307: 'Temporary Redirect',
			400: 'Bad Request',
			401: 'Unauthorized',
			403: 'Forbidden',
			404: 'Not Found',
			405: 'Method Not Allowed',
			406: 'Not Acceptable',
			407: 'Proxy Authentication Required',
			408: 'Request Timeout',
			409: 'Conflict',
			410: 'Gone',
			411: 'Length Required',
			412: 'Precondition Failed',
			413: 'Request Entity Too Large',
			414: 'Request-URI Too Long',
			415: 'Unsupported Media Type',
			416: 'Request Range Not Satisfiable',
			417: 'Expectation Failed',
			422: 'Unprocessable Entity',
			500: 'Internal Server Error',
			501: 'Not Implemented',
			502: 'Bad Gateway',
			503: 'Service Unavailable',
			504: 'Gateway Timeout',
			505: 'HTTP Version Not Supported',
		}
	};


	$(document).ready(function () {

		// handle automatic ajax elements //////////////////////////////////////////////////////////////////////////////

		$(document)
			.on('click', 'a.ajax, a[data-target=ajax]', function() { // Links
				var $link = $(this).addClass('ajax-loading');

				$.ajax({
					url: this.href
				}).always(function () {
						$link.removeClass('ajax-loading');
					});

				return false;
			})
			.on('submit', 'form.ajax, form[data-target=ajax]', function(){ // Forms
				var $form = $(this).addClass('ajax-loading'),
					$clicked = $form.find('.ajax-clicked').removeClass('ajax-clicked'),
					params = $form.serialize();

				// include the button in the response if appropriate
				if ($clicked.length > 0 && $clicked.prop('name')) {
					params += (params.length > 0 ? '&' : '') + encodeURIComponent($clicked.prop('name'))
						+ '=' + encodeURIComponent($clicked.val());
				}

				// send the request
				$.ajax({
					url:    $form.prop('action'),
					type:   $form.prop('method'),
					data:   params
				}).always(function(){
						$form.removeClass('ajax-loading');
						$clicked.removeClass('ajax-loading');
					});

				return false;
			})
			.on('click', 'form.ajax input[type=submit], form[data-target=ajax] input[type=submit]', function(){ // Form buttons
				// this allows us to know which button (if any was clicked)
				// usually, we expect there to be an indicator on the button itself
				// and additionally, we'll want to send the name=val of this button in the response
				$(this).addClass('ajax-loading ajax-clicked');
				return true;
			})
		;

		// handle ajax responses ///////////////////////////////////////////////////////////////////////////////////////

		var replaceRegion = function(html, key) {
			var $region = $(html),
				explicit = $('[data-ajax-region="' + key + '"]'),
				explicit2 = $('[data-ajax-region^="' + key + ':"]'),
				id = $region.length > 0 ? $region.prop('id') : '',
				classes = ($region.length > 0 && $region[0].className)
					? $region[0].className.replace(/^\s|\s$/, '').split(/\s+/)
					: [];

			if (explicit.length > 0) {
				// If there is one (or more) element with a data-ajax-region attribute it
				// means we know for sure it's a match to this region, usually because the
				// watch was set up on that particular element.
				explicit.html(html=='' ? html : $region.html());
			} else if (explicit2.length > 0) {
				explicit2.html(html=='' ? html : $region.html());
			} else if (id) {
				// second best is if the root element of the new content contains an id
				$('#' + id).html($region.html());
			} else if (classes.length > 0) {
				// otherwise, we try to match by css classes
				$('.' + classes.join('.')).html($region.html());
			} else {
				// finally we fail silently but leave a warning for the developer
				if (typeof(console) != 'undefined' && typeof(console.warn) == 'function') {
					console.warn('Region returned without class or id!');
				}
			}
		}

		$(document)
			.ajaxComplete(function (event, xhr, settings) {
				
			 	if (settings.dataType !== "script"){
				
					var data = null;
	
					try {
						data = $.parseJSON(xhr.responseText);
					} catch (e) {
					}
	
					if (data != null && typeof(data) === 'object') {
						// Replace regions
						if (typeof(data[config.REGIONS_KEY]) === 'object') {
							for (var key in data[config.REGIONS_KEY]) {
								if (typeof(data[config.REGIONS_KEY][key]) === 'string') {
									replaceRegion(data[config.REGIONS_KEY][key], key);
								}
							}
						}
	
						// Trigger events
						if (typeof(data[config.EVENTS_KEY]) === 'object') {
							for (var eventName in data[config.EVENTS_KEY]) {
								$(document).trigger(eventName, [data[config.EVENTS_KEY][eventName]]);
							}
						}
	
						// Show messages
						if ($.isArray(data[config.MESSAGES_KEY])) {
							var messages = data[config.MESSAGES_KEY];
							for (var i = 0; i < messages.length; i++) {
								var message = typeof(messages[i]) == 'string' ? {content:message[i]} : messages[i];
								$(document).trigger('statusmessage', message);
							}
						}
					} else if (xhr.status === 200 && xhr.responseText.indexOf('<') > -1) {
						// Otherwise, if we got some html, try to insert it as a region
						// This is mainly used with form validation, which is somewhat hardcoded in Silverstripe
						replaceRegion(xhr.responseText, 'UnidentifiedRegion');
					} else if (xhr.status >= 400) {
						// If there was no understandable payload AND the status code is an error,
						// we need to try to guess at a status message and display it to the user
						// default to the official status description
						var msg = config.statusCodes[xhr.status];
						if (typeof(msg) === 'undefined') msg = 'Unknown Error';
	
						// if the body is present and doesn't look too much like a full html page, use that instead
						if (typeof(xhr.responseText) === 'string' && xhr.responseText.length > 0) {
							if (!config.checkForFullPage.test(xhr.responseText)) {
								msg = xhr.responseText;
							}
						}
	
						// trigger the status message
						$(document).trigger('statusmessage', {content:msg, type:'error'});
					}
			 	}
			})
			.ajaxStart(function () {
				$('body').addClass('global-ajax-loading');
			})
			.ajaxStop(function () {
				$('body').removeClass('global-ajax-loading');
			})
		;
	});


	// handle ajax pulls ///////////////////////////////////////////////////////////////////////////////////////////

	var pullWatches = {};

	/**
	 * Converts url to an absolute url among other things.
	 * @param {string} url
	 * @returns {string}
	 */
	var normaliseURL = function (url) {
		return $('<a></a>').prop('href', url).prop('search', '').prop('hash', '').prop('href').replace('?#', '');
	};

	/**
	 * Adds a watch to the existing list.
	 * Cleans up the url pattern to make it easier to match.
	 * @param {string} url
	 * @param {string} region
	 * @param {jQuery} target
	 */
	var addWatch = function (url, region, target) {
		url = normaliseURL(url);
		if (typeof(pullWatches[url]) == 'undefined') pullWatches[url] = [];
		pullWatches[url].push(region);

		// If the target is not document, set data-ajax-region attribute
		// so it is cemented as the recipient of that region
		if (target && target.length == 1 && target[0].nodeName != '#document') {
			target.attr('data-ajax-region', region);
		}
	};

	/**
	 * Checks if the given url matches the pattern.
	 * @param {string} url
	 * @param {string} pattern
	 * @returns {boolean}
	 */
	var doesUrlMatch = function (url, pattern) {
		if (pattern.indexOf('*') > -1) {
			var re = new RegExp(pattern.replace('.', '\\.').replace('*', '.*'));
			return re.test(url);
		} else {
			return url === pattern;
		}
	};

	/**
	 * Adds a watch for ajax requests.
	 *
	 * @param {object|string} urls
	 * @param {string} region [optional]
	 * @returns {*}
	 */
	$.fn.pullRegionForURL = function (urls, region) {
		// this is a more user friendly interface if you only have one url to watch
		if (typeof(urls) == 'string') {
			addWatch(urls, region, this);
			return this;
		}

		if (typeof(urls) == 'object') {
			for (var url in urls) {
				if (typeof(urls[url]) == 'object') {
					for (var k in urls[url]) addWatch(url, urls[url][k], this);
				} else {
					addWatch(url, urls[url], this);
				}
			}
		}
		return this;
	};

	/**
	 * Clear all ajax request watches
	 */
	$.fn.clearPullRegions = function () {
		pullWatches = {};
		return this;
	};

	// Watch the outgoing requests and add headers as needed
	$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
		var regions = [],
			checkUrl = normaliseURL(options.url);

		// see if there are any matches
		for (var urlPattern in pullWatches) {
			if (doesUrlMatch(checkUrl, urlPattern)) {
				regions = regions.concat(pullWatches[urlPattern]);
			}
		}

		// if so, add the appropriate header
		if (regions.length > 0) {
			if (typeof(options.headers) != 'object') options.headers = {};
			options.headers['X-Pull-Regions'] = regions.join(',');
		}
	});


	// Automatically set up pulls by data-ajax-watch
	$(window).on('load', function () {
		$('[data-ajax-watch]').each(function (index, el) {
			$(el).pullRegionForURL(el.getAttribute('data-ajax-watch'), el.getAttribute('data-ajax-region'));
		});
	});

}));
