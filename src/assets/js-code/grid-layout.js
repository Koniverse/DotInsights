(
	function( $ ) {
		'use strict';

		if ( typeof Isotope != 'undefined' ) {
			// Add isotope-hidden class for filtered items.
			var itemReveal = Isotope.Item.prototype.reveal,
			    itemHide   = Isotope.Item.prototype.hide;

			Isotope.Item.prototype.reveal = function() {
				itemReveal.apply( this, arguments );
				$( this.element ).removeClass( 'isotope-hidden' );
			};

			Isotope.Item.prototype.hide = function() {
				itemHide.apply( this, arguments );
				$( this.element ).addClass( 'isotope-hidden' );
			};
		}

		var SubwalletGridPlugin = function( $el, options ) {
			this.$el = $el;
			var $grid = $el.find( '.subwallet-grid' );

			var disableColumnChange = false;
			var activeColumns            = 1,
			    activeGutter             = 0,
			    activeZigzagHeight       = 0,
			    activeAlternatingColumns = 0; // 0 to Disable, 1 to Enable, -1 to Enable & Reversed.

			this._isotopeOptions = {
				itemSelector: '.grid-item',
				percentPosition: true,
				transitionDuration: 0,
				packery: {
					columnWidth: '.grid-sizer',
				},
				fitRows: {
					gutter: 10
				}
			};

			// jQuery methods.
			this.triggerMethod = function( method, options ) {
				if ( typeof this[ method ] === 'function' ) {
					this[ method ]( options );
				}
			};

			this.init = function() {
				var plugin = this;
				var resizeTimer;

				var settings = $el.data( 'grid' );

				if ( $grid.length > 0 && settings && typeof settings.type !== 'undefined' ) {
					if ( 'masonry' === settings.type || 'metro' === settings.type ) {
						plugin._isotopeOptions.layoutMode = 'packery';
					} else {
						plugin._isotopeOptions.layoutMode = 'fitRows';
					}

					if ( $.fn.imagesLoaded ) {
						$grid.imagesLoaded( function() {
							plugin.calculateMasonrySize();
						} );
					} else {
						plugin.calculateMasonrySize();
					}

					var lazyLoadTimer;
					if ( $.fn.laziestloader ) {
						var llImages = $grid.find( '.ll-image' );

						// Re cal layout one time when all lazy images in view loaded.
						llImages.on( 'loaded', function( evt ) {
							clearTimeout( lazyLoadTimer );
							lazyLoadTimer = setTimeout( function() {
								// Run code here, resizing has "stopped"
								plugin.calculateMasonrySize();
							}, 100 );
						} );
					}

					$grid.one( 'arrangeComplete', function() {
						plugin.handlerEntranceAnimation();
					} );

					$( window ).on( 'resize', function() {
						plugin.calculateMasonrySize();

						// Sometimes layout can be overlap. then re-cal layout one time.
						clearTimeout( resizeTimer );
						resizeTimer = setTimeout( function() {
							// Run code here, resizing has "stopped"
							plugin.calculateMasonrySize();
						}, 500 ); // DO NOT decrease the time. Sometime, It'll make layout overlay on resize.
					} );
				} else {
					$grid.addClass( 'loaded' );
					plugin.handlerEntranceAnimation();
				}

				$el.on( 'SubwalletQueryEnd', function( event, el, $items ) {
					plugin.update( $items );
				} );
			};

			this.update = function( $items ) {
				var plugin = this;
				var settings = $el.data( 'grid' );

				if ( $.fn.laziestloader ) {
					var llImages = $items.find( '.ll-image' );

					if ( llImages.length > 0 ) {
						llImages.laziestloader( {}, function() {
							$( this ).unwrap( '.subwallet-lazy-image' );
						} ).trigger( 'laziestloader' );
					}
				}

				if ( $grid.length > 0 && settings && typeof settings.type !== 'undefined' ) {
					$grid.isotope().append( $items ).isotope( 'reloadItems', $items );

					if ( $.fn.laziestloader ) {
						$items.addClass( 'animate' );
						plugin.calculateMasonrySize();
					} else if ( $.fn.imagesLoaded ) {
						$grid.imagesLoaded().always( function() {
							$items.addClass( 'animate' );
							plugin.calculateMasonrySize();
						} );
					}
				} else {
					$grid.append( $items );
					if ( $.fn.laziestloader ) {
						$items.addClass( 'animate' );
					} else if ( $.fn.imagesLoaded ) {
						$grid.imagesLoaded().always( function() {
							$items.addClass( 'animate' );
						} );
					}
				}
			};

			this.updateLayout = function( options = {} ) {
				var plugin = this;

				plugin.disableColumnChange = true === options.disableColumnChange;

				plugin.calculateMasonrySize( options );
			};

			this.parseNumberValue = function( setting = '', default_value = '' ) {
				if ( undefined === setting || '' === setting || isNaN( setting ) ) {
					return default_value;
				}

				return parseInt( setting );
			};

			this.calculateMasonrySize = function( options = {} ) {
				var plugin = this;

				var windowWidth             = window.innerWidth,
				    gridWidth               = $grid[ 0 ].getBoundingClientRect().width,
				    settings                = $el.data( 'grid' ),
				    gutterDesktop           = this.parseNumberValue( settings.gutter, 0 ),
				    gutterWideScreen        = this.parseNumberValue( settings.gutterWideScreen, gutterDesktop ),
				    gutterLaptop            = this.parseNumberValue( settings.gutterLaptop, gutterDesktop ),
				    gutterTabletExtra       = this.parseNumberValue( settings.gutterTabletExtra, gutterLaptop ),
				    gutterTablet            = this.parseNumberValue( settings.gutterTablet, gutterTabletExtra ),
				    gutterMobileExtra       = this.parseNumberValue( settings.gutterMobileExtra, gutterTablet ),
				    gutterMobile            = this.parseNumberValue( settings.gutterMobile, gutterMobileExtra ),
				    columnsDesktop          = this.parseNumberValue( settings.columns, 1 ),
				    columnsWideScreen       = this.parseNumberValue( settings.columnsWideScreen, columnsDesktop ),
				    columnsLaptop           = this.parseNumberValue( settings.columnsLaptop, columnsDesktop ),
				    columnsTabletExtra      = this.parseNumberValue( settings.columnsTabletExtra, columnsLaptop ),
				    columnsTablet           = this.parseNumberValue( settings.columnsTablet, columnsTabletExtra ),
				    columnsMobileExtra      = this.parseNumberValue( settings.columnsMobileExtra, columnsTablet ),
				    columnsMobile           = this.parseNumberValue( settings.columnsMobile, columnsMobileExtra ),
				    zigzagHeightDesktop     = this.parseNumberValue( settings.zigzagHeight, 0 ),
				    zigzagHeightWideScreen  = this.parseNumberValue( settings.zigzagHeightWideScreen, zigzagHeightDesktop ),
				    zigzagHeightLaptop      = this.parseNumberValue( settings.zigzagHeightLaptop, zigzagHeightDesktop ),
				    zigzagHeightTabletExtra = this.parseNumberValue( settings.zigzagHeightTabletExtra, zigzagHeightLaptop ),
				    zigzagHeightTablet      = this.parseNumberValue( settings.zigzagHeightTablet, zigzagHeightTabletExtra ),
				    zigzagHeightMobileExtra = this.parseNumberValue( settings.zigzagHeightMobileExtra, zigzagHeightTablet ),
				    zigzagHeightMobile      = this.parseNumberValue( settings.zigzagHeightMobile, zigzagHeightMobileExtra ),
				    zigzagReversed          = settings.zigzagReversed !== undefined && settings.zigzagReversed === 1 ? true : false;

				var alternatingColumnWidth       = 0,
				    columnAlternatingDesktop     = this.parseNumberValue( settings.columnAlternating, 0 ),
				    columnAlternatingWideScreen  = this.parseNumberValue( settings.columnAlternatingWideScreen, columnAlternatingDesktop ),
				    columnAlternatingLaptop      = this.parseNumberValue( settings.columnAlternatingLaptop, columnAlternatingDesktop ),
				    columnAlternatingTabletExtra = this.parseNumberValue( settings.columnAlternatingTabletExtra, columnAlternatingLaptop ),
				    columnAlternatingTablet      = this.parseNumberValue( settings.columnAlternatingTablet, columnAlternatingTabletExtra ),
				    columnAlternatingMobileExtra = this.parseNumberValue( settings.columnAlternatingMobileExtra, columnAlternatingTablet ),
				    columnAlternatingMobile      = this.parseNumberValue( settings.columnAlternatingMobile, columnAlternatingMobileExtra );

				var wideScreenBreakPoint = 1600;
				var laptopBreakPoint = 1200;
				var tabletExtraBreakPoint = 992;
				var tabletBreakPoint = 768;
				var mobileExtraBreakPoint = 576;
				var mobileBreakPoint = 360;

				if ( typeof elementorFrontendConfig !== 'undefined' ) {
					var elementorBreakpoints = elementorFrontendConfig.responsive.breakpoints;

					wideScreenBreakPoint = this.parseNumberValue( elementorBreakpoints.widescreen.value, wideScreenBreakPoint );
					laptopBreakPoint = this.parseNumberValue( elementorBreakpoints.laptop.value, laptopBreakPoint );
					tabletExtraBreakPoint = this.parseNumberValue( elementorBreakpoints.tablet_extra.value, tabletExtraBreakPoint );
					tabletBreakPoint = this.parseNumberValue( elementorBreakpoints.tablet.value, tabletBreakPoint );
					mobileExtraBreakPoint = this.parseNumberValue( elementorBreakpoints.mobile_extra.value, mobileBreakPoint );
					mobileBreakPoint = this.parseNumberValue( elementorBreakpoints.mobile.value, mobileBreakPoint );
				}

				var oldActiveColumns = plugin.activeColumns;

				if ( ! plugin.disableColumnChange ) {
					if ( windowWidth >= wideScreenBreakPoint ) { // Use >= Because from up
						plugin.activeColumns = columnsWideScreen;
						plugin.activeGutter = gutterWideScreen;
						plugin.activeZigzagHeight = zigzagHeightWideScreen;
						plugin.activeAlternatingColumns = columnAlternatingWideScreen;
					} else if ( windowWidth > laptopBreakPoint ) {
						plugin.activeColumns = columnsDesktop;
						plugin.activeGutter = gutterDesktop;
						plugin.activeZigzagHeight = zigzagHeightDesktop;
						plugin.activeAlternatingColumns = columnAlternatingDesktop;
					} else if ( windowWidth > tabletExtraBreakPoint ) {
						plugin.activeColumns = columnsLaptop;
						plugin.activeGutter = gutterLaptop;
						plugin.activeZigzagHeight = zigzagHeightLaptop;
						plugin.activeAlternatingColumns = columnAlternatingLaptop;
					} else if ( windowWidth > tabletBreakPoint ) {
						plugin.activeColumns = columnsTabletExtra;
						plugin.activeGutter = gutterTabletExtra;
						plugin.activeZigzagHeight = zigzagHeightTabletExtra;
						plugin.activeAlternatingColumns = columnAlternatingTabletExtra;
					} else if ( windowWidth > mobileExtraBreakPoint ) {
						plugin.activeColumns = columnsTablet;
						plugin.activeGutter = gutterTablet;
						plugin.activeZigzagHeight = zigzagHeightTablet;
						plugin.activeAlternatingColumns = columnAlternatingTablet;
					} else if ( windowWidth > mobileBreakPoint ) {
						plugin.activeColumns = columnsMobileExtra;
						plugin.activeGutter = gutterMobileExtra;
						plugin.activeZigzagHeight = zigzagHeightMobileExtra;
						plugin.activeAlternatingColumns = columnAlternatingMobileExtra;
					} else {
						plugin.activeColumns = columnsMobile;
						plugin.activeGutter = gutterMobile;
						plugin.activeZigzagHeight = zigzagHeightMobile;
						plugin.activeAlternatingColumns = columnAlternatingMobile;
					}
				}

				/**
				 * Override Columns.
				 */
				if ( typeof options.columns !== 'undefined' ) {
					plugin.activeColumns = options.columns;
				}

				if ( oldActiveColumns !== plugin.activeColumns ) {
					$( document.body ).trigger( 'SubwalletGridLayoutColumnsChange', [
						$el,
						oldActiveColumns,
						plugin.activeColumns
					] );
				}

				$el.attr( 'data-active-columns', plugin.activeColumns );

				var totalGutterPerRow = (
					                        plugin.activeColumns - 1
				                        ) * plugin.activeGutter;

				var columnWidth = (
					                  gridWidth - totalGutterPerRow
				                  ) / plugin.activeColumns;

				columnWidth = Math.floor( columnWidth );

				var columnWidth2 = columnWidth;
				if ( plugin.activeColumns > 1 ) {
					columnWidth2 = columnWidth * 2 + plugin.activeGutter;
				}

				/**
				 * Used this css var for layout grid border around
				 */
				$el.css( '--grid-real-width', columnWidth * plugin.activeColumns + 'px' );

				$grid.children( '.grid-sizer' ).css( {
					'width': columnWidth + 'px'
				} );

				var columnHeight   = 0,
				    columnHeight2  = 0, // 200%.
				    columnHeight7  = 0, // 70%.
				    columnHeight13 = 0, // 130%.
				    isMetro        = false,
				    ratioW         = 1,
				    ratioH         = 1;

				if ( settings.ratio ) {
					ratioH = settings.ratio;
					isMetro = true;
				}

				// Calculate item height for only metro type.
				if ( isMetro ) {
					columnHeight = columnWidth * ratioH / ratioW;
					columnHeight = Math.floor( columnHeight );

					if ( plugin.activeColumns > 1 ) {
						columnHeight2 = columnHeight * 2 + plugin.activeGutter;
						columnHeight13 = parseInt( columnHeight * 1.3 );
						columnHeight7 = columnHeight2 - plugin.activeGutter - columnHeight13;
					} else {
						columnHeight2 = columnHeight7 = columnHeight13 = columnHeight;
					}
				}

				var alternatingLoopCount = 0;
				var alternatingReversed = plugin.activeAlternatingColumns < 0 ? true : false;
				var totalAlternatingColumns = alternatingReversed ? plugin.activeColumns - 1 : plugin.activeColumns + 1;
				var totalAlternatingFlowColumns = plugin.activeColumns + totalAlternatingColumns; // Normal columns + alternating columns.
				var isAlternatingColumn = false;

				if ( plugin.activeAlternatingColumns ) {
					if ( alternatingReversed ) {
						alternatingColumnWidth = (
							                         gridWidth - (
								                                     totalAlternatingColumns - 1
							                                     ) * plugin.activeGutter
						                         ) / totalAlternatingColumns;
					} else {
						alternatingColumnWidth = (
							                         gridWidth - plugin.activeColumns * plugin.activeGutter
						                         ) / (
							                         plugin.activeColumns + 1
						                         );
					}

					alternatingColumnWidth = Math.floor( alternatingColumnWidth );
				}

				$grid.children( '.grid-item' ).each( function( index ) {
					var gridItem = $( this );
					alternatingLoopCount ++;

					if ( alternatingLoopCount > plugin.activeColumns ) {
						isAlternatingColumn = true;
					}

					// Zigzag.
					if (
						plugin.activeZigzagHeight > 0 // Has zigzag.
						&& plugin.activeColumns > 1 // More than 1 column.
						&& index + 1 <= plugin.activeColumns // On top items.
					) {
						if ( zigzagReversed === false ) { // Is odd item.
							if ( index % 2 === 0 ) {
								gridItem.css( {
									'marginTop': plugin.activeZigzagHeight + 'px'
								} );
							} else {
								gridItem.css( {
									'marginTop': '0px'
								} );
							}
						} else {
							if ( index % 2 !== 0 ) {
								gridItem.css( {
									'marginTop': plugin.activeZigzagHeight + 'px'
								} );
							} else {
								gridItem.css( {
									'marginTop': '0px'
								} );
							}
						}

					} else {
						gridItem.css( {
							'marginTop': '0px'
						} );
					}

					if ( plugin.activeAlternatingColumns && isAlternatingColumn ) {
						gridItem.css( {
							'width': alternatingColumnWidth + 'px',
							'height': 'auto',
						} );
					} else {
						if ( gridItem.data( 'width' ) === 2 ) {
							gridItem.css( {
								'width': columnWidth2 + 'px',
								'height': 'auto',
							} );
						} else {
							gridItem.css( {
								'width': columnWidth + 'px',
								'height': 'auto',
							} );
						}
					}

					if ( 'grid' === settings.type ) {
						gridItem.css( {
							'marginBottom': plugin.activeGutter + 'px'
						} );
					}

					if ( isMetro ) {
						var $itemHeight;

						if ( gridItem.hasClass( 'grid-item-height' ) ) {
							$itemHeight = gridItem;
						} else {
							$itemHeight = gridItem.find( '.grid-item-height' );
						}

						if ( gridItem.data( 'height' ) === 2 ) {
							$itemHeight.css( {
								'height': columnHeight2 + 'px'
							} );
						} else if ( gridItem.data( 'height' ) === 1.3 ) {
							$itemHeight.css( {
								'height': columnHeight13 + 'px'
							} );
						} else if ( gridItem.data( 'height' ) === 0.7 ) {
							$itemHeight.css( {
								'height': columnHeight7 + 'px'
							} );
						} else {
							$itemHeight.css( {
								'height': columnHeight + 'px'
							} );
						}
					}

					isAlternatingColumn = false;
					if ( alternatingLoopCount % totalAlternatingFlowColumns === 0 ) {
						alternatingLoopCount = 0; // Reset to next alternating row.
					}
				} );

				if ( 'grid' === settings.type ) {
					$grid.children( '.grid-item' ).matchHeight();
				}

				if ( plugin._isotopeOptions ) {
					$grid.addClass( 'loaded' );
					plugin._isotopeOptions.packery.gutter = plugin.activeGutter;
					plugin._isotopeOptions.fitRows.gutter = plugin.activeGutter;
					$grid.isotope( plugin._isotopeOptions );
				}

				/**
				 * Delay 250 to fix layout overlap when toggle columns.
				 */
				setTimeout( function() {
					$grid.isotope( 'layout' );
					if ( $grid.hasClass( 'has-animation' ) ) {
						$grid.children( '.grid-item' ).addClass( 'animate' );
					}

					$el.trigger( 'SubwalletGridLayoutResized' );
				}, 250 );
			};

			this.handlerEntranceAnimation = function() {
				if ( ! $grid.hasClass( 'has-animation' ) ) {
					return;
				}

				// Used find() for flex layout.
				var items = $grid.find( '.grid-item' );

				items.waypoint( function() {
					// Fix for different ver of waypoints plugin.
					var _self = this.element ? this.element : this;
					var $self = $( _self );
					$self.addClass( 'animate' );

					this.destroy(); // trigger once.
				}, {
					offset: '90%'
				} );
			};

			this.init();
		};

		const namespace = 'subwalletGridLayout';

		$.fn.extend( {
			SubwalletGridLayout: function( args, update ) {
				// Check if selected element exist.
				if ( ! this.length ) {
					return this;
				}

				// We need to return options.
				if ( args === 'options' ) {
					return $.data( this.get( 0 ), namespace ).options();
				}

				return this.each( function() {
					var $el = $( this );

					let instance = $.data( this, namespace );

					if ( instance ) { // Already created then trigger method.
						instance.triggerMethod( args, update );
					} else { // Create new instance.
						instance = new SubwalletGridPlugin( $el, args );
						$.data( this, namespace, instance );
					}
				} );
			}
		} );
	}( jQuery )
);
