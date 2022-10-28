(
	function( $ ) {
		'use strict';

		window.DotInsights = window.DotInsights || {};
		DotInsights.Projects = DotInsights.Projects || {};
		DotInsights.FilteredProjects = DotInsights.FilteredProjects || {};
		DotInsights.Query = DotInsights.Query || {
			itemsPerPage: 50,
			maxNumPages: 1,
			page: 1,
			foundItems: 0
		};
		DotInsights.Pagination = DotInsights.Pagination || {};
		DotInsights.FilteredProjects = DotInsights.FilteredProjects || {};

		if ( window.innerWidth < 561 ) {
			DotInsights.Pagination.midSize = 2;
		} else {
			DotInsights.Pagination.midSize = 3;
		}

		if ( window.innerWidth < 768 ) {
			DotInsights.Query.itemsPerPage = 10;
		} else {
			DotInsights.Query.itemsPerPage = 50;
		}

		var Helpers = window.DotInsights.Helpers;

		var $searchForm      = $( '#project-form-filter' ),
		    $searchSubmitBtn = $searchForm.find( '.search-submit' ),
		    searchDelay      = 700,
		    searching        = null,
		    $projectTable    = $( '#most-loved-projects-table tbody' ),
		    $pagination      = $( '#most-loved-projects-pagination' );

		$( document.body ).on( 'DotInsights/EcosystemMap/Data', function( evt, data ) {
			/**
			 * Fake likes count for testing:
			 * @todo Remove on production
			 */
			for ( var i = 0; i < data.length; i ++ ) {
				data[ i ].totalLikes = DotInsights.NumberUtil.getRandomInt( 1000, 4000 ); // Fake like count;
			}

			// Sort by total likes.
			data.sort( DotInsights.ArrayUtil.dynamicSort( 'totalLikes' ) );

			// Add rank for project after total likes sorted.
			for ( var i = 0; i < data.length; i ++ ) {
				data[ i ].rank = i + 1;
			}
		} );

		$( document.body ).on( 'DotInsights/EcosystemMap/Loaded', function() {
			DotInsights.FilteredProjects = DotInsights.Projects;
			var foundItems = DotInsights.FilteredProjects.length;

			DotInsights.Query.page = 1;
			DotInsights.Query.foundItems = foundItems;
			DotInsights.Query.maxNumPages = DotInsights.Query.itemsPerPage > 0 ? Math.ceil( foundItems / DotInsights.Query.itemsPerPage ) : 1;

			buildTable();
			buildPagination();
		} );

		$searchForm.on( 'keyup', '.search-field', function() {
			clearTimeout( searching );
			searching = setTimeout( function() {
				$searchSubmitBtn.addClass( 'updating-icon' );

				setTimeout( function() {
					$searchSubmitBtn.removeClass( 'updating-icon' );
					$( document.body ).trigger( 'DotInsights/EcosystemMap/Searching' );
				}, 300 )
			}, searchDelay );
		} );

		$searchForm.on( 'submit', function( evt ) {
			clearTimeout( searching );
			searching = setTimeout( function() {
				$( document.body ).trigger( 'DotInsights/EcosystemMap/Searching' );
			}, searchDelay );

			return false;
		} );

		$( document.body ).on( 'DotInsights/EcosystemMap/Searching', function( evt ) {
			var searchTerm = $searchForm.find( 'input[name="s"]' ).val();

			var rules = [];

			if ( '' !== searchTerm ) {
				rules.push( {
					key: 'project',
					value: searchTerm,
					operator: 'like'
				} );
			}

			DotInsights.FilteredProjects = rules.length > 0 ? Helpers.filterByRules( rules, DotInsights.Projects ) : DotInsights.Projects;
			var foundItems = DotInsights.FilteredProjects.length;

			DotInsights.Query.page = 1;
			DotInsights.Query.foundItems = foundItems;
			DotInsights.Query.maxNumPages = DotInsights.Query.itemsPerPage > 0 ? Math.ceil( foundItems / DotInsights.Query.itemsPerPage ) : 1;
			buildTable();
			buildPagination();
		} );

		var bubbles    = [
			    {
				    project_slug: 'polkadot',
				    name: 'Polkadot',
				    likes: 7927,
				    r: 197,
				    fontSize: 30
			    }, {
				    project_slug: 'subwallet',
				    name: 'SubWallet',
				    likes: 6827,
				    r: 144,
				    fontSize: 20
			    }, {
				    project_slug: 'ampnet',
				    name: 'Ampnet',
				    likes: 4072,
				    r: 107,
				    fontSize: 18
			    }, {
				    project_slug: 'acala',
				    name: 'Acala',
				    likes: 4072,
				    r: 88,
				    fontSize: 16
			    }, {
				    project_slug: 'demodyfi',
				    name: 'Demodyfi',
				    likes: 5072,
				    r: 121,
				    fontSize: 16
			    }, {
				    project_slug: 'chainsafe',
				    name: 'ChainSafe',
				    likes: 2989,
				    r: 102,
				    fontSize: 16
			    }, {
				    project_slug: '1beam',
				    name: '1beam',
				    likes: 2989,
				    r: 102,
				    fontSize: 16
			    }, {
				    project_slug: 'unilend',
				    name: 'Unilend',
				    likes: 2025,
				    r: 96,
				    fontSize: 16
			    }, {
				    project_slug: 'metamask',
				    name: 'MetaMask',
				    likes: 3325,
				    r: 76,
				    fontSize: 16
			    }, {
				    project_slug: 'onfinality',
				    name: 'OnFinality',
				    likes: 2028,
				    r: 68,
				    fontSize: 16
			    }, {
				    project_slug: 'nabox',
				    name: 'Nabox',
				    likes: 1931,
				    r: 77,
				    fontSize: 16
			    }, {
				    project_slug: 'anchor',
				    name: 'Anchor',
				    likes: 1931,
				    r: 52,
				    fontSize: 16
			    }, {
				    project_slug: 'athos_finance',
				    name: 'Athos Finance',
				    likes: 1092,
				    r: 64,
				    fontSize: 16
			    }, {
				    project_slug: 'huckleberry',
				    name: 'Huckleberry',
				    likes: 821,
				    r: 39,
				    fontSize: 16
			    }, {
				    project_slug: 'ambire_wallet',
				    name: 'Ambire Wallet',
				    likes: 821,
				    r: 48,
				    fontSize: 16
			    }, {
				    project_slug: 'polkafoundry',
				    name: 'PolkaFoundry',
				    likes: 821,
				    r: 57,
				    fontSize: 16
			    }, {
				    project_slug: 'lido',
				    name: 'Lido',
				    likes: 821,
				    r: 60,
				    fontSize: 16
			    }, {
				    project_slug: 'beyondfi',
				    name: 'BeyondFi',
				    likes: 821,
				    r: 38,
				    fontSize: 16
			    }, {
				    project_slug: 'basilisk',
				    name: 'Basilisk',
				    likes: 821,
				    r: 49,
				    fontSize: 16
			    }, {
				    project_slug: 'avault',
				    name: 'Avault',
				    likes: 821,
				    r: 35,
				    fontSize: 16
			    }, {
				    project_slug: 'curve',
				    name: 'Curve',
				    likes: 821,
				    r: 60,
				    fontSize: 16
			    }, {
				    project_slug: 'linear',
				    name: 'Linear',
				    likes: 821,
				    r: 54,
				    fontSize: 16
			    }, {
				    project_slug: 'prime_protocol',
				    name: 'Prime Protocol',
				    likes: 821,
				    r: 33,
				    fontSize: 16
			    }, {
				    project_slug: 'riodefi',
				    name: 'RioDeFi',
				    likes: 821,
				    r: 57,
				    fontSize: 16
			    }, {
				    project_slug: 'parallel',
				    name: 'Parallel',
				    likes: 821,
				    r: 76,
				    fontSize: 16
			    }
		    ],
		    numCircles = bubbles.length,
		    $canvas    = $( '#bubble-projects' ),
		    // Perimeter of the rectangle.
		    canvasC    = (
			                 1400 + 715
		                 ) * 2;

		$( document ).ready( function() {
			drawProjectBubbles();
		} );

		$( window ).on( 'hresize', function() {
			if ( window.innerWidth < 561 ) {
				DotInsights.Pagination.midSize = 2;
			} else {
				DotInsights.Pagination.midSize = 3;
			}

			if ( window.innerWidth < 768 ) {
				DotInsights.Query.itemsPerPage = 10;
			} else {
				DotInsights.Query.itemsPerPage = 50;
			}
		} );

		$( window ).on( 'hresize_one', function() {
			drawProjectBubbles();
		} );

		function drawProjectBubbles() {
			$canvas.empty();

			var canvasWidth = $canvas.width(),
			    circles     = [],
			    circle      = {},
			    overlapping = false,
			    counter     = 0,
			    bubbleIndex = 0,
			    radiusRatio = 1,
			    protection  = 10000;

			// Reduce size of all bubbles on mobile.
			if ( window.innerWidth < 768 ) {
				radiusRatio = 0.5;
			} else if ( window.innerWidth < 1200 ) {
				radiusRatio = 0.8;
			}

			var canvasHeight = (
				                   canvasC / 2
			                   ) - window.innerWidth;
			canvasHeight *= radiusRatio;
			canvasHeight = Math.max( canvasHeight, 700 );

			$canvas.height( canvasHeight );

			for ( var i = 0; i < numCircles; i ++ ) {
				var newRadius = DotInsights.NumberUtil.precisionRoundMod( bubbles[ i ].r * radiusRatio, 0 );
				// Make sure bubble not smaller than 80px.
				bubbles[ i ].displayR = Math.max( newRadius, 40 );
			}

			while ( circles.length < numCircles && counter < protection ) {
				circle = bubbles[ bubbleIndex ];

				// Make sure circle inside canvas.
				circle.x = DotInsights.NumberUtil.getRandomInt( circle.displayR, canvasWidth - circle.displayR );
				circle.y = DotInsights.NumberUtil.getRandomInt( circle.displayR, canvasHeight - circle.displayR );

				overlapping = false;

				// check that it is not overlapping with any existing circle
				// another brute force approach
				for ( var i = 0; i < circles.length; i ++ ) {
					var existing = circles[ i ];
					/*var d = dist( circle.x, circle.y, existing.x, existing.y )
					if ( d < circle.r + existing.r ) {
						// They are overlapping
						overlapping = true;
						// do not add to array
						break;
					}*/

					var d = DotInsights.NumberUtil.dist( circle.x, circle.y, existing.x, existing.y );
					if ( d < circle.displayR + existing.displayR ) {
						// They are overlapping.
						overlapping = true;
						// do not add to array.
						break;
					}
				}

				// add valid circles to array.
				if ( ! overlapping ) {
					circles.push( circle );
					bubbleIndex ++;
				}

				counter ++;
			}

			var moveDurations = [
				'move-slow',
				'move-normal',
				'move-fast',
			];
			for ( var i = 0; i < circles.length; i ++ ) {
				var thisCircle  = circles[ i ],
				    circleClass = 'bubble-project bubble-project--' + thisCircle.project_slug;
				circleClass += i % 2 === 0 ? ' move-vertical' : ' move-vertical-reversed';
				circleClass += ' ' + moveDurations[ DotInsights.NumberUtil.getRandomInt( 0, 3 ) ];

				var html = '<div class="' + circleClass + '">';
				html += '<img src="./assets/images/bubbles/' + thisCircle.project_slug + '.png" alt="">';
				html += '<h3>' + thisCircle.name + '</h3><div class="total-likes"><svg><use xlink:href="#symbol-ph-heart-straight"></use></svg>' + thisCircle.likes + '</div>';
				html += '</div>';

				var $circleObject = $( html );
				$circleObject.css( {
					width: thisCircle.displayR * 2,
					height: thisCircle.displayR * 2,
					top: thisCircle.y - thisCircle.displayR,
					left: thisCircle.x - thisCircle.displayR
				} );
				$circleObject.css( '--circle-size', thisCircle.displayR * 2 + 'px' );

				$canvas.append( $circleObject );
			}
		}

		$pagination.on( 'click', 'a', function( evt ) {
			evt.preventDefault();
			DotInsights.Query.page = $( this ).data( 'page' ); // Next page.

			var offset = $projectTable.offset().top - 120; // header height + content spacing.
			$( 'html, body' ).animate( { scrollTop: offset }, 200 );

			buildTable();
			buildPagination();
		} );

		$( document.body ).on( 'click', '.btn-like', function( evt ) {
			evt.preventDefault();

			var $thisButton = $( this ),
			    projectID   = $thisButton.data( 'project-id' );

			console.log( projectID );
		} );

		function buildTable( append = false ) {
			var offset = (
				             DotInsights.Query.page - 1
			             ) * DotInsights.Query.itemsPerPage + 1,
			    getTo  = offset + DotInsights.Query.itemsPerPage,
			    output = '';

			getTo = getTo > DotInsights.Query.foundItems ? DotInsights.Query.foundItems + 1 : getTo;

			for ( var index = offset; index < getTo; index ++ ) {
				var thisProject = DotInsights.FilteredProjects[ index - 1 ];

				var itemClass = 'row-project';

				var isInTop3 = thisProject.rank <= 3;
				var rankHTML = '<span class="rank-number">' + thisProject.rank + '</span>';
				rankHTML = isInTop3 ? '<svg><use xlink:href="#symbol-crown"></use></svg>' + rankHTML : rankHTML;

				itemClass += isInTop3 ? ' row-project-highlight' : '';

				var layerClass = 'project-layer';
				layerClass += thisProject.layer ? ' project-layer-color--' + Helpers.sanitizeKey( thisProject.layer ) : '';
				var layerHTML = typeof thisProject.layer === 'string' ? '<span class="' + layerClass + '">' + thisProject.layer + '</span>' : '<span class="text-placeholder">--</span>';
				var tokenHTML = '' !== thisProject.token ? thisProject.token : '<span class="text-placeholder">--</span>';
				var native = true === thisProject.native ? ' checked' : '';
				var nativeHTML = '<input type="checkbox" readonly disabled class="project-is-native"' + native + ' />'

				var itemCatClass = 'project-category project-cat-color--' + thisProject.category_slug;
				var thumbnailUrl = './assets/images/projects/' + thisProject.project_slug + '.png';

				/*if ( ! imageExists( thumbnailUrl ) ) {
					console.log( thisProject.project_slug );
					console.log( thisProject );
				}*/

				output += '<tr class="' + itemClass + '">';
				output += '<td class="col-project-info">' +
				          '<a href="' + thisProject.website + '" target="_blank" rel="nofollow" class="project-info">' +
				          '<div class="project-rank">' + rankHTML + '</div>' +
				          '<div class="project-thumbnail"><img src="' + thumbnailUrl + '" alt="' + thisProject.project + '" width="80" height="80"/></div>' +
				          '<div class="project-details">' +
				          '<h3 class="project-name">' + thisProject.project + '</h3>' +
				          '<p class="' + itemCatClass + '">' + thisProject.category + '</p>' +
				          '</div>' +
				          '</a>' +
				          '</td>';
				output += '<td class="col-project-layer">' + layerHTML + '</td>';
				output += '<td class="col-project-token"><span class="project-token">' + tokenHTML + '</span></td>';
				output += '<td class="col-project-native">' + nativeHTML + '</td>';
				output += '<td class="col-project-github">' + getGithubLink( thisProject ) + '</td>';
				output += '<td class="col-project-twitter">' + getTwitterLink( thisProject ) + '</td>';
				output += '<td class="col-mobile-project-info">' + getHTMLInfoMobile( thisProject, layerHTML, tokenHTML, nativeHTML ) + '</td>';
				output += '<td class="col-project-love">' + getLoveButton( thisProject ) + '</td>';
				output += '</tr>';
			}

			append ? $projectTable.append( output ) : $projectTable.html( output );
		}

		function buildPagination() {
			var output   = '',
			    maxPages = DotInsights.Query.maxNumPages;

			if ( 1 < maxPages ) {
				var currentPage = DotInsights.Query.page;
				var allItems = [ currentPage ];

				var step = 1;
				for ( var i = currentPage - 1; i > 0; i -- ) {
					allItems.unshift( i );
					if ( step === DotInsights.Pagination.midSize ) {
						break;
					}

					step ++;
				}

				step = 1;
				for ( var i = currentPage + 1; i <= maxPages; i ++ ) {
					allItems.push( i );
					if ( step === DotInsights.Pagination.midSize ) {
						break;
					}

					step ++;
				}

				output += '<ul>';

				if ( currentPage > 1 ) {
					output += '<li><a href="#" class="page-prev"  data-page="' + (
						currentPage - 1
					) + '"><svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#000000" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polyline points="56 48 136 128 56 208" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><polyline points="136 48 216 128 136 208" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg></a></li>';
				}

				for ( var i = 0; i < allItems.length; i ++ ) {
					output += '<li>';
					if ( allItems[ i ] === currentPage ) {
						output += '<span class="page-numbers current">' + allItems[ i ] + '</a>';
					} else {
						output += '<a href="#" class="page-numbers" data-page="' + allItems[ i ] + '">' + allItems[ i ] + '</a>';
					}
					output += '</li>';
				}

				if ( currentPage < maxPages ) {
					output += '<li><a href="#" class="page-next" data-page="' + (
					          currentPage + 1
					) + '"><svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" fill="#000000" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polyline points="56 48 136 128 56 208" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><polyline points="136 48 216 128 136 208" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline></svg></a></li>';
				}

				output += '</ul>';
			}

			$pagination.html( output );
		}

		function getTwitterLink( project ) {
			if ( project.twitter && '' !== project.twitter && 'N/A' !== project.twitter ) {
				var text = project.twitter.replace( 'https://twitter.com/', '@' );
				text = text.replace( 'https://mobile.twitter.com/', '@', text );
				text = DotInsights.StringUtil.rtrim( text, '/' );

				return '<a href="' + project.twitter + '" target="_blank" class="project-link-twitter">' + text + '</a>';
			}

			return '<span class="text-placeholder">--</span>';
		}

		function getGithubLink( project ) {
			if ( project.github && '' !== project.github && 'N/A' !== project.github ) {
				return '<a href="' + project.github + '" target="_blank" class="project-link-github"><span class="fab fa-github"></span></a>';
			}

			return '<span class="text-placeholder">--</span>';
		}

		function getLoveButton( project ) {
			var isLoved = false;
			var loveBtnClass = 'button btn-like ';
			loveBtnClass += isLoved ? ' dislike-this' : ' like-this';

			return '<a href="#" data-project-id="' + project.project_id + '" class="' + loveBtnClass + '"><svg class="button-icon"><use xlink:href="#symbol-ph-heart-straight"></use></svg><span class="button-text">' + DotInsights.NumberUtil.formatWithCommas( project.totalLikes ) + '</span></a>';
		}

		function getHTMLInfoMobile( project, layerHTML, tokenHTML, nativeHTML ) {
			var output = '';

			output += '<div class="project-info-line">'
			output += '<div class="label">Native: </div>';
			output += '<div class="value">' + nativeHTML + '</div>';
			output += '</div>';

			output += '<div class="project-info-line">'
			output += '<div class="label">Layer: </div>';
			output += '<div class="value">' + layerHTML + '</div>';
			output += '</div>';

			output += '<div class="project-info-line">'
			output += '<div class="label">Token: </div>';
			output += '<div class="value">' + tokenHTML + '</div>';
			output += '</div>';

			output += '<div class="project-info-line">'
			output += '<div class="label">Github: </div>';
			output += '<div class="value">' + getGithubLink( project ) + '</div>';
			output += '</div>';

			output += '<div class="project-info-line">'
			output += '<div class="label">Twitter: </div>';
			output += '<div class="value">' + getTwitterLink( project ) + '</div>';
			output += '</div>';

			return output;
		}

		function imageExists( image_url ) {
			var http = new XMLHttpRequest();

			http.open( 'HEAD', image_url, false );
			http.send();

			return http.status != 404;
		}
	}( jQuery )
);
