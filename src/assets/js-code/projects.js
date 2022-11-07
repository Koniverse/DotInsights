(
	function( $ ) {
		'use strict';

		window.DotInsights = window.DotInsights || {};
		DotInsights.Projects = DotInsights.Projects || {};
		DotInsights.Query = DotInsights.Query || {
			itemsPerPage: 3,
			maxNumPages: 1,
			page: 1,
			foundItems: 0
		};
		DotInsights.FilteredProjects = DotInsights.FilteredProjects || {};
		var Helpers = window.DotInsights.Helpers;

		var lastST = 0;
		var $window = $( window );
		var projectSortedCategories = {
			wallet: {
				name: 'Wallet'
			},
			infrastructure: {
				name: 'Infrastructure'
			},
			defi: {
				name: 'DeFi'
			},
			socialfi: {
				name: 'SocialFi'
			},
			privacy: {
				name: 'Privacy'
			},
			aggregator: {
				name: 'Aggregator'
			},
			bridge: {
				name: 'Bridge'
			},
			cold_wallet: {
				name: 'Cold Wallet'
			},
			dao: {
				name: 'DAO'
			},
			data: {
				name: 'Data'
			},
			fintech: {
				name: 'FinTech'
			},
			gaming: {
				name: 'Gaming'
			},
			identity: {
				name: 'Identity'
			},
			nft_collection: {
				name: 'NFT Collection'
			},
			iot: {
				name: 'IoT'
			},
			nft_marketplace: {
				name: 'NFT Marketplace'
			},
			scanner: {
				name: 'Scanner'
			},
			smartcontracts: {
				name: 'Smart Contract'
			},
			storage: {
				name: 'Storage'
			},
			security: {
				name: 'Security'
			},
			launchpad: {
				name: 'LaunchPad'
			},
			metaverse: {
				name: 'Metaverse'
			},
			sustainability: {
				name: 'Sustainability'
			},
			tooling: {
				name: 'Tooling'
			},
			validator: {
				name: 'Validator'
			}
		};

		var $searchForm            = $( '#project-form-filter' ),
		    $searchSubmitBtn       = $searchForm.find( '.search-submit' ),
		    searchDelay            = 700,
		    searching              = null,
		    $projectCategoriesList = $( '#project-categories-list' ),
		    $buttonLoadmore        = $( '#btn-load-more-projects' );

		$( document.body ).on( 'DotInsights/EcosystemMap/Loaded', function() {
			sortAndGroup( DotInsights.Projects );
			buildFilters();
			buildList();
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
			var cat = $searchForm.find( 'input[name="cat"]' ).val();

			var rules = [];

			if ( '' !== searchTerm ) {
				rules.push( {
					key: 'project',
					value: searchTerm,
					operator: 'like'
				} );
			}

			if ( '' !== cat ) {
				rules.push( {
					key: 'category_slug',
					value: cat,
					operator: '='
				} );
			}

			var results = rules.length > 0 ? Helpers.filterByRules( rules, DotInsights.Projects ) : DotInsights.Projects;
				sortAndGroup( results );
				buildList();
			} );

			$( document.body ).on( 'click', '.filter-item', function( evt ) {
				evt.preventDefault();

				var $thisButton = $( this );

				if ( $thisButton.hasClass( 'current' ) ) {
					return;
				}

				var cat = $( this ).data( 'cat' );
				$thisButton.siblings().removeClass( 'current' );
			$thisButton.addClass( 'current' );

			$searchForm.find( 'input[name="cat"]' ).val( cat );
			$searchForm.trigger( 'DotInsights/EcosystemMap/Searching' );
		} );

		$( document.body ).on( 'click', '#btn-load-more-projects', function( evt ) {
			evt.preventDefault();

			var $button = $( this );

			if ( DotInsights.Query.page < DotInsights.Query.maxNumPages ) {
				$buttonLoadmore.addClass( 'updating-icon' );
				setTimeout( function() {
					DotInsights.Query.page += 1;
					buildList( true );
					$buttonLoadmore.removeClass( 'updating-icon' );

					if ( DotInsights.Query.page === DotInsights.Query.maxNumPages ) {
						$button.hide();
					}
				}, 700 );
			}
		} );

		$window.on( 'scroll', function() {
			var currentST = $( this ).scrollTop();

			// Scroll down only.
			if ( currentST > lastST ) {
				var windowHeight = $window.height(),
				    // 90% window height.
				    halfWH       = parseInt( 90 / 100 * windowHeight ),
				    elOffsetTop  = $buttonLoadmore.offset().top,
				    elHeight     = $buttonLoadmore.outerHeight( true ),
				    offsetTop    = elOffsetTop + elHeight,
				    finalOffset  = offsetTop - halfWH;

				if ( currentST >= finalOffset ) {
					if ( ! $buttonLoadmore.hasClass( 'updating-icon' ) ) {
						$buttonLoadmore.trigger( 'click' );
					}
				}
			}

			lastST = currentST;
		} );

		function handlerListItemAnimation() {
			var $animations = $projectCategoriesList.find( '.tm-animation' );

			$animations.waypoint( function() {
				// Fix for different ver of waypoints plugin.
				var _self = this.element ? this.element : $( this );
				$( _self ).addClass( 'animate' );
			}, {
				offset: '100%' // triggerOnce: true
			} );
		}

		function sortAndGroup( array ) {
			array = Helpers.groupByKey( array, 'category_slug' );
			var results = [];

			for ( var catKey in projectSortedCategories ) {
				if ( ! array.hasOwnProperty( catKey ) ) {
					continue;
				}

				var category = projectSortedCategories[ catKey ];

				category.key = catKey;
				category.projects = array[ catKey ];

				results.push( category );
			}

			var foundItems = results.length;
			DotInsights.FilteredProjects = results;
			DotInsights.Query.page = 1;
			DotInsights.Query.foundItems = foundItems;
			DotInsights.Query.maxNumPages = DotInsights.Query.itemsPerPage > 0 ? Math.ceil( foundItems / DotInsights.Query.itemsPerPage ) : 1;

			if ( DotInsights.Query.maxNumPages > 1 ) {
				$buttonLoadmore.show();
			} else {
				$buttonLoadmore.hide();
			}
		}

		function buildFilters() {
			var allProjects = DotInsights.Projects.length;
			var $filterWrap = $( '#project-categories-filter' );
			var output = '<a href="#" data-cat="" class="current filter-item filter-all"><span class="filter-name">All projects</span><span class="filter-count">' + allProjects + '</span></a>';

			for ( var catIndex = 0; catIndex < DotInsights.FilteredProjects.length; catIndex ++ ) {
				var thisCat   = DotInsights.FilteredProjects[ catIndex ],
				    projects  = thisCat.projects,
				    itemClass = 'filter-item project-cat-color--' + thisCat.key;

				output += '<a href="#" data-cat="' + thisCat.key + '" class="' + itemClass + '">' + '<span class="filter-name">' + thisCat.name + '</span>' + '<span class="filter-count">' + projects.length + '</span></a>'
			}

			$filterWrap.html( output )
		}

		function buildList( append = false ) {
			var offset = (
				             DotInsights.Query.page - 1
			             ) * DotInsights.Query.itemsPerPage + 1,
			    getTo  = offset + DotInsights.Query.itemsPerPage,
			    output = '';

			getTo = getTo > DotInsights.Query.foundItems ? DotInsights.Query.foundItems + 1 : getTo;

			for ( var catIndex = offset; catIndex < getTo; catIndex ++ ) {
				var thisCategory     = DotInsights.FilteredProjects[ catIndex - 1 ],
				    projects         = thisCategory.projects,
				    catTotalProjects = projects.length,
				    catItemClass     = 'tm-animation fade-in-up cat-item cat-' + thisCategory.key,
				    catName          = '' !== thisCategory.name ? thisCategory.name : 'Others',
				    catHeadingClass  = 'project-category-name project-cat-color--' + thisCategory.key;

				output += '<div class="' + catItemClass + '"><h3 class="' + catHeadingClass + '">' + catName + '<span class="count">' + catTotalProjects + '</span></h3>';

				output += '<div class="projects-grid grid-modern" style="--grid-columns-desktop: 8; --grid-gutter-desktop: 20;--grid-columns-laptop: 7; --grid-columns-tablet-extra: 6; --grid-columns-tablet: 4; --grid-columns-mobile-extra: 3; --grid-columns-mobile: 2;">';
				for ( var i = 0; i < catTotalProjects; i ++ ) {
					var thisProject = projects[ i ];
					var thumbnailUrl = '../assets/images/projects/' + thisProject.project_slug + '.png';
					output += '<a href="' + thisProject.website + '" target="_blank" rel="nofollow" class="grid-item project-item">';
					output += '<div class="project-thumbnail"><img src="' + thumbnailUrl + '" alt="' + thisProject.project + '" width="80" height="80"/></div>';
					output += '<div class="project-info"><h3 class="project-name">' + thisProject.project + '</h3></div>';
					output += '</a>';
				}

				output += '</div></div>';
			}

			if ( append ) {
				$projectCategoriesList.append( output );
			} else {
				$projectCategoriesList.html( output );
			}

			handlerListItemAnimation();
		}
	}( jQuery )
);
