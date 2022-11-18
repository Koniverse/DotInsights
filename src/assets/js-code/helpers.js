(
	function( window, $ ) {
		'use strict';
		window.dotinsights = window.dotinsights || {};

		var $supports_html5_storage = true;
		try {
			$supports_html5_storage = (
				'sessionStorage' in window && window.sessionStorage !== null
			);
			window.sessionStorage.setItem( 'mg', 'test' );
			window.sessionStorage.removeItem( 'mg' );
			window.localStorage.setItem( 'mg', 'test' );
			window.localStorage.removeItem( 'mg' );
		} catch ( err ) {
			$supports_html5_storage = false;
		}

		dotinsights.StorageUtil = {
			isSupported: $supports_html5_storage,
			set: function( key, value ) {
				var settings = JSON.parse( localStorage.getItem( 'dotinsights' ) );
				settings = settings ? settings : {};

				settings[ key ] = value;

				localStorage.setItem( 'dotinsights', JSON.stringify( settings ) );
			},
			get: function( key, defaults = '' ) {
				var settings = JSON.parse( localStorage.getItem( 'dotinsights' ) );

				if ( settings && settings.hasOwnProperty( key ) ) {
					return settings[ key ];
				}

				return defaults;
			},
		};

		dotinsights.Helpers = {
			getApiEndpointUrl: ( endpoint ) => {
				if ( 'dotinsights.subwallet.app' === window.location.host ) {
					return 'https://dot-insights-api.subwallet.app/api/%%endpoint%%'.replace( '%%endpoint%%', endpoint );
				}

				return 'https://dotinsights-be-test.subwallet.app/api/%%endpoint%%'.replace( '%%endpoint%%', endpoint );
			},

			getScrollbarWidth: () => {
				// Creating invisible container.
				const outer = document.createElement( 'div' );
				outer.style.visibility = 'hidden';
				outer.style.overflow = 'scroll'; // forcing scrollbar to appear.
				outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps.
				document.body.appendChild( outer );

				// Creating inner element and placing it in the container.
				const inner = document.createElement( 'div' );
				outer.appendChild( inner );

				// Calculating difference between container's full width and the child width.
				const scrollbarWidth = (
					outer.offsetWidth - inner.offsetWidth
				);

				// Removing temporary elements from the DOM.
				outer.parentNode.removeChild( outer );

				return scrollbarWidth;
			},

			setBodyOverflow() {
				$( 'body' ).css( {
					'overflow': 'hidden',
					'paddingRight': this.getScrollbarWidth() + 'px'
				} );
			},

			unsetBodyOverflow: () => {
				$( 'body' ).css( {
					'overflow': 'visible',
					'paddingRight': 0
				} );
			},
			setElementHandling: ( $element ) => {
				$element.addClass( 'updating-icon' );
			},

			unsetElementHandling: ( $element ) => {
				$element.removeClass( 'updating-icon' );
			},

			isHandheld: () => {
				let check = false;
				(
					function( a ) {
						if ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test( a ) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( a.substr( 0, 4 ) ) ) {
							check = true;
						}
					}
				)( navigator.userAgent || navigator.vendor || window.opera );
				return check;
			},

			sanitizeSlug: function( key ) {
				if (!key)
					return '';
				key = key.replace( / /g, '-' );
				key = key.replace( /,/g, '' );
				key = key.replace( /&/g, '_' );

				return key.toLowerCase();
			},

			sanitizeKey: function( key, defaultValue = '' ) {
				if ( ! key ) {
					return defaultValue;
				}
				key = key.replace( / /g, '_' );
				key = key.replace( /-/g, '_' );
				key = key.replace( /,/g, '' );
				key = key.replace( /&/g, '_' );

				return key.toLowerCase();
			},

			groupByKey: function( xs, key ) {
				return xs.reduce( function( rv, x ) {
					var _key = '' !== x[ key ] ? x[ key ] : 'uncategorized';

					(
						rv[ _key ] = rv[ _key ] || []
					).push( x );
					return rv;
				}, {} );
			},

			filterByRules: function( rules, array ) {
				var ruleLength = rules.length;

				// Convert search term for operator LIKE.
				for ( var i = 0; i < ruleLength; i ++ ) {
					if ( 'like' === rules[ i ].operator ) {
						rules[ i ].value = rules[ i ].value.toLowerCase();
					}
				}

				return array.filter( function( item ) {
					for ( var i = 0; i < ruleLength; i ++ ) {
						switch ( rules[ i ][ 'operator' ] ) {
							case 'like':
								// Convert both side to lower case to ignore case sensitive.
								if ( ! item[ rules[ i ].key ].toLowerCase().match( rules[ i ].value ) ) {
									return false;
								}
								break;
							case '!':
								if ( item[ rules[ i ].key ] === rules[ i ].value ) {
									return false;
								}
								break;
							default:
								if ( item[ rules[ i ].key ] !== rules[ i ].value ) {
									return false;
								}
								break;
						}
					}

					return true;
				} );
			}

		};

		dotinsights.NumberUtil = {
			formatWithCommas: function( x ) {
				return x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, "," );
			},
			formatMoney: function( value ) {
				// Nine Zeroes for Billions.
				return Math.abs( Number( value ) ) >= 1.0e+9

					? Math.abs( Number( value ) ) / 1.0e+9 + "B"
					// Six Zeroes for Millions.
					: Math.abs( Number( value ) ) >= 1.0e+6

						? (
							  Math.abs( Number( value ) ) / 1.0e+6
						  ) + "M"
						// Three Zeroes for Thousands.
						: Math.abs( Number( value ) ) >= 1.0e+3

							? Math.abs( Number( value ) ) / 1.0e+3 + "K"

							: Math.abs( Number( value ) );
			},

			getRandomInt: function( min, max ) {
				min = Math.ceil( min );
				max = Math.floor( max );
				return Math.floor( Math.random() * (
					max - min
				) + min ); // The maximum is exclusive and the minimum is inclusive
			},

			precisionRoundMod: function( number, precision ) {
				var factor = Math.pow( 10, precision ),
				    n      = precision < 0 ? number : 0.01 / factor + number;
				return Math.round( n * factor ) / factor;
			},

			checkOverlap: function( R, Xc, Yc, X1, Y1, X2, Y2 ) {

				// Find the nearest point on the
				// rectangle to the center of
				// the circle
				let Xn = Math.max( X1, Math.min( Xc, X2 ) );
				let Yn = Math.max( Y1, Math.min( Yc, Y2 ) );

				// Find the distance between the
				// nearest point and the center
				// of the circle
				// Distance between 2 points,
				// (x1, y1) & (x2, y2) in
				// 2D Euclidean space is
				// ((x1-x2)**2 + (y1-y2)**2)**0.5
				let Dx = Xn - Xc;
				let Dy = Yn - Yc;
				return (
					       Dx * Dx + Dy * Dy
				       ) <= R * R;
			},

			dist: function( x1, y1, x2, y2 ) {
				return Math.hypot( x2 - x1, y2 - y1 );
			},

			/**
			 * Remove thousand separator chars.
			 * @param number
			 * @returns {*}
			 */
			validate( number ) {
				return number.replace( /,(?=[\d,]*\.\d{2}\b)/g, '' );
			}
		};

		dotinsights.StringUtil = {
			rtrim: function( str, char ) {
				return str.replace( new RegExp( char + "*$" ), '' );
			}
		};

		dotinsights.ArrayUtil = {
			dynamicSort: function( property ) {
				var sortOrder = 1;
				if ( property[ 0 ] === "-" ) {
					sortOrder = - 1;
					property = property.substr( 1 );
				}
				return function( a, b ) {
					/* next line works with strings and numbers,
					 * and you may want to customize it to your needs
					 */
					var result = (
						a[ property ] > b[ property ]
					) ? - 1 : (
						a[ property ] < b[ property ]
					) ? 1 : 0;
					return result * sortOrder;
				}
			},

			sortByKey: function( array, key, order = 'DESC' ) {
				switch ( order ) {
					case 'DESC':
						return array.sort( ( a, b ) => b[ key ] - a[ key ] );
					default: // ASC.
						return array.sort( ( a, b ) => a[ key ] - b[ key ] );
				}
			}
		};

		dotinsights.BrowserUtil = {
			isOpera: false,
			isChrome: false,
			isFirefox: false,
			isSafari: false,
			isIE: false,
			isEdge: false,
			isEdgeChromium: false
		};

		const agent = window.navigator.userAgent.toLowerCase();
		switch ( true ) {
			case agent.indexOf( 'edge' ) > - 1:
				dotinsights.BrowserUtil.isEdge = true;
				break;
			case agent.indexOf( 'edg/' ) > - 1:
				dotinsights.BrowserUtil.isEdgeChromium = true;
				break;
			case agent.indexOf( 'opr' ) > - 1 && ! ! window.opr:
				dotinsights.BrowserUtil.isOpera = true;
				break;
			case agent.indexOf( 'chrome' ) > - 1 && ! ! window.chrome:
				dotinsights.BrowserUtil.isChrome = true;
				break;
			case agent.indexOf( 'trident' ) > - 1:
				dotinsights.BrowserUtil.isIE = true;
				break;
			case agent.indexOf( 'firefox' ) > - 1:
				dotinsights.BrowserUtil.isFirefox = true;
				break;
			case agent.indexOf( 'safari' ) > - 1:
				dotinsights.BrowserUtil.isSafari = true;
				break;
		}

    dotinsights.requestUtils = {
			sendPost: async function (url, data) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", url);

          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader("Content-Type", "application/json");

          xhr.onload = () => {
            resolve(JSON.parse(xhr.responseText))
          };

          try {
            xhr.send(JSON.stringify(data));
          } catch (e) {
            console.error(e);
            reject(e);
          }
        })
      }
		};
	}( window, jQuery )
);
