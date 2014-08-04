<?php
/**
 * Tests to cover AjaxHTTPResponse.
 *
 * @author Mark Guinn <mark@adaircreative.com>
 * @date 04.07.2014
 * @package shop
 * @subpackage tests
 */
class AjaxResponseTest extends SapphireTest {

	function setUpOnce() {
		if (!Controller::has_extension('AjaxControllerExtension')) Controller::add_extension('AjaxControllerExtension');
		parent::setUpOnce();
	}

	function testEmptyResponseJson() {
		$r = new AjaxHTTPResponse();
		$this->assertEquals('application/json', $r->getHeader('Content-type'));
		$this->assertEquals('{}', $r->getBody());
	}


	function testTriggerEvent() {
		$r = new AjaxHTTPResponse();
		$r->triggerEvent('cartchange', array('qty' => 4));
		$r->triggerEvent('addtocart');
		$json = $r->getBody();
		$data = json_decode($json, true);
		$this->assertNotEmpty($data[AjaxHTTPResponse::EVENTS_KEY], 'should contain an events key');
		$this->assertEquals(1, $data[AjaxHTTPResponse::EVENTS_KEY]['addtocart'], 'should contain a record of the addtocart event');
		$this->assertEquals(4, $data[AjaxHTTPResponse::EVENTS_KEY]['cartchange']['qty'], 'should correctly pass on the event data');
	}


	function testPushRegion() {
		$mock = new ArrayData(array('Cart' => ShoppingCart::curr()));
		$r = new AjaxHTTPResponse();
		$r->pushRegion('SideCart', $mock);
		$json = $r->getBody();
		$data = json_decode($json, true);
		$this->assertNotEmpty($data[AjaxHTTPResponse::REGIONS_KEY]['SideCart'], 'should contain an entry for the side cart');
		$this->assertEquals($data[AjaxHTTPResponse::REGIONS_KEY]['SideCart'], $mock->renderWith('SideCart')->forTemplate(), 'SideCart entry should match the sidecart template');
	}


	function testPullRegion() {
		// this is a dirty dirty mess. sorry.
		$req = new SS_HTTPRequest('GET', '/test1');
		$req->addHeader(AjaxHTTPResponse::PULL_HEADER, 'SideCart,OrderHistory');
		$req->addHeader('X-Requested-With', 'XMLHttpRequest');
		$page = new Page();
		$ctrl = new Page_Controller($page);
		$ctrl->pushCurrent();
		$ctrl->setRequest($req);
		$ctrl->setDataModel(DataModel::inst());
		$ctrl->setURLParams(array());
		$ctrl->init();
		$response = $ctrl->getAjaxResponse();
		$ctrl->popCurrent();
		$data = json_decode($response->getBody(), true);
		$this->assertNotEmpty($data[AjaxHTTPResponse::REGIONS_KEY]['SideCart']);
		$this->assertNotEmpty($data[AjaxHTTPResponse::REGIONS_KEY]['OrderHistory']);
	}


	function testPullRegionByParam() {
		// this is a dirty dirty mess. sorry.
		$req = new SS_HTTPRequest('GET', '/test1', array(AjaxHTTPResponse::PULL_PARAM => 'SideCart,OrderHistory'));
		$page = new Page();
		$ctrl = new Page_Controller($page);
		$ctrl->pushCurrent();
		$ctrl->setRequest($req);
		$ctrl->setDataModel(DataModel::inst());
		$ctrl->setURLParams(array());
		$ctrl->init();
		$response = $ctrl->getAjaxResponse();
		$ctrl->popCurrent();
		$data = json_decode($response->getBody(), true);
		$this->assertNotEmpty($data[AjaxHTTPResponse::REGIONS_KEY]['SideCart']);
		$this->assertNotEmpty($data[AjaxHTTPResponse::REGIONS_KEY]['OrderHistory']);
	}


	function testPullRegionWithRenderContext() {
		// this is a dirty dirty mess. sorry.
		$req = new SS_HTTPRequest('GET', '/test1');
		$req->addHeader(AjaxHTTPResponse::PULL_HEADER, 'ProductGroupItem:BUYABLE');
		$req->addHeader('X-Requested-With', 'XMLHttpRequest');
		$page = new Page();
		$ctrl = new Page_Controller($page);
		$ctrl->pushCurrent();
		$ctrl->setRequest($req);
		$ctrl->setDataModel(DataModel::inst());
		$ctrl->setURLParams(array());
		$ctrl->init();
		$response = $ctrl->getAjaxResponse();
		$response->addRenderContext('BUYABLE', new ArrayData(array(
			'Title' => 'Test Product',
			'Link'  => '/test-product',
			'Price' => 29.99,
		)));
		$data = json_decode($response->getBody(), true);
		$ctrl->popCurrent();
		$this->assertNotEmpty($data[AjaxHTTPResponse::REGIONS_KEY]['ProductGroupItem']);
	}



	// TODO: http errors
	// TODO: html/xml output

}