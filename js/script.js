var dataset, paragraphs, revisions;

var isIE = ( window.navigator.userAgent.indexOf( "MSIE") != -1 );

$j = jQuery.noConflict();

p = {
	
	containerID: "backstory",
	
	scale: {},
	
	view: {
		
		padding: 100,
		width: 800,
		paragraphHeight: 30
		
	},
	
	viewerID: "viewer_content"	
	
};

TEST_p = p;

$j( initialise );

function initialise() {
	
	$j( "#close_button" ).click( function() {
		
		$j( "#instructions" ).fadeOut();
		
	} )
	
	load( window.location.hash.substr(1) || "condoms" );
	
	$j( "#backstory_topics a" ).click( function( e ) { 
	
		load( $j( this ).attr( "data-topic" ) );
		
	} );
	
	$j( "#viewer_container").css( "top", $j( "#backstory_topics").outerHeight() );
	
	$j( "#backstory" ).scroll( function( e ) {
		
		$j( "#viewer_container").css( "top", $j( "#backstory_topics").outerHeight() - Math.min( $j( "#backstory" ).scrollTop(), $j( "#backstory_topics" ).outerHeight() ) );
		
	})
	
}

function load( which ) {
	
	function initLoad() {

			$j( "#" + p.containerID + "_container" ).remove();
			$j( "#" + p.viewerID ).html( "" );
			
			if ( ! which ) {
				
				which = "condoms";
				
			}
			
		
			
			d3.json( "data/" + which + ".json", function(d) {
			
				dataset = d;
				
				dataset.forEach( function(d) {
					
					d.revision_id = parseInt( d.revision_id );
					d.revision_timestamp = new Date( d.revision_timestamp );
					
				} );
				
				initDataset();
					
			} );
		}

	
	$j( "#backstory_topics a.selected" ).removeClass( "selected" );
	$j(  "#backstory_topics a[data-topic=" + which + "]" ).addClass( "selected" );
			
	if ( $j( "#" + p.containerID + "_container" ).size() ) {
	
		$j( "#" + p.containerID + "_container" ).fadeOut( 300, initLoad )
		
	} else {
		
		initLoad();
		
	}

	
	
}

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
	
	p.container = d3.select( "#" + p.containerID )
		.append("div")
		.attr("id", p.containerID + "_container")
		.style( "display", "none");
		
	$j( "#" + p.containerID + "_container" ).fadeIn( 300 );	
		
	p.container.append( "div" )
		.attr( "id", "time_indicator" )
		.style( "display", "none" )
	.append( "span" )
		.attr( "class", "time" )
	
	p.container.style( "height", p.view.height + p.view.padding * 10 + "px" );
	
	build();
	
}

