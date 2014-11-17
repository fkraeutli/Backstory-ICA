<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Grab extends CI_Controller {

	public function index()
	{
		
		$this->load->model( "query" );
		$this->load->model( "revision" );
		
		$this->load->helper( "url" );
		
		$query = $this->query->getLatestQuery();
		
		if ( count( $query ) ) {
			
			$continue = $query->query_continue;
			
		} else {
			
			$continue = false;
			
		}
		
		$jsonurl = "http://en.wikipedia.org/w/api.php?format=json&action=query&prop=revisions%7Cinfo&rvprop=content|timestamp&rvlimit=25&titles=HIV/AIDS";
		
		if ( $continue ) {
			
			$jsonurl .= "&rvcontinue=$continue";
			
		}
		
		$json = json_decode( file_get_contents( $jsonurl ) );

		$data = array();
		$data[ "query_continue" ] = $json->{"query-continue"}->revisions->rvcontinue;
		
		$query_id = $this->query->add( $data );
		
		foreach( $json->query->pages->{"5069516"}->revisions as $revision ) {
			
			if ( @$revision->{"*"} ) {
			
				$data = array();
				$data[ "revision_timestamp" ] = $revision->timestamp;
				$data[ "revision_query_id" ] = $query_id;
				$data[ "revision_content" ] = $revision->{"*"};
				
				$this->revision->add( $data );
				
			}
			
		}
		
		redirect( "grab" );
		
	}
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */