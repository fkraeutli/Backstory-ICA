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
	
	public function getIds( $continue = false ) {
		
		$this->load->model( "revision" );
		$jsonurl = "http://en.wikipedia.org/w/api.php?format=json&action=query&prop=revisions%7Cinfo&rvprop=ids|timestamp&rvlimit=500&titles=HIV/AIDS";
		
		if ( $continue ) {
			
			$jsonurl .= "&rvcontinue=$continue";
			
		}
		$json = json_decode( file_get_contents( $jsonurl ) );



		foreach( $json->query->pages->{"5069516"}->revisions as $revision ) {
		
				$timestamp = str_replace("T", " ", $revision->timestamp );
				$timestamp = str_replace("Z", "", $timestamp );			

				$rev = $this->revision->getByTimestamp( $timestamp );

				echo $timestamp . "<br>";

				if( count ($rev ) ) {
	
					$data = array();
	
					$data[ "revision_id" ] = $rev->revision_id;
					$data[ "oldid" ] = $revision->revid;
					
					$this->db->insert( "revids", $data);				
				}
				
		
			
		};
		
		$continue = $json->{"query-continue"}->revisions->rvcontinue;
				
		echo "<a href=\"/icaphila/ci/index.php/grab/getids/$continue\">Continue</a>"; 
		
	}
	
	public function updateRevIds() {
		
		$ids = "8996
8946
8945
8944
8881
8867
8866
8861
8853
8852
8822
8817
8754
8747
8736
8727
8584
8526
8521
8466
8402
8389
8358
8350
8303
8300
8261
8191
7926
7923
7901
7874
7873
7811
7796
7614
7613
7566
7548
7503
7501
7486
7320
7312
7310
7309
7249
7205
7056
6976
6974
6972
6968
6892
6888
6794
6793
6792
6600
6560
6555
6549
6537
6532
6516
6498
6335
6333
6332
6331
6330
6322
6321
6320
6318
6317
6316
6315
6313
6294
6291
6263
6237
6151
5899
5864
5841
5831
5812
5798
5770
5768
5226
5225
5224
5212
5211
5198
5196
5156
4867
4646
4494
4400
3709
3686
3257
3211
3059
3041
3040
3025
2903
2810
2700
2524
2353
2321
2319
2264
2263
2258
2205
2201
2200
2199
2196
2194
2192
2161
2141
2047
2044
1998
1866
1668
1526
1122
1114
1095
1011
1010
1008
1004
1002
989
985
981
979
977
976
972
970
964
911
906
905
892
891
890
889
883
882
849
844
842
773
729
716
715
676
673
625
603
588
581
580
578
575
565
564
563
555
552
522
483
435
374
312
297
223
197
175
163
102
87
77";

	$ids = explode("\n", $ids);
	
	print_r( $ids );
		
	}
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */