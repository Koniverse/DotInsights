(
	function( $ ) {
		'use strict';

		var locate = window.DotInsights.Localization;
		var baseUrl = location.origin;
		var partname = location.pathname.split( '/' );

		for ( var i = 0; i < partname.length - 2; i ++ ) {
			if ( '' !== partname[ i ] ) {
				baseUrl += '/' + partname[ i ];
			}
		}

		var sourceBaseUrl = baseUrl + '/assets/data/';
		var tokenBaseUrl = baseUrl + '/assets/images/token/';

		var $allCharts                 = $( '.block-chart' ),
		    dateFormatter              = '{dd}/{MM}/{yyyy}',
		    dateShortFormatter         = '{MM}/{yyyy}',
		    fontFamily                 = 'Plus Jakarta Sans',
		    echarts                    = window.echarts,
		    defaultTooltipStyle        = {
			    padding: [ 15, 20 ],
			    backgroundColor: '#000',
			    borderWidth: 0,
			    extraCssText: 'border-radius: 10px;box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);',
			    textStyle: {
				    fontFamily: fontFamily,
				    color: '#fff',
				    fontSize: 14,
				    fontWeight: '500'
			    }
		    },
		    defaultTooltipSettings     = $.extend( true, {}, defaultTooltipStyle, {
			    trigger: 'axis',
			    axisPointer: {
				    type: 'cross',
				    crossStyle: {
					    color: 'rgba(255,255,255,0.3)'
				    },
				    lineStyle: {
					    type: [ 4, 4 ],
					    color: 'rgba(255,255,255,0.3)'
				    }
			    }
		    } ),
		    defaultLegendSettings      = {
			    show: true,
			    icon: 'roundRect',
			    textStyle: {
				    fontFamily: fontFamily,
				    color: '#ffffff',
				    fontSize: 15,
				    fontWeight: '500',
				    padding: [ 3, 0, 0, 0 ]
			    },
			    itemWidth: 14,
			    itemHeight: 14,
			    itemGap: 30,
			    top: 'bottom',

			    // Should be allow scroll for better ux.
			    type: 'scroll',
			    pageIconColor: '#ffffff',
			    pageIconInactiveColor: 'rgba(255,255,255,0.2)',
			    pageTextStyle: {
				    fontFamily: fontFamily,
				    color: '#ffffff',
				    fontSize: 15,
				    fontWeight: '500'
			    }
		    },
		    defaultAxisPointerSettings = {
			    label: {
				    color: '#fff',
				    backgroundColor: '#004bff'
			    }
		    };

		$( document ).ready( function() {
			$allCharts.waypoint( function() {
				// Fix for different ver of waypoints plugin.
				var _self = this.element ? this.element : this;
				var $self = $( _self );

				initCharts( $self );

				this.destroy(); // trigger once.
			}, {
				offset: '90%'
			} );

			/*$( '.js-data-table' ).DataTable( {
				info: false,
				paging: false,
				searching: false
			} );*/

			initTableOfContents();
		} );

		$( window ).on( 'hresize_one', function() {
			$allCharts.each( function() {
				var $chart        = $( this ),
				    chartInstance = echarts.getInstanceByDom( $chart.get( 0 ) ),
				    chartName     = $chart.data( 'chart-name' );

				if ( typeof chartInstance !== 'undefined' ) {
					chartInstance.resize( {
						width: 'auto',
						height: 'auto'
					} );

					var chartOptions = false;

					switch ( chartName ) {
						case 'price-dev-act':
							chartOptions = getChartResponsiveOptionsPriceDevAct();
							break;
						case 'dev-act-comparison':
							chartOptions = getChartResponsiveOptionsDevActComparison();
							break;
						case 'vcs-dot-ksm':
							chartOptions = getChartResponsiveOptionsVCsDotKsm();
							break;
						case 'dot-ksm-account-overview':
							chartOptions = getChartResponsiveOptionsDotKsmAccOverview();
							break;
						case 'dot-treasury-activity':
							chartOptions = getChartResponsiveOptionsDotTreasuryActivity();
							break;
						case 'polkadot-parachain':
						case 'kusama-parachain':
						case 'polkadot-dex':
						case 'polkadot-lending-protocol':
						case 'ausd-issuance':
						case 'rmrk-cumulative-sales':
							chartOptions = getChartLinesBaseResponsiveOptions( chartName );
							break;
						case 'rmrk-daily-sales':
							chartOptions = getChartResponsiveOptionsRmrkDailySales( chartName );
							break;

					}

					if ( chartOptions ) {
						chartInstance.setOption( chartOptions )
					}
				}
			} );
		} );

		function initTableOfContents() {
			var $tableOfContents = $( '#table-of-contents' );

			$tableOfContents.on( 'click', '.btn-close-panel', function( e ) {
				e.preventDefault();
				e.stopPropagation();

				$tableOfContents.removeClass( 'open' );
			} );

			$tableOfContents.on( 'click', function( e ) {
				if ( e.target !== this ) {
					return;
				}

				$tableOfContents.removeClass( 'open' );
			} );

			$tableOfContents.on( 'click', 'a', function( e ) {
				$tableOfContents.removeClass( 'open' );
			} );

			$( document ).on( 'click', '#btn-open-panel', function( e ) {
				e.preventDefault();
				e.stopPropagation();

				$tableOfContents.addClass( 'open' );
			} );
		}

		function validate_number( number ) {
			// Remove thousand separator chars.
			return number.replace( /,(?=[\d,]*\.\d{2}\b)/g, '' );
		}

		function moneyFormat( value ) {
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
		}

		function initCharts( $chart ) {
			var chartName     = $chart.data( 'chart-name' ),
			    chartSource   = $chart.data( 'chart-source' ),
			    chartInstance = echarts.init( $chart.get( 0 ), 'macarons' );

			chartInstance.showLoading( 'default', {
				text: 'loading',
				color: '#004bff',
				textColor: '#004bff',
				maskColor: '#151515',
				zlevel: 0,
				fontSize: 18,
				showSpinner: true,
				spinnerRadius: 10,
				lineWidth: 2,
				fontWeight: 600,
				fontStyle: 'normal',
				fontFamily: fontFamily
			} );

			if ( ! chartName ) {
				return;
			}

			if ( 'inline' !== chartSource ) {
				var fileName = typeof chartSource !== 'undefined' ? chartSource : chartName;
				var url = sourceBaseUrl + fileName + '.json';

				fetch( url ).then( function( response ) {
					return response.json();
				} ).then( function( jsonData ) {
					var chartOptions = {};

					switch ( chartName ) {
						case 'price-dev-act':
							chartOptions = getChartOptionsPriceDevAct( chartName, jsonData );
							break;
						case 'dev-act-comparison':
							chartOptions = getChartOptionsDevActComparison( chartName, jsonData );
							break;
						case 'dot-ksm-account-overview':
							chartOptions = getChartOptionsDotKsmAccOverview( chartName, jsonData );
							break;
						case 'polkadot-parachain':
							chartOptions = getChartOptionsPolkadotParachain( chartName, jsonData );
							break;
						case 'kusama-parachain':
							chartOptions = getChartOptionsKusamaParachain( chartName, jsonData );
							break;
						case 'polkadot-dex':
							chartOptions = getChartOptionsDotsamaDex( chartName, jsonData );
							break;
						case 'polkadot-lending-protocol':
							chartOptions = getChartOptionsDotsamaLendingProtocol( chartName, jsonData );
							break;
						case 'ausd-issuance':
							chartOptions = getChartOptionsAUsdIssuance( chartName, jsonData );
							break;
						case 'rmrk-cumulative-sales':
							chartOptions = getChartOptionsRmrkCumulativeSales( chartName, jsonData );
							break;
						case 'rmrk-daily-sales':
							chartOptions = getChartOptionsRmrkDailySales( chartName, jsonData );
							break;
						case 'web-assembly-usage':
							chartOptions = getChartOptionsWebAssemblyUsage( chartName, jsonData );
							break;
						case 'dot-treasury-activity':
							chartOptions = getChartOptionsDotTreasuryActivity( chartName, jsonData );
							break;
					}
					chartInstance.hideLoading();
					chartInstance.setOption( chartOptions );
				} );
			} else { // Chart with inline source.
				var chartOptions = {};

				switch ( chartName ) {
					case 'treasury-output':
						chartOptions = getChartOptionsTreasuryOutput( chartName );
						break;
					case 'nakamoto-coefficient':
						chartOptions = getChartOptionsNakamotoCoefficient( chartName );
						break;
					case 'vcs-dot-ksm':
						chartOptions = getChartOptionsVCsDotKsm( chartName );
						break;
					case 'xcm-transfers':
						chartOptions = getChartOptionsXCMTransfers( chartName );
						break;
				}
				chartInstance.hideLoading();
				chartInstance.setOption( chartOptions );
			}
		}

		function getChartOptionsPriceDevAct( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    kusama: [],
				    polkadot: [],
				    dev: []
			    },
			    colors     = [
				    '#66E1B6',
				    '#E6007A',
				    '#0091FF'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.kusama.push( [ jsonData[ i ].date, jsonData[ i ].ksm ] );
				data.polkadot.push( [ jsonData[ i ].date, jsonData[ i ].dot ] );
				data.dev.push( [ jsonData[ i ].date, jsonData[ i ].dev ] );
			}

			var baseOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: defaultTooltipSettings,
				legend: defaultLegendSettings,
				grid: {
					left: '4px',
					right: 95,
					top: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					splitLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisTick: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: '#262626'
						}
					},
					axisPointer: defaultAxisPointerSettings,
					axisLabel: {
						align: 'left',
						formatter: dateFormatter,
						color: '#ccc'
					}
				},
				yAxis: [
					{
						type: 'value',
						name: locate.ksmPrice,
						nameTextStyle: {
							fontSize: 0
						},
						position: 'right',
						alignTicks: true,
						axisLine: {
							show: true,
							lineStyle: {
								color: colors[ 0 ]
							}
						},
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisPointer: {
							label: {
								color: '#020722',
								backgroundColor: '#66E1B6'
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					},
					{
						type: 'value',
						name: locate.dotPrice,
						nameTextStyle: {
							fontSize: 0
						},
						position: 'right',
						alignTicks: true,
						offset: 70,
						axisLine: {
							show: true,
							lineStyle: {
								color: colors[ 1 ]
							}
						},
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					}, {
						type: 'value',
						name: locate.developmentActivity,
						nameTextStyle: {
							fontSize: 0
						},
						position: 'right',
						alignTicks: true,
						offset: 140,
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisLine: {
							show: true,
							lineStyle: {
								color: colors[ 2 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					}
				],
				series: [
					{
						name: locate.ksmPrice,
						data: data.kusama,
						itemStyle: {
							color: colors[ 0 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						//stack: 'Total',
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.dotPrice,
						data: data.polkadot,
						itemStyle: {
							color: colors[ 1 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						yAxisIndex: 1,
						//stack: 'Total',
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.developmentActivity,
						data: data.dev,
						areaStyle: {
							color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								{
									offset: 0,
									color: 'rgba(0, 145, 255,0.5)'
								},
								{
									offset: 1,
									color: 'rgba(7, 14, 48,0)'
								}
							] )
						},
						itemStyle: {
							color: colors[ 2 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						yAxisIndex: 2,
						//stack: 'Total',
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsPriceDevAct();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsPriceDevAct() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 8
					}
				};
			} else {
				newOptions = {
					tooltip: {
						trigger: 'axis'
					},
					xAxis: {
						splitNumber: 3
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( newOptions, {
						xAxis: {
							splitNumber: 2
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsDevActComparison( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    cosmos: [],
				    dot: [],
				    eth: [],
				    sol: [],
				    btc: [],
				    ada: []
			    },
			    colors     = [
				    '#4CFCFC',
				    '#8B93AF',
				    '#8E54F7',
				    '#E6007A',
				    '#EA973D',
				    '#004BFF',
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.dot.push( [ jsonData[ i ].date, jsonData[ i ].dot ] );
				data.eth.push( [ jsonData[ i ].date, jsonData[ i ].eth ] );
				data.sol.push( [ jsonData[ i ].date, jsonData[ i ].sol ] );
				data.cosmos.push( [ jsonData[ i ].date, jsonData[ i ].near ] );
				data.btc.push( [ jsonData[ i ].date, jsonData[ i ].matic ] );
				data.ada.push( [ jsonData[ i ].date, jsonData[ i ].ada ] );
			}

			var baseOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: defaultTooltipSettings,
				legend: defaultLegendSettings,
				grid: {
					left: '4px',
					right: '3%',
					top: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					axisTick: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: '#262626'
						}
					},
					splitLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisPointer: defaultAxisPointerSettings,
					axisLabel: {
						align: 'left',
						formatter: dateFormatter,
						color: '#ccc'
					}
				},
				yAxis: {
					type: 'value',
					position: 'right',
					axisLine: {
						show: true,
						lineStyle: {
							color: colors[ 0 ]
						}
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisPointer: defaultAxisPointerSettings,
					axisLabel: {
						color: '#ccc'
					}
				},
				series: [
					{
						name: 'Cosmos',
						data: data.cosmos,
						itemStyle: {
							color: colors[ 0 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: 'Ethereum',
						data: data.eth,
						itemStyle: {
							color: colors[ 1 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: 'Solana',
						data: data.sol,
						itemStyle: {
							color: colors[ 2 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: 'Polkadot',
						data: data.dot,
						itemStyle: {
							color: colors[ 3 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: 'Bitcoin',
						data: data.btc,
						itemStyle: {
							color: colors[ 4 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: 'Cardano',
						data: data.ada,
						itemStyle: {
							color: colors[ 5 ]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsDevActComparison();
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsDevActComparison() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 8
					}
				};
			} else {
				newOptions = {
					xAxis: {
						splitNumber: 3
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( true, newOptions, {
						xAxis: {
							splitNumber: 2
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsNakamotoCoefficient() {
			var colors = [
				'#EA3572'
			];

			var baseOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				/*tooltip: {
					show: false
				},*/
				legend: {
					show: false
				},
				grid: {
					left: '3%',
					right: '3%',
					top: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					data: [ 'Solana', 'Avalanche', 'Polkadot', 'Cosmos', 'NEAR', 'Polygon', 'Fantom', 'BSC' ],
					axisTick: {
						show: false
					},
					//boundaryGap: [ '40%', '40%' ],
					//
					axisLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: '#262626'
						}
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						hideOverlap: false,
						rotate: 45,
						showMaxLabel: true,
						overflow: 'breakAll',
						formatter: function( value ) {
							return '{' + value + '|}{spacing|}{value|' + value + '}';
						},
						align: 'right',
						rich: {
							value: {
								lineHeight: 30,
								align: 'center'
							},
							spacing: {
								width: 7,
							},
							Solana: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Solana' )
								}
							},
							Avalanche: {
								height: 20,
								align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Avax' )
								}
							},
							Polkadot: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Polkadot' )
								}
							},
							Cosmos: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Cosmos' )
								}
							},
							NEAR: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Near' )
								}
							},
							Polygon: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Polygon' )
								}
							},
							Fantom: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'Fantom' )
								}
							},
							BSC: {
								height: 20,
								//align: 'center',
								backgroundColor: {
									image: getTokenIcon( 'BSC' )
								}
							},
						},
						/*formatter: function( value ) {
							return '{icon|' + getTokenIcon( value ) + '}' + value;
						},
						rich: {
							icon: {
								fontSize: 25,
								padding: 5
							}
						},*/
						fontFamily: fontFamily,
						fontSize: 13,
						fontWeight: 500,
						color: '#FFFFFF'
					}
				},
				yAxis: {
					type: 'value',
					max: 100,
					splitNumber: 4,
					maxInterval: 25,
					axisLine: {
						show: false
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						fontFamily: fontFamily,
						fontSize: 12,
						fontWeight: 500,
						color: '#ccc'
					}
				},
				series: [
					{
						type: 'bar',
						data: [ 27, 28, 82, 7, 7, 3, 3, 7 ],
						name: '',
						label: {
							fontFamily: fontFamily,
							fontSize: 13,
							fontWeight: 500,
							color: '#EA3572',
							show: true,
							position: 'top'
						},
						//barMaxWidth: 56,
						itemStyle: {
							color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								{
									offset: 0,
									color: '#B82DA7'
								},
								{
									offset: 1,
									color: '#EB3571'
								}
							] ),
							borderRadius: [ 8, 8, 0, 0 ]
						},
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsNakamotoCoefficient();
			//var responsiveOptions = {};
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsNakamotoCoefficient() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					series: [
						{
							label: {
								fontSize: 17
							},
							barMaxWidth: 56,
							itemStyle: {
								borderRadius: [ 8, 8, 0, 0 ]
							}
						}
					]
				};
			} else {
				newOptions = {
					series: [
						{
							label: {
								fontSize: 15
							},
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [ 5, 5, 0, 0 ]
							}
						}
					]
				};
			}

			return newOptions;
		}

		function getChartOptionsDotKsmAccOverview( chartName, jsonData ) {
			var datasets   = [
				    {
					    name: 'dot_cumulative',
					    label: 'DOT'
				    }, {
					    name: 'ksm_cumulative',
					    label: 'KSM'
				    }
			    ],
			    colors     = [
				    '#E6007A',
				    '#004BFF',
			    ],

			    totalItems = jsonData.length,
			    data       = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function( dataset ) {
					var value = jsonData[ i ][ dataset.name ] ? validate_number( jsonData[ i ][ dataset.name ] ) : '';
					data[ dataset.name ].push( [ jsonData[ i ].date, value ] );
				} );
			}

			var baseOptions = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: defaultTooltipSettings,
				legend: defaultLegendSettings,
				    grid: {
					    left: '3%',
					    right: '3%',
					    top: '3%',
					    containLabel: true
				    },
				/*dataset: {
					source: data
				},*/
				    xAxis: {
					    type: 'time',
					    boundaryGap: [ '0%', '0%' ],
					    splitLine: {
						    show: true,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisTick: {
						    show: false
					    },
					    axisLine: {
						    show: true,
						    lineStyle: {
							    color: '#262626'
						    }
					    },
					    axisPointer: defaultAxisPointerSettings,
					    axisLabel: {
						    formatter: dateFormatter,
						    color: '#ccc'
					    }
				    },
				yAxis: [
					{
						name: 'DOT',
						type: 'value',
						position: 'left',
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisLine: {
							show: false,
							lineStyle: {
								type: [ 4, 4 ],
								color: '#262626'
							}
						},
						axisPointer: defaultAxisPointerSettings,
						axisLabel: {
							color: '#ccc'
						}
					}, {
						name: 'KSM',
						type: 'value',
						position: 'right',
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisLine: {
							show: false,
							lineStyle: {
								type: [ 4, 4 ],
								color: '#262626'
							}
						},
						axisPointer: defaultAxisPointerSettings,
						axisLabel: {
							color: '#ccc'
						}
					}
				],
				series: [
					{
						name: 'DOT',
						data: data.dot_cumulative,
						areaStyle: {
							color: new echarts.graphic.LinearGradient( 0.5, 0.5, 1, 1, [
								{
									offset: 0.6,
									color: 'rgba(93,25,110,0.6)'
								},
								{
									offset: 1,
									color: 'rgba(93,25,110,0)'
								}
							] )
						},
						itemStyle: {
							color: colors[ 0 ]
						},
						type: 'line',
						z: 9,
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						},
					},{
						name: 'KSM',
						data: data.ksm_cumulative,
						areaStyle: {
							color: new echarts.graphic.LinearGradient( 0.5, 0.5, 1, 1, [
								{
									offset: 0.6,
									color: 'rgba(14,40,104,0.6)'
								},
								{
									offset: 1,
									color: 'rgba(14,40,104,0)'
								}
							] )
						},
						itemStyle: {
							color: colors[ 1 ]
						},
						yAxisIndex: 1,

						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						},
					},
				]
			};

			//responsiveOptions = getChartResponsiveOptionsDotKsmAccOverview();
			var responsiveOptions = {};

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsDotKsmAccOverview() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: '{value}'
						}
					},
					xAxis: {
						splitNumber: 8
					}
				};
			} else {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: function( value ) {
								return moneyFormat( value );
							}
						}
					},
					xAxis: {
						splitNumber: 4
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( newOptions, {
						xAxis: {
							splitNumber: 2
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsVCsDotKsm() {
			var colors = [
				'#004BFF'
			];

			var baseOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				grid: {
					left: 65,
					right: '3%',
					top: '3%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					data: [
						'DFG',
						'Au21 Capital',
						'NGC Ventures',
						'Hypersphere',
						'Illusionist Group',
						'CMS Holdings',
						'Waterdrip Cap',
						'KR1',
						'LD Capital',
						'Signum Capital'
					],
					axisTick: {
						show: false
					},
					axisLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: '#262626'
						}
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						hideOverlap: false,
						showMaxLabel: true,
						overflow: 'breakAll',
						rotate: 45,
						align: 'right',
						fontFamily: fontFamily,
						fontSize: 12,
						fontWeight: 500,
						color: '#FFFFFF'
					}
				},
				yAxis: {
					type: 'value',
					name: locate.projectCount,
					nameLocation: 'middle',
					nameGap: 62,
					nameTextStyle: {
						fontFamily: fontFamily,
						fontWeight: '500',
						fontSize: 17,
						color: '#ccc'
					},
					splitNumber: 4,
					maxInterval: 25,
					axisLine: {
						show: false
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						fontFamily: fontFamily,
						fontSize: 12,
						fontWeight: 500,
						color: '#ccc'
					},
				},
				series: [
					{
						type: 'bar',
						data: [ 45, 40, 38, 37, 32, 31, 27, 26, 25, 25 ],
						name: '',
						label: {
							fontFamily: fontFamily,
							fontWeight: 700,
							show: true,
							position: 'insideTop',
							padding: [ 7, 0, 0, 0 ]
						},
					}
				]
			};

			var responsiveOptions = getChartResponsiveOptionsVCsDotKsm();
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsVCsDotKsm() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					series: [
						{
							label: {
								fontSize: 16
							},
							barMaxWidth: 50,
							itemStyle: {
								borderRadius: [ 8, 8, 0, 0 ]
							}
						}
					]
				};
			} else {
				newOptions = {
					series: [
						{
							label: {
								fontSize: 15
							},
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [ 5, 5, 0, 0 ]
							}
						}
					]
				};
			}

			return newOptions;
		}

		function getChartOptionsXCMTransfers() {
			var colors = [
				    '#004BFF',
				    '#66E1B6',
			    ],
			    data   = getChartDataXCMTransfers();

			var baseOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: defaultTooltipSettings,
				legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: '3%',
					top: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					data: data[ 0 ],
					axisTick: {
						show: false
					},
					axisLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: '#262626'
						}
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						hideOverlap: false,
						rotate: 45,
						showMaxLabel: true,
						overflow: 'breakAll',
						formatter: function( value ) {
							var iconKey = value.replace( / /g, '' );
							return '{' + iconKey + '|}{spacing|}{value|' + value + '}';
						},
						align: 'right',
						rich: {
							value: {
								lineHeight: 30,
								align: 'center'
							},
							spacing: {
								width: 7,
							},
							Moonbeam: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Moonbeam' )
								}
							},
							Acala: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Acala' )
								}
							},
							Moonriver: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Moonriver' )
								}
							},
							Parallel: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Parallel' )
								}
							},
							Karura: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Karura' )
								}
							},
							ParallelHeiko: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'ParallelHeiko' )
								}
							},
							Interlay: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Interlay' )
								}
							},
							BifrostKusama: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Bifrost' )
								}
							},
							Astar: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Astar' )
								}
							},
							Kintsugi: {
								height: 20,
								backgroundColor: {
									image: getTokenIcon( 'Kintsugi' )
								}
							},
						},
						fontFamily: fontFamily,
						fontSize: 13,
						fontWeight: 500,
						color: '#FFFFFF'
					}
				},
				yAxis: {
					type: 'value',
					splitNumber: 3,
					axisLine: {
						show: false
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						fontFamily: fontFamily,
						fontSize: 12,
						fontWeight: 500,
						color: '#ccc'
					}
				},
				series: [
					{
						type: 'bar',
						data: data[ 1 ],
						name: locate.inUSD,
						barMaxWidth: 24,
						itemStyle: {
							borderRadius: [ 5, 5, 0, 0 ]
						},
					}, {
						type: 'bar',
						data: data[ 2 ],
						name: locate.outUSD,
						barMaxWidth: 24,
						itemStyle: {
							borderRadius: [ 5, 5, 0, 0 ]
						},
					}
				]
			};
			//var responsiveOptions = getChartResponsiveOptionsNakamotoCoefficient();
			var responsiveOptions = {};
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsXCMTransfers() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					series: [
						{
							label: {
								fontSize: 17
							},
							barMaxWidth: 56,
							itemStyle: {
								borderRadius: [ 8, 8, 0, 0 ]
							}
						}
					]
				};
			} else {
				newOptions = {
					series: [
						{
							label: {
								fontSize: 15
							},
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [ 5, 5, 0, 0 ]
							}
						}
					]
				};
			}

			return newOptions;
		}

		function getChartOptionsDotTreasuryActivity( chartName, jsonData ) {
			var datasets   = [
				    {
					    name: 'income',
					    label: locate.income
				    }, {
					    name: 'output',
					    label: locate.output
				    }, {
					    name: 'treasury_balance',
					    label: locate.treasury
				    }
			    ],
			    colors     = [
				    '#66E1B6',
				    '#EA1B53',
				    '#F7A21B'
			    ],
			    totalItems = jsonData.length,
			    data       = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function( dataset ) {
					var value = jsonData[ i ][ dataset.name ] ? validate_number( jsonData[ i ][ dataset.name ] ) : '';
					data[ dataset.name ].push( [ jsonData[ i ].date, value ] );
				} );
			}

			var baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: defaultTooltipSettings,
				    legend: defaultLegendSettings,
				    grid: {
					    left: '3%',
					    right: '3%',
					    top: '3%',
					    containLabel: true
				    },
				    xAxis: {
					    type: 'time',
					    boundaryGap: false,
					    axisTick: {
						    show: false
					    },
					    axisLine: {
						    lineStyle: {
							    color: '#262626'
						    }
					    },
					    splitLine: {
						    show: false,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisPointer: defaultAxisPointerSettings,
					    axisLabel: {
						    formatter: dateFormatter,
						    color: '#ccc'
					    }
				    },
				    yAxis: {
					    type: 'value',
					    position: 'right',
					    axisLine: {
						    show: false
					    },
					    splitLine: {
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisPointer: $.extend( true, {}, defaultAxisPointerSettings, {
						    label: {
							    formatter: function( params ) {
								    return DotInsights.NumberUtil.formatWithCommas( parseInt( params.value ) );
							    }
						    }
					    } ),
					    axisLabel: {
						    formatter: function( value ) {
							    return moneyFormat( value );
						    },
						    color: '#ccc'
					    }
				    },
				    series: [
					    {
						    name: locate.income,
						    data: data.income,
						    areaStyle: {
							    opacity: 0.2
						    },
						    itemStyle: {
							    color: colors[ 0 ]
						    },
						    type: 'line',
						    smooth: true,
						    showSymbol: false,
						    emphasis: {
							    focus: 'series'
						    }
					    },
					    {
						    name: locate.output,
						    data: data.output,
						    zlevel: 3,
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
								    {
									    offset: 0,
									    color: 'rgba(107,20,63,1)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(42,16,53,0)'
								    }
							    ] )

						    },
						    itemStyle: {
							    color: colors[ 1 ]
						    },
						    type: 'line',
						    smooth: true,
						    showSymbol: false,
						    emphasis: {
							    focus: 'series'
						    }
					    },
					    {
						    name: locate.treasury,
						    data: data.treasury_balance,
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
								    {
									    offset: 0,
									    color: 'rgba(92,91,61,1)'
								    },
								    {
									    offset: 0.7,
									    color: 'rgba(7,14,48,1)'
								    }
							    ] )
						    },
						    itemStyle: {
							    color: colors[ 2 ]
						    },
						    type: 'line',
						    smooth: true,
						    showSymbol: false,
						    emphasis: {
							    focus: 'series'
						    }
					    }
				    ]
			    },
			    responsiveOptions = getChartResponsiveOptionsDotTreasuryActivity();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsDotTreasuryActivity() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 8
					}
				};
			} else {
				newOptions = {
					xAxis: {
						splitNumber: 4
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( true, newOptions, {
						xAxis: {
							splitNumber: 2
						}
					} );
				}
			}

			return newOptions;
		}

		function getChartOptionsPolkadotParachain( chartName, jsonData ) {
			var datasets       = [
				    {
					    name: 'parallel',
					    label: 'Parallel'
				    }, {
					    name: 'acala',
					    label: 'Acala'
				    }
			    ],
			    colors         = [
				    '#2F74F7',
				    '#EA1B53'
			    ],
			    areaBackground = [
				    [ 'rgba(26,65,149,1)', 'rgba(26,65,149,0)' ],
				    [ 'rgba(102,19,63,1)', 'rgba(102,19,63,0.3)' ]
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartOptionsKusamaParachain( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'karura',
					    label: 'Karura'
				    }, {
					    name: 'bifrost',
					    label: 'Bifrost'
				    }, {
					    name: 'genshiro',
					    label: 'Genshiro'
				    }
			    ],
			    colors   = [
				    '#C30D00',
				    '#5A25F0',
				    '#FB7930'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartOptionsDotsamaDex( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'stellaswap',
					    label: 'StellaSwap'
				    }, {
					    name: 'beamswap',
					    label: 'Beamswap'
				    }, {
					    name: 'solarbeam',
					    label: 'Solarbeam'
				    }, {
					    name: 'solarflare',
					    label: 'Solarflare'
				    }, {
					    name: 'zenlink',
					    label: 'Zenlink'
				    }
				    , {
					    name: 'arthswap',
					    label: 'ArthSwap'
				    }
			    ],
			    colors   = [
				    '#66E1B6',
				    '#C30D00',
				    '#F7A21B',
				    '#9D3BEA',
				    '#89C900',
				    '#004BFF'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartOptionsDotsamaLendingProtocol( chartName, jsonData ) {
			var datasets       = [
				    {
					    name: 'starlay',
					    label: 'Starlay'
				    }, {
					    name: 'artemis',
					    label: 'Moonwell Artemis'
				    }, {
					    name: 'apollo',
					    label: 'Moonwell Apollo'
				    }
			    ],
			    colors         = [
				    '#D50075',
				    '#B8E94A',
				    '#5C42FB'
			    ],
			    areaBackground = [
				    [ 'rgba(95,16,102,1)', 'rgba(95,16,102,0.4)' ],
				    [ 'rgba(77,99,64,1)', 'rgba(77,99,64,0.4)' ],
				    [ 'rgba(37,33,122,1)', 'rgba(37,33,122,0.4)' ]
			    ];

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartOptionsAUsdIssuance( chartName, jsonData ) {
			var datasets       = [
				    {
					    name: 'acala',
					    label: 'Acala'
				    }, {
					    name: 'karura',
					    label: 'Karura'
				    }
			    ],
			    colors         = [
				    '#C30D00',
				    '#004BFF'
			    ],
			    areaBackground = [
				    [ 'rgba(108,13,22,0.9)', 'rgba(108,13,22,0.3)' ],
				    [ 'rgba(23,46,152,0.9)', 'rgba(23,46,152,0.3)' ]
			    ],
			    seriesOptions  = {
				    stack: 'total'
			    };

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground, seriesOptions ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartOptionsRmrkCumulativeSales( chartName, jsonData ) {
			var datasets          = [
				    {
					    name: 'cumulative_sum_of_amount',
					    label: 'Cumulative Sum of Amount'
				    }
			    ],
			    colors            = [
				    '#CA2B77'
			    ],
			    areaBackground    = [
				    [ 'rgba(86,25,77,1)', 'rgba(86,25,77,0)' ]
			    ],
			    seriesOptions     = {
				    lineStyle: {
					    width: 4
				    }
			    },
			    chartExtraOptions = {
				    legend: {
					    show: false
				    },
				    grid: {
					    left: 54,
					    bottom: '3%'
				    },
				    xAxis: {
					    splitLine: {
						    show: true
					    }
				    },
				    yAxis: {
					    name: 'Volume (KSM)',
					    nameLocation: 'middle',
					    nameGap: 83,
					    nameTextStyle: {
						    fontFamily: fontFamily,
						    color: '#ccc',
						    fontSize: 15,
						    fontWeight: '500'
					    },
					    splitNumber: 4
				    }
			    };

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground, seriesOptions, chartExtraOptions ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartOptionsRmrkDailySales( chartName, jsonData ) {
			var datasets    = [
				    {
					    name: 'kanbird',
					    label: 'KANBIRD'
				    }, {
					    name: 'kanchamp',
					    label: 'KANCHAMP'
				    }, {
					    name: 'kanprtn',
					    label: 'KANPRTN'
				    }, {
					    name: 'evrloot',
					    label: 'EVRLOOT'
				    }, {
					    name: 'kk01',
					    label: 'KK01'
				    }, {
					    name: 'rmrkbnnrs',
					    label: 'RMRKBNNRS'
				    }, {
					    name: 'kq01',
					    label: 'KQ01'
				    }, {
					    name: 'kanbg',
					    label: 'KANBG'
				    }, {
					    name: 'others',
					    label: locate.others
				    }
			    ],
			    colors      = [
				    '#004BFF',
				    '#DF5C53',
				    '#709BF5',
				    '#66E1B6',
				    '#9D3BEA',
				    '#2D9C42',
				    '#889641',
				    '#E12C29',
				    '#F7A21B'
			    ],
			    totalItems  = jsonData.length,
			    data        = [],
			    chartSeries = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function( dataset ) {
					var value = jsonData[ i ][ dataset.name ] ? validate_number( jsonData[ i ][ dataset.name ] ) : '';
					data[ dataset.name ].push( [ jsonData[ i ].date, value ] );
				} );
			}

			datasets.forEach( function( dataset, index ) {
				chartSeries.push( {
					name: dataset.label,
					data: data[ dataset.name ],
					itemStyle: {
						color: colors[ index ]
					},
					type: 'bar',
					stack: 'total',
					emphasis: {
						focus: 'series'
					}
				} );
			} );

			var baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: {
					    trigger: 'axis',
					    padding: [ 15, 20 ],
					    backgroundColor: '#21063C',
					    borderWidth: 0,
					    extraCssText: 'border-radius: 10px;box-shadow: 0 4px 50px rgba(161, 107, 216, 0.5);',
					    textStyle: {
						    fontFamily: fontFamily,
						    color: '#ccc',
						    fontSize: 14,
						    fontWeight: '500'
					    },
					    axisPointer: {
						    type: 'shadow',
						    label: {
							    color: '#020722',
							    backgroundColor: '#4ccbc9'
						    },
						    crossStyle: {
							    color: 'rgba(255,255,255,0.3)'
						    },
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: 'rgba(255,255,255,0.3)'
						    }
					    }
				    },
				    legend: defaultLegendSettings,
				    grid: {
					    left: 78,
					    right: '3%',
					    top: '3%',
					    containLabel: true
				    },
				    xAxis: {
					    type: 'time',
					    boundaryGap: false,
					    axisTick: {
						    show: false
					    },
					    axisLine: {
						    show: false,
						    lineStyle: {
							    color: '#262626'
						    }
					    },
					    splitLine: {
						    show: true,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisPointer: {
						    label: {
							    color: '#66E1B6',
							    backgroundColor: '#262C4A'
						    }
					    },
					    axisLabel: {
						    formatter: dateFormatter,
						    color: '#ccc'
					    }
				    },
				    yAxis: {
					    type: 'value',
					    axisLine: {
						    show: false
					    },
					    splitLine: {
						    show: true,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisPointer: {
						    label: {
							    color: '#66E1B6',
							    backgroundColor: '#262C4A'
						    }
					    },
					    axisLabel: {
						    color: '#ccc'
					    },
					    name: 'Volume (KSM)',
					    nameLocation: 'middle',
					    nameGap: 100,
					    nameTextStyle: {
						    fontFamily: fontFamily,
						    color: '#ccc',
						    fontSize: 15,
						    fontWeight: '500'
					    }
				    },
				    series: chartSeries
			    },
			    responsiveOptions = getChartResponsiveOptionsRmrkDailySales( chartName );

			$.extend( true, baseOptions, responsiveOptions );
			return baseOptions;
		}

		function getChartResponsiveOptionsRmrkDailySales() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					grid: {
						left: 78
					},
					yAxis: {
						nameGap: 100,
						nameTextStyle: {
							fontSize: 15
						},
						axisLabel: {
							formatter: '{value}'
						}
					},
					xAxis: {
						splitNumber: 8,
						axisLabel: {
							formatter: dateFormatter
						}
					}
				};
			} else {
				newOptions = {
					grid: {
						left: 50
					},
					yAxis: {
						nameGap: 50,
						nameTextStyle: {
							fontSize: 14
						},
						axisLabel: {
							formatter: function( value ) {
								return moneyFormat( value );
							}
						}
					},
					xAxis: {
						splitNumber: 3,
						axisLabel: {
							formatter: dateShortFormatter
						}
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( newOptions, {
						xAxis: {
							splitNumber: 3
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsWebAssemblyUsage( chartName, jsonData ) {
			var datasets       = [
				    {
					    name: 'notused',
					    label: locate.notUsed
				    }, {
					    name: 'occasionally',
					    label: locate.usedOccasionally
				    }, {
					    name: 'sometimes',
					    label: locate.useSometimes
				    },
				    {
					    name: 'frequently',
					    label: locate.useFrequently
				    }
			    ],
			    datasetsLength = datasets.length,
			    colors         = [
				    '#004BFF',
				    '#DF5C53',
				    '#F7A21B',
				    '#66E1B6'
			    ],
			    categories     = [
				    {
					    name: 'rust',
					    label: 'Rust'
				    }, {
					    name: 'javascript',
					    label: 'JavaScript'
				    }, {
					    name: 'c_plus',
					    label: 'C++'
				    }, {
					    name: 'blazor',
					    label: 'Blazor'
				    }, {
					    name: 'assemblyscript',
					    label: 'AssemblyScript'
				    }, {
					    name: 'python',
					    label: 'Python'
				    }, {
					    name: 'go',
					    label: 'Go'
				    }, {
					    name: 'wat',
					    label: 'WAT'
				    }, {
					    name: 'zig',
					    label: 'Zig'
				    }, {
					    name: 'java',
					    label: 'Java'
				    }, {
					    name: 'swift',
					    label: 'Swift'
				    }, {
					    name: 'ruby',
					    label: 'Ruby'
				    }, {
					    name: 'grain',
					    label: 'Grain'
				    }
			    ],
			    totalItems     = jsonData.length,
			    data           = [],
			    chartSeries    = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var catIndex = 0; catIndex < categories.length; catIndex ++ ) {
				categories[ catIndex ].total = 0;
				for ( var i = 0; i < totalItems; i ++ ) {
					var value = parseInt( jsonData[ i ][ categories[ catIndex ].name ] );
					categories[ catIndex ].total += value;
					switch ( jsonData[ i ].category ) {
						case 'use frequently':
							categories[ catIndex ].frequently = value;
							break;
						case 'use sometimes':
							categories[ catIndex ].sometimes = value;
							break;
						case 'have used occasionally':
							categories[ catIndex ].occasionally = value;
							break;
						case 'not used':
							categories[ catIndex ].notused = value;
							break;
					}
				}
			}

			for ( var i = 0; i < categories.length; i ++ ) {
				var total = categories[ i ].total;
				categories[ i ].frequentlyPercent = DotInsights.NumberUtil.precisionRoundMod( categories[ i ].frequently / total * 100, 2 );
				categories[ i ].sometimesPercent = DotInsights.NumberUtil.precisionRoundMod( categories[ i ].sometimes / total * 100, 2 );
				categories[ i ].occasionallyPercent = DotInsights.NumberUtil.precisionRoundMod( categories[ i ].occasionally / total * 100, 2 );
				categories[ i ].notusedPercent = DotInsights.NumberUtil.precisionRoundMod( 100 - categories[ i ].frequentlyPercent - categories[ i ].sometimesPercent - categories[ i ].occasionallyPercent, 2 );
			}

			for ( var dataIndex = 0; dataIndex < datasets.length; dataIndex ++ ) {
				datasets[ dataIndex ].data = [];
				var name = datasets[ dataIndex ].name;
				for ( var catIndex = 0; catIndex < categories.length; catIndex ++ ) {
					datasets[ dataIndex ].data.push( categories[ catIndex ][ name + 'Percent' ] );
				}
			}

			datasets.forEach( function( dataset, index ) {
				var datasetOptions = {
					name: dataset.label,
					data: dataset.data,
					realData: dataset.realData,
					foo: 'bar',
					itemStyle: {
						color: colors[ index ]
					},
					barMaxWidth: 24,
					type: 'bar',
					stack: 'total',
					emphasis: {
						focus: 'series'
					}
				};

				if ( index === 0 ) {
					datasetOptions.itemStyle.borderRadius = [ 0, 0, 3, 3 ];
				}

				if ( index === datasetsLength - 1 ) {
					datasetOptions.itemStyle.borderRadius = [ 3, 3, 0, 0 ];
				}

				chartSeries.push( datasetOptions );
			} );

			return {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: {
					trigger: 'axis',
					padding: [ 15, 20 ],
					backgroundColor: '#21063C',
					borderWidth: 0,
					extraCssText: 'border-radius: 10px;box-shadow: 0 4px 50px rgba(161, 107, 216, 0.5);',
					textStyle: {
						fontFamily: fontFamily,
						color: '#ccc',
						fontSize: 14,
						fontWeight: '500'
					},
					valueFormatter: function( value ) {
						return value + '%';
					},
					axisPointer: {
						type: 'shadow',
						label: {
							color: '#020722',
							backgroundColor: '#4ccbc9'
						},
						crossStyle: {
							color: 'rgba(255,255,255,0.3)'
						},
						lineStyle: {
							type: [ 4, 4 ],
							color: 'rgba(255,255,255,0.3)'
						}
					}
				},
				legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: '3%',
					top: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					data: [
						'Rust',
						'JavaScript',
						'C++',
						'Blazor',
						'AssemblyScript',
						'Python',
						'Go',
						'WAT',
						'Zig',
						'Java',
						'Swift',
						'Ruby',
						'Grain'
					],
					axisLabel: {
						interval: 0,
						rotate: 30
					}
				},
				yAxis: {
					type: 'value',
					axisLine: {
						show: false
					},
					splitLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisLabel: {
						formatter: '{value}%',
						color: '#ccc'
					}
				},
				series: chartSeries
			};
		}

		function getChartOptionsTreasuryOutput( chartName ) {
			var datasets = [
				{
					value: 470447,
					name: locate.proposal
				}, {
					value: 12212,
					name: locate.tips
				}, {
					value: 1103232,
					name: locate.bounties
				}, {
					value: 5070182,
					name: locate.burnt
				}
			], colors    = [
				'#66E1B6',
				'#F7A21B',
				'#DF5C53',
				'#004BFF'
			];

			// find the sum of all data values
			/*var sum = datasets.reduce( function( prev, current ) {
				return prev + current.value;
			}, 0 );

			sum = moneyFormat( sum );*/

			return {
				color: colors,
				tooltip: $.extend( true, {}, defaultTooltipStyle, {
					trigger: 'item',
					valueFormatter: function( value ) {
						return DotInsights.NumberUtil.formatWithCommas( value ) + ' DOT';
					}
				} ),
				legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: '3%',
					top: '0',
					containLabel: true
				},
				series: [
					{
						name: 'Treasury Output',
						type: 'pie',
						//top: 'top',
						center: [ '50%', '45%' ],
						radius: [ '68%', '86%' ],
						label: {
							color: '#A8ADC3',
							fontFamily: fontFamily,
							fontWeight: 500,
							fontSize: 18,
							position: 'center',
							formatter: [
								'{a|6.66M} {x|DOT}',
								'{t| ' + locate.totalAmount + ' }'
							].join( '\n' ),
							rich: {
								a: {
									color: '#66E1B6',
									fontFamily: fontFamily,
									fontWeight: 700,
									fontSize: '30'
								},
								x: {
									color: '#ffffff',
									fontFamily: fontFamily,
									fontWeight: 700,
									fontSize: '30'
								},
								t: {
									color: '#A8ADC3',
									fontFamily: fontFamily,
									fontWeight: 500,
									fontSize: 18,
									padding: [ 18, 0, 0, 0 ]
								}
							}
						},
						labelLine: {
							show: false
						},
						itemStyle: {
							borderColor: '#070e30',
							borderWidth: 4
						},
						emphasis: {
							scaleSize: 5
						},
						data: datasets
					}
				]
			};
		}

		function getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground, seriesOptions, chartExtraOptions ) {
			var totalItems = jsonData.length,
			    data       = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function( dataset ) {
					var value = jsonData[ i ][ dataset.name ] ? validate_number( jsonData[ i ][ dataset.name ] ) : '';
					data[ dataset.name ].push( [ jsonData[ i ].date, value ] );
				} );
			}

			var chartSeries = [];

			datasets.forEach( function( dataset, index ) {
				var options = {
					name: dataset.label,
					data: data[ dataset.name ],
					itemStyle: {
						color: colors[ index ]
					},
					type: 'line',
					smooth: true,
					showSymbol: false,
					connectNulls: true, // used for dotsama dex.
					emphasis: {
						focus: 'series'
					}
				};

				if ( areaBackground && areaBackground[ index ] ) {
					options.areaStyle = {
						//opacity: 0.6,
						color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
							{
								offset: 0,
								color: areaBackground[ index ][ 0 ]
							},
							{
								offset: 1,
								color: areaBackground[ index ][ 1 ]
							}
						] )
					};
				}

				if ( typeof seriesOptions !== 'undefined' ) {
					options = $.extend( true, {}, options, seriesOptions );
				}

				chartSeries.push( options );
			} );

			var chartOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: $.extend( true, {}, defaultTooltipStyle, {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: 'rgba(255,255,255,0.3)'
						},
						lineStyle: {
							type: [ 4, 4 ],
							color: 'rgba(255,255,255,0.3)'
						}
					}
				} ),
				legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: '3%',
					top: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					axisTick: {
						show: false
					},
					axisLine: {
						lineStyle: {
							color: '#262626'
						}
					},
					splitLine: {
						show: false,
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisPointer: {
						label: {
							color: '#66E1B6',
							backgroundColor: '#262C4A'
						}
					},
					axisLabel: {
						formatter: dateFormatter,
						color: '#ccc'
					}
				},
				yAxis: {
					type: 'value',
					axisLine: {
						show: false
					},
					splitNumber: 4,
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#262626' ]
						}
					},
					axisPointer: {
						label: {
							color: '#66E1B6',
							backgroundColor: '#262C4A'
						}
					},
					axisLabel: {
						color: '#ccc'
					}
				},
				series: chartSeries
			};

			if ( chartExtraOptions ) {
				return $.extend( true, {}, chartOptions, chartExtraOptions );
			}

			return chartOptions;
		}

		function getChartLinesBaseResponsiveOptions( chartName ) {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 8
					}
				};
			} else {
				newOptions = {
					xAxis: {
						splitNumber: 3
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( true, newOptions, {
						xAxis: {
							splitNumber: 2
						}
					} );
				}
			}

			var yAxis = {};
			switch ( chartName ) {
				case 'polkadot-parachain':
				case 'kusama-parachain':
				case 'polkadot-dex':
				case 'polkadot-lending-protocol':
				case 'ausd-issuance':
					var tooltip = {
						valueFormatter: function( value ) {
							return value ? '$' + DotInsights.NumberUtil.formatWithCommas( value ) : '-';
						}
					};
					newOptions.tooltip = tooltip;

					if ( window.innerWidth > 767 ) {
						yAxis = {
							axisPointer: {
								label: {
									formatter: "${value}"
								}
							},
							axisLabel: {
								formatter: "${value}"
							}
						};
					} else {
						yAxis = {
							axisPointer: {
								label: {
									formatter: "${value}"
								}
							},
							axisLabel: {
								formatter: function( value ) {
									return value ? '$' + moneyFormat( value ) : '-';
								}
							}
						};
					}
					newOptions.yAxis = yAxis;

					break;
				case 'rmrk-cumulative-sales':
					if ( window.innerWidth > 767 ) {
						yAxis = {
							axisLabel: {
								formatter: "{value}"
							}
						};
					} else {
						yAxis = {
							axisLabel: {
								formatter: function( value ) {
									return value ? moneyFormat( value ) : '-';
								}
							}
						};
					}
					newOptions.yAxis = yAxis;

					break;
			}

			switch ( chartName ) {
				case 'rmrk-cumulative-sales':
					if ( window.innerWidth > 767 ) {
						$.extend( true, newOptions, {
							grid: {
								left: 54
							},
							yAxis: {
								nameTextStyle: {
									fontSize: 15
								},
								nameGap: 83
							},
							series: [
								{
									lineStyle: {
										width: 4
									}
								}
							]
						} );
					} else {
						$.extend( true, newOptions, {
							grid: {
								left: 40
							},
							yAxis: {
								nameTextStyle: {
									fontSize: 14
								},
								nameGap: 56
							},
							series: [
								{
									lineStyle: {
										width: 2
									}
								}
							]
						} );
					}
					break;
			}

			return newOptions;
		}

		function getChartDataXCMTransfers() {
			return [
				[
					'Moonbeam',
					'Acala',
					'Moonriver',
					'Parallel',
					'Karura',
					'Parallel Heiko',
					'Interlay',
					'Bifrost Kusama',
					'Astar',
					'Kintsugi'
				],
				[ 56878947, 21890482, 18066626, 17998162, 15076004, 12107783, 6417391, 5148441, 3876451, 1699308 ],
				[ 39684136, 27054801, 11053411, 19805052, 18723873, 8756901, 1443603, 2449835, 8005710, 856864 ],
			]
		}

		function getTokenIcon( name ) {
			var icon = '';

			switch ( name ) {
				case 'Polkadot':
					icon = 'dot.png';
					break;
				case 'Solana':
					icon = 'sol.png';
					break;
				case 'Avalanche':
				case 'Avax':
					icon = 'avax.png';
					break;
				case 'Cosmos':
					icon = 'atom.png';
					break;
				case 'Near':
					icon = 'near.png';
					break;
				case 'Polygon':
					icon = 'polygon.png';
					break;
				case 'Fantom':
					icon = 'fantom.png';
					break;
				case 'BSC':
					icon = 'bsc.png';
					break;
				case 'Moonbeam':
					icon = 'moonbeam.png';
					break;
				case 'Acala':
					icon = 'acala.png';
					break;
				case 'Moonriver':
					icon = 'moonriver.png';
					break;
				case 'Parallel':
					icon = 'parallel.png';
					break;
				case 'Karura':
					icon = 'karura.png';
					break;
				case 'ParallelHeiko':
					icon = 'parallel-keiko.png';
					break;
				case 'Interlay':
					icon = 'interlay.png';
					break;
				case 'Bifrost':
					icon = 'bifrost.png';
					break;
				case 'Astar':
					icon = 'astar.png';
					break;
				case 'Kintsugi':
					icon = 'kintsugi.png';
					break;
			}

			return '' !== icon ? tokenBaseUrl + icon : ''
		}

	}( jQuery )
);
