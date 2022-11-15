(
	function( $ ) {
		'use strict';

		window.dotinsights = window.dotinsights || {};
		dotinsights.Projects = dotinsights.Projects || {};
		dotinsights.FilteredProjects = dotinsights.FilteredProjects || {};
		dotinsights.Query = dotinsights.Query || {
			itemsPerPage: 50,
			maxNumPages: 1,
			page: 1,
			foundItems: 0
		};
		dotinsights.Pagination = dotinsights.Pagination || {};
		dotinsights.FilteredProjects = dotinsights.FilteredProjects || {};

		if ( window.innerWidth < 561 ) {
			dotinsights.Pagination.midSize = 2;
		} else {
			dotinsights.Pagination.midSize = 3;
		}

		if ( window.innerWidth < 768 ) {
			dotinsights.Query.itemsPerPage = 10;
		} else {
			dotinsights.Query.itemsPerPage = 50;
		}

		var Helpers = window.dotinsights.Helpers;

		var $searchForm      = $( '#project-form-filter' ),
		    $searchSubmitBtn = $searchForm.find( '.search-submit' ),
		    searchDelay      = 700,
		    searching        = null,
		    $projectTable    = $( '#most-loved-projects-table tbody' ),
		    $pagination      = $( '#most-loved-projects-pagination' );

		$( document.body ).on( 'dotinsights/EcosystemMap/Loaded', function() {
			dotinsights.FilteredProjects = dotinsights.Projects;
			var foundItems = dotinsights.FilteredProjects.length;

			dotinsights.Query.page = 1;
			dotinsights.Query.foundItems = foundItems;
			dotinsights.Query.maxNumPages = dotinsights.Query.itemsPerPage > 0 ? Math.ceil( foundItems / dotinsights.Query.itemsPerPage ) : 1;

			buildBubbles();
			buildTable();
			buildPagination();
		} );

		$searchForm.on( 'keyup', '.search-field', function() {
			clearTimeout( searching );
			searching = setTimeout( function() {
				$searchSubmitBtn.addClass( 'updating-icon' );

				setTimeout( function() {
					$searchSubmitBtn.removeClass( 'updating-icon' );
					$( document.body ).trigger( 'dotinsights/EcosystemMap/Searching' );
				}, 300 )
			}, searchDelay );
		} );

		$searchForm.on( 'submit', function( evt ) {
			clearTimeout( searching );
			searching = setTimeout( function() {
				$( document.body ).trigger( 'dotinsights/EcosystemMap/Searching' );
			}, searchDelay );

			return false;
		} );

		$( document.body ).on( 'dotinsights/EcosystemMap/Searching', function( evt ) {
			var searchTerm = $searchForm.find( 'input[name="s"]' ).val();

			var rules = [];

			if ( '' !== searchTerm ) {
				rules.push( {
					key: 'project',
					value: searchTerm,
					operator: 'like'
				} );
			}

			dotinsights.FilteredProjects = rules.length > 0 ? Helpers.filterByRules( rules, dotinsights.Projects ) : dotinsights.Projects;
			var foundItems = dotinsights.FilteredProjects.length;

			dotinsights.Query.page = 1;
			dotinsights.Query.foundItems = foundItems;
			dotinsights.Query.maxNumPages = dotinsights.Query.itemsPerPage > 0 ? Math.ceil( foundItems / dotinsights.Query.itemsPerPage ) : 1;
			buildTable();
			buildPagination();
		} );

		function buildBubbles() {
			var
				/*bubbles    = [
				    {
					    r: 197
				    }, {
					    r: 144
				    }, {
					    r: 107
				    }, {
					    r: 88
				    }, {
					    r: 121
				    }, {
					    r: 102
				    }, {
					    r: 102
				    }, {
					    r: 96
				    }, {
					    r: 76
				    }, {
					    r: 68
				    }, {
					    r: 77
				    }, {
					    r: 52
				    }, {
					    r: 64
				    }, {
					    r: 39
				    }, {
					    r: 48
				    }, {
					    r: 57
				    }, {
					    r: 60
				    }, {
					    r: 38
				    }, {
					    r: 49
				    }, {
					    r: 35
				    }, {
					    r: 60
				    }, {
					    r: 54
				    }, {
					    r: 33
				    }, {
					    r: 57
				    }, {
					    r: 76
				    }
			    ],*/
				bubbles    = [
					{
						project_slug: 'polkadot',
						name: 'Polkadot',
						r: 197
					}, {
						project_slug: 'subwallet',
						name: 'SubWallet',
						r: 144
					}, {
						project_slug: 'ampnet',
						name: 'Ampnet',
						r: 107
					}, {
						project_slug: 'acala',
						name: 'Acala',
						r: 88
					}, {
						project_slug: 'demodyfi',
						name: 'Demodyfi',
						r: 121
					}, {
						project_slug: 'chainsafe',
						name: 'ChainSafe',
						r: 102
					}, {
						project_slug: '1beam',
						name: '1beam',
						r: 102
					}, {
						project_slug: 'unilend',
						name: 'Unilend',
						r: 96
					}, {
						project_slug: 'metamask',
						name: 'MetaMask',
						r: 76
					}, {
						project_slug: 'onfinality',
						name: 'OnFinality',
						r: 68
					}, {
						project_slug: 'nabox',
						name: 'Nabox',
						r: 77
					}, {
						project_slug: 'anchor',
						name: 'Anchor',
						r: 52
					}, {
						project_slug: 'athos-finance',
						name: 'Athos Finance',
						r: 64
					}, {
						project_slug: 'huckleberry',
						name: 'Huckleberry',
						r: 39
					}, {
						project_slug: 'ambire-wallet',
						name: 'Ambire Wallet',
						r: 48
					}, {
						project_slug: 'kusama',
						name: 'Kusama',
						r: 57
					}, {
						project_slug: 'lido',
						name: 'Lido',
						r: 60
					}, {
						project_slug: 'beyondfi',
						name: 'BeyondFi',
						r: 38
					}, {
						project_slug: 'basilisk',
						name: 'Basilisk',
						r: 49
					}, {
						project_slug: 'avault',
						name: 'Avault',
						r: 35
					}, {
						project_slug: 'curve',
						name: 'Curve',
						r: 60
					}, {
						project_slug: 'linear',
						name: 'Linear',
						r: 54
					}, {
						project_slug: 'prime-protocol',
						name: 'Prime Protocol',
						r: 33
					}, {
						project_slug: 'riodefi',
						name: 'RioDeFi',
						r: 57
					}, {
						project_slug: 'parallel',
						name: 'Parallel',
						r: 76
					}
				],
				numCircles = bubbles.length,
				$canvas    = $( '#bubble-projects' ),
				// Perimeter of the rectangle.
				canvasC    = (
					             1400 + 715
				             ) * 2;

			// Map bubble settings with top voted project.
			/*bubbles = bubbles.map( function( bubble, index ) {
				return {
					...bubble,
					...dotinsights.Projects[ index ]
				}
			} );*/


			bubbles = bubbles.map( function( bubble, index ) {
				return {
					...bubble,
					project: bubble.name
				}
			} );

			drawProjectBubbles();

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
					var newRadius = dotinsights.NumberUtil.precisionRoundMod( bubbles[ i ].r * radiusRatio, 0 );
					// Make sure bubble not smaller than 80px.
					bubbles[ i ].displayR = Math.max( newRadius, 40 );
				}

				while ( circles.length < numCircles && counter < protection ) {
					circle = bubbles[ bubbleIndex ];

					// Make sure circle inside canvas.
					circle.x = dotinsights.NumberUtil.getRandomInt( circle.displayR, canvasWidth - circle.displayR );
					circle.y = dotinsights.NumberUtil.getRandomInt( circle.displayR, canvasHeight - circle.displayR );

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

						var d = dotinsights.NumberUtil.dist( circle.x, circle.y, existing.x, existing.y );
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
					    totalVote   = thisCircle.vote_count ? thisCircle.vote_count : 0,
					    circleClass = 'bubble-project bubble-project--' + thisCircle.project_slug;
					circleClass += i % 2 === 0 ? ' move-vertical' : ' move-vertical-reversed';
					circleClass += ' ' + moveDurations[ dotinsights.NumberUtil.getRandomInt( 0, 3 ) ];

					var html = '<div class="' + circleClass + '">';
					html += '<img src="./assets/images/projects/' + thisCircle.project_slug + '.png" alt="">';
					html += '<h3>' + thisCircle.project + '</h3><div class="vote-count"><svg><use xlink:href="#symbol-ph-heart-straight"></use></svg>' + totalVote + '</div>';
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
		}

		$( window ).on( 'hresize', function() {
			if ( window.innerWidth < 561 ) {
				dotinsights.Pagination.midSize = 2;
			} else {
				dotinsights.Pagination.midSize = 3;
			}

			if ( window.innerWidth < 768 ) {
				dotinsights.Query.itemsPerPage = 10;
			} else {
				dotinsights.Query.itemsPerPage = 50;
			}
		} );

		$pagination.on( 'click', 'a', function( evt ) {
			evt.preventDefault();
			dotinsights.Query.page = $( this ).data( 'page' ); // Next page.

			var offset = $projectTable.offset().top - 120; // header height + content spacing.
			$( 'html, body' ).animate( { scrollTop: offset }, 200 );

			buildTable();
			buildPagination();
		} );

		function buildTable( append = false ) {
			var offset = (
				             dotinsights.Query.page - 1
			             ) * dotinsights.Query.itemsPerPage + 1,
			    getTo  = offset + dotinsights.Query.itemsPerPage,
			    output = '';

			getTo = getTo > dotinsights.Query.foundItems ? dotinsights.Query.foundItems + 1 : getTo;

			for ( var index = offset; index < getTo; index ++ ) {
				var thisProject = dotinsights.FilteredProjects[ index - 1 ];

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
				output += '<td class="col-project-love">' + getVoteButton( thisProject ) + '</td>';
				output += '</tr>';
			}

			append ? $projectTable.append( output ) : $projectTable.html( output );
		}

		function buildPagination() {
			var output   = '',
			    maxPages = dotinsights.Query.maxNumPages;

			if ( 1 < maxPages ) {
				var currentPage = dotinsights.Query.page;
				var allItems = [ currentPage ];

				var step = 1;
				for ( var i = currentPage - 1; i > 0; i -- ) {
					allItems.unshift( i );
					if ( step === dotinsights.Pagination.midSize ) {
						break;
					}

					step ++;
				}

				step = 1;
				for ( var i = currentPage + 1; i <= maxPages; i ++ ) {
					allItems.push( i );
					if ( step === dotinsights.Pagination.midSize ) {
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
				text = dotinsights.StringUtil.rtrim( text, '/' );

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

		function getVoteButton( project ) {
			var isVoted = dotinsights.VotedProjects.includes( project.project_id );
			var voteBtnClass = 'button btn-vote';
			voteBtnClass += isVoted ? ' unvote-this' : ' vote-this';

			return '<a href="#" data-project-id="' + project.project_id + '" class="' + voteBtnClass + '"><svg class="button-icon"><use xlink:href="#symbol-ph-heart-straight"></use></svg><span class="button-text">' + dotinsights.NumberUtil.formatWithCommas( project.vote_count ) + '</span></a>';
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
