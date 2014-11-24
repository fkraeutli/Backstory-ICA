var dataset, paragraphs, revisions;

$j = jQuery.noConflict();

p = {
	
	view: {
		
		width: 800,
		height: 4600,
		paragraphHeight: 40
		
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
	revisions = [];
	
	dataset.forEach( function( d, index ) {
		
		revisions.push( {
			
			timestamp: d.revision_timestamp,
			id: d.revision_id,
			data: []
			
		});
		
		for( var i = 0; i < 100; i++ ) {
			
			if ( d[ "p" + i ] ) {
				
				if ( ! paragraphs[ i - 1 ] ) {
					
					paragraphs[ i - 1 ] = {
						id: d.revision_id,
						data: []
					};
					
				}
				
				var obj = {
					
					revision: d.revision_id,
					timestamp: d.revision_timestamp,
					content: d[ "p" + i ],
					row: index,
					col: i
					
				}
				
				paragraphs[ i - 1 ].data.push( obj );
				
				revisions[ revisions.length - 1 ].data.push( d[ "p" + i ] != "" ? { revision: d.revision_id, row: index, col: i, content: d[ "p" + i ] } : false );
				
			}
			
		}
		
		
		
	} )
	
	p.view.height = revisions.length * p.view.paragraphHeight;
	$j( "body, html" ).height( p.view.height + "px" );
	
	makeVis();
	
}

function makeVis() {
	
	var behaviours = {	
		
		vis: {
			
			mousemove: function() {
				
				var prev = d3.select( ".active" );
				var current = d3.select( d3.event.toElement );
				
				if ( current.classed( "paragraph" ) ) {
					
					d3.selectAll( ".paragraph.active" ).classed( "active", false );
					current.classed( "active", true );
					
					if ( ! prev.empty()  && current.attr( "id" ) != prev.attr( "id" ) ) {
						
						updateViewer( current );
						
					} 
					
				}
				
			}
			
		}
		
	};
	
	var scale = d3.scale.linear()
		.domain( [ d3.min( dataset, function(d) { return d.revision_timestamp; } ), d3.max( dataset, function(d) { return d.revision_timestamp; } ) ] )
		.range( [0, p.view.height ] ) ;
	
	var ul = d3.select( "body" ).append("ul").attr( "id", "vis" )
			.on("mousemove", behaviours.vis.mousemove );
	
	var li = ul.selectAll( "li" )
		.data( paragraphs )
	.enter()
		.append( "li" )
		.attr( "class", function( d, i ) {
		
			return "col-" + i;	
			
		})
		.style( "width", function() {
			
			return 100 / paragraphs.length + "%";
			
		})
	
	
	li.each( function(d) {
		
		
		d3.select( this ).append( "ul" )
			.selectAll( "li" )
			.data( d.data )
		.enter()
			.append( "li" )
			.attr( "id", function( d) {
				
				return d.revision + "-" + d.row + "-" + d.col;
				
			} )
			.attr( "class", function( d) {
				
				return "paragraph row-" + d.row + " col-" + d.col;
				
			} )		
			.html( function(d) {
				
				return d.content 
				
			} )		
			.style( "position", "absolute" )
			.style( "top", function( d, i ) {
				
				return scale( d.timestamp ) + "px";
					
				
			} )
			.on( "click", function(d) { 
			
				var obj = dataset.filter( function(ds) { return ds.revision_id == d.revision; } )[ 0 ];
				
				obj[ "p" + d.col ] = ""; 
				
				console.log ( "ok" );
				
				d3.select( this ).style( "background", "red" );
			
			} );;	

	} )	
	
			
	
}

function updateViewer( element  ) {
	
	function storePositions( prefix ) {
		
		if ( prefix === undefined ) {
			
			prefix = "";
			
		}
		
		$j("#viewer span" ).each( function(d) {
			
			var pos = $j(this).position();
			
			$j(this).attr("data-pos-" + prefix + "-top", pos.top)
				.attr("data-pos-" + prefix + "-left", pos.left)
			
		} );
		
	}
	
	function initElement() {
	
		var d = element.datum();
		var prev = d3.select( "li.col-" + d.col + ".current" );
		
		prev.classed( "current", false );
		element.classed( "current", true );
	
		if ( ! prev.empty() ) {
			
			var diffs = diffTexts( [ prev.datum().content, d.content ] )
	
			d3.select( "#viewer" ).html( "" ).selectAll("span")	
				.data( diffs[0], function(d) { return d.id; } )
			.enter()
				.append("span")
				.html( function(d) {
			
				return d.text + " ";
				
			})
			
			doUpdate( diffs[1] );
			
		} 

	}
	
	function doUpdate( data ) {
		
		var output = d3.select( "#viewer" );
		var transition_duration = 500;
		
		var dataUpdate = output.selectAll("span")	
			.data( data, function(d) { return d.id } );
			
		var dataEnter = dataUpdate.enter();
		var dataExit = dataUpdate.exit();
		
		storePositions("old");
		
		dataUpdate.classed("added", false)
			.classed("old", true);
			
		var entered = dataEnter.append("span")
			.classed( "added", true )
			.html( function(d) {
			
				return d.text + " ";
				
			})
		
		dataExit.classed("remove", true)
			.style("display", "none");
		
		output.selectAll("span").sort( function (a, b) {
			
			return a.currentPos - b.currentPos;
			
		});
		
		$j( "span.remove", output[0] ).each(function() {
			
			$j(this).css("position", "absolute")
				.css( "top", $j(this).attr("data-pos-old-top") + "px" )
				.css( "left", $j(this).attr("data-pos-old-left") + "px" );
			
			var el = $j(this);
			
			window.setTimeout( function() {
	
			   el.addClass("removing");
	
			}, 100);
			
		})
		
		dataExit.style("display", "")
			.transition()
			.duration(transition_duration)
			.remove();
	}
	
	initElement();

}