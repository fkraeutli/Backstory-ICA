<?php
	
	class Revision extends CI_Model {
		
		function listAll() {
			
			$this->db->order_by( "revision_timestamp", "asc" );
			
			return $this->db->get( "revisions" )->result();
			
		}
		
		function listWithoutPlain() {
			
			$this->db->order_by( "revision_timestamp", "asc" );
			$this->db->where( "revision_plain IS NULL" , null, false );
			$this->db->limit( 100 );
			
			return $this->db->get( "revisions" )->result();
			
		}
		
		function search( $term, $limit, $offset ) {
			
			$this->db->where( "revision_content LIKE", "%$term%" );
			$this->db->order_by( "revision_timestamp", "asc" );
			
//			if ( $limit != false && $offset != false ) {
				
				$this->db->limit( $limit, $offset );
				
//			}
			
			return $this->db->get( "revisions" )->result();
			
		}
		
		function get( $id ) {
			
			$this->db->where( "revision_id", $id );
			
			return $this->db->get( "revisions" )->row();
			
		}
		
		function getByTimestamp( $timestamp ) {
			
			$this->db->where( "revision_timestamp", $timestamp );
			
			return $this->db->get( "revisions" )->row();
			
		}
		function add( $data ) {
			
			$this->db->insert( "revisions", $data );
			
			return $this->db->insert_id();
			
		}
		
		function addPlain( $id, $plain ) {
			
			$data = array();
			$data[ "revision_plain" ] = $plain;
			
			$this->db->where( "revision_id", $id );
			$this->db->update( "revisions", $data );
			
		}
		
	}