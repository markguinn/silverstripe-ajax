# Server Side

The suggested usage is:

```php
	function add($request) {
		// Do something...

		if ($request->isAjax()) {
			$response = $this->getAjaxResponse();
			$response->triggerEvent('cartchange');
			$response->pushRegion('SideCart');
			return $response;
		} else {
			return $this->redirectBack(); // or render or whatever
		}
	}
```

Within shop module the above is extracted into an extension. For example:

```php
class ShoppingCart_Controller {
	function add($request) {
		// Do something...
		$this->extend('updateAddResponse', $request, $response, $product);
		return $response ? $response : self::direct();
	}
}

class ShoppingCartAjax extends Extension {
	public function updateAddResponse(&$request, &$response, $product=null) {
		if ($request->isAjax()) {
			if (!$response) $response = $this->owner->getAjaxResponse();
			$response->pushRegion('SideCart', $this->owner);
			$response->triggerEvent('cartadd');
		}
	}
}
```


## Status Messages

Examples of sending status messages in a response:

```php
$response->triggerEvent('statusmessage', 'Simple message');
$response->triggerEvent('statusmessage', array('content' => 'Something bad', 'type' => 'bad'));
$response->triggerEvent('statusmessage', array(
	'Multiple messages'
	'Message #2',
	array('content' => 'Mixed messages', type => 'good'),
));
```
