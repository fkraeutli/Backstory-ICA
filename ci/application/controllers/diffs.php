<?php
	
	class Diffs extends CI_Controller {
	
		function __construct() {
			
			parent::__construct();
			
			ini_set( "memory_limit", "1024M" );
			$this->load->model( "revision" );
			
		}
		
		function search( $limit, $offset ) {

			error_reporting(0);
			require_once "Text/Wiki/Mediawiki.php";
			$p = new Text_Wiki_Mediawiki();
			
			$search = "safe sex";
			
			$revisions = $this->revision->search( $search, $limit, $offset );
			
			$searchParagraphs = array();
			$allParagraphs = array();
			$meta = array();
			
			foreach( $revisions as $revision ) {
			
	 			$paragraphs = ( explode("\n", $revision->revision_content ) );
	 		
	 			$paragraphsToKeep = array();
	 		
	 			foreach ( $paragraphs as $paragraph ) {
		 			
		 			if ( strstr( $paragraph, $search ) && $paragraph != "" ) {
			 			
			 			$paragraphsToKeep[] = $paragraph;
		 			}
		 			
	 			}
	 			
	 			$paragraphAdded = false;
	 			
	 			foreach( $paragraphsToKeep as $paragraph ) {
		 		
		 			if ( ! in_array( $paragraph, $allParagraphs ) ) {
			 		
			 			$allParagraphs[] = $paragraph;
			 			$paragraphAdded = true;
			 			
			 		}
		 			
	 			}
	 			
	 			if ( $paragraphAdded ) {
		 		
		 			$add = array();
		 			$searchParagraphs[] = $paragraphsToKeep;
		 			$meta[] = array( "revision_id" => $revision->revision_id, "revision_timestamp" => $revision->revision_timestamp );
		 			
	 			}
	 			
	 		
			}
			
			echo "<table><thead><tr><th>revision_id</th><th>revision_timestamp</th><th>revision_diff</th></tr></thead>";
			
			for( $i = 0; $i < count( $meta ); $i++ ) {
				
				echo "<tr><td>{$meta[$i]["revision_id"]}</td><td>{$meta[$i]["revision_timestamp"]}</td>";
				
				foreach( $searchParagraphs[ $i ] as $j => $paragraph ) {
					
					if ( $searchParagraphs[ $i - 1] && $searchParagraphs[ $i - 1][ $j ] == $paragraph ) {
						
						echo "<td></td>";
						
					} else {
					
						echo "<td>" . strip_tags( $p->transform( $paragraph, "plain" ) ) . "</td>";
						
					}
					
				}
				
				
			}
			
			echo "</table>";
		}
		
		function makePlain() {
		
		
			//error_reporting(0);
		
			
			$revisions = $this->revision->listWithoutPlain( );
		
			require_once "Text/Wiki/Mediawiki.php";
			$p = new Text_Wiki_Mediawiki();
			
			echo count( $revisions ) . " revisions to process<br>";


			foreach( $revisions as $revision ) {
				
				echo "Revision {$revision->revision_id} <br>";
				
				$plain = strip_tags( $p->transform( $revision->revision_content, "plain" ) );
				
				$this->revision->addPlain( $revision->revision_id, $plain );
			}
			

			
			
		}
		
	}