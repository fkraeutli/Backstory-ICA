<?php
	
	class Query extends CI_Model {
		
		function getLatestQuery() {
			
			$this->db->from( "queries" );
			$this->db->order_by( "query_executed", "desc" );
			$this->db->limit( 1 );
			
			return $this->db->get()->row();
			
		}
		
		function add( $data ) {
			
			$this->db->insert( "queries", $data );
			
			return $this->db->insert_id();
			
		}
		
	}