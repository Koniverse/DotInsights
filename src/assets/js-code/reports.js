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

		var NumberUtil                      = DotInsights.NumberUtil,
		    $allCharts                      = $( '.block-chart' ),
		    dateFormatter                   = '{dd}/{MM}/{yyyy}',
		    dateShortFormatter              = '{MM}/{yyyy}',
		    fontFamily                      = 'Plus Jakarta Sans',
		    echarts                         = window.echarts,
		    defaultTooltipStyle             = {
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
		    defaultTooltipSettings          = $.extend( true, {}, defaultTooltipStyle, {
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
		    defaultLegendSettings           = {
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
		    defaultAxisPointerLabelSettings = {
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
						case 'dex-with-average-tvl':
						case 'tvl-lending-borrowing':
						case 'stablecoin-total-issuance':
							chartOptions = getChartLinesBaseResponsiveOptions( chartName );
							break;
						case 'nft-marketplace-daily-volume':
							chartOptions = getChartResponsiveOptionsNftMarketplaceDailyVolume( chartName );
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
						case 'tvl-lending-borrowing':
							chartOptions = getChartOptionsTvlLendingBorrowing( chartName, jsonData );
							break;
						case 'tvl-liquid-staking':
							chartOptions = getChartOptionsTvlLiquidStaking( chartName, jsonData );
							break;
						case 'dex-with-average-tvl-higher-than-10m':
							chartOptions = getChartOptionsDexWithAverageTvlHigherThan10M( chartName, jsonData );
							break;
						case 'dex-with-average-tvl-lower-than-5m':
							chartOptions = getChartOptionsDexWithAverageTvlLowerThan5M( chartName, jsonData );
							break;
						case 'stablecoin-total-issuance':
							chartOptions = getChartOptionsStablecoinTotalIssuance( chartName, jsonData );
							break;
						case 'nft-marketplace-daily-volume':
							chartOptions = getChartOptionsNftMarketplaceDailyVolume( chartName, jsonData );
							break;
						case 'dot-treasury-activity':
							chartOptions = getChartOptionsDotTreasuryActivity( chartName, jsonData );
							break;
						case 'subsocial-daily-activities':
							chartOptions = getChartOptionsSubsocialDailyActivities( chartName, jsonData );
							break;
						case 'joystream-cumulative-activities':
							chartOptions = getChartOptionsJoystreamCumulativeActivities( chartName, jsonData );
							break;
					}
					chartInstance.hideLoading();
					chartInstance.setOption( chartOptions );
				} );
			} else { // Chart with inline source.
				var chartOptions = {};

				switch ( chartName ) {
					case 'web3-foundation-grants':
						chartOptions = getChartOptionsWeb3FoundationGrants( chartName );
						break;
					case 'tvl-by-chain':
						chartOptions = getChartOptionsTvlByChain( chartName );
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
					axisPointer: defaultAxisPointerLabelSettings,
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
					axisPointer: defaultAxisPointerLabelSettings,
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
					axisPointer: defaultAxisPointerLabelSettings,
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
					var value = jsonData[ i ][ dataset.name ] ? NumberUtil.validate( jsonData[ i ][ dataset.name ] ) : '';
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
					    axisPointer: defaultAxisPointerLabelSettings,
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
						axisPointer: defaultAxisPointerLabelSettings,
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
						axisPointer: defaultAxisPointerLabelSettings,
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
								return NumberUtil.formatMoney( value );
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
						data: [ 53, 40, 38, 37, 32, 31, 27, 26, 25, 25 ],
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
					    name: 'treasury',
					    label: locate.treasury
				    }
			    ],
			    colors     = [
				    '#66E1B6',
				    '#9D3BEA',
				    '#004BFF'
			    ],
			    totalItems = jsonData.length,
			    data       = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function( dataset ) {
					var value = jsonData[ i ][ dataset.name ] ? NumberUtil.validate( jsonData[ i ][ dataset.name ] ) : '';
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
					    axisPointer: defaultAxisPointerLabelSettings,
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
					    axisPointer: $.extend( true, {}, defaultAxisPointerLabelSettings, {
						    label: {
							    formatter: function( params ) {
								    return NumberUtil.formatWithCommas( parseInt( params.value ) );
							    }
						    }
					    } ),
					    axisLabel: {
						    formatter: function( value ) {
							    return NumberUtil.formatMoney( value );
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
						    connectNulls: true,
						    emphasis: {
							    focus: 'series'
						    }
					    },
					    {
						    name: locate.output,
						    data: data.output,
						    z: 9,
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
								    {
									    offset: 0,
									    color: 'rgba(80,38,114,1)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(80,38,114,0.5)'
								    }
							    ] )

						    },
						    itemStyle: {
							    color: colors[ 1 ]
						    },
						    type: 'line',
						    smooth: true,
						    showSymbol: false,
						    connectNulls: true,
						    emphasis: {
							    focus: 'series'
						    }
					    },
					    {
						    name: locate.treasury,
						    data: data.treasury,
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
								    {
									    offset: 0,
									    color: 'rgba(14,65,125,1)'
								    },
								    {
									    offset: 0.6,
									    color: 'rgba(14,65,125,0.5)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(21,21,21,1)'
								    }
							    ] )
						    },
						    itemStyle: {
							    color: colors[ 2 ]
						    },
						    type: 'line',
						    smooth: true,
						    showSymbol: false,
						    connectNulls: true,
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

		function getChartOptionsDexWithAverageTvlHigherThan10M( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'arthswap',
					    label: 'ArthSwap'
				    }, {
					    name: 'curve_glmr',
					    label: 'Curve Finance on Moonbeam'
				    }, {
					    name: 'solarbeam',
					    label: 'Solarbeam'
				    }, {
					    name: 'stellaswap',
					    label: 'StellaSwap'
				    }, {
					    name: 'zenlink',
					    label: 'Zenlink'
				    },
			    ],
			    colors   = [
				    '#66E1B6',
				    '#C30D00',
				    '#F7A21B',
				    '#9D3BEA',
				    '#89C900'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsDexWithAverageTvlLowerThan5M( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'avault',
					    label: 'Avault'
				    }, {
					    name: 'beamswap',
					    label: 'Beamswap'
				    }, {
					    name: 'beefy_glmr',
					    label: 'Beefy on Moonbeam'
				    }, {
					    name: 'beefy_movr',
					    label: 'Beefy on Moonriver'
				    }, {
					    name: 'bifrost',
					    label: 'Bifrost'
				    }, {
					    name: 'solarflare',
					    label: 'Solarflare'
				    }, {
					    name: 'parallel',
					    label: 'Parallel'
				    }, {
					    name: 'karura',
					    label: 'Karura'
				    },
			    ],
			    colors   = [
				    '#D251FD',
				    '#774EED',
				    '#66E1B6',
				    '#FFA800',
				    '#0049F1',
				    '#89C900',
				    '#22BFFE',
				    '#C30D00'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlLendingBorrowing( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'moonwell_apollo',
					    label: 'Moonwell Apollo'
				    }, {
					    name: 'moonwell_artemis',
					    label: 'Moonwell Artemis'
				    }, {
					    name: 'parallel',
					    label: 'Parallel'
				    }, {
					    name: 'starlay',
					    label: 'Starlay'
				    }
			    ],
			    colors   = [
				    '#5C42FB',
				    '#B8E94A',
				    '#22BFFE',
				    '#D50075'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlLiquidStaking( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'lido_moonbeam',
					    label: 'Lido on Moonbeam (DOT)'
				    }, {
					    name: 'lido_moonriver',
					    label: 'Lido Moonriver (KSM)'
				    }, {
					    name: 'karura',
					    label: 'Karura (KSM)'
				    }, {
					    name: 'parallel',
					    label: 'Parallel (DOT)'
				    }, {
					    name: 'bifrost',
					    label: 'Bifrost (KSM)'
				    }, {
					    name: 'taiga',
					    label: 'Taiga (KSM)'
				    }
			    ],
			    colors   = [
				    '#E6007A',
				    '#66E1B6',
				    '#C30D00',
				    '#22BFFE',
				    '#0049F1',
				    '#A23CC8'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsStablecoinTotalIssuance( chartName, jsonData ) {
			var datasets       = [
				    {
					    name: 'karura',
					    label: 'aUSD (Karura)',
					    options: {
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(203,47,90,0.42)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(203,47,90,0.05)'
								    }
							    ] )
						    }
					    }
				    }, {
					    name: 'bai',
					    label: 'BAI (AstridDAO)',
					    options: {
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(233,178,8,0.42)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(233,178,8,0.05)'
								    }
							    ] )
						    }
					    }
				    }
			    ],
			    colors         = [
				    '#CB2F5A',
				    '#E9B255'
			    ];

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsNftMarketplaceDailyVolume( chartName, jsonData ) {
			var datasets    = [
				    {
					    name: 'singular',
					    label: 'Singular'
				    },
				    {
					    name: 'tofu_glmr',
					    label: 'tofu GLMR'
				    },
				    {
					    name: 'tofu_movr',
					    label: 'tofu MOVR'
				    },
				    {
					    name: 'tofu_astr',
					    label: 'tofu ASTR'
				    },
				    {
					    name: 'tofu_sdn',
					    label: 'tofu SDN'
				    },
				    {
					    name: 'moonbeans_glmr',
					    label: 'MoonBeans GLMR'
				    },
				    {
					    name: 'moonbeans_movr',
					    label: 'Moonbeans MOVR'
				    },
				    {
					    name: 'nft_trades',
					    label: 'NFTTrades'
				    },
				    {
					    name: 'mintverse',
					    label: 'Mintverse'
				    }
			    ],
			    colors      = [
				    '#E6007A',
				    '#FFB800',
				    '#004BFF',
				    '#FF6B00',
				    '#F0A08C',
				    '#4CCBC9',
				    '#9EE542',
				    '#429DF4',
				    '#BB3E24'
			    ],
			    totalItems  = jsonData.length,
			    data        = [],
			    chartSeries = [];

			datasets.forEach( function( dataset ) {
				data[ dataset.name ] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function( dataset ) {
					var value = jsonData[ i ][ dataset.name ] ? NumberUtil.validate( jsonData[ i ][ dataset.name ] ) : '';
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
					    axisPointer: defaultAxisPointerLabelSettings,
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
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    color: '#ccc'
					    }
				    },
				    series: chartSeries
			    },
			    responsiveOptions = getChartResponsiveOptionsNftMarketplaceDailyVolume( chartName );

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsSubsocialDailyActivities( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'post',
					    label: locate.postsCreated
				    }, {
					    name: 'space',
					    label: locate.spaceCreated
				    }
			    ],
			    colors   = [
				    '#004BFF',
				    '#E9B255'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsJoystreamCumulativeActivities( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'user',
					    label: locate.users,
					    options: {
						    z: 9,
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(0,75,255,0.8)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(0,75,255,0.05)'
								    }
							    ] )
						    }
					    }
				    },
				    {
					    name: 'video',
					    label: locate.videos,
					    options: {
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(233,178,85,0.42)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(233,178,85,0.05)'
								    }
							    ] )
						    },
						    z: 9
					    }
				    }
			    ],
			    colors   = [
				    '#004BFF',
				    '#E9B255'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsNftMarketplaceDailyVolume() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: '${value}'
						}
					},
					xAxis: {
						splitNumber: 5,
						axisLabel: {
							formatter: dateFormatter
						}
					}
				};
			} else {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: function( value ) {
								return '$' + NumberUtil.formatWithCommas( value );
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

		function getChartOptionsWeb3FoundationGrants( chartName ) {
			var datasets = [
				    {
					    name: locate.runtimeModulesChains,
					    value: 41.5,
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				}, {
					    name: locate.developmentTools,
					    value: 11.1,
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				}, {
					    name: locate.wallets,
					    value: 8.5
				}, {
					    name: locate.uiDevelopment,
					    value: 13.2
				    }, {
					    name: locate.deploymentTooling,
					    value: 5.6
				    }, {
					    name: locate.runtimeEnvironment,
					    value: 2.6
				    }, {
					    name: locate.languageDevelopment,
					    value: 2.1
				    }, {
					    name: locate.apis,
					    value: 4.5
				    }, {
					    name: locate.bridges,
					    value: 2.4
				    }, {
					    name: locate.cryptography,
					    value: 3.0
				    }, {
					    name: locate.smartContracts,
					    value: 4.0
				    }
			    ],
			    colors   = [
				    '#004BFF',
				    '#66E1B6',
				    '#9293FF',
				    '#FD5BDB',
				    '#F01923',
				    '#FF7D0A',
				    '#FFEF5B',
				    '#F0A08C',
				    '#C669FF',
				    '#A9AC24',
				    '#47D9FA',
			    ];

			return {
				color: colors,
				tooltip: $.extend( true, {}, defaultTooltipStyle, {
					trigger: 'item',
					valueFormatter: function( value ) {
						return value + '%';
					}
				} ),
				//legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: '3%',
					top: '0',
					containLabel: true
				},
				series: [
					{ // Center logo.
						name: 'Label',
						type: 'pie',
						//top: 'top',
						center: [ '50%', '45%' ],
						radius: [ '68%', '86%' ],
						label: {
							show: true,
							position: 'center',
							formatter: '',
							/*rich: {
								branding: {
									width: 252,
									height: 106,
									image: baseUrl + '/assets/images/report/web3-foundation-grants.png'
								}
							}*/
							backgroundColor: {
								image: baseUrl + '/assets/images/report/web3-foundation-grants.png'
								// It can be URL of a image,
								// or dataURI,
								// or HTMLImageElement,
								// or HTMLCanvasElement.
							},
							width: 252,
							height: 106
						},
						itemStyle: {
							color: '#151515'
						},
						silent: true,
						labelLine: {
							show: false
						},
						emphasis: {
							scaleSize: 5
						},
						data: [
							{
								name: '',
								value: 100
							}
						]
					}, {
						name: 'Category',
						type: 'pie',
						//top: 'top',
						center: [ '50%', '45%' ],
						radius: [ '68%', '86%' ],
						label: {
							alignTo: 'edge',
							minMargin: 5,
							edgeDistance: 10,
							color: '#fff',
							fontFamily: fontFamily,
							fontWeight: 500,
							fontSize: 17,
							lineHeight: 30,
							formatter: function( params ) {
								return `${params.name} ${params.value}%`;
							}
						},
						labelLine: {
							showAbove: false,
							length: 30,
							length2: 0,
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'

									},
									{
										offset: 1,
										color: '#fff'
									}
								] ),
								//color: '#fff'
							},
							maxSurfaceAngle: 80

						},
						/*labelLayout: function( params ) {
							const isLeft = params.labelRect.x < 570;
							const points = params.labelLinePoints;
							// Update the end point.
							points[ 2 ][ 0 ] = isLeft
								? params.labelRect.x
								: params.labelRect.x + params.labelRect.width;
							return {
								labelLinePoints: points
							};
						},*/
						itemStyle: {
							borderColor: '#151515',
							borderWidth: 5
						},
						emphasis: {
							scaleSize: 5
						},
						data: datasets
					}
				]
			};
		}

		function getChartOptionsTvlByChain( chartName ) {
			var colors   = [
				    '#E4A30D',
				    '#66E1B6',
				    '#D81356',
				    '#22BFFE',
				    '#1B6AE0',
				    '#F42F44',
				    '#B1B1B1',
				    '#C669FF',
				    '#EC7430',
				    '#9871EB',
				    '#89E469'
			    ],
			    datasets = [
				    {
					    value: 66609820.48,
					    name: 'Moonriver',
					    label: {
						    color: colors[ 0 ]
					    },
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    value: 59641462.91,
					    name: 'Moonbeam',
					    label: {
						    color: colors[ 1 ]
					    },
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    value: 47800887.19,
					    name: 'Acala',
					    label: {
						    color: colors[ 2 ]
					    },
				    }, {
					    value: 40774324.99,
					    name: 'Parallel',
					    label: {
						    color: colors[ 3 ]
					    },
				    }, {
					    value: 36916163.3,
					    name: 'Astar',
					    label: {
						    color: colors[ 4 ]
					    },
				    }, {
					    value: 14488857.47,
					    name: 'Karura',
					    label: {
						    color: colors[ 5 ]
					    },
				    }, {
					    value: 5290490.04,
					    name: 'Heiko',
					    label: {
						    color: colors[ 6 ]
					    },
				    }, {
					    value: 4172517.9,
					    name: 'Interlay',
					    label: {
						    color: colors[ 7 ]
					    },
				    }, {
					    value: 2825232.73,
					    name: 'Bifrost',
					    label: {
						    color: colors[ 8 ]
					    },
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    value: 1827688.62,
					    name: 'Kintsugi',
					    label: {
						    color: colors[ 9 ]
					    },
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    value: 2453873.6,
					    name: 'Others',
					    label: {
						    color: colors[ 10 ]
					    },
					    labelLine: {
						    lineStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: '#fff'

								    },
								    {
									    offset: 1,
									    color: 'rgba(255,255,255,0)'
								    }
							    ] )
						    }
					    }
				    }
			    ];

			return {
				color: colors,
				tooltip: $.extend( true, {}, defaultTooltipStyle, {
					trigger: 'item',
					valueFormatter: function( value ) {
						return NumberUtil.formatWithCommas( value );
					}
				} ),
				/*title: {
					text: `Hello`,
					left: 'center',
					top: 'center',
				},*/
				//legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: '3%',
					top: '0',
					containLabel: true
				},
				series: [
					{
						startAngle: 80,
						name: '',
						type: 'pie',
						//top: 'top',
						center: [ '50%', '45%' ],
						radius: [ '68%', '86%' ],
						label: {
							alignTo: 'edge',
							minMargin: 5,
							edgeDistance: 10,
							color: '#fff',
							fontFamily: fontFamily,
							fontWeight: 500,
							fontSize: 17,
							lineHeight: 30,
							formatter: function( params ) {
								return `${params.name} ${params.percent}%`;
							}
						},
						labelLine: {
							showAbove: false,
							length: 30,
							length2: 0,
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'

									},
									{
										offset: 1,
										color: '#fff'
									}
								] )
							},
							maxSurfaceAngle: 80
						},
						/*labelLayout: function( params ) {
							const isLeft = params.labelRect.x < 570;
							const points = params.labelLinePoints;
							// Update the end point.
							points[ 2 ][ 0 ] = isLeft
								? params.labelRect.x
								: params.labelRect.x + params.labelRect.width;
							return {
								labelLinePoints: points
							};
						},*/
						itemStyle: {
							borderColor: '#151515',
							borderWidth: 2
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
					var value = jsonData[ i ][ dataset.name ] ? NumberUtil.validate( jsonData[ i ][ dataset.name ] ) : '';
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

				if ( dataset.hasOwnProperty( 'options' ) ) {
					options = $.extend( true, {}, options, dataset.options );

					console.log( options );
				}

				// Used dateset.options instead of.
				if ( areaBackground && areaBackground[ index ] ) {
					options.areaStyle = {
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
					axisPointer: defaultAxisPointerLabelSettings,
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
					axisPointer: defaultAxisPointerLabelSettings,
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
				switch ( chartName ) {
					case 'dex-with-average-tvl-higher-than-10m':
					case 'dex-with-average-tvl-lower-than-5m':
					case 'tvl-lending-borrowing':
					case 'tvl-liquid-staking':
					case 'stablecoin-total-issuance':
					case 'subsocial-daily-activities':
					case 'joystream-cumulative-activities':
						newOptions[ 'xAxis' ] = {
							splitNumber: 5
						};
						break;
					default:
						newOptions[ 'xAxis' ] = {
							splitNumber: 8
						};
						break;
				}
			} else {
				newOptions[ 'xAxis' ] = {
					splitNumber: 3
				};

				if ( window.innerWidth < 460 ) {
					newOptions[ 'xAxis' ] = {
						splitNumber: 2
					};
				}
			}

			var yAxis = {};
			switch ( chartName ) {
				case 'dex-with-average-tvl-higher-than-10m':
				case 'dex-with-average-tvl-lower-than-5m':
				case 'tvl-lending-borrowing':
				case 'tvl-liquid-staking':
				case 'stablecoin-total-issuance':
					newOptions.tooltip = {
						valueFormatter: function( value ) {
							return value ? '$' + NumberUtil.formatWithCommas( value ) : '-';
						}
					};

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
									return value ? '$' + NumberUtil.formatMoney( value ) : '-';
								}
							}
						};
					}
					newOptions.yAxis = yAxis;

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
					icon = 'parallel-heiko.png';
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
