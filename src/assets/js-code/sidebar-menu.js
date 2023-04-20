(
	function ( $ ) {
		'use strict';

		if ( window.innerWidth < 1100 ) {
			$( '#btn-open-panel' ).css( 'top', $( '#header' ).outerHeight() );
		}

		// Cache selectors
		var lastId,
			topMenu = $( "#panel" ),
			header = $( "#header" ),
			topMenuHeight = header.outerHeight() + 15, // All list items
			menuItems = topMenu.find( "a" ), // Anchors corresponding to menu items
			scrollItems = menuItems.map( function () {
				var item = $( $( this ).attr( "href" ) );
				if ( item.length ) {
					return item;
				}
			} );

		// Bind click handler to menu items
		// so we can get a fancy scroll animation
		menuItems.click( function ( e ) {
			var href = $( this ).attr( "href" ),
				offsetTop = href === "#" ? 0 : $( href ).offset().top - topMenuHeight + 1;
			$( 'html, body' ).stop().animate( {
				                                  scrollTop: offsetTop
			                                  }, 300 );
			e.preventDefault();
		} );

		// Bind to scroll
		$( window ).scroll( function () {
			// Get container scroll position
			var fromTop = $( this ).scrollTop() + topMenuHeight;

			// Get id of current scroll item
			var cur = scrollItems.map( function () {
				if ( $( this ).offset().top < fromTop ) {
					return this;
				}
			} );
			// Get the id of the current element
			cur = cur[cur.length - 1];
			var id = cur && cur.length ? cur[0].id : "";

			if ( lastId !== id ) {
				lastId = id;
				// Set/remove active class
				menuItems.parent().removeClass( "active" );

				var $activeLink = menuItems.filter( "[href='#" + id + "']" );

				$activeLink.parent().addClass( "active" );
				if ( window.innerWidth < 1100 ) {
					$( '#btn-open-panel' ).find( '.btn-open-panel--text' ).text( $activeLink.text() );
				}
			}
		} );
	}( jQuery )
);
