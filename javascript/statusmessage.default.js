/**
 * Very basic provider for status messages (flash, toast, whatever you want to call them)
 *
 * @author Mark Guinn <mark@adaircreative.com>
 * @date 04.11.2014
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

	function getContainer() {
		var container = $('#StatusMessages');
		if (container.length == 0) container = $(document.body);
		return container;
	}

	function showMessage(msg) {
		if (typeof(msg) === 'string') msg = {content:msg};
		if (typeof(msg.content) != 'string') return;
		if (typeof(msg.type) != 'string') msg.type = '';
		$('<div></div>')
			.html(msg.content)
			.addClass('statusMessage '+msg.type)
			.prependTo(getContainer())
			.click(function(){
				$(this).fadeOut('fast', function(){
					$(this).remove();
				});
			});
	}

	$(document).on('statusmessage', function(e, msg){
		if ($.isArray(msg)) {
			for (var i = 0; i < msg.length; i++) showMessage(msg[i]);
		} else {
			showMessage(msg);
		}
	});

}));
