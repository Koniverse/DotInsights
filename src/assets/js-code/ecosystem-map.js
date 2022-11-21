(
	function( $ ) {
		'use strict';

		window.dotinsights = window.dotinsights || {};
		dotinsights.Projects = dotinsights.Projects || {};
		var Helpers    = window.dotinsights.Helpers,
		    NumberUtil = window.dotinsights.NumberUtil;

		fetch( Helpers.getApiEndpointUrl( 'getProjects' ) ).then( function( response ) {
			return response.json();
		} ).then( function( jsonData ) {
			var projects = jsonData.projects;

			// Skip project without name.
			projects = Helpers.filterByRules( [
				{
					key: 'project',
					value: '',
					operator: '!'
				}
			], projects );

			prepareData( projects );

			// Get vote count to avoid cache with wrong count.
			$.ajax( {
				method: 'GET',
				url: Helpers.getApiEndpointUrl( 'getVoteCount' ),
				success: function( voteCountProjects ) {
					for ( var i = 0; i < projects.length; i ++ ) {
						if ( voteCountProjects.hasOwnProperty( projects[ i ].project_id ) ) {
							projects[ i ].vote_count = voteCountProjects[ projects[ i ].project_id ];
						}
					}

					// Sort by total vote.
					projects.sort( dotinsights.ArrayUtil.dynamicSort( 'vote_count' ) );

					// Add rank for project after total likes sorted.
					for ( var i = 0; i < projects.length; i ++ ) {
						projects[ i ].rank = i + 1;
					}

					$( document.body ).trigger( 'dotinsights/EcosystemMap/Data', [ projects ] );

					dotinsights.Projects = projects;

					$( document.body ).trigger( 'dotinsights/EcosystemMap/Loaded' );
				},
			} );
		} );

		fetch( Helpers.getApiEndpointUrl( 'chainData/polkadot' ) ).then( function( response ) {
			return 200 === response.status ? response.json() : false;
		} ).then( function( polkadot ) {
			if ( ! polkadot ) {
				return;
			}
			var $dotFinalizedBlocks  = $( '#statistic-dot-finalized-blocks' ),
			    $dotSignedExtrinsics = $( '#statistic-dot-signed-extrinsics' ),
			    $dotAccounts         = $( '#statistic-dot-accounts' ),
			    $dotTransactions     = $( '#statistic-dot-transactions' );

			$dotFinalizedBlocks.find( '.statistic-amount' ).html( NumberUtil.formatWithCommas( polkadot.finalizedBlockNum ) );
			$dotFinalizedBlocks.find( '.statistic-volume .value' ).html( NumberUtil.formatWithCommas( '+' + polkadot.block_change_24h ) );

			$dotSignedExtrinsics.find( '.statistic-amount' ).html( NumberUtil.formatWithCommas( polkadot.countSignedExtrinsic ) );
			$dotSignedExtrinsics.find( '.statistic-volume .value' ).html( NumberUtil.formatWithCommas( '+' + polkadot.extrinsicsChange ) );

			$dotAccounts.find( '.statistic-amount' ).html( NumberUtil.formatWithCommas( polkadot.accounts ) );
			$dotAccounts.find( '.statistic-volume .value' ).html( NumberUtil.formatWithCommas( '+' + polkadot.accounts_change_24h ) );

			$dotTransactions.find( '.statistic-amount' ).html( NumberUtil.formatWithCommas( polkadot.transfers ) );
			$dotTransactions.find( '.statistic-volume .value' ).html( NumberUtil.formatWithCommas( '+' + polkadot.transfers_change_24h ) );
		} );

		var $statisticSlider = $( '#polkadot-statistic-slider' );

		$( document ).ready( function() {
			getStatisticBlockWidth();
		} );

		$( window ).on( 'hresize_one', function() {
			getStatisticBlockWidth();
		} );

		function getStatisticBlockWidth() {
			var wWidth              = window.innerWidth,
			    statisticBlockWidth = wWidth / 100 * 85;

			statisticBlockWidth = Math.min( statisticBlockWidth, 408 );
			$statisticSlider.css( '--statistic-block-width', statisticBlockWidth + 'px' );
		}

		/**
		 * Append new data from original data.
		 * @param data
		 */
		function prepareData( data ) {
			for ( var i = data.length - 1; i >= 0; i -- ) {
				var categoryStringToArray = (
					data[ i ].category || ''
				).trim().split( ',' );

				var categories = [];

				categoryStringToArray.map( function( cat, index ) {
					categories.push( {
						name: cat.trim(),
						slug: Helpers.sanitizeKey( cat.trim(), 'uncategorized' )
					} );
				} );

				data[ i ].categories = categories;
				data[ i ].category_slugs = categories.map( cat => cat.slug ); // Using group projects by cat.
				data[ i ].project_slug = Helpers.sanitizeSlug( data[ i ].project ); // Using render on bubbles.
			}
		}
	}( jQuery )
);
