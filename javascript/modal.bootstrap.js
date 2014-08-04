/**
 * Very basic provider for status messages (flash, toast, whatever you want to call them)
 *
 * @author Mark Guinn <mark@adaircreative.com>
 * @date 8.1.2014
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
	var modalID = 0;

	$(document).on('showmodal', function(e, data){
		if (data[0] == '<') {
			var id = 'modal-'+(++modalID);
			var html = '<div class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-hidden="true">'+
				'<div class="modal-dialog modal-lg">'+
					'<div class="modal-content">'+
						data+
					'</div>'+
				'</div>'+
			'</div>';

			$(html).appendTo(document.body).attr('id', id).attr('aria-labelledby', id).modal();
		} else {
			$(data).modal();
		}
	});

}));