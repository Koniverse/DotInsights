(
	function( $ ) {
		'use strict';

		window.DotInsights = window.DotInsights || {};
		DotInsights.Projects = DotInsights.Projects || {};
		var Helpers    = window.DotInsights.Helpers,
		    NumberUtil = window.DotInsights.NumberUtil;

		/*
		var baseUrl       = location.origin,
		    partname      = location.pathname.split( '/' ),
		    exclude_parts = [
			    'projects'
		    ];
		for ( var i = 0; i < partname.length; i ++ ) {
			if ( '' !== partname[ i ] && ! exclude_parts.includes( partname[ i ] ) ) {
				baseUrl += '/' + partname[ i ];
			}
		}
		var sourceUrl2 = baseUrl + '/assets/data/ecosystem-map.json';
		fetch( sourceUrl2 ).then( function( response ) {
			return response.json();
		} ).then( function( jsonData ) {
			prepareData( jsonData );

			$( document.body ).trigger( 'DotInsights/EcosystemMap/Data', [ jsonData ] );

			DotInsights.Projects = jsonData;

			$( document.body ).trigger( 'DotInsights/EcosystemMap/Loaded' );
		} );
		*/

		fetch( Helpers.getApiEndpointUrl( 'getProjects' ) ).then( function( response ) {
			return response.json();
		} ).then( function( jsonData ) {
			var projects = jsonData.projects;
			prepareData( projects );

			$( document.body ).trigger( 'DotInsights/EcosystemMap/Data', [ projects ] );

			DotInsights.Projects = projects;

			$( document.body ).trigger( 'DotInsights/EcosystemMap/Loaded' );
		} );

		fetch( Helpers.getApiEndpointUrl( 'chainData/polkadot' ) ).then( function( response ) {
			return response.json();
		} ).then( function( polkadot ) {
			var $dotPrice        = $( '#statistic-dot-price' ),
			    $dotVolume       = $dotPrice.find( '.statistic-volume .value' ),
			    $dotMarketCap    = $( '#statistic-dot-marketcap' ),
			    $dotAccounts     = $( '#statistic-dot-accounts' ),
			    $dotTransactions = $( '#statistic-dot-transactions' ),
			    volume24h        = polkadot.volume24h;

			$dotPrice.find( '.statistic-amount' ).html( '$' + polkadot.current_price );
			$dotVolume.html( NumberUtil.precisionRoundMod( volume24h, 1 ) + '%' );
			volume24h > 0 ? $dotVolume.addClass( 'value-up' ) : $dotVolume.addClass( 'value-down' );

			$dotMarketCap.find( '.statistic-amount' ).html( '$' + NumberUtil.formatWithCommas( polkadot.market_cap ) );
			$dotMarketCap.find( '.statistic-volume .value' ).html( '#' + polkadot.market_cap_rank );

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
				data[ i ].category_slug = Helpers.sanitizeKey( data[ i ].category ); // Using group projects by cat.
				data[ i ].project_slug = Helpers.sanitizeKey( data[ i ].project ); // Using render on bubbles.
			}
		}
	}( jQuery )
);
