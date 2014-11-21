var dataset, paragraphs;

p = {
	
	view: {
		
		width: 800,
		height: 4600
		
	}	
	
};

d3.csv( "data/condoms.csv", function(d) {

	dataset = d;
	
	dataset.forEach( function(d) {
		
		d.revision_id = parseInt( d.revision_id );
		d.revision_timestamp = new Date( d.revision_timestamp );
		
	} );
	
	initDataset();
		
} );


function initDataset() {
	
	paragraphs = [];
	
	dataset.forEach( function(d) {
		
		for( var i = 0; i < 100; i++ ) {
			
			if ( d[ "p" + i ] ) {
				
				if ( ! paragraphs[ i - 1 ] ) {
					
					paragraphs[ i - 1 ] = Array();
					
				}
				
				var obj = {
					
					revision_id: d.revision_id,
					revision_timestamp: d.revision_timestamp,
					revision_paragraph: d[ "p" + i ]
					
				}
				
				paragraphs[ i - 1 ].push( obj );
				
			}
			
		}
		
	} )
	
	makeVis();
	
}

function makeVis() {
	
	var scale = d3.scale.linear()
		.domain( [ d3.min( dataset, function(d) { return d.revision_timestamp; } ), d3.max( dataset, function(d) { return d.revision_timestamp; } ) ] )
		.range( [0, p.view.height ] ) ;
	
	var ul = d3.select("body").append("ul").attr( "id", "vis" );
	
	var li = ul.selectAll("li")
		.data( paragraphs )
	.enter()
		.append( "li" );
		
	li.each( function(d) {
		
		d3.select( this ).append( "ul" )
			.selectAll( "li" )
			.data( d )
		.enter()
			.append( "li" )
			.html( function(d) {
				return d.revision_paragraph 
			} )
			.style( "top", function(d) {
				
				return scale( d.revision_timestamp ) + "px";
				
			} );
			
		
	} )
			
	
}