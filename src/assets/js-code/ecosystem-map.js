(
	function( $ ) {
		'use strict';

		window.DotInsights = window.DotInsights || {};
		DotInsights.Projects = DotInsights.Projects || {};
		var Helpers       = window.DotInsights.Helpers,
		    baseUrl       = location.origin,
		    partname      = location.pathname.split( '/' ),
		    exclude_parts = [
			    'projects'
		    ];

		for ( var i = 0; i < partname.length; i ++ ) {
			if ( '' !== partname[ i ] && ! exclude_parts.includes( partname[ i ] ) ) {
				baseUrl += '/' + partname[ i ];
			}
		}

		var sourceUrl = baseUrl + '/assets/data/ecosystem-map.json';

		fetch( sourceUrl ).then( function( response ) {
			return response.json();
		} ).then( function( jsonData ) {
			prepareData( jsonData );

			$( document.body ).trigger( 'DotInsights/EcosystemMap/Data', [ jsonData ] );

			DotInsights.Projects = jsonData;

			$( document.body ).trigger( 'DotInsights/EcosystemMap/Loaded' );
		} );

		// Get Dot accounts.
		$.ajax( {
			method: 'POST',
			url: 'https://polkadot.api.subscan.io/api/v2/scan/accounts',
			headers: {
				"X-API-Key": "a21ca935f82e4cd3810c6f78ae4bc4ca",
				"Content-Type": "application/json",
			},
			data: JSON.stringify( {
				row: 1,
				page: 1
			} ),
			success: function( response ) {
				if ( 0 === response.code ) {
					var $dotAccounts = $( '#statistic-dot-accounts' ),
					    data         = response.data;

					$dotAccounts.find( '.statistic-amount' ).html( DotInsights.NumberUtil.formatWithCommas( data.count ) );
				}
			},
		} );

		// Get Dot transactions.
		$.ajax( {
			method: 'POST',
			url: 'https://polkadot.api.subscan.io/api/v2/scan/transfers',
			headers: {
				"X-API-Key": "a21ca935f82e4cd3810c6f78ae4bc4ca",
				"Content-Type": "application/json",
			},
			data: JSON.stringify( {
				row: 1,
				page: 1
			} ),
			success: function( response ) {
				if ( 0 === response.code ) {
					var $dotTransactions = $( '#statistic-dot-transactions' ),
					    data             = response.data;

					$dotTransactions.find( '.statistic-amount' ).html( DotInsights.NumberUtil.formatWithCommas( data.count ) );
				}
			},
		} );

		// Dot Price + Marketcap.
		$.ajax( {
			method: 'GET',
			url: 'https://api.coingecko.com/api/v3/coins/polkadot',
			contentType: 'application/json',
			dataType: 'json',
			data: {
				tickers: false,
				market_data: true,
				community_data: false,
				developer_data: false,
				sparkline: false
			},
			success: function( response ) {
				var $dotPrice     = $( '#statistic-dot-price' ),
				    $dotVolumn    = $dotPrice.find( '.statistic-volume .value' ),
				    $dotMarketcap = $( '#statistic-dot-marketcap' );

				var marketData   = response.market_data,
				    currentPrice = marketData.current_price.usd,
				    volume24h    = marketData.market_cap_change_percentage_24h,
				    marketcap    = marketData.market_cap.usd;

				$dotPrice.find( '.statistic-amount' ).html( '$' + currentPrice );
				$dotVolumn.html( DotInsights.NumberUtil.precisionRoundMod( volume24h, 1 ) + '%' );
				volume24h > 0 ? $dotVolumn.addClass( 'value-up' ) : $dotVolumn.addClass( 'value-down' );

				$dotMarketcap.find( '.statistic-amount' ).html( '$' + DotInsights.NumberUtil.formatWithCommas( marketcap ) );
				$dotMarketcap.find( '.statistic-volume .value' ).html( '#' + marketData.market_cap_rank );
			},
		} );

		var $statisticSlider = $( '#polkadot-statistic-slider' );

		$( document ).ready( function() {
			getStatisticBlockWidth();
		} );

		$( window ).on( 'hresize_one', function() {
			getStatisticBlockWidth();
		} );

		function getStatisticBlockWidth() {
			var wWidth = window.innerWidth;
			var statisticBlockWidth = wWidth / 100 * 85;
			statisticBlockWidth = Math.min( statisticBlockWidth, 408 );
			$statisticSlider.css( '--statistic-block-width', statisticBlockWidth + 'px' );
		}

		/**
		 * Append new data from original data.
		 * @param data
		 */
		function prepareData( data ) {
			for ( var i = data.length - 1; i >= 0; i -- ) {
				data[ i ].category_id = Helpers.sanitizeKey( data[ i ].category );
				data[ i ].project_id = Helpers.sanitizeKey( data[ i ].project );
			}
		}
	}( jQuery )
);
