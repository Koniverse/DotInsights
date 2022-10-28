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

		baseUrl += '/assets/data/';

		var $allCharts                 = $( '.block-chart' ),
		    dateFormatter              = '{dd}/{MM}/{yyyy}',
		    dateShortFormatter         = '{MM}/{yyyy}',
		    fontFamily                 = 'TT Commons',
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
				    padding: [ 7, 10, 3, 10 ],
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

			$( '#table-nft-market-overview' ).DataTable( {
				info: false,
				paging: false,
				searching: false
			} );

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
						case 'vc-polkadot':
							chartOptions = getChartResponsiveOptionsVCPolkadot();
							break;
						case 'polkadot-account-overview':
							chartOptions = getChartResponsiveOptionsDotAccOverview();
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
				var url = baseUrl + fileName + '.json';

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
					case 'polkadot-account-overview':
						chartOptions = getChartOptionsDotAccOverview( chartName );
						break;
					case 'vc-polkadot':
						chartOptions = getChartOptionsVCPolkadot( chartName );
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
						color: '#858585'
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
								/*width: 50,
								padding: [ 6, 3, 4, 3 ],
								fontFamily: fontFamily,
								fontStyle: 500,
								fontSize: 10,*/
								color: '#020722',
								backgroundColor: '#66E1B6'
							}
						},
						axisLabel: {
							color: '#858585'
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
							color: '#858585'
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
							color: '#858585'
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
				    btc: []
			    },
			    colors     = [
				    '#4CFCFC',
				    '#8B93AF',
				    '#8E54F7',
				    '#E6007A',
				    '#EA973D'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.dot.push( [ jsonData[ i ].date, jsonData[ i ].dot ] );
				data.eth.push( [ jsonData[ i ].date, jsonData[ i ].eth ] );
				data.sol.push( [ jsonData[ i ].date, jsonData[ i ].sol ] );
				data.cosmos.push( [ jsonData[ i ].date, jsonData[ i ].near ] );
				data.btc.push( [ jsonData[ i ].date, jsonData[ i ].matic ] );
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
						color: '#858585'
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
						color: '#858585'
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
						/*areaStyle: {
							color: new echarts.graphic.LinearGradient( 0, 0, 0, 1, [
								{
									offset: 0.5,
									color: 'rgba(79,91,60,1)'
								}, {
									offset: 1,
									color: 'rgba(79,91,60,0)'
								}
							] ),
							opacity: 1
						},
						lineStyle: {
							width: 0
						},*/
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

		function getChartOptionsDotAccOverview() {
			var colors            = [
				    '#E6007A'
			    ],
			    data              = getChartDataPolkadotAccOverview(),
			    baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: defaultTooltipSettings,
				    legend: {
					    show: false
				    },
				    grid: {
					    left: '3%',
					    right: '3%',
					    top: '3%',
					    bottom: '3%',
					    containLabel: true
				    },
				    dataset: {
					    source: data
				    },
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
						    color: '#858585'
					    }
				    },
				    yAxis: {
					    type: 'value',
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
						    color: '#858585'
					    }
				    },
				    series: {
					    name: 'Cumulative',
					    areaStyle: {
						    color: new echarts.graphic.LinearGradient( 0.5, 0.5, 1, 1, [
							    {
								    offset: 0.6,
								    color: 'rgba(80,9,72,0.6)'
							    },
							    {
								    offset: 1,
								    color: 'rgba(80,9,72,0)'
							    }
						    ] )
					    },
					    itemStyle: {
						    color: colors[ 0 ]
					    },
					    type: 'line',
					    smooth: true,
					    showSymbol: false,
					    emphasis: {
						    focus: 'series'
					    },
					    encode: {
						    // Map "date" column to x-axis.
						    x: 'date',
						    // Map "cumulative" row to y-axis.
						    y: 'cumulative'
					    }
				    }
			    },
			    responsiveOptions = getChartResponsiveOptionsDotAccOverview();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsDotAccOverview() {
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

		function getChartOptionsVCPolkadot() {
			var colors = [
				'#66E1B6',
				'#004BFF'
			];

			var data = getChartDataVcPolkadot();

			var baseOptions = {
				color: colors,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: $.extend( true, {}, defaultTooltipStyle, {
					valueFormatter: function( value ) {
						return value + '%';
					},
					trigger: 'axis',
					axisPointer: {
						type: 'none',
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
				} ),
				legend: $.extend( true, {}, defaultLegendSettings, {
					selectedMode: false
				} ),
				grid: {
					left: '3%',
					right: '3%',
					top: '3%',
					containLabel: true
				},
				xAxis: {
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
							color: [ '#2D3863' ]
						}
					},
					axisLabel: {
						formatter: "{value}%",
						color: '#858585'
					}
				},
				yAxis: {
					type: 'category',
					inverse: true,
					axisTick: {
						show: false
					},
					axisLine: {
						show: true,
						lineStyle: {
							type: [ 4, 4 ],
							color: '#2D3863'
						}
					},
					splitLine: {
						lineStyle: {
							type: [ 4, 4 ],
							color: [ '#2D3863' ]
						}
					},
					axisLabel: {
						fontFamily: fontFamily,
						fontSize: 18,
						fontWeight: 500,
						color: '#A8ADC3'
					}
				},
				dataset: {
					source: data,
					dimensions: [ 'category', 'investing', 'total', 'investing_percent', 'total_percent' ]
				},
				series: [
					{
						type: 'bar',
						stack: 'total',
						name: locate.dotVCsInvesting,
						//data: data.investing,
						label: {
							fontFamily: fontFamily,
							fontSize: 18,
							fontWeight: 500,
							align: 'right',
							color: '#020722',
							show: true,
							formatter: '{@[3]}'
						},
						barMaxWidth: 48,
						itemStyle: {
							borderRadius: [ 8, 0, 0, 8 ]
						},
						datasetIndexnumber: 4
						//dimensions: [ 'investing_percent' ],
						/*encode: {
							x: [ 'investing_percent', 'total_percent' ],
							y: 'category'
						}*/
					}, {
						type: 'bar',
						stack: 'total',
						name: locate.totalVCs,
						//data: data.total,
						label: {
							fontFamily: fontFamily,
							fontSize: 18,
							fontWeight: 500,
							align: 'right',
							show: true,
							formatter: '{@[4]}'
						},
						barMaxWidth: 48,
						itemStyle: {
							borderRadius: [ 0, 8, 8, 0 ]
						},
						datasetIndexnumber: 5
						//dimensions: [ 'total_percent' ]
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsVCPolkadot();
			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsVCPolkadot() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							fontSize: 18
						}
					},
					series: [
						{
							label: {
								fontSize: 18
							},
							barMaxWidth: 48,
							itemStyle: {
								borderRadius: [ 8, 0, 0, 8 ]
							}
						}, {
							label: {
								fontSize: 18
							},
							barMaxWidth: 48,
							itemStyle: {
								borderRadius: [ 0, 8, 8, 0 ]
							}
						}
					]
				};
			} else {
				newOptions = {
					yAxis: {
						axisLabel: {
							fontSize: 13
						}
					},
					series: [
						{
							label: {
								fontSize: 16
							},
							barMaxWidth: 32,
							itemStyle: {
								borderRadius: [ 5, 0, 0, 5 ]
							}
						}, {
							label: {
								fontSize: 16
							},
							barMaxWidth: 32,
							itemStyle: {
								borderRadius: [ 0, 5, 5, 0 ]
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
						    color: '#858585'
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
						    color: '#858585'
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
						    color: '#858585',
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
						    color: '#858585',
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
						    color: '#858585'
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
						    color: '#858585'
					    },
					    name: 'Volume (KSM)',
					    nameLocation: 'middle',
					    nameGap: 100,
					    nameTextStyle: {
						    fontFamily: fontFamily,
						    color: '#858585',
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
						color: '#858585',
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
						color: '#858585'
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
						color: '#858585'
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
						color: '#858585'
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

		function getChartDataPolkadotAccOverview() {
			return [
				[ 'date', 'incremental', 'cumulative' ],
				[ "2021-11-04T00:00:00Z", 1510, 1510 ],
				[ "2021-11-05T00:00:00Z", 17925, 19435 ],
				[ "2021-11-06T00:00:00Z", 15073, 34508 ],
				[ "2021-11-07T00:00:00Z", 14832, 49340 ],
				[ "2021-11-08T00:00:00Z", 14791, 64131 ],
				[ "2021-11-09T00:00:00Z", 13825, 77956 ],
				[ "2021-11-10T00:00:00Z", 15283, 93239 ],
				[ "2021-11-11T00:00:00Z", 15526, 108765 ],
				[ "2021-11-12T00:00:00Z", 9788, 118553 ],
				[ "2021-11-13T00:00:00Z", 8617, 127170 ],
				[ "2021-11-14T00:00:00Z", 6755, 133925 ],
				[ "2021-11-15T00:00:00Z", 6921, 140846 ],
				[ "2021-11-16T00:00:00Z", 7674, 148520 ],
				[ "2021-11-17T00:00:00Z", 7364, 155884 ],
				[ "2021-11-18T00:00:00Z", 6514, 162398 ],
				[ "2021-11-19T00:00:00Z", 5257, 167655 ],
				[ "2021-11-20T00:00:00Z", 4981, 172636 ],
				[ "2021-11-21T00:00:00Z", 5238, 177874 ],
				[ "2021-11-22T00:00:00Z", 5349, 183223 ],
				[ "2021-11-23T00:00:00Z", 5225, 188448 ],
				[ "2021-11-24T00:00:00Z", 5559, 194007 ],
				[ "2021-11-25T00:00:00Z", 5234, 199241 ],
				[ "2021-11-26T00:00:00Z", 5055, 204296 ],
				[ "2021-11-27T00:00:00Z", 4513, 208809 ],
				[ "2021-11-28T00:00:00Z", 4744, 213553 ],
				[ "2021-11-29T00:00:00Z", 5511, 219064 ],
				[ "2021-11-30T00:00:00Z", 8117, 227181 ],
				[ "2021-12-01T00:00:00Z", 7671, 234852 ],
				[ "2021-12-02T00:00:00Z", 8154, 243006 ],
				[ "2021-12-03T00:00:00Z", 5360, 248366 ],
				[ "2021-12-04T00:00:00Z", 7452, 255818 ],
				[ "2021-12-05T00:00:00Z", 5739, 261557 ],
				[ "2021-12-06T00:00:00Z", 5985, 267542 ],
				[ "2021-12-07T00:00:00Z", 5754, 273296 ],
				[ "2021-12-08T00:00:00Z", 4882, 278178 ],
				[ "2021-12-09T00:00:00Z", 4832, 283010 ],
				[ "2021-12-10T00:00:00Z", 4694, 287704 ],
				[ "2021-12-11T00:00:00Z", 4485, 292189 ],
				[ "2021-12-12T00:00:00Z", 4582, 296771 ],
				[ "2021-12-13T00:00:00Z", 4820, 301591 ],
				[ "2021-12-14T00:00:00Z", 4955, 306546 ],
				[ "2021-12-15T00:00:00Z", 4350, 310896 ],
				[ "2021-12-16T00:00:00Z", 3768, 314664 ],
				[ "2021-12-17T00:00:00Z", 4932, 319596 ],
				[ "2021-12-18T00:00:00Z", 4344, 323940 ],
				[ "2021-12-19T00:00:00Z", 3581, 327521 ],
				[ "2021-12-20T00:00:00Z", 3852, 331373 ],
				[ "2021-12-21T00:00:00Z", 4102, 335475 ],
				[ "2021-12-22T00:00:00Z", 4771, 340246 ],
				[ "2021-12-23T00:00:00Z", 4344, 344590 ],
				[ "2021-12-24T00:00:00Z", 4244, 348834 ],
				[ "2021-12-25T00:00:00Z", 3854, 352688 ],
				[ "2021-12-26T00:00:00Z", 4226, 356914 ],
				[ "2021-12-27T00:00:00Z", 5112, 362026 ],
				[ "2021-12-28T00:00:00Z", 4761, 366787 ],
				[ "2021-12-29T00:00:00Z", 4593, 371380 ],
				[ "2021-12-30T00:00:00Z", 4620, 376000 ],
				[ "2021-12-31T00:00:00Z", 4125, 380125 ],
				[ "2022-01-01T00:00:00Z", 3287, 383412 ],
				[ "2022-01-02T00:00:00Z", 3848, 387260 ],
				[ "2022-01-03T00:00:00Z", 4034, 391294 ],
				[ "2022-01-04T00:00:00Z", 4187, 395481 ],
				[ "2022-01-05T00:00:00Z", 4485, 399966 ],
				[ "2022-01-06T00:00:00Z", 4187, 404153 ],
				[ "2022-01-07T00:00:00Z", 4165, 408318 ],
				[ "2022-01-08T00:00:00Z", 3636, 411954 ],
				[ "2022-01-09T00:00:00Z", 3271, 415225 ],
				[ "2022-01-10T00:00:00Z", 3512, 418737 ],
				[ "2022-01-11T00:00:00Z", 4693, 423430 ],
				[ "2022-01-12T00:00:00Z", 5989, 429419 ],
				[ "2022-01-13T00:00:00Z", 3919, 433338 ],
				[ "2022-01-14T00:00:00Z", 3424, 436762 ],
				[ "2022-01-15T00:00:00Z", 2918, 439680 ],
				[ "2022-01-16T00:00:00Z", 3436, 443116 ],
				[ "2022-01-17T00:00:00Z", 3207, 446323 ],
				[ "2022-01-18T00:00:00Z", 2973, 449296 ],
				[ "2022-01-19T00:00:00Z", 3533, 452829 ],
				[ "2022-01-20T00:00:00Z", 3505, 456334 ],
				[ "2022-01-21T00:00:00Z", 4251, 460585 ],
				[ "2022-01-22T00:00:00Z", 4989, 465574 ],
				[ "2022-01-23T00:00:00Z", 3941, 469515 ],
				[ "2022-01-24T00:00:00Z", 4241, 473756 ],
				[ "2022-01-25T00:00:00Z", 3865, 477621 ],
				[ "2022-01-26T00:00:00Z", 3643, 481264 ],
				[ "2022-01-27T00:00:00Z", 3108, 484372 ],
				[ "2022-01-28T00:00:00Z", 3008, 487380 ],
				[ "2022-01-29T00:00:00Z", 3136, 490516 ],
				[ "2022-01-30T00:00:00Z", 2950, 493466 ],
				[ "2022-01-31T00:00:00Z", 2998, 496464 ],
				[ "2022-02-01T00:00:00Z", 3397, 499861 ],
				[ "2022-02-02T00:00:00Z", 2975, 502836 ],
				[ "2022-02-03T00:00:00Z", 2672, 505508 ],
				[ "2022-02-04T00:00:00Z", 2847, 508355 ],
				[ "2022-02-05T00:00:00Z", 2989, 511344 ],
				[ "2022-02-06T00:00:00Z", 2702, 514046 ],
				[ "2022-02-07T00:00:00Z", 3533, 517579 ],
				[ "2022-02-08T00:00:00Z", 3286, 520865 ],
				[ "2022-02-09T00:00:00Z", 3398, 524263 ],
				[ "2022-02-10T00:00:00Z", 3183, 527446 ],
				[ "2022-02-11T00:00:00Z", 2895, 530341 ],
				[ "2022-02-12T00:00:00Z", 2545, 532886 ],
				[ "2022-02-13T00:00:00Z", 2642, 535528 ],
				[ "2022-02-14T00:00:00Z", 2682, 538210 ],
				[ "2022-02-15T00:00:00Z", 2877, 541087 ],
				[ "2022-02-16T00:00:00Z", 2795, 543882 ],
				[ "2022-02-17T00:00:00Z", 2382, 546264 ],
				[ "2022-02-18T00:00:00Z", 2511, 548775 ],
				[ "2022-02-19T00:00:00Z", 2679, 551454 ],
				[ "2022-02-20T00:00:00Z", 2959, 554413 ],
				[ "2022-02-21T00:00:00Z", 2946, 557359 ],
				[ "2022-02-22T00:00:00Z", 3101, 560460 ],
				[ "2022-02-23T00:00:00Z", 2849, 563309 ],
				[ "2022-02-24T00:00:00Z", 3631, 566940 ],
				[ "2022-02-25T00:00:00Z", 2458, 569398 ],
				[ "2022-02-26T00:00:00Z", 2583, 571981 ],
				[ "2022-02-27T00:00:00Z", 3072, 575053 ],
				[ "2022-02-28T00:00:00Z", 3257, 578310 ],
				[ "2022-03-01T00:00:00Z", 3516, 581826 ],
				[ "2022-03-02T00:00:00Z", 3558, 585384 ],
				[ "2022-03-03T00:00:00Z", 3403, 588787 ],
				[ "2022-03-04T00:00:00Z", 2761, 591548 ],
				[ "2022-03-05T00:00:00Z", 2474, 594022 ],
				[ "2022-03-06T00:00:00Z", 2225, 596247 ],
				[ "2022-03-07T00:00:00Z", 2531, 598778 ],
				[ "2022-03-08T00:00:00Z", 2582, 601360 ],
				[ "2022-03-09T00:00:00Z", 3086, 604446 ],
				[ "2022-03-10T00:00:00Z", 2405, 606851 ],
				[ "2022-03-11T00:00:00Z", 2335, 609186 ],
				[ "2022-03-12T00:00:00Z", 3445, 612631 ],
				[ "2022-03-13T00:00:00Z", 2315, 614946 ],
				[ "2022-03-14T00:00:00Z", 2663, 617609 ],
				[ "2022-03-15T00:00:00Z", 2383, 619992 ],
				[ "2022-03-16T00:00:00Z", 2358, 622350 ],
				[ "2022-03-17T00:00:00Z", 2198, 624548 ],
				[ "2022-03-18T00:00:00Z", 2063, 626611 ],
				[ "2022-03-19T00:00:00Z", 2057, 628668 ],
				[ "2022-03-20T00:00:00Z", 2023, 630691 ],
				[ "2022-03-21T00:00:00Z", 1961, 632652 ],
				[ "2022-03-22T00:00:00Z", 2438, 635090 ],
				[ "2022-03-23T00:00:00Z", 2303, 637393 ],
				[ "2022-03-24T00:00:00Z", 2610, 640003 ],
				[ "2022-03-25T00:00:00Z", 2394, 642397 ],
				[ "2022-03-26T00:00:00Z", 2080, 644477 ],
				[ "2022-03-27T00:00:00Z", 2362, 646839 ],
				[ "2022-03-28T00:00:00Z", 3069, 649908 ],
				[ "2022-03-29T00:00:00Z", 2767, 652675 ],
				[ "2022-03-30T00:00:00Z", 2433, 655108 ],
				[ "2022-03-31T00:00:00Z", 2547, 657655 ],
				[ "2022-04-01T00:00:00Z", 2286, 659941 ],
				[ "2022-04-02T00:00:00Z", 2551, 662492 ],
				[ "2022-04-03T00:00:00Z", 2265, 664757 ],
				[ "2022-04-04T00:00:00Z", 2207, 666964 ],
				[ "2022-04-05T00:00:00Z", 2321, 669285 ],
				[ "2022-04-06T00:00:00Z", 2320, 671605 ],
				[ "2022-04-07T00:00:00Z", 2024, 673629 ],
				[ "2022-04-08T00:00:00Z", 2006, 675635 ],
				[ "2022-04-09T00:00:00Z", 1765, 677400 ],
				[ "2022-04-10T00:00:00Z", 1791, 679191 ],
				[ "2022-04-11T00:00:00Z", 2124, 681315 ],
				[ "2022-04-12T00:00:00Z", 2297, 683612 ],
				[ "2022-04-13T00:00:00Z", 2277, 685889 ],
				[ "2022-04-14T00:00:00Z", 2035, 687924 ],
				[ "2022-04-15T00:00:00Z", 2191, 690115 ],
				[ "2022-04-16T00:00:00Z", 1784, 691899 ],
				[ "2022-04-17T00:00:00Z", 1934, 693833 ],
				[ "2022-04-18T00:00:00Z", 2171, 696004 ],
				[ "2022-04-19T00:00:00Z", 2017, 698021 ],
				[ "2022-04-20T00:00:00Z", 1968, 699989 ],
				[ "2022-04-21T00:00:00Z", 2952, 702941 ],
				[ "2022-04-22T00:00:00Z", 2273, 705214 ],
				[ "2022-04-23T00:00:00Z", 2171, 707385 ],
				[ "2022-04-24T00:00:00Z", 2152, 709537 ],
				[ "2022-04-25T00:00:00Z", 2090, 711627 ],
				[ "2022-04-26T00:00:00Z", 2046, 713673 ],
				[ "2022-04-27T00:00:00Z", 2131, 715804 ],
				[ "2022-04-28T00:00:00Z", 2281, 718085 ],
				[ "2022-04-29T00:00:00Z", 1873, 719958 ],
				[ "2022-04-30T00:00:00Z", 1828, 721786 ],
				[ "2022-05-01T00:00:00Z", 1911, 723697 ],
				[ "2022-05-02T00:00:00Z", 1894, 725591 ],
				[ "2022-05-03T00:00:00Z", 1812, 727403 ],
				[ "2022-05-04T00:00:00Z", 1850, 729253 ],
				[ "2022-05-05T00:00:00Z", 2069, 731322 ],
				[ "2022-05-06T00:00:00Z", 1889, 733211 ],
				[ "2022-05-07T00:00:00Z", 1737, 734948 ],
				[ "2022-05-08T00:00:00Z", 2006, 736954 ],
				[ "2022-05-09T00:00:00Z", 3705, 740659 ],
				[ "2022-05-10T00:00:00Z", 3501, 744160 ],
				[ "2022-05-11T00:00:00Z", 5308, 749468 ],
				[ "2022-05-12T00:00:00Z", 6105, 755573 ],
				[ "2022-05-13T00:00:00Z", 4395, 759968 ],
				[ "2022-05-14T00:00:00Z", 3228, 763196 ],
				[ "2022-05-15T00:00:00Z", 2726, 765922 ],
				[ "2022-05-16T00:00:00Z", 2526, 768448 ],
				[ "2022-05-17T00:00:00Z", 2313, 770761 ],
				[ "2022-05-18T00:00:00Z", 2277, 773038 ],
				[ "2022-05-19T00:00:00Z", 2023, 775061 ],
				[ "2022-05-20T00:00:00Z", 1904, 776965 ],
				[ "2022-05-21T00:00:00Z", 1701, 778666 ],
				[ "2022-05-22T00:00:00Z", 1760, 780426 ],
				[ "2022-05-23T00:00:00Z", 1804, 782230 ],
				[ "2022-05-24T00:00:00Z", 1670, 783900 ],
				[ "2022-05-25T00:00:00Z", 1703, 785603 ],
				[ "2022-05-26T00:00:00Z", 1871, 787474 ],
				[ "2022-05-27T00:00:00Z", 1891, 789365 ],
				[ "2022-05-28T00:00:00Z", 1549, 790914 ],
				[ "2022-05-29T00:00:00Z", 1653, 792567 ],
				[ "2022-05-30T00:00:00Z", 1787, 794354 ],
				[ "2022-05-31T00:00:00Z", 1879, 796233 ],
				[ "2022-06-01T00:00:00Z", 1638, 797871 ],
				[ "2022-06-02T00:00:00Z", 1754, 799625 ],
				[ "2022-06-03T00:00:00Z", 1432, 801057 ],
				[ "2022-06-04T00:00:00Z", 1313, 802370 ],
				[ "2022-06-05T00:00:00Z", 1390, 803760 ],
				[ "2022-06-06T00:00:00Z", 1627, 805387 ],
				[ "2022-06-07T00:00:00Z", 1714, 807101 ],
				[ "2022-06-08T00:00:00Z", 1579, 808680 ],
				[ "2022-06-09T00:00:00Z", 1626, 810306 ],
				[ "2022-06-10T00:00:00Z", 1645, 811951 ],
				[ "2022-06-11T00:00:00Z", 1877, 813828 ],
				[ "2022-06-12T00:00:00Z", 2256, 816084 ],
				[ "2022-06-13T00:00:00Z", 3948, 820032 ],
				[ "2022-06-14T00:00:00Z", 2979, 823011 ],
				[ "2022-06-15T00:00:00Z", 3080, 826091 ],
				[ "2022-06-16T00:00:00Z", 2366, 828457 ],
				[ "2022-06-17T00:00:00Z", 2248, 830705 ],
				[ "2022-06-18T00:00:00Z", 2867, 833572 ],
				[ "2022-06-19T00:00:00Z", 2389, 835961 ],
				[ "2022-06-20T00:00:00Z", 2220, 838181 ],
				[ "2022-06-21T00:00:00Z", 2186, 840367 ],
				[ "2022-06-22T00:00:00Z", 1742, 842109 ],
				[ "2022-06-23T00:00:00Z", 1758, 843867 ],
				[ "2022-06-24T00:00:00Z", 1824, 845691 ],
				[ "2022-06-25T00:00:00Z", 1649, 847340 ],
				[ "2022-06-26T00:00:00Z", 1642, 848982 ],
				[ "2022-06-27T00:00:00Z", 1580, 850562 ],
				[ "2022-06-28T00:00:00Z", 1848, 852410 ],
				[ "2022-06-29T00:00:00Z", 2048, 854458 ],
				[ "2022-06-30T00:00:00Z", 2322, 856780 ],
				[ "2022-07-01T00:00:00Z", 2520, 859300 ],
				[ "2022-07-02T00:00:00Z", 3903, 863203 ],
				[ "2022-07-03T00:00:00Z", 2633, 865836 ],
				[ "2022-07-04T00:00:00Z", 2490, 868326 ],
				[ "2022-07-05T00:00:00Z", 2438, 870764 ],
				[ "2022-07-06T00:00:00Z", 2220, 872984 ],
				[ "2022-07-07T00:00:00Z", 2304, 875288 ],
				[ "2022-07-08T00:00:00Z", 2227, 877515 ],
				[ "2022-07-09T00:00:00Z", 1594, 879109 ],
				[ "2022-07-10T00:00:00Z", 1720, 880829 ],
				[ "2022-07-11T00:00:00Z", 1793, 882622 ],
				[ "2022-07-12T00:00:00Z", 1856, 884478 ],
				[ "2022-07-13T00:00:00Z", 1552, 886030 ],
				[ "2022-07-14T00:00:00Z", 2083, 888113 ],
				[ "2022-07-15T00:00:00Z", 1871, 889984 ],
				[ "2022-07-16T00:00:00Z", 1976, 891960 ],
				[ "2022-07-17T00:00:00Z", 2023, 893983 ],
				[ "2022-07-18T00:00:00Z", 2464, 896447 ],
				[ "2022-07-19T00:00:00Z", 2472, 898919 ],
				[ "2022-07-20T00:00:00Z", 2216, 901135 ],
				[ "2022-07-21T00:00:00Z", 1887, 903022 ],
				[ "2022-07-22T00:00:00Z", 2038, 905060 ],
				[ "2022-07-23T00:00:00Z", 1886, 906946 ],
				[ "2022-07-24T00:00:00Z", 1751, 908697 ],
				[ "2022-07-25T00:00:00Z", 1743, 910440 ],
				[ "2022-07-26T00:00:00Z", 2119, 912559 ],
				[ "2022-07-27T00:00:00Z", 2052, 914611 ],
				[ "2022-07-28T00:00:00Z", 2191, 916802 ],
				[ "2022-07-29T00:00:00Z", 2621, 919423 ],
				[ "2022-07-30T00:00:00Z", 2741, 922164 ],
				[ "2022-07-31T00:00:00Z", 3546, 925710 ],
				[ "2022-08-01T00:00:00Z", 718, 926428 ]
			];
		}

		function getChartDataVcPolkadot() {
			var originalData = [
				    [ 'category', 'investing', 'total' ],
				    [ 'H1 2021', 19, 44 ],
				    [ 'Q3 2021', 21, 53 ],
				    [ 'Q4 2021', 24, 57 ],
				    [ 'H1 2022', 29, 82 ]
			    ],
			    data         = [
				    [
					    'category',
					    'investing_percent', // Data to render investing bar.
					    'total_percent',  // Data to render total VC bar.
					    'investing',// Data to render investing label.
					    'total' // Data to render total VC label
				    ]
			    ];

			// Calculate percent of items.
			for ( var i = 1; i < originalData.length; i ++ ) {
				var investing        = originalData[ i ][ 1 ],
				    total            = originalData[ i ][ 2 ],
				    investingPercent = DotInsights.NumberUtil.precisionRoundMod( investing / total * 100, 2 );

				data.push( [
					originalData[ i ][ 0 ],
					investingPercent,
					100,
					investing,
					total
				] );
			}

			return data;
		}

	}( jQuery )
);
