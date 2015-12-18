<?php
/**
 * Special case of HTTP response that adds some helpers for ajax and
 * automatically handles the construction of the response.
 *
 * @author Mark Guinn <mark@adaircreative.com>
 * @date 04.03.2014
 * @package silverstripe-ajax
 */
class AjaxHTTPResponse extends SS_HTTPResponse
{

    const EVENTS_KEY  = 'events';
    const REGIONS_KEY = 'regions';
    const PULL_PARAM  = '__regions__';
    const PULL_HEADER = 'X-Pull-Regions';


    /** @var array - CLIENT-SIDE events that will be triggered on the document. Key=event, value=data for event handler */
    protected $events = array();

    /** @var array - Regions to send along. Key=Template, Value=HTML */
    protected $regions = array();

    /** @var array - Key/val store of objects a region can be rendered against. DEFAULT=current controller */
    protected $renderContexts = array();

    /** @var SS_HTTPRequest */
    protected $request = null;


    /**
     * Create a new HTTP response
     *
     * @param SS_HTTPRequest $request - The corresponding request object
     * @param string $body - The body of the response
     * @param int $statusCode - The numeric status code - 200, 404, etc
     * @param string $statusDescription - The text to be given alongside the status code.
     *  See {@link setStatusCode()} for more information.
     */
    public function __construct($request = null, $body = null, $statusCode = null, $statusDescription = null)
    {
        if ($request && $request instanceof SS_HTTPRequest) {
            $this->request = $request;
        } elseif (is_string($request)) {
            // respond intelligently if someone uses the parent constructor syntax
            $statusDescription = $statusCode;
            $statusCode = $body;
            $body = $request;
        }

        parent::__construct($body, $statusCode, $statusDescription);

        // default content type
        $this->addHeader('Content-type', 'application/json');
        $this->addRenderContext('DEFAULT', Controller::curr());
    }


    /**
     * Queues up an event to be triggered on the client when the response is received.
     * Events are not gauranteed to be triggered in order.
     * Events are triggered AFTER regions are replaced.
     *
     * @param string $eventName
     * @param mixed $eventData - must be json encodable
     * @return $this
     */
    public function triggerEvent($eventName, $eventData=1)
    {
        if (!empty($eventName)) {
            $this->events[$eventName] = $eventData;
        }

        return $this;
    }


    /**
     * @param string $template
     * @param ViewableData $contextObj [optional] - if not present, current controller will be used
     * @param array $data [optional] - if present, renderObj will be customised with this data
     * @return $this
     */
    public function pushRegion($template, $contextObj=null, $data=null)
    {
        if (!empty($template)) {
            // add the default render target if none is present
            if (strpos($template, ':') === false) {
                $template .= ':DEFAULT';
            }

            // separate the template name and render target
            list($template, $contextName) = explode(':', $template);
            if (!$contextObj) {
                $contextObj = $this->getRenderContext($contextName);
            }

            if (!isset($this->regions[$template])) {
                // render the region
                $this->regions[$template] = $contextObj ? $contextObj->renderWith($template, $data)->forTemplate() : '';
            }
        }

        return $this;
    }


    /**
     * @return string
     */
    public function getBody()
    {
        // if the body has been set elsewhere, just pass that through.
        if (empty($this->body)) {
            $data = new StdClass;

            if (!empty($this->events)) {
                $key = self::EVENTS_KEY;
                $data->$key = $this->events;
            }

            // add the pull regions, if any
            $pulls = $this->getPulledRegionIDs();
            if (count($pulls) > 0) {
                foreach ($pulls as $regionID) {
                    $this->pushRegion($regionID);
                }
            }

            if (!empty($this->regions)) {
                $key = self::REGIONS_KEY;
                $data->$key = $this->regions;
            }

            $this->setBody(json_encode($data));
        }

        return parent::getBody();
    }


    /**
     * @param string $name
     * @param ViewableData $obj
     * @return $this
     */
    public function addRenderContext($name, ViewableData $obj)
    {
        $this->renderContexts[$name] = $obj;
        return $this;
    }


    /**
     * @return $this
     */
    public function clearRenderContexts()
    {
        $this->renderContexts = array();
        return $this;
    }


    /**
     * @param string $name
     * @return ViewableData|null
     */
    public function getRenderContext($name)
    {
        return isset($this->renderContexts[$name]) ? $this->renderContexts[$name] : null;
    }


    /**
     * Looks first for the X-Pull-Regions header and then for a __regions__ get/post var.
     * @return array
     */
    protected function getPulledRegionIDs()
    {
        if (!$this->request) {
            return array();
        }
        $header = $this->request->getHeader(self::PULL_HEADER);
        if (!empty($header)) {
            return explode(',', $header);
        }
        $param  = $this->request->requestVar(self::PULL_PARAM);
        if (!empty($param)) {
            return explode(',', $param);
        }
        return array();
    }
}
