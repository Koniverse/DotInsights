(
	function( $ ) {
		'use strict';

		var locate = window.dotinsights.Localization;
		var baseUrl = location.origin;
		var partname = location.pathname.split( '/' );

		for ( var i = 0; i < partname.length - 2; i ++ ) {
			if ( '' !== partname[ i ] ) {
				baseUrl += '/' + partname[ i ];
			}
		}

		var sourceBaseUrl = baseUrl + '/assets/data/q4-2022/';
		var tokenBaseUrl = baseUrl + '/assets/images/token/';

		var NumberUtil                      = dotinsights.NumberUtil,
		    $allCharts                      = $( '.block-chart' ),
		    dateFormatter                   = '{dd}/{MM}/{yyyy}',
		    dateShortFormatter              = '{MM}/{yyyy}',
		    fontFamily                      = 'Plus Jakarta Sans',
		    echarts                         = window.echarts,
		    defaultDataZoom                 = {
			    type: 'slider',
			    backgroundColor: '#232323',
			    borderColor: '#232323',
			    dataBackground: {
				    lineStyle: {
					    color: '#777'
				    },
				    areaStyle: {
					    opacity: 0.6,
					    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
						    {
							    offset: 0,
							    color: 'rgba(88, 88, 88,0)'
						    },
						    {
							    offset: 1,
							    color: 'rgba(140, 140, 140,1)'
						    }
					    ] )
				    }
			    },
			    selectedDataBackground: {
				    lineStyle: {
					    color: '#777'
				    },
				    areaStyle: {
					    opacity: 0.6,
					    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
						    {
							    offset: 0,
							    color: 'rgba(88, 88, 88,0)'
						    },
						    {
							    offset: 1,
							    color: 'rgba(140, 140, 140,1)'
						    }
					    ] )
				    }
			    },
			    fillerColor: 'rgba(0, 75, 255, 0.38)',
			    textStyle: {
				    color: '#ccc'
			    },
			    handleStyle: {
				    borderWidth: 0,
				    borderCap: 'round',
				    color: '#3C72FF'
			    },
			    moveHandleStyle: {
				    borderWidth: 0,
				    color: '#3C72FF',
			    },
			    start: 0,
			    end: 10,
			    height: 32,
			    bottom: 45
		    },
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
				    color: '#000',
				    backgroundColor: '#ccc'
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
			initLanguageSwitcher();

			var $readmore = $( '.block-dao .description' );

			new Readmore( $readmore, {
				moreLink: '<a href="#" class="btn btn-flat btn-small">' + locate.readMore + '</a>',
				lessLink: '<a href="#" class="btn btn-flat btn-small">' + locate.readLess + '</a>'
			} );

			var $blockBridge = $( '.block-bridge' );

			$( document.body ).on( 'click', '.bridge-list a', function( evt ) {
				evt.preventDefault();

				var $thisButton = $( this );

				if ( $thisButton.hasClass( 'current' ) ) {
					return;
				}

				$thisButton.siblings().removeClass( 'current' );
				$thisButton.addClass( 'current' );

				$blockBridge.find( '.bridge-item' ).hide().removeClass( 'animate' );
				$blockBridge.find( '.bridge--' + $thisButton.data( 'filter' ) ).show( function() {
					$( this ).addClass( 'animate' );
				}, 0 );
			} );
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
						case 'nomination-pool-staking':
							chartOptions = getChartResponsiveOptionsNominationPoolStaking();
							break;
						case 'total-dot-raised-parachain':
						case 'total-ksm-raised-parachain':
							chartOptions = getChartResponsiveOptionsTotalTokenRaisedParachain();
							break;
						case 'xcm-transfers':
							chartOptions = getChartResponsiveOptionsXCMTransfers();
							break;
						case 'xcm-total-amount-received':
							chartOptions = getChartResponsiveOptionsXCMTotalAmountReceived();
							break;
						case 'twitter-followers':
						case 'tvl-defi-parachain':
						case 'tvl-dot-dex':
						case 'tvl-ksm-dex':
						case 'tvl-dot-lending':
						case 'tvl-ksm-lending':
						case 'tvl-dot-liquid-staking':
						case 'tvl-ksm-liquid-staking':
						case 'tvl-liquid-crowdloan':
						case 'stablecoin-issuance':
						case 'total-bridge-tvl':
						case 'mf-daily-active-user':
							chartOptions = getChartLinesBaseResponsiveOptions( chartName );
							break;
						case 'nft-marketplace-daily-volume':
							chartOptions = getChartResponsiveOptionsNftMarketplaceDailyVolume( chartName );
							break;
						case 'web3-foundation-grants':
							chartOptions = getChartResponsiveOptionsWeb3FoundationGrants( chartName );
							break;
						case 'total-plots-sale-skybreach':
							chartOptions = getChartResponsiveOptionsTotalPlotsSaleSkybreach( chartName );
							break;
						case 'the-great-escape-users':
							chartOptions = getChartResponsiveOptionsTheGreatEscapeUsers();
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

		function initLanguageSwitcher() {
			var languages = [
				{
					code: 'en',
					name: 'English',
					flag: 'us.svg',
					url: 'polkadot-report-q4-2022-en',
					isActive: 1,
				}, {
					code: 'pt',
					name: 'Português',
					flag: 'pt.svg',
					url: 'polkadot-report-q4-2022-pt',
					isActive: 1,
				}, {
					code: 'vi',
					name: 'Tiếng Việt',
					flag: 'vn.svg',
					url: 'polkadot-report-q4-2022-vi',
					isActive: 1,
				}, {
					code: 'zh',
					name: '中文',
					flag: 'cn.svg',
					url: 'polkadot-report-q4-2022-zh',
					isActive: 1,
				}, {
					code: 'id_ID',
					name: 'Bahasa Indonesia',
					flag: 'id.svg',
					url: 'polkadot-report-q4-2022-id',
					isActive: 1,
				}, {
					code: 'es',
					name: 'Español',
					flag: 'es.svg',
					url: 'polkadot-report-q4-2022-es',
					isActive: 1,
				}, {
					code: 'kr',
					name: '한국어',
					flag: 'kr.svg',
					url: 'polkadot-report-q4-2022-kr',
					isActive: 1,
				}, {
					code: 'ja',
					name: '日本語',
					flag: 'jp.svg',
					url: 'polkadot-report-q4-2022-ja',
					isActive: 1,
				}, {
					code: 'fr',
					name: 'Français',
					flag: 'fr.svg',
					url: 'polkadot-report-q4-2022-fr',
					isActive: 1,
				}
			];

			var currentLang = $( 'html' ).attr( 'lang' );

			var currentLangOutput = '',
			    subLangOutput     = '';
			for ( var i = 0; i < languages.length; i ++ ) {
				var thisLang = languages[ i ];

				if ( ! thisLang.isActive ) {
					continue;
				}

				if ( thisLang.code === currentLang ) {
					currentLangOutput = `
					<img src="../assets/flags/4x3/${thisLang.flag}" alt="${thisLang.name}" width="25" height="19"/>
					<span class="lang-label">${thisLang.name}</span><svg class="lang-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M360.5 217.5l-152 143.1C203.9 365.8 197.9 368 192 368s-11.88-2.188-16.5-6.562L23.5 217.5C13.87 208.3 13.47 193.1 22.56 183.5C31.69 173.8 46.94 173.5 56.5 182.6L192 310.9l135.5-128.4c9.562-9.094 24.75-8.75 33.94 .9375C370.5 193.1 370.1 208.3 360.5 217.5z"/></svg>`
				} else {
					subLangOutput += `
						<li>
							<a href="/${thisLang.url}/">
								<img src="../assets/flags/4x3/${thisLang.flag}" alt="${thisLang.name}" width="25" height="19"/>
								${thisLang.name}
							</a>
						</li>
					`
				}
			}

			var $switcher = $( '#language-switcher' ),
			    output    = `
				<div class="current-lang">${currentLangOutput}</div>
				<ul class="language-switcher-list">${subLangOutput}</ul>`;

			$switcher.html( output );

			$switcher.on( 'click', '.current-lang', function( evt ) {
				evt.preventDefault();

				$switcher.addClass( 'show' );
			} );

			$( document.body ).on( 'click', function( e ) {
				if ( $( e.target ).closest( $switcher ).length === 0 ) {
					$switcher.removeClass( 'show' );
				}
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
				//maskColor: '#151515',
				maskColor: 'rgba(0,0,0,0)',
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
						case 'active-devs-commits':
							chartOptions = getChartOptionsActiveDevsCommits( chartName, jsonData );
							break;
						case 'dev-act-comparison':
							chartOptions = getChartOptionsDevActComparison( chartName, jsonData );
							break;
						case 'nomination-pool-staking':
							chartOptions = getChartOptionsNominationPoolStaking( chartName, jsonData );
							break;
						case 'staking-ratio':
							chartOptions = getChartOptionsStakingRatio( chartName, jsonData );
							break;
						case 'dot-active-and-new-acc':
						case 'ksm-active-and-new-acc':
							chartOptions = getChartOptionsActiveAndNewAccount( chartName, jsonData );
							break;
						case 'total-dot-raised-parachain':
						case 'total-ksm-raised-parachain':
							chartOptions = getChartOptionsTotalTokenRaisedParachain( chartName, jsonData );
							break;
						case 'twitter-followers':
							chartOptions = getChartOptionsTwitterFollowers( chartName, jsonData );
							break;
						case 'tvl-defi-parachain':
							chartOptions = getChartOptionsDefiParachain( chartName, jsonData );
							break;
						case 'tvl-dot-dex':
							chartOptions = getChartOptionsTvlDotDex( chartName, jsonData );
							break;
						case 'tvl-ksm-dex':
							chartOptions = getChartOptionsTvlKsmDex( chartName, jsonData );
							break;
						case 'tvl-dot-lending':
							chartOptions = getChartOptionsTvlDotLending( chartName, jsonData );
							break;
						case 'tvl-ksm-lending':
							chartOptions = getChartOptionsTvlKsmLending( chartName, jsonData );
							break;
						case 'tvl-dot-liquid-staking':
							chartOptions = getChartOptionsTvlDotLiquidStaking( chartName, jsonData );
							break;
						case 'tvl-ksm-liquid-staking':
							chartOptions = getChartOptionsTvlKsmLiquidStaking( chartName, jsonData );
							break;
						case 'tvl-liquid-crowdloan':
							chartOptions = getChartOptionsTvlLiquidCrowdloan( chartName, jsonData );
							break;
						case 'stablecoin-issuance':
							chartOptions = getChartOptionsStablecoinIssuance( chartName, jsonData );
							break;
						case 'total-bridge-tvl':
							chartOptions = getChartOptionsTotalBridgeTvl( chartName, jsonData );
							break;
						case 'nft-marketplace-daily-volume':
							chartOptions = getChartOptionsNftMarketplaceDailyVolume( chartName, jsonData );
							break;
						case 'mf-daily-active-user':
							chartOptions = getChartOptionsMoonfitDailyActiveUser( chartName, jsonData );
							break;
						case 'total-plots-sale-skybreach':
							chartOptions = getChartOptionsTotalPlotsSaleSkybreach( chartName, jsonData );
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
					case 'xcm-transfers':
						chartOptions = getChartOptionsXCMTransfers( chartName );
						break;
					case 'xcm-total-amount-received':
						chartOptions = getChartOptionsXCMTotalAmountReceived( chartName );
						break;
					case 'the-great-escape-users':
						chartOptions = getChartOptionsTheGreatEscapeUsers( chartName );
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
				//dataZoom: defaultDataZoom,
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
					//bottom: 100, // DataZoom + Legend.
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
						margin: 12,
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
						splitNumber: 5
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

		function getChartOptionsActiveDevsCommits( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    active_devs: [],
				    code_commits: [],
			    },
			    colors     = [
				    '#66E1B6',
				    '#004BFF'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.active_devs.push( [ jsonData[ i ].date, jsonData[ i ].active_devs ] );
				data.code_commits.push( [ jsonData[ i ].date, jsonData[ i ].code_commits ] );
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
					left: '25px',
					right: '25px',
					containLabel: true
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					splitLine: {
						show: false,
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
						name: locate.activeDevelopers,
						nameGap: 35,
						nameTextStyle: {
							color: '#fff',
						},
						alignTicks: true,
						axisLine: {
							show: false,
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
								backgroundColor: colors[ 0 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					},
					{
						type: 'value',
						name: locate.codeCommits,
						nameGap: 35,
						nameTextStyle: {
							color: '#fff',
						},
						position: 'right',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisPointer: {
							label: {
								color: '#fff',
								backgroundColor: colors[ 1 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					}
				],
				series: [
					{
						name: locate.activeDevelopers,
						data: data.active_devs,
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.codeCommits,
						data: data.code_commits,
						type: 'bar',
						smooth: true,
						yAxisIndex: 1,
						showSymbol: false,
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

		function getChartOptionsDevActComparison( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    near: [],
				    eth: [],
				    sol: [],
				    dot: [],
				    atom: [],
				    ada: []
			    },
			    colors     = [
				    '#4CFCFC',
				    '#8B93AF',
				    '#24F483',
				    '#E6007A',
				    '#8247E5',
				    '#004BFF',
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.near.push( [ jsonData[ i ].date, jsonData[ i ].near ] );
				data.eth.push( [ jsonData[ i ].date, jsonData[ i ].eth ] );
				data.sol.push( [ jsonData[ i ].date, jsonData[ i ].sol ] );
				data.dot.push( [ jsonData[ i ].date, jsonData[ i ].dot ] );
				data.atom.push( [ jsonData[ i ].date, jsonData[ i ].atom ] );
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
							color: '#66E1B6'
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
						name: 'Near',
						data: data.near,
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
						name: 'Cosmos',
						data: data.atom,
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

		function getChartOptionsNominationPoolStaking( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    total_members: [],
				    total_stake: [],
			    },
			    colors     = [
				    '#004BFF',
				    '#E6007A'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.total_members.push( [ jsonData[ i ].date, jsonData[ i ].total_members ] );
				data.total_stake.push( [ jsonData[ i ].date, jsonData[ i ].total_stake ] );
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
					top: '3%',
					left: '25px',
					right: '25px',
					containLabel: true
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					splitLine: {
						show: false,
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
						name: locate.totalPoolsStake,
						nameTextStyle: {
							fontSize: 0
						},
						alignTicks: true,
						axisLine: {
							show: false,
						},
						interval: 250000,
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisPointer: {
							label: {
								color: '#fff',
								backgroundColor: colors[ 1 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					},
					{
						type: 'value',
						name: locate.totalPoolsMembers,
						nameTextStyle: {
							fontSize: 0
						},
						position: 'right',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisPointer: {
							label: {
								color: '#fff',
								backgroundColor: colors[ 0 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					}
				],
				series: [
					{
						name: locate.totalPoolsMembers,
						data: data.total_members,
						type: 'bar',
						smooth: true,
						yAxisIndex: 1,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.totalPoolsStake,
						data: data.total_stake,
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsNominationPoolStaking();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsNominationPoolStaking() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: [
						{
							axisLabel: {
								formatter: '{value}'
							}
						}, {
							axisLabel: {
								formatter: '{value}'
							}
						}
					],
					xAxis: {
						splitNumber: 3,
						axisLabel: {
							formatter: dateFormatter
						}
					}
				};
			} else {
				newOptions = {
					yAxis: [
						{
							axisLabel: {
								formatter: function( value ) {
									return NumberUtil.formatMoney( value );
								}
							}
						}, {
							axisLabel: {
								formatter: function( value ) {
									return NumberUtil.formatMoney( value );
								}
							}
						}
					],
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
							splitNumber: 2
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsStakingRatio( chartName, jsonData ) {
			var datasets          = [
				    {
					    name: 'ratio',
					    label: 'Ratio',
					    options: {
						    lineStyle: {
							    width: 4
						    }
					    }
				    }
			    ],
			    colors            = [
				    '#E6007A'
			    ],
			    chartExtraOptions = {
				    legend: {
					    show: false,
				    },
				    grid: {
					    bottom: '3%'
				    },
				    yAxis: {
					    min: 0,
					    max: 100,
					    interval: 25,
					    axisLabel: {
						    formatter: '{value}%'
					    }
				    },
				    xAxis: {
					    axisLine: {
						    show: false,
					    },
					    splitLine: {
						    show: true,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    }
				    },
				    tooltip: {
					    valueFormatter: function( value ) {
						    return value + '%';
					    }
				    }
			    };

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsActiveAndNewAccount( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    active: [],
				    new: [],
			    },
			    colors     = [
				    '#004BFF',
				    '#E6007A'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.active.push( [ jsonData[ i ].date, jsonData[ i ].active ] );
				data.new.push( [ jsonData[ i ].date, jsonData[ i ].new ] );
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
					top: '3%',
					left: '3%',
					right: '3%',
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
				yAxis: {
					type: 'value',
					alignTicks: true,
					axisLine: {
						show: false,
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
				series: [
					{
						name: locate.activeAccount,
						data: data.active,
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.newAccount,
						data: data.new,
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsActiveAndNewAccount();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsActiveAndNewAccount() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: '{value}'
						}
					},
					xAxis: {
						splitNumber: 3,
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
								return NumberUtil.formatMoney( value );
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
							splitNumber: 2
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsTotalTokenRaisedParachain( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = [],
			    cats       = [],
			    colors     = [
				    '#004BFF'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				cats.push( jsonData[ i ].project );
				data.push( NumberUtil.validate( jsonData[ i ].funds_raised ) );
			}

			var baseOptions       = {
				    color: colors,
				    tooltip: defaultTooltipSettings,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    grid: {
					    left: '3%',
					    right: '3%',
					    top: '3%',
					    bottom: '3%',
					    containLabel: true
				    },
				    xAxis: {
					    type: 'category',
					    data: cats,
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
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    hideOverlap: false,
						    showMaxLabel: true,
						    overflow: 'breakAll',
						    rotate: 45,
						    align: 'right',
						    fontFamily: fontFamily,
						    fontSize: 10,
						    fontWeight: 500,
						    color: '#ccc'
					    }
				    },
				    yAxis: {
					    type: 'value',
					    name: locate.projectCount,
					    axisLine: {
						    show: false
					    },
					    splitLine: {
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    splitNumber: 3,
					    axisPointer: defaultAxisPointerLabelSettings,
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
						    data: data,
						    name: '',
						    label: {
							    show: false,
						    },
						    barMaxWidth: 15,
						    itemStyle: {
							    borderRadius: [ 2, 2, 0, 0 ]
						    }
					    }
				    ]
			    },
			    responsiveOptions = getChartResponsiveOptionsTotalTokenRaisedParachain();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsTotalTokenRaisedParachain() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions[ 'yAxis' ] = {
					axisLabel: {
						formatter: "{value}"
					}
				};
			} else {
				newOptions[ 'yAxis' ] = {
					axisLabel: {
						formatter: function( value ) {
							return NumberUtil.formatMoney( value );
						}
					}
				};
			}

			return newOptions;
		}

		function getChartOptionsTwitterFollowers( chartName, jsonData ) {
			var datasets          = [
				    {
					    name: 'count',
					    label: 'Followers',
					    options: {
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0.45, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(28, 135, 236, 0.7)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(28, 135, 236, 0)'
								    }
							    ] )
						    }
					    }
				    }
			    ],
			    colors            = [
				    '#1C87EC'
			    ],
			    chartExtraOptions = {
				    legend: {
					    show: false
				    },
				    grid: {
					    bottom: '3%'
				    },
				    xAxis: {
					    splitLine: {
						    show: true,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
				    },
				    yAxis: {
					    min: 1000000,
					    max: 1400000,
				    }
			    };

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsXCMTransfers() {
			var colors            = [
				    '#004BFF',
				    '#E6007A',
			    ],
			    data              = [
				    [
					    'Jan',
					    'Feb',
					    'Mar',
					    'Apr',
					    'May',
					    'Jun',
					    'Jul',
					    'Aug',
					    'Sep',
					    'Oct',
					    'Nov',
					    'Dec'
				    ],
				    [
					    9060,
					    6138,
					    10528,
					    13905,
					    20645,
					    17680,
					    18577,
					    17827,
					    11276,
					    14094,
					    17159,
					    12307
				    ],
				    [
					    '',
					    '',
					    '',
					    '',
					    23239,
					    17298,
					    21232,
					    26912,
					    14027,
					    23220,
					    20159,
					    14621
				    ],
			    ],
			    baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: defaultTooltipSettings,
				    legend: $.extend( true, {}, defaultLegendSettings, {
					    formatter: function( name ) {
						    return locate.transferOn + ' ' + name;
					    }
				    } ),
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
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    margin: 12,
						    color: '#ccc'
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
					    axisPointer: defaultAxisPointerLabelSettings,
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
						    name: 'Kusama',
						    barMaxWidth: 8,
						    itemStyle: {
							    borderRadius: [ 5, 5, 0, 0 ]
						    },
					    }, {
						    type: 'bar',
						    data: data[ 2 ],
						    name: 'Polkadot',
						    barMaxWidth: 8,
						    itemStyle: {
							    borderRadius: [ 5, 5, 0, 0 ]
						    },
					    }
				    ]
			    },
			    responsiveOptions = getChartResponsiveOptionsXCMTransfers();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsXCMTransfers() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: '{value}'
						}
					}
				};
			} else {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: function( value ) {
								return value ? NumberUtil.formatMoney( value ) : '-';
							}
						}
					}
				};
			}

			return newOptions;
		}

		function getChartOptionsXCMTotalAmountReceived() {
			var colors            = [
				    '#004BFF',
				    '#E6007A',
			    ],
			    data              = [
				    [
					    'Jan',
					    'Feb',
					    'Mar',
					    'Apr',
					    'May',
					    'Jun',
					    'Jul',
					    'Aug',
					    'Sep',
					    'Oct',
					    'Nov',
					    'Dec'
				    ],
				    [
					    33512223,
					    53943045,
					    77477509,
					    124099450,
					    193957834,
					    225645603,
					    254666571,
					    301123152,
					    316118330,
					    331628007,
					    345425245,
					    354319177
				    ],
				    [
					    '',
					    '',
					    '',
					    '',
					    209950885.1,
					    271907681.4,
					    336682142.2,
					    426150086.3,
					    463966505.9,
					    519121685.8,
					    578522490,
					    605642350.7
				    ],
			    ],
			    baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: defaultTooltipSettings,
				    legend: $.extend( true, {}, defaultLegendSettings, {
					    formatter: function( name ) {
						    return locate.amountReceivedOn + ' ' + name;
					    }
				    } ),
				    grid: {
					    left: '3%',
					    right: '3%',
					    top: '3%',
					    containLabel: true
				    },
				    xAxis: {
					    type: 'category',
					    boundaryGap: false,
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
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    margin: 12,
						    color: '#ccc'
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
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    fontFamily: fontFamily,
						    fontSize: 12,
						    fontWeight: 500,
						    color: '#ccc'
					    }
				    },
				    series: [
					    {
						    type: 'line',
						    data: data[ 1 ],
						    name: 'Kusama',
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: 'rgba(0, 75, 255,0.5)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(0, 75, 255,0)'
								    }
							    ] )
						    },
						    smooth: true,
						    showSymbol: false,
						    connectNulls: true,
						    emphasis: {
							    focus: 'series'
						    },
					    }, {
						    type: 'line',
						    data: data[ 2 ],
						    name: 'Polkadot',
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: 'rgba(230, 0, 122,0.5)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(230, 0, 122,0)'
								    }
							    ] )
						    },
						    smooth: true,
						    showSymbol: false,
						    connectNulls: true,
						    emphasis: {
							    focus: 'series'
						    }
					    }
				    ]
			    },
			    responsiveOptions = getChartResponsiveOptionsXCMTotalAmountReceived();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsXCMTotalAmountReceived() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: '${value}'
						}
					}
				};
			} else {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: function( value ) {
								return value ? '$' + NumberUtil.formatMoney( value ) : '-';
							}
						}
					}
				};
			}

			return newOptions;
		}

		function getChartOptionsDefiParachain( chartName, jsonData ) {
			var datasets          = [
				    {
					    options: {
						    stack: 'Total'
					    },
					    name: 'others',
					    label: locate.others
				    }, {
					    options: {
						    stack: 'Total'
					    },
					    name: 'parallel',
					    label: 'Parallel'
				    }, {
					    options: {
						    stack: 'Total'
					    },
					    name: 'astar',
					    label: 'Astar'
				    }, {
					    options: {
						    stack: 'Total'
					    },
					    name: 'karura',
					    label: 'Karura'
				    }, {
					    options: {
						    stack: 'Total'
					    },
					    name: 'acala',
					    label: 'Acala'
				    }, {
					    options: {
						    stack: 'Total'
					    },
					    name: 'moonriver',
					    label: 'Moonriver'
				    }, {
					    options: {
						    stack: 'Total'
					    },
					    name: 'moonbeam',
					    label: 'Moonbeam'
				    }
			    ],
			    colors            = [
				    '#D251FD',
				    '#22BFFE',
				    '#1B6AE0',
				    '#DA4520',
				    '#D81356',
				    '#FFA800',
				    '#4CCBC9'
			    ],
			    chartExtraOptions = {
				    yAxis: {
					    interval: 250000000,
				    }
			    };

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlDotDex( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'arthswap',
					    label: 'ArthSwap'
				    }, {
					    name: 'curve_moonbeam',
					    label: 'Curve on Moonbeam'
				    }, {
					    name: 'stellaswap',
					    label: 'StellaSwap'
				    }, {
					    name: 'zenlink_astar',
					    label: 'Zenlink on Astar'
				    }, {
					    name: 'zenlink_moonbeam',
					    label: 'Zenlink Moonbeam'
				    }, {
					    name: 'avault',
					    label: 'Avault'
				    }, {
					    name: 'beamswap',
					    label: 'Beamswap'
				    }, {
					    name: 'beefy_moonbeam',
					    label: 'Beefy on Moonbeam'
				    }, {
					    name: 'solarflare',
					    label: 'Solarflare'
				    }, {
					    name: 'parallel',
					    label: 'Parallel'
				    }, {
					    name: 'acala',
					    label: 'Acala'
				    }
			    ],
			    colors   = [
				    '#66E1B6',
				    '#C30D00',
				    '#774EED',
				    '#E4560A',
				    '#89C900',
				    '#D251FD',
				    '#22BFFE',
				    '#FFB800',
				    '#FF806C',
				    '#2A42F1',
				    '#D81356'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlKsmDex( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'solarbeam',
					    label: 'Solarbeam'
				    }, {
					    name: 'karura',
					    label: 'Karura'
				    }, {
					    name: 'zenlink_moonriver',
					    label: 'Zenlink on Moonriver'
				    }, {
					    name: 'beefy_moonriver',
					    label: 'Beefy on Moonriver'
				    }, {
					    name: 'polkaswap',
					    label: 'Polkaswap'
				    }, {
					    name: 'heiko',
					    label: 'Heiko'
				    }, {
					    name: 'bifrost',
					    label: 'Bifrost Kusama'
				    },
			    ],
			    colors   = [
				    '#FF806C',
				    '#C30D00',
				    '#E4A30D',
				    '#66E1B6',
				    '#22BFFE',
				    '#B1B1B1',
				    '#0049F1'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlDotLending( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'starlay',
					    label: 'Starlay'
				    }, {
					    name: 'acala',
					    label: 'Acala (aUSD)'
				    }, {
					    name: 'moonwell_artemis',
					    label: 'Moonwell Artemis'
				    }, {
					    name: 'astriddao',
					    label: 'AstridDAO (BAI)'
				    }, {
					    name: 'parallel',
					    label: 'Parallel'
				    }
			    ],
			    colors   = [
				    '#ED148B',
				    '#D81356',
				    '#B8E94A',
				    '#66E1B6',
				    '#2A42F1'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlKsmLending( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'moonwell_apollo',
					    label: 'Moonwell Apollo'
				    }, {
					    name: 'karura',
					    label: 'Karura (aUSD)'
				    },
			    ],
			    colors   = [
				    '#5C42FB',
				    '#C30D00'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlDotLiquidStaking( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'lido_moonbeam',
					    label: 'Lido on Moonbeam'
				    }, {
					    name: 'acala',
					    label: 'Acala'
				    }, {
					    name: 'bifrost_dot',
					    label: 'Bifrost Polkadot'
				    }, {
					    name: 'parallel',
					    label: 'Parallel'
				    }, {
					    name: 'tapio',
					    label: 'Tapio'
				    }
			    ],
			    colors   = [
				    '#118AF5',
				    '#D81356',
				    '#FFB800',
				    '#2A42F1',
				    '#25DF96'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlKsmLiquidStaking( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'lido_moonriver',
					    label: 'Lido on Moonriver'
				    }, {
					    name: 'karura',
					    label: 'Karura'
				    }, {
					    name: 'bifrost_ksm',
					    label: 'Bifrost Kusama'
				    }, {
					    name: 'heiko',
					    label: 'Heiko'
				    }, {
					    name: 'taiga',
					    label: 'Taiga'
				    }
			    ],
			    colors   = [
				    '#118AF5',
				    '#C30D00',
				    '#FFB800',
				    '#EA5474',
				    '#960DB9'
			    ];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlLiquidCrowdloan( chartName, jsonData ) {
			var datasets          = [
				    {
					    name: 'bifrost_dot',
					    label: 'Bifrost Polkadot'
				    }, {
					    name: 'bifrost_ksm',
					    label: 'Bifrost Kusama'
				    }, {
					    name: 'acala',
					    label: 'Acala'
				    }, {
					    name: 'parallel',
					    label: 'Parallel'
				    }
			    ],
			    colors            = [
				    '#E6007A',
				    '#0049F1',
				    '#F82613',
				    '#22BFFE'
			    ],
			    chartExtraOptions = {
				    yAxis: {
					    splitNumber: 3
				    }
			    };

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsStablecoinIssuance( chartName, jsonData ) {
			var datasets = [
				    {
					    name: 'karura_ausd',
					    label: 'Karura aUSD',
					    options: {
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(0,75,255,0.7)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(0,75,255,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    name: 'acala_ausd',
					    label: 'Acala Ausd',
					    options: {
						    z: 9,
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
								    {
									    offset: 0,
									    color: 'rgba(195,13,0,1)'
								    },
								    {
									    offset: 0.5,
									    color: 'rgba(195,13,0,0.3)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(195,13,0,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    name: 'astriddao_bai',
					    label: 'AstridDAO BAI',
					    options: {
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(255,184,0,0.9)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(255,184,0,0)'
								    }
							    ] )
						    }
					    }
				    }
			    ],
			    colors   = [
				    '#004BFF',
				    '#C30D00',
				    '#FFB800'
			    ];

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTotalBridgeTvl( chartName, jsonData ) {
			var datasets          = [
				    {
					    name: 'interlay',
					    label: 'Interlay',
					    options: {
						    z: 9,
						    opacity: 1,
						    areaStyle: {
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(0,75,255,0.5)'
								    },
								    {
									    offset: 1,
									    color: 'rgba(0,75,255,0)'
								    }
							    ] )
						    }
					    }
				    }, {
					    name: 'kintsugi',
					    label: 'Kintsugi',
					    options: {
						    areaStyle: {
							    opacity: 1,
							    color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
								    {
									    offset: 0,
									    color: 'rgba(142,52,6,0.9)'
								    }, {
									    offset: 1,
									    color: 'rgba(255,184,0,0)'
								    }
							    ] )
						    }
					    }
				    }
			    ],
			    colors            = [
				    '#004BFF',
				    '#E4560A'
			    ],
			    chartExtraOptions = {
				    yAxis: {
					    splitNumber: 3
				    }
			    };

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsNftMarketplaceDailyVolume( chartName, jsonData ) {
			var datasets    = [
				    {
					    name: 'raresama',
					    label: 'Raresama'
				    }, {
					    name: 'singular',
					    label: 'Singular'
				    }, {
					    name: 'nftrade_moonbeam',
					    label: 'NFTrade Moonbeam'
				    }, {
					    name: 'moonbeans_movr',
					    label: 'Moonbeans MOVR'
				    }, {
					    name: 'moonbeans_glmr',
					    label: 'MoonBeans GLMR'
				    }, {
					    name: 'tofu_sdn',
					    label: 'tofu SDN'
				    }, {
					    name: 'tofu_astr',
					    label: 'tofu ASTR'
				    }, {
					    name: 'tofu_movr',
					    label: 'tofu MOVR'
				    }, {
					    name: 'tofu_glmr',
					    label: 'tofu GLMR'
				    }
			    ],
			    colors      = [
				    '#6B49B5',
				    '#E6007A',
				    '#429DF4',
				    '#9EE542',
				    '#4CCBC9',
				    '#F0A08C',
				    '#FF6B00',
				    '#004BFF',
				    '#FFB800'
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
				var dataSetOptions = {
					name: dataset.label,
					data: data[ dataset.name ],
					itemStyle: {
						color: colors[ index ]
					},
					type: 'bar',
					//stack: 'total',
					emphasis: {
						focus: 'series'
					}
				};

				if ( dataset.hasOwnProperty( 'options' ) ) {
					$.extend( true, dataSetOptions, dataset.options );
				}

				chartSeries.push( dataSetOptions );
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
						    show: false
					    },
					    splitLine: {
						    show: false
					    },
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    margin: 12,
						    color: '#ccc',
						    formatter: dateFormatter
					    }
				    },
				    yAxis: {
					    type: 'value',
					    axisLine: {
						    show: false
					    },
					    splitNumber: 4,
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

		function getChartOptionsTheGreatEscapeUsers( chartName ) {
			var colors            = [
				    '#004BFF'
			    ],
			    data              = [
				    [
					    'October\n W1',
					    'October\n W2',
					    'October\n W3',
					    'October\n W4',
					    'November\n W1',
					    'November\n W2',
					    'November\n W3',
					    'November\n W4',
					    'December\n W1',
					    'December\n W2',
					    'December\n W3',
					    'December\n W4'
				    ], [
					    1466,
					    1304,
					    1633,
					    996,
					    1806,
					    1226,
					    1897,
					    1281,
					    1943,
					    1699,
					    3782,
					    2919
				    ]
			    ],
			    baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    grid: {
					    left: '3%',
					    right: '3%',
					    top: '3%',
					    bottom: '3%',
					    containLabel: true
				    },
				    xAxis: {
					    type: 'category',
					    data: data[ 0 ],
					    axisTick: {
						    show: false
					    },
					    axisLine: {
						    show: false
					    },
					    splitLine: {
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    lineHeight: 16,
						    margin: 12,
						    color: '#ccc'
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
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    fontFamily: fontFamily,
						    fontSize: 12,
						    fontWeight: 500,
						    color: '#ccc'
					    }
				    },
				    series: {
					    type: 'bar',
					    data: data[ 1 ],
					    name: 'Game Sessions Played',
					    barMaxWidth: 50,
					    itemStyle: {
						    borderRadius: [ 8, 8, 0, 0 ]
					    },
					    label: {
						    show: true,
						    fontFamily: fontFamily,
						    fontSize: 16,
						    fontWeight: 700,
						    color: '#66E1B6',
						    position: 'top'
					    },
				    }
			    },
			    responsiveOptions = getChartResponsiveOptionsTheGreatEscapeUsers();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsTheGreatEscapeUsers() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						axisLabel: {
							hideOverlap: false,
							showMaxLabel: true,
							rotate: 0,
							align: 'center'
						}
					},
					series: {
						barMaxWidth: 50,
						itemStyle: {
							borderRadius: [ 8, 8, 0, 0 ]
						},
						label: {
							fontSize: 16,
						}
					}
				};
			} else {
				newOptions = {
					xAxis: {
						axisLabel: {
							hideOverlap: true,
							showMaxLabel: false,
							rotate: 45,
							lineHeight: 12,
							align: 'right'
						}
					},
					series: {
						barMaxWidth: 20,
						itemStyle: {
							borderRadius: [ 3, 3, 0, 0 ]
						},
						label: {
							fontSize: 12,
						}
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( true, newOptions, {
						series: {
							barMaxWidth: 10,
							itemStyle: {
								borderRadius: [ 3, 3, 0, 0 ]
							},
							label: {
								fontSize: 10,
							}
						}
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsMoonfitDailyActiveUser( chartName, jsonData ) {
			var datasets          = [
				    {
					    name: 'users',
					    label: 'Active users'
				    }
			    ],
			    colors            = [
				    '#FD2E9C'
			    ],
			    chartExtraOptions = {
				    yAxis: {
					    splitNumber: 3
				    }
			    };

			var baseOptions       = getChartLinesBaseOptions( jsonData, datasets, colors ),
			    responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTotalPlotsSaleSkybreach( chartName, jsonData ) {
			var totalItems = jsonData.length,
			    data       = {
				    cumulative_plot_count: [],
				    cumulative_volume: [],
			    },
			    colors     = [
				    '#004BFF',
				    '#E6007A'
			    ];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.cumulative_plot_count.push( [ jsonData[ i ].date, jsonData[ i ].cumulative_plot_count ] );
				data.cumulative_volume.push( [ jsonData[ i ].date, jsonData[ i ].cumulative_volume ] );
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
					top: '3%',
					left: '25px',
					right: '25px',
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
						show: false
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
						position: 'right',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisPointer: {
							label: {
								color: '#fff',
								backgroundColor: colors[ 0 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					},
					{
						type: 'value',
						position: 'left',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						interval: 250000,
						max: 1250000,
						splitLine: {
							lineStyle: {
								type: [ 4, 4 ],
								color: [ '#262626' ]
							}
						},
						axisPointer: {
							label: {
								color: '#fff',
								backgroundColor: colors[ 1 ]
							}
						},
						axisLabel: {
							color: '#ccc'
						}
					}
				],
				series: [
					{
						name: locate.cumulativePlotCount,
						data: data.cumulative_plot_count,
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}, {
						name: locate.cumulativeVolume + ' (xcRMRK)',
						data: data.cumulative_volume,
						type: 'line',
						yAxisIndex: 1,
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsTotalPlotsSaleSkybreach();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsTotalPlotsSaleSkybreach() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					grid: {
						left: '25px',
						right: '25px',
					},
					xAxis: {
						splitNumber: 3,
						axisLabel: {
							formatter: dateFormatter
						}
					},
					yAxis: [
						{
							axisLabel: {
								formatter: '{value}'
							}
						}, {
							axisLabel: {
								formatter: '{value}'
							}
						}
					]
				};
			} else {
				newOptions = {
					grid: {
						left: '15px',
						right: '15px',
					},
					xAxis: {
						splitNumber: 3,
						axisLabel: {
							formatter: dateShortFormatter
						}
					},
					yAxis: [
						{
							axisLabel: {
								formatter: function( value ) {
									return value ? NumberUtil.formatMoney( value ) : '-';
								}
							}
						}, {
							axisLabel: {
								formatter: function( value ) {
									return value ? NumberUtil.formatMoney( value ) : '-';
								}
							}
						}
					]
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
			var colors            = [
				    '#004BFF',
				    '#E6007A'
			    ],
			    data              = [
				    [ '2019', '2020', '2021', '2022' ],
				    [ 62, 144, 124, 146 ],
				    [ 62, 206, 330, 476 ],
			    ],
			    baseOptions       = {
				    color: colors,
				    textStyle: {
					    fontFamily: fontFamily,
					    fontWeight: 500
				    },
				    tooltip: defaultTooltipSettings,
				    legend: defaultLegendSettings,
				    grid: {
					    top: '5%',
					    left: '3%',
					    right: '3%',
					    containLabel: true
				    },
				    xAxis: {
					    type: 'category',
					    data: data[ 0 ],
					    splitLine: {
						    show: false,
						    lineStyle: {
							    type: [ 4, 4 ],
							    color: [ '#262626' ]
						    }
					    },
					    axisTick: {
						    show: false
					    },
					    axisLine: {
						    show: false,
					    },
					    axisPointer: defaultAxisPointerLabelSettings,
					    axisLabel: {
						    margin: 12,
						    color: '#ccc'
					    }
				    },
				    yAxis: {
					    type: 'value',
					    alignTicks: true,
					    axisLine: {
						    show: false,
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
						    name: locate.grantsEachYear,
						    data: data[ 1 ],
						    type: 'bar',
						    label: {
							    show: true,
							    fontFamily: fontFamily,
							    fontWeight: 700,
							    fontSize: 16,
							    position: 'insideTop',
							    padding: [ 7, 0, 0, 0 ]
						    },
						    barMaxWidth: 102,
						    itemStyle: {
							    borderRadius: [ 8, 8, 0, 0 ]
						    }
					    },
					    {
						    name: locate.grantsCumulative,
						    data: data[ 2 ],
						    type: 'line',
						    label: {
							    show: true,
							    fontFamily: fontFamily,
							    fontWeight: 700,
							    fontSize: 16,
							    position: 'top',
							    color: colors[ 1 ],
						    },
						    smooth: false,
						    showSymbol: true,
						    symbolSize: 16,
						    //symbol: 'path://M11 8C11 9.65685 9.65685 11 8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8 M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z',
						    symbol: 'image://data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFzSURBVHgBpVMxS8NAGH13uTSgtkhrCwpqVXCyix100cFMSpzFSRdH166li0N/g4OTg2ulTl10EIdOnUTQ0kGhbVwqQtMm511ECdeisT744PLue++Sl+8IFDSQm9GgpzVg3gOPfrLEJoDN0KsmUewE+8nX4gHHRgyTqy7cDH6ABq2WAq0SFJxvAykeR8wCeAKhQOxpsJI0ofJRnhxeLMETTXhZ36qFXLQHto8RoAMl1ocunPjAZrx8sGuYS1ty3btr3LY3Ty/UHhFymgrpwKvHr4/2jO1lCxFtTJa+sWDGy4eW2tcHTdNh326sza4PcOaiqXJE/GaKf4JSkI5KOpXHisp1RQ5D5G1K4NVV2t45u+zePFXguO+yulf3pdchIRK4NpGjy8AsjAAG/ZzOofisgdfwR0hNCoU3P8QUIlU5nmHFruht+ZrAZeLIR5pwsmIz89vJUrwSvExBNJGfcIURB58SKfszQuF1+iB1Q1QSJy/B/g/pm3cqp4f8DgAAAABJRU5ErkJggg==',
						    emphasis: {
							    focus: 'series'
						    }
					    }
				    ]
			    },
			    responsiveOptions = getChartResponsiveOptionsWeb3FoundationGrants();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsWeb3FoundationGrants() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'series' ] = [
					{
						label: {
							fontSize: 12,
						},
					}, {
						label: {
							fontSize: 12,
						},
					}
				]
			} else {
				newOptions[ 'series' ] = [
					{
						label: {
							fontSize: 16,
						},
					}, {
						label: {
							fontSize: 16,
						},
					}
				]
			}

			return newOptions;
		}

		function getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground, seriesOptions, chartExtraOptions ) {
			/*if( null === areaBackground) {
				console.log( typeof areaBackground );
				console.log( areaBackground );
			}

			if( null === seriesOptions) {
				console.log( typeof seriesOptions );
				console.log( seriesOptions );
			}*/

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
						margin: 12,
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
					case 'staking-ratio':
					case 'twitter-followers':
					case 'tvl-defi-parachain':
					case 'tvl-dot-dex':
					case 'tvl-ksm-dex':
					case 'tvl-dot-lending':
					case 'tvl-ksm-lending':
					case 'tvl-dot-liquid-staking':
					case 'tvl-ksm-liquid-staking':
					case 'tvl-liquid-crowdloan':
					case 'stablecoin-issuance':
					case 'total-bridge-tvl':

					case 'subsocial-daily-activities':
					case 'joystream-cumulative-activities':
						newOptions[ 'xAxis' ] = {
							splitNumber: 5
						};
						break;

					case 'mf-daily-active-user':
						newOptions[ 'xAxis' ] = {
							splitNumber: 4
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
					splitNumber: 3,
					axisLabel: {
						formatter: dateShortFormatter
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

			var yAxis = {};
			switch ( chartName ) {
				case 'tvl-defi-parachain':
				case 'tvl-dot-dex':
				case 'tvl-ksm-dex':
				case 'tvl-dot-lending':
				case 'tvl-ksm-lending':
				case 'tvl-dot-liquid-staking':
				case 'tvl-ksm-liquid-staking':
				case 'tvl-liquid-crowdloan':
				case 'stablecoin-issuance':
				case 'total-bridge-tvl':
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
