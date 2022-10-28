(
	function( $ ) {
		'use strict';

		$.fn.SubwalletSwiper = function( options ) {
			var defaults = {};
			var settings = $.extend( {}, defaults, options );

			var $swiper;

			this.each( function() {
				var $slider = $( this );
				var $sliderInner = $slider.children( '.swiper-inner' ).first();
				var sliderSettings = $slider.data();

				var $sliderContainer      = $sliderInner.children( '.swiper-container' ).first(),
				    itemsDesktop          = parseItemValue( sliderSettings.itemsDesktop, 1 ), // Slides Per View.
				    itemsWideScreen       = parseItemValue( sliderSettings.itemsWideScreen, itemsDesktop ),
				    itemsLaptop           = parseItemValue( sliderSettings.itemsLaptop, itemsDesktop ),
				    itemsTabletExtra      = parseItemValue( sliderSettings.itemsTabletExtra, itemsLaptop ),
				    itemsTablet           = parseItemValue( sliderSettings.itemsTablet, itemsTabletExtra ),
				    itemsMobileExtra      = parseItemValue( sliderSettings.itemsMobileExtra, itemsTablet ),
				    itemsMobile           = parseItemValue( sliderSettings.itemsMobile, itemsMobileExtra ),
				    itemsGroupDesktop     = parseItemGroupValue( sliderSettings.itemsGroupDesktop, itemsDesktop, itemsDesktop ), // Slides Per Group, Default same as Slides Per View.
				    itemsGroupWideScreen  = parseItemGroupValue( sliderSettings.itemsGroupWideScreen, itemsGroupDesktop, itemsWideScreen ),
				    itemsGroupLaptop      = parseItemGroupValue( sliderSettings.itemsGroupLaptop, itemsGroupDesktop, itemsLaptop ),
				    itemsGroupTabletExtra = parseItemGroupValue( sliderSettings.itemsGroupTabletExtra, itemsGroupLaptop, itemsTabletExtra ),
				    itemsGroupTablet      = parseItemGroupValue( sliderSettings.itemsGroupTablet, itemsGroupTabletExtra, itemsTablet ),
				    itemsGroupMobileExtra = parseItemGroupValue( sliderSettings.itemsGroupMobileExtra, itemsGroupTablet, itemsMobileExtra ),
				    itemsGroupMobile      = parseItemGroupValue( sliderSettings.itemsGroupMobile, itemsGroupMobileExtra, itemsMobile ),
				    gutterDesktop         = parseNumberValue( sliderSettings.gutterDesktop, 0 ), // Distance between slides.
				    gutterWideScreen      = parseNumberValue( sliderSettings.gutterWideScreen, gutterDesktop ),
				    gutterLaptop          = parseNumberValue( sliderSettings.gutterLaptop, gutterDesktop ),
				    gutterTabletExtra     = parseNumberValue( sliderSettings.gutterTabletExtra, gutterLaptop ),
				    gutterTablet          = parseNumberValue( sliderSettings.gutterTablet, gutterTabletExtra ),
				    gutterMobileExtra     = parseNumberValue( sliderSettings.gutterMobileExtra, gutterTablet ),
				    gutterMobile          = parseNumberValue( sliderSettings.gutterMobile, gutterMobileExtra ),
				    speed                 = parseNumberValue( sliderSettings.speed, 500 );

				var swiperOptions = $.extend( {}, {
					init: false,
					watchSlidesVisibility: true,
					slidesPerView: itemsMobile,
					slidesPerGroup: itemsGroupMobile,
					spaceBetween: gutterMobile,
					resizeObserver: true,
					breakpoints: {
						// when window width is >=
						361: {
							slidesPerView: itemsMobileExtra,
							slidesPerGroup: itemsGroupMobileExtra,
							spaceBetween: gutterMobileExtra
						},
						576: {
							slidesPerView: itemsTablet,
							slidesPerGroup: itemsGroupTablet,
							spaceBetween: gutterTablet
						},
						768: {
							slidesPerView: itemsTabletExtra,
							slidesPerGroup: itemsGroupTabletExtra,
							spaceBetween: gutterTabletExtra
						},
						992: {
							slidesPerView: itemsLaptop,
							slidesPerGroup: itemsGroupLaptop,
							spaceBetween: gutterLaptop
						},
						1200: {
							slidesPerView: itemsDesktop,
							slidesPerGroup: itemsGroupDesktop,
							spaceBetween: gutterDesktop
						},
						1600: {
							slidesPerView: itemsWideScreen,
							slidesPerGroup: itemsGroupWideScreen,
							spaceBetween: gutterWideScreen
						}
					}
				}, settings );

				swiperOptions.watchOverflow = true;

				if ( sliderSettings.slideColumns ) {
					swiperOptions.slidesPerColumn = sliderSettings.slideColumns;
				}

				if ( sliderSettings.initialSlide ) {
					swiperOptions.initialSlide = sliderSettings.initialSlide;
				}

				if ( sliderSettings.autoHeight ) {
					swiperOptions.autoHeight = true;
				}

				if ( typeof sliderSettings.simulateTouch !== 'undefined' && ! sliderSettings.simulateTouch ) {
					swiperOptions.simulateTouch = false;
				}

				if ( speed ) {
					swiperOptions.speed = speed;
				}

				// Maybe: fade, flip
				if ( sliderSettings.effect ) {
					swiperOptions.effect = sliderSettings.effect;

					if ( 'fade' === sliderSettings.effect ) {
						if ( 'custom' === sliderSettings.fadeEffect ) {
							swiperOptions.fadeEffect = {
								crossFade: false
							};
						} else {
							swiperOptions.fadeEffect = {
								crossFade: true
							};
						}
					}
				}

				if ( sliderSettings.loop ) {
					swiperOptions.loop = true;

					if ( sliderSettings.loopedSlides ) {
						swiperOptions.loopedSlides = sliderSettings.loopedSlides;
					}
				}

				if ( sliderSettings.centered ) {
					swiperOptions.centeredSlides = true;
				}

				if ( sliderSettings.autoplay ) {
					swiperOptions.autoplay = {
						delay: sliderSettings.autoplay,
						disableOnInteraction: false
					};

					if ( sliderSettings.autoplayReverseDirection ) {
						swiperOptions.autoplay.reverseDirection = true;
					}
				}

				if ( sliderSettings.freeMode ) {
					swiperOptions.freeMode = true;
				}

				var $wrapControls;

				if ( sliderSettings.wrapControls ) {
					var $wrapControlsWrap = $( '<div class="swiper-controls-wrap"></div>' );
					$wrapControls = $( '<div class="swiper-controls"></div>' );

					$wrapControlsWrap.append( $wrapControls );
					$slider.append( $wrapControlsWrap );
				}

				if ( sliderSettings.nav ) {

					if ( sliderSettings.customNav && sliderSettings.customNav !== '' ) {
						var $customBtn = $( '#' + sliderSettings.customNav );
						var $fractionWrapper = $( '.pagination-wrapper', $customBtn );
						var $swiperPrev = $customBtn.find( '.slider-prev-btn' );
						var $swiperNext = $customBtn.find( '.slider-next-btn' );

						if ( $customBtn.hasClass( 'style-02' ) ) {
							swiperOptions.pagination = {
								el: $fractionWrapper,
								type: 'custom',
								clickable: true
							};

							swiperOptions.pagination.renderCustom = function( swiper, current, total ) {
								// Convert to string.
								var currentStr = current.toString();
								var totalStr = total.toString();

								return '<div class="fraction"><div class="text">' + $customBtn.data( 'text' ) + '</div><div class="current">' + currentStr + '</div><div class="separator">/</div><div class="total">' + totalStr + '</div></div>';
							};
						} else if ( $customBtn.hasClass( 'style-03' ) || $customBtn.hasClass( 'style-04' ) ) {
							swiperOptions.pagination = {
								el: $fractionWrapper,
								type: 'bullets',
								clickable: true
							};

							swiperOptions.pagination.renderBullet = function( index, className ) {
								return '<span class="' + className + '"></span>';
							};
						}

					} else {
						var $swiperPrev = $( '<div class="swiper-nav-button swiper-button-prev"><i class="nav-button-icon"></i><span class="nav-button-text"></span></div>' );
						var $swiperNext = $( '<div class="swiper-nav-button swiper-button-next"><i class="nav-button-icon"></i><span class="nav-button-text"></span></div>' );

						if ( '03' === sliderSettings.navStyle ) {
							var $arrowRightSvg = '<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 8L21.2222 8" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.7773 1L22.7773 8L15.7773 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
							var $arrowLeftSvg = '<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 8L2.77778 8" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.22266 1L1.22266 8L8.22266 15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
							$swiperPrev = $( '<div class="swiper-nav-button swiper-button-prev">' + $arrowLeftSvg + '</div>' );
							$swiperNext = $( '<div class="swiper-nav-button swiper-button-next">' + $arrowRightSvg + '</div>' );
						}

						var $swiperNavButtons = $( '<div class="swiper-nav-buttons"></div>' );
						$swiperNavButtons.append( $swiperPrev ).append( $swiperNext );

						var $swiperNavButtonsWrap = $( '<div class="swiper-nav-buttons-wrap"></div>' );

						if ( 'grid' == sliderSettings.navAlignedBy ) {
							$swiperNavButtonsWrap.append( '<div class="container"><div class="row"><div class="col-sm-12"></div></div></div>' );
							$swiperNavButtonsWrap.find( '.col-sm-12' ).append( $swiperNavButtons );
						} else {
							$swiperNavButtonsWrap.append( $swiperNavButtons );
						}

						if ( $wrapControls ) {
							$wrapControls.append( $swiperNavButtonsWrap );
						} else {
							$sliderInner.append( $swiperNavButtonsWrap );
						}
					}

					swiperOptions.navigation = {
						nextEl: $swiperNext,
						prevEl: $swiperPrev
					};
				}

				if ( sliderSettings.pagination ) {
					var $swiperPaginationWrap = $( '<div class="swiper-pagination-wrap"><div class="swiper-pagination-inner"></div></div>' );
					var $swiperPagination = $( '<div class="swiper-pagination"></div>' );

					$swiperPaginationWrap.find( '.swiper-pagination-inner' ).append( $swiperPagination );

					var $swiperPaginationContainerWrap = $( '<div class="swiper-pagination-container"></div>' );

					if ( 'grid' == sliderSettings.paginationAlignedBy ) {
						$swiperPaginationContainerWrap.append( '<div class="container"><div class="row"><div class="col-sm-12"></div></div></div>' );
						$swiperPaginationContainerWrap.find( '.col-sm-12' ).append( $swiperPaginationWrap );
					} else {
						$swiperPaginationContainerWrap.append( $swiperPaginationWrap );
					}

					if ( $wrapControls ) {
						$wrapControls.append( $swiperPaginationContainerWrap );
					} else {
						$slider.append( $swiperPaginationContainerWrap );
					}

					var paginationType = 'bullets';

					if ( sliderSettings.paginationType ) {
						paginationType = sliderSettings.paginationType;
					}

					swiperOptions.pagination = {
						el: $swiperPagination,
						type: paginationType,
						clickable: true
					};

					if ( sliderSettings.paginationDynamicBullets ) {
						swiperOptions.pagination.dynamicBullets = true;
					}

					if ( $slider.hasClass( 'pagination-style-04' ) ) {
						var $swiperAltArrows = $( '<div class="swiper-alt-arrow-button swiper-alt-arrow-prev" data-action="prev"></div><div class="swiper-alt-arrow-button swiper-alt-arrow-next" data-action="next"></div>' );

						$swiperPaginationWrap.find( '.swiper-pagination-inner' ).append( $swiperAltArrows );

						swiperOptions.pagination.renderCustom = function( swiper, current, total ) {
							// Convert to string.
							var currentStr = current.toString();
							var totalStr = total.toString();

							return '<div class="fraction"><div class="text">' + sliderSettings.paginationText + '</div><div class="current">' + currentStr + '</div><div class="separator">/</div><div class="total">' + totalStr + '</div></div>';
						};
					} else if ( $slider.hasClass( 'pagination-style-03' ) ) {
						swiperOptions.pagination.renderCustom = function( swiper, current, total ) {
							// Convert to string.
							var currentStr = current.toString();
							var totalStr = total.toString();

							// Add leading 0.
							currentStr = currentStr.padStart( 2, '0' );
							totalStr = totalStr.padStart( 2, '0' );

							return '<div class="fraction"><div class="current">' + currentStr + '</div><div class="separator"></div><div class="total">' + totalStr + '</div></div>';
						};
					} else if ( $slider.hasClass( 'pagination-style-06' ) ) {
						swiperOptions.pagination.renderCustom = function( swiper, current, total ) {
							// Convert to string.
							var currentStr = current.toString();
							var totalStr = total.toString();

							// Add leading 0.
							currentStr = currentStr.padStart( 2, '0' );
							totalStr = totalStr.padStart( 2, '0' );

							return '<div class="fraction"><div class="current">' + current + '<div class="separator">/</div></div><div class="total">' + total + '</div></div>';
						};
					} else if ( $slider.hasClass( 'pagination-style-07' ) ) {
						swiperOptions.pagination.renderBullet = function( index, className ) {
							// Convert to string.
							var indexStr = (
								index + 1
							).toString();

							// Add leading 0.
							indexStr = indexStr.padStart( 2, '0' );

							return '<span class="' + className + '">' + indexStr + '<span class="dot">.</span></span>';
						};
					} else if ( $slider.hasClass( 'pagination-style-08' ) ) {
						var $swiperAltArrows = $( '<div class="swiper-alt-arrow-button swiper-alt-arrow-prev" data-action="prev"></div><div class="swiper-alt-arrow-button swiper-alt-arrow-next" data-action="next"></div>' );

						$swiperPaginationWrap.find( '.swiper-pagination-inner' ).append( $swiperAltArrows );

						swiperOptions.pagination.renderBullet = function( index, className ) {
							return '<span class="' + className + '"></span>';
						};
					}
				}

				if ( sliderSettings.mousewheel ) {
					swiperOptions.mousewheel = {
						enabled: true
					};
				}

				if ( sliderSettings.vertical ) {
					swiperOptions.direction = 'vertical';
				}

				if ( sliderSettings.slideToClickedSlide ) {
					swiperOptions.slideToClickedSlide = true;
					swiperOptions.touchRatio = 0.2;
				}

				$swiper = new Swiper( $sliderContainer, swiperOptions );

				if ( sliderSettings.layerTransition ) {
					$swiper.on( 'init', function() {
						var slides = $swiper.$wrapperEl.find( '.swiper-slide' );
						/**
						 * index = $swiper.activeIndex;
						 * currentSlide = slides.eq( index );
						 *
						 * Work properly if slides per view is greater than 1
						 */
						var currentSlide = $( slides ).filter( '.swiper-slide-visible' );
						currentSlide.addClass( 'animated' );
					} );

					$swiper.on( 'slideChangeTransitionEnd', function() {
						var slides = $swiper.$wrapperEl.find( '.swiper-slide' );
						/**
						 * index = $swiper.activeIndex;
						 * currentSlide = slides.eq( index );
						 *
						 * Work properly if slides per view is greater than 1
						 */
						var visibleSlides = $( slides ).filter( '.swiper-slide-visible' );
						visibleSlides.addClass( 'animated' );

						slides.removeClass( 'swiper-ken-burn-active' );
						visibleSlides.addClass( 'swiper-ken-burn-active' );
					} );

					$swiper.on( 'slideChangeTransitionStart', function() {
						var slides = $swiper.$wrapperEl.find( '.swiper-slide' );
						slides.removeClass( 'animated' );
					} );
				}

				if ( sliderSettings.vertical && sliderSettings.verticalAutoHeight ) {
					$swiper.on( 'init', function() {
						setSlideHeight( this );
					} );

					$swiper.on( 'transitionEnd', function() {
						setSlideHeight( this );
					} );

					$swiper.on( 'resize', function() {
						setSlideHeight( this );
					} );
				}

				$swiper.on( 'resize', function() {
					var slidesPerView = this.params.slidesPerView;

					$( this.$wrapperEl ).attr( 'data-active-items', slidesPerView );
				} );

				/**
				 * Use beforeInit instead of init to avoid broken slider view auto.
				 * Updated: On some cases Normal per views return "auto" instead of real per view on beforeInit
				 * then we needed init event to avoid broken render.
				 */
				$swiper.on( 'beforeInit', function() {
					var slidesPerView = this.params.slidesPerView;
					$( this.$wrapperEl ).attr( 'data-active-items', slidesPerView );
				} );

				$swiper.on( 'init', function() {
					var slidesPerView = this.params.slidesPerView;
					$( this.$wrapperEl ).attr( 'data-active-items', slidesPerView );

					var slides = $swiper.$wrapperEl.find( '.swiper-slide' );
					var visibleSlide = $( slides ).filter( '.swiper-slide-visible' );
					visibleSlide.addClass( 'subwallet-slide-active' );
				} );

				$swiper.on( 'slideChangeTransitionEnd', function() {
					var slides = $swiper.$wrapperEl.find( '.swiper-slide' );
					var visibleSlide = $( slides ).filter( '.swiper-slide-visible' );
					visibleSlide.addClass( 'subwallet-slide-active' );
				} );

				$swiper.on( 'slideChangeTransitionStart', function() {
					var slides = $swiper.$wrapperEl.find( '.swiper-slide' );
					slides.removeClass( 'subwallet-slide-active' );
				} );

				// If lazy load + retina enable.
				if ( $.fn.laziestloader ) {
					$slider.waypoint( function() {
						var _self = this.element ? this.element : this;
						var $self = $( _self );
						var llImages = $self.find( '.ll-image' );

						if ( llImages.length > 0 ) {
							llImages.laziestloader( {}, function() {
								$( this ).unwrap( '.subwallet-lazy-image' );
							} ).trigger( 'laziestloader' );
						}

						this.destroy(); // trigger once.
					}, {
						offset: '90%'
					} );
				}

				/**
				 * Center Mode Handler
				 */
				if ( sliderSettings.centeredHightlight && 'scale' === sliderSettings.centeredHightlight ) {
					$swiper.on( 'beforeInit resize', function() {
						setSlideHeightCenterMode( this );
					} );
				}

				$swiper.init();

				if ( $slider.hasClass( 'pagination-style-04' ) || $slider.hasClass( 'pagination-style-08' ) ) {
					$slider.on( 'click', '.swiper-alt-arrow-button', function() {
						var action = $( this ).data( 'action' );

						switch ( action ) {
							case 'prev' :
								$swiper.slidePrev();
								break;
							case 'next' :
								$swiper.slideNext();
								break;
						}
					} );
				}

				$( document ).trigger( 'SubwalletSwiperInit', [ $swiper, $slider, swiperOptions ] );
			} );

			return $swiper;
		};

		function parseNumberValue( setting = '', defaultValue = '' ) {
			if ( undefined === setting || '' === setting || isNaN( setting ) ) {
				return defaultValue;
			}

			return parseInt( setting );
		}

		function parseItemValue( setting = '', defaultValue = '' ) {
			if ( undefined === setting || '' === setting ) {
				return defaultValue;
			}

			// Normalize slide per view, reset fake view to exist view.
			if ( 'auto-fixed' === setting ) {
				return 'auto';
			}

			return setting;
		}

		function parseItemGroupValue( setting = '', inherit, itemsPerView ) {
			if ( 'auto' === itemsPerView ) {
				return 1;
			}

			if ( 'auto' === inherit ) {
				inherit = 1;
			} else if ( 'inherit' === inherit || parseInt( inherit ) > parseInt( itemsPerView ) ) {
				inherit = itemsPerView;
			}

			if ( undefined === setting || '' === setting ) {
				return inherit || 1;
			} else if ( 'inherit' === setting ) {
				return itemsPerView || 1;
			}

			return parseInt( setting );
		}

		function setSlideHeight( that ) {
			var slides = that.$wrapperEl.find( '.swiper-slide' );
			slides.css( { height: 'auto' } );
			var currentSlide = that.activeIndex;
			var itemHeight = $( that.slides[ currentSlide ] ).height();

			var slidesPerView = that.params.slidesPerView;
			var spaceBetween = that.params.spaceBetween;
			var wrapperHeight = slidesPerView * itemHeight + (
				slidesPerView - 1
			) * spaceBetween;

			$( that.$el ).height( wrapperHeight );
			$( that.$wrapperEl ).find( '.swiper-slide' ).height( itemHeight );

			that.update();
		}

		function setSlideHeightCenterMode( that ) {
			var slides = that.$wrapperEl.find( '.swiper-slide' ).each( function() {
				var $thisSlide = $( this );
				$thisSlide.css( '--placeholder-height', $thisSlide.children().height() + 'px' );
			} );
		}

		// Get total slides.
		function getTotalSlides( swiper ) {
			var slidesLength = swiper.slides.length;
			var total = swiper.params.loop ? Math.ceil( (
				                                            slidesLength - (
					                                            swiper.loopedSlides * 2
				                                            )
			                                            ) / swiper.params.slidesPerGroup ) : swiper.snapGrid.length;

			return total;
		}

		// Get current index.
		function getCurrentIndex( swiper ) {
			var slidesLength = swiper.slides.length;
			var total = getTotalSlides( swiper );
			var current;

			if ( swiper.params.loop ) {
				current = Math.ceil( (
					                     swiper.activeIndex - swiper.loopedSlides
				                     ) / swiper.params.slidesPerGroup );
				if ( current > slidesLength - 1 - (
					swiper.loopedSlides * 2
				) ) {
					current -= (
						slidesLength - (
							swiper.loopedSlides * 2
						)
					);
				}
				if ( current > total - 1 ) {
					current -= total;
				}
				if ( current < 0 && swiper.params.paginationType !== 'bullets' ) {
					current = total + current;
				}
			} else if ( typeof swiper.snapIndex !== 'undefined' ) {
				current = swiper.snapIndex;
			} else {
				current = swiper.activeIndex || 0;
			}

			return current;
		}

	}( jQuery )
);
