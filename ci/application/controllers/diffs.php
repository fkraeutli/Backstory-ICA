<?php
	
	class Diffs extends CI_Controller {
	
		function __construct() {
			
			parent::__construct();
			
			ini_set( "memory_limit", "1024M" );
			$this->load->model( "revision" );
			
		}
		
		function search( $limit, $offset ) {

			//error_reporting(0);
			require_once "Text/Wiki/Mediawiki.php";
			$p = new Text_Wiki_Mediawiki();
			
			$search = "viral load";
			
			$revisions = $this->revision->search( $search, $limit, $offset );
			
			$searchParagraphs = array();
			$allParagraphs = array();
			$meta = array();
			
			//echo count($revisions) . " revisions<br>";
			
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
	 			
	 			
	 			
	 			
	 			/*

	 			if ( count( $searchParagraphs ) > 0 ) {
		 			
	 				$prev =  $searchParagraphs[ count( $searchParagraphs ) - 1 ];
		 			
		 			$diff = array_diff( $paragraphsToKeep, $prev );
		 			
		 			if ( count( $diff) ) {
			 			
			 			$add = array();
	
			 			for( $i = 0; $i < count( $prev ); $i++ ) {
				 			
				 			foreach( $paragraphsToKeep as $paragraph ) {
				
				 				if ( $prev[ $i ] == $paragraph ) {
					 				
					 				$add[$i] = $prev[$i];
					 				
				 				}
				 			
					 		}
				 			
			 			}
			 			
			 			foreach( $diff as $paragraph ) {
				 			
				 			$add[] = $paragraph;
				 			
			 			}
			 			
			 			if ( count( $add ) ) {
				 		
					 		$searchParagraphs[] = $add;			
				 			$meta[] = array( "revision_id" => $revision->revision_id, "revision_timestamp" => $revision->revision_timestamp );	
				 			
				 		}
				 		
			 		}
*/
		 			
		 			/*

		 			$diff = array_diff( $prev, $paragraphsToKeep );
		 			
		 			//print_r($diff);
		 			
		 			// record paragraphs and only include new paragraphs (store in array)
		 			
		 			if ( count ( $diff ) ) {
			 		
			 			$add = array();
			 			
			 			for ( $i = 0; $i < count( $paragraphsToKeep ); $i++ ) {
				 			
				 			if ( $prev[ $i ] && $prev[ $i ] == $paragraphsToKeep[ $i] ) {
					 		
					 			$add[ $i ] = "";
					 		
					 		} else {
						 		
						 		$add[ $i ] = $paragraphsToKeep[ $i ];
					 		}
				 			
			 			}
			 			
			 			$searchParagraphs[] = $add; //$paragraphsToKeep;
			 			
			 			
			 			$meta[] = array( "revision_id" => $revision->revision_id, "revision_timestamp" => $revision->revision_timestamp );

		 			}
		 			
		 			
	 			} else {
		 			
//		 			$searchParagraphs[] = $paragraphsToKeep;
//		 			$meta[] = array( "revision_id" => $revision->revision_id, "revision_timestamp" => $revision->revision_timestamp );
		 			
	 			}
	 			*/
			
			}
			/*

			for( $i = 1; $i < count( $meta ); $i++ ) {
				
				$current = &$searchParagraphs[ $i ];
				$prev = &$searchParagraphs[ $i - 1 ];
				
				for( $j = 0; $j < min( count( $current ), count( $prev ) ); $j++ ) {
					
					if ( $current[ $j ] == $prev[ $j] ) {
						
						$current[ $j ] = "";
						
					}
					
					//$current[ $j ] = levenshtein( $current[$j], $prev[$j] );
					
				}
				
			}
*/
			
			echo "<table><thead><tr><th>revision_id</th><th>revision_timestamp</th><th>revision_diff</th></tr></thead>";
			
			for( $i = 0; $i < count( $meta ); $i++ ) {
				
				echo "<tr><td>{$meta[$i]["revision_id"]}</td><td>{$meta[$i]["revision_timestamp"]}</td>";
				
				foreach( $searchParagraphs[ $i ] as $paragraph ) {
					
					echo "<td>" . strip_tags( $p->transform( $paragraph, "plain" ) ) . "</td>";
					
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