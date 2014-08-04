/**
 * Responds to statusmessage events by triggering toastr. See https://github.com/CodeSeven/toastr
 * You should also include the following JS/CSS if using this adapter:
 *
 * //cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js
 * //cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css
 *
 * @author Mark Guinn <mark@adaircreative.com>
 * @date 07.15.2014
 * @package silverstripe-ajax
 * @subpackage javascript
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery', 'toastr'], factory);
	} else {
		// Browser globals
		factory(root.jQuery);
	}
}(this, function ($) {

	function showMessage(msg) {
		if (typeof(msg) === 'string') msg = {content:msg};
		if (typeof(msg.content) != 'string') return;
		if (typeof(msg.type) != 'string') msg.type = 'info';

		switch(msg.type) {
			case 'good':
			case 'success':
				toastr.success(msg.content);
				break;

			case 'bad':
			case 'error':
				toastr.error(msg.content);
				break;

			case 'warning':
			case 'warn':
				toastr.warning(msg.content);
				break;

			default:
				toastr.info(msg.content);
		}
	}

	$(document).on('statusmessage', function(e, msg){
		if ($.isArray(msg)) {
			for (var i = 0; i < msg.length; i++) showMessage(msg[i]);
		} else {
			showMessage(msg);
		}
	});

}));