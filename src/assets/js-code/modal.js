(
	function( $ ) {
		'use strict';

		var DotInsightsModal = function( $el, options ) {
			this.$el = $el;
			this.ACTIVE_CLASS = 'open';
			this.initialized = false;
			this.defaults = {
				perfectScrollbar: true
			};
			this.settings = $.extend( {}, this.defaults, options );

			// jQuery methods.
			this.triggerMethod = ( method, options ) => {
				if ( typeof this[ method ] === 'function' ) {
					this[ method ]( options );
				}
			};

			this.setOptions = function( options ) {
				options = options || {};

				this.settings = $.extend( {}, this.settings, options );
			};

			this.getOptions = function() {
				return this.settings;
			};

			this.update = function( options ) {
				this.setOptions( options );
			};

			this.setHeight = function( newHeight ) {
				this.$el.find( '.modal-content-wrap' ).height( newHeight );
			};

			this.init = function() {
				var plugin = this;

				if ( false === plugin.initialized ) {
					$el.on( 'click', '.modal-overlay, .button-close-modal', function( e ) {
						e.preventDefault();
						e.stopPropagation();

						plugin.close();
					} );

					$( document.body ).on( 'keyup', function( e ) {
						// Esc button
						if ( e.keyCode === 27 ) {
							plugin.close();
						}
					} );

					plugin.initialized = true;
					$( document.body ).trigger( 'DotInsightsModalInit', [ $el ] );
				}
			};

			this.open = function() {
				var plugin = this;

				$( '.dotinsights-modal' ).removeClass( plugin.ACTIVE_CLASS );

				plugin.init();

				$el.addClass( plugin.ACTIVE_CLASS );

				window.DotInsights.Helpers.setBodyOverflow();

				if ( this.settings.perfectScrollbar && $.fn.perfectScrollbar && ! window.DotInsights.Helpers.isHandheld() ) {
					$el.find( '.modal-content-wrap' ).perfectScrollbar();
				}

				$( document.body ).trigger( 'DotInsightsModalOpen', [ $el ] );
				$el.trigger( 'DotInsightsModalOpen' );
			};

			this.close = function() {
				var plugin = this;

				plugin.init();

				$el.removeClass( plugin.ACTIVE_CLASS );

				window.DotInsights.Helpers.unsetBodyOverflow();

				$( document.body ).trigger( 'DotInsightsModalClose', [ $el ] );
				$el.trigger( 'DotInsightsModalClose' );
			};

			this.init();
		};

		const namespace = 'DotInsightsModal';

		$.fn.extend( {
			DotInsightsModal: function( args, update ) {
				// Check if selected element exist.
				if ( ! this.length ) {
					return this;
				}

				// We need to return options.
				if ( args === 'options' ) {
					return $.data( this.get( 0 ), namespace ).getOptions();
				}

				return this.each( function() {
					var $el = $( this );

					let instance = $.data( this, namespace );

					if ( instance ) { // Already created then trigger method.
						instance.triggerMethod( args, update );
					} else { // Create new instance.
						instance = new DotInsightsModal( $el, args );
						$.data( this, namespace, instance );
					}
				} );
			}
		} );
	}( jQuery )
);