function build() {
	
	var behaviours = {	
		
		vis: {
			
			mousemove: function( e ) {
				
				var current = $j( e.target );
				
				if ( current.hasClass( "column") ) {
					
					$j( ".column.active" ).removeClass( "active" );
					current.addClass( "active" );
					
				}
				
				// IE
				if ( isIE && e.target && e.target.__data__ && e.target.__data__.col) {
					current = $j( ".column.col-" + ( e.target.__data__.col - 1 ) );
					$j( ".column.active" ).removeClass( "active" );
					current.addClass( "active" );
					
				}
				
				
				var y = $j( "#" + p.containerID ).scrollTop(),
					found = $j( ".column.active li:last");

				var lis = $j( ".column.active li");
				
				for( var i = 0; i < lis.length; i++ ) {
					
					var top = +lis.eq( i ).attr( "data-top" );
					
					if ( top >= y  ) {//+ p.view.padding * 2 ) {
					
						found = lis.eq( i );
						break;	
						
					}
					
				}			
				
				if ( found ) {
					
					var prev = d3.select( ".paragraph.active" )
					
					found = d3.select( "#" + found.attr("id") );
					
					d3.selectAll( ".paragraph.active" ).classed( "active", false );
					found.classed( "active", true );
					
					if ( ! prev.empty()  && found.attr( "id" ) != prev.attr( "id" ) ) {

						d3.select( "#time_indicator")
							.style( "top", found.datum().top + "px" )
							.style( "display", "block" )
						.select( ".time" )
							.html( found.datum().timestamp.getFullYear() + "/" + ( found.datum().timestamp.getMonth() + 1 ) + "/" + found.datum().timestamp.getDate() + " " + found.datum().timestamp.getHours() + ":" + found.datum().timestamp.getMinutes() );
							
						updateViewer( found );
						
					} 
					
				}	
				
			},
			
			mousewheel: function() {
	
				$j( "#vis" ).trigger( "mousemove" );
			
			} 
			
		}
		
	};
	
	p.scale.timeToPx = d3.scale.linear()
		.domain( [ d3.min( dataset, function(d) { return d.revision_timestamp; } ), d3.max( dataset, function(d) { return d.revision_timestamp; } ) ] )
		.range( [0, p.view.height ] ) ;
		
	p.scale.pxToTime = d3.scale.linear()
		.domain( [0, p.view.height ] )
		.range( [ d3.min( dataset, function(d) { return d.revision_timestamp; } ), d3.max( dataset, function(d) { return d.revision_timestamp; } ) ] ) ;
	
	var ul = p.container.append("ul").attr( "id", "vis" )
	
	 /* DEBUG
			.on( "click", function() { 
			
				d = d3.select(".active .active").datum()
			
				var obj = dataset.filter( function(ds) { return ds.revision_id == d.revision; } )[ 0 ];
				
				obj[ "p" + d.col ] = ""; 
				
				console.log ( "ok" );
				
				d3.select( ".active .active" ).style( "background", "blue" );
			
			} );
	*/		
	

	$j( "#vis" ).bind( "mousemove", behaviours.vis.mousemove );
	
	// IE
	//$j( "#viewer_container" ).bind( "mousemove", behaviours.vis.mousemove );
	
	d3.select( "#" + p.containerID )
		.on( "mousewheel", behaviours.vis.mousewheel)
		.on( "DOMMouseScroll", behaviours.vis.mousewheel ) // Firefox;
	
	
	var li = ul.selectAll( "li" )
		.data( paragraphs )
	.enter()
		.append( "li" )
		.attr( "class", function( d, i ) {
		
			return "column col-" + i;	
			
		})
		.attr( "data-column", function( d, i ) {
			
			return i;
			
		} )
		.style( "width", function() {
			
			return 100 / paragraphs.length + "%";
			
		})
	
	
	li.each( function(d,i) {
		
		d3.select( this ).append( "ul" )
			.selectAll( "li" )
			.data( d.data )
		.enter()
			.append( "li" )
			.attr( "id", function( d) {
				
				return "paragraph-" + d.revision + "-" + d.row + "-" + d.col;
				
			} )
			.attr( "class", function( d) {
				
				return "paragraph row-" + d.row + " col-" + d.col;
				
			} )		
			.html( function(d) {
				
				return d.content 
				
			} )		
			.style( "position", "absolute" )
			.style( "top", function( d, i ) {
				
				d.top = p.scale.timeToPx( d.timestamp ) + p.view.padding;
				
				return d.top + "px";
					
				
			} )
			.attr( "data-top", function( d, i ) {
				
				return Math.floor( p.scale.timeToPx( d.timestamp ) );
					
				
			} )

	} )	
	
			
	
}

function updateViewer( element ) {
	
	function storePositions( prefix ) {
		
		if ( prefix === undefined ) {
			
			prefix = "";
			
		}
		
		$j( p.viewerID + " span" ).each( function(d) {
			
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
	
			d3.select( "#" + p.viewerID ).html( "" ).selectAll("span")	
				.data( diffs[0], function(d) { return d.id; } )
			.enter()
				.append("span")
				.html( function(d) {
			
				return d.text + " ";
				
			})
			
			doUpdate( diffs[1] );
			
		} else {
			
			d3.select( "#" + p.viewerID ).html( d.content );
			
		}

	}
	
	function doUpdate( data ) {
		
		var output = d3.select( "#" + p.viewerID );
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