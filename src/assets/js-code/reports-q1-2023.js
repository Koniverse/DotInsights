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

		var sourceBaseUrl = baseUrl + '/assets/data/q1-2023/';
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
			//initLanguageSwitcher();

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
							chartOptions = getChartResponsiveOptionsPriceDevAct( chartName );
							break;
						case 'newly-created-repo':
							chartOptions = getChartResponsiveOptionsNewlyCreatedRepo( chartName );
							break;
						case 'ku-net-alloca':
							chartOptions = getChartResponsiveOptionsKuNetAlloca( chartName );
							break;
						case 'pol-net-alloca':
							chartOptions = getChartResponsiveOptionsPolNetAlloca( chartName );
							break;
						case 'nomination-pool-staking':
							chartOptions = getChartResponsiveOptionsNominationPoolStaking( chartName );
							break;
						case 'spending-dominated-kusama':
							chartOptions = getChartResponsiveOptionsSpendingDominatedKusama( chartName );
							break;
						case 'open-gov-average-turnout':
							chartOptions = getChartResponsiveOptionsOpenGovAverageTurnout( chartName );
							break;
						case 'web3-foundation-grants':
							chartOptions = getChartResponsiveOptionsWeb3FoundationGrants( chartName );
							break;
						case 'chain-with-more-token-holders':
							chartOptions = getChartResponsiveOptionsChainWithMoreTokenHolders( chartName );
							break;
						case 'top-dot-ksm-chain-fees':
							chartOptions = getChartResponsiveOptionsTopDotKsmChainFees( chartName );
							break;
						case 'tvl-defi-parachain':
							chartOptions = getChartLinesBaseResponsiveOptions( chartName );
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
					url: 'polkadot-report-q1-2023-en',
					isActive: 1,
				}, {
					code: 'pt',
					name: 'Português',
					flag: 'pt.svg',
					url: 'polkadot-report-q1-2023-pt',
					isActive: 1,
				}, {
					code: 'vi',
					name: 'Tiếng Việt',
					flag: 'vn.svg',
					url: 'polkadot-report-q1-2023-vi',
					isActive: 1,
				}, {
					code: 'zh',
					name: '中文',
					flag: 'cn.svg',
					url: 'polkadot-report-q1-2023-zh',
					isActive: 1,
				}, {
					code: 'id_ID',
					name: 'Bahasa Indonesia',
					flag: 'id.svg',
					url: 'polkadot-report-q1-2023-id',
					isActive: 1,
				}, {
					code: 'es',
					name: 'Español',
					flag: 'es.svg',
					url: 'polkadot-report-q1-2023-es',
					isActive: 1,
				}, {
					code: 'kr',
					name: '한국어',
					flag: 'kr.svg',
					url: 'polkadot-report-q1-2023-kr',
					isActive: 1,
				}, {
					code: 'ja',
					name: '日本語',
					flag: 'jp.svg',
					url: 'polkadot-report-q1-2023-ja',
					isActive: 1,
				}, {
					code: 'fr',
					name: 'Français',
					flag: 'fr.svg',
					url: 'polkadot-report-q1-2023-fr',
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
						case 'newly-created-repo':
							chartOptions = getChartOptionsNewlyCreatedRepo( chartName, jsonData );
							break;
						case 'staking-ratio':
							chartOptions = getChartOptionsStakingRatio( chartName, jsonData );
							break;
						case 'nomination-pool-staking':
							chartOptions = getChartOptionsNominationPoolStaking( chartName, jsonData );
							break;
						case 'tvl-defi-parachain':
							chartOptions = getChartOptionsDefiParachain( chartName, jsonData );
							break;
					}
					chartInstance.hideLoading();
					chartInstance.setOption( chartOptions );
				} );
			} else { // Chart with inline source.
				var chartOptions = {};

				switch ( chartName ) {
					case 'ku-net-alloca':
						chartOptions = getChartOptionsKuNetAlloca( chartName );
						break;
					case 'pol-net-alloca':
						chartOptions = getChartOptionsPolNetAlloca( chartName );
						break;
					case 'spending-dominated-kusama':
						chartOptions = getChartOptionsSpendingDominatedKusama( chartName );
						break;
					case 'open-gov-average-turnout':
						chartOptions = getChartOptionsOpenGovAverageTurnout( chartName );
						break;
					case 'web3-foundation-grants':
						chartOptions = getChartOptionsWeb3FoundationGrants( chartName );
						break;
					case 'chain-with-more-token-holders':
						chartOptions = getChartOptionsChainWithMoreTokenHolders( chartName );
						break;
					case 'top-dot-ksm-chain-fees':
						chartOptions = getChartOptionsTopDotKsmChainFees( chartName );
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
					left: '3%',
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
						margin: 12,
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

		function getChartOptionsNewlyCreatedRepo( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data       = [],
				cats       = [],
				colors     = [
					'#004BFF'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				cats.push( jsonData[ i ].quarter );
				data.push( NumberUtil.validate( jsonData[ i ].new_repos ) );
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
				responsiveOptions = getChartResponsiveOptionsNewlyCreatedRepo();

			return $.extend( true, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsNewlyCreatedRepo() {
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

		function getChartOptionsKuNetAlloca( chartName ) {
			var colors   = [
					'#346DF1',
					'#DC0067',
					'#D0C6E3',
					'#CA93AF',
					'#3BB1BA',
					'#5100C7',
					'#F42F44',
					'#EA645F',
					'#FAC83F'
				],
				datasets = [
					{
						value: 31.0,
						name: 'Infrastructure deployment and continued operation',
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
						value: 12.2,
						name: 'Software development (wallets and wallet integration, clients and client upgrades)',
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
						value: 8.5,
						name: 'Community events and outreach (meetups, hackerspaces).',
						label: {
							color: colors[ 2 ]
						},
					}, {
						value: 8.5,
						name: 'Marketing activities (advertising, paid features, collaborations)',
						label: {
							color: colors[ 3 ]
						},
					}, {
						value: 9.4,
						name: 'Bounties',
						label: {
							color: colors[ 4 ]
						},
					}, {
						value: 13.0,
						name: 'Others',
						label: {
							color: colors[ 5 ]
						},
					}, {
						value: 13.5,
						name: 'Liquidity provision ',
						label: {
							color: colors[ 6 ]
						},
					}, {
						value: 2.1,
						name: 'Network security operations (monitoring services, anti-scam activities, continuous auditing).',
						label: {
							color: colors[ 7 ]
						},
					}, {
						value: 1.8,
						name: 'Ecosystem provisions (collaborations with friendly chains).',
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
					}
				],
				baseOptions       = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function( value ) {
							return NumberUtil.formatWithCommas( value );
						}
					} ),
					legend: $.extend( true, {}, defaultLegendSettings, {
						show: false,
					} ),
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
							center: [ '50%', '45%' ],
							radius: [ '40%', '60%' ],
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
				},
				responsiveOptions = getChartResponsiveOptionsKuNetAlloca();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsKuNetAlloca() {
			var newOptions = {
				series: [ {}, {} ]
			};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'legend' ] = defaultLegendSettings;
				newOptions[ 'series' ][ 0 ] = {
					label: {
						fontSize: 11,
						lineHeight: 24,
						formatter: function( params ) {
							return `${params.percent}%`;
						}
					},
					labelLine: {
						length: 5,
					}
				}
			} else {
				newOptions[ 'legend' ] = {
					show: false
				};
				newOptions[ 'series' ][ 0 ] = {
					label: {
						fontSize: 17,
						lineHeight: 30,
						formatter: function( params ) {
							return `${params.name} ${params.percent}%`;
						}
					}
				}
			}

			return newOptions;
		}

		function getChartOptionsPolNetAlloca( chartName ) {
			var colors   = [
					'#346DF1',
					'#DC0067',
					'#D0C6E3',
					'#CA93AF',
					'#3BB1BA',
					'#5100C7',
					'#F42F44',
					'#EA645F',
					'#FAC83F'
				],
				datasets = [
					{
						value: 10.8,
						name: 'Public infrastructure deployment and continued operation',
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
						value: 0.5,
						name: 'Software development (wallets and wallet integration, clients and client upgrades)',
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
						value: 4.0,
						name: 'Community events and outreach (meetups, hackerspaces).',
						label: {
							color: colors[ 2 ]
						},
					}, {
						value: 2.0,
						name: 'Marketing activities (advertising, paid features, collaborations)',
						label: {
							color: colors[ 3 ]
						},
					}, {
						value: 73.2,
						name: 'Bounties',
						label: {
							color: colors[ 4 ]
						},
					}, {
						value: 0.9,
						name: 'Others',
						label: {
							color: colors[ 5 ]
						},
					}, {
						value: 0.0,
						name: 'Liquidity provision ',
						label: {
							color: colors[ 6 ]
						},
					}, {
						value: 7.3,
						name: 'Network security operations (monitoring services, anti-scam activities, continuous auditing).',
						label: {
							color: colors[ 7 ]
						},
					}, {
						value: 1.4,
						name: 'Ecosystem provisions (collaborations with friendly chains).',
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
					}
				],
				baseOptions       = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function( value ) {
							return NumberUtil.formatWithCommas( value );
						}
					} ),
					legend: $.extend( true, {}, defaultLegendSettings, {
						show: false,
					} ),
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
							center: [ '50%', '45%' ],
							radius: [ '40%', '60%' ],
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
				},
				responsiveOptions = getChartResponsiveOptionsPolNetAlloca();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsPolNetAlloca() {
			var newOptions = {
				series: [ {}, {} ]
			};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'legend' ] = defaultLegendSettings;
				newOptions[ 'series' ][ 0 ] = {
					label: {
						fontSize: 11,
						lineHeight: 24,
						formatter: function( params ) {
							return `${params.percent}%`;
						}
					},
					labelLine: {
						length: 5,
					}
				}
			} else {
				newOptions[ 'legend' ] = {
					show: false
				};
				newOptions[ 'series' ][ 0 ] = {
					label: {
						fontSize: 17,
						lineHeight: 30,
						formatter: function( params ) {
							return `${params.name} ${params.percent}%`;
						}
					}
				}
			}

			return newOptions;
		}

		function getChartOptionsStakingRatio( chartName, jsonData ) {
			var datasets = [
					{
						name: 'inflation_ratio',
						label: 'Inflation Ratio'
					}, {
						name: 'rewards_ratio',
						label: 'Rewards Ratio'
					},
					{
						name: 'staking_ratio',
						label: 'Staking Ratio'
					},
				],
				colors   = [
					'#004BFF',
					'#E12C29',
					'#F8B00C'
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
						max: 50,
						interval: 10,
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
					left: '40px',
					right: '40px',
					containLabel: true
				},
				xAxis: {
					type: 'time',
					splitLine: {
						show: false,
					},

					axisTick: {
						show: false
					},
					axisLine: {
						show: false
					},
					axisPointer: defaultAxisPointerLabelSettings,
					axisLabel: {
						margin: 15,
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
						offset: 20,
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
						offset: 20,
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
					grid: {
						left: '40px',
						right: '40px',
					},
					yAxis: [
						{
							offset: 20,
							axisLabel: {
								formatter: '{value}'
							}
						}, {
							offset: 20,
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
					grid: {
						left: '20px',
						right: '20px',
					},
					yAxis: [
						{
							offset: 5,
							axisLabel: {
								formatter: function( value ) {
									return NumberUtil.formatMoney( value );
								}
							}
						}, {
							offset: 5,
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

		function getChartOptionsSpendingDominatedKusama( chartName ) {
			var colors = [
					'#004BFF',
					'#E12C29',
					'#F8B00C'
				],
				data = [
					[
						'lease_admin',
					  'general_admin',
					  'staking_admin',
					  'big_tipper',
					  'auction_admin',
					  'referendum_canceller',
					  'root',
					  'small_spender',
					  'small_tipper',
					  'treasurer',
					  'whitelisted_caller',
					  'big_spender',
					  'medium_spender'
					],
					[ 1, 0, 2, 2, 5, 6, 4, 3, 7, 8, 19, 14, 22 ],
					[ 0, 2, 0, 1, 0, 0, 4, 4, 3, 2, 7, 11, 6 ],
					[ 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 4, 4 ]
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
							name: locate.Approved,
							data: data[ 1 ],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 40
						},
						{
							name: locate.notApproved,
							data: data[ 2 ],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 40
						},
						{
							name: locate.pending,
							data: data[ 3 ],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 40
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsSpendingDominatedKusama();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsSpendingDominatedKusama() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'series' ] = [
					{
						label: {
							fontSize: 12,
						},
					},
					{
						label: {
							fontSize: 12,
						},
					},
					{
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
					},
					{
						label: {
							fontSize: 16,
						},
					},
					{
						label: {
							fontSize: 16,
						},
					}
				]
			}

			return newOptions;
		}

		function getChartOptionsOpenGovAverageTurnout( chartName ) {
			var colors = [
					'#FB560A'
				],
				data = [
					[
						'lease_admin',
						'general_admin',
						'staking_admin',
						'big_tipper',
						'auction_admin',
						'referendum_canceller',
						'root',
						'small_spender',
						'small_tipper',
						'treasurer',
						'whitelisted_caller',
						'big_spender',
						'medium_spender'
					],
					[ 0.16, 1.26, 0.17, 0.06, 0.78, 0.33, 0.18, 0.75, 0.30, 0.08, 0.33, 0.19, 0.18 ]
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
							type: 'bar',
							data: data[1],
							name: '',
							label: {
								show: true,
								position: 'top',
								fontFamily: fontFamily,
								fontSize: 16,
								fontWeight: 700,
								color: '#FB560A',
								formatter: '{c}%'
							},
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [ 2, 2, 0, 0 ]
							}
						}
					],
				},
				responsiveOptions = getChartResponsiveOptionsOpenGovAverageTurnout();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsOpenGovAverageTurnout() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'series' ] = [
					{
						label: {
							fontSize: 12,
						},
					},
					{
						label: {
							fontSize: 12,
						},
					},
					{
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
					},
					{
						label: {
							fontSize: 16,
						},
					},
					{
						label: {
							fontSize: 16,
						},
					}
				]
			}

			return newOptions;
		}

		function getChartOptionsWeb3FoundationGrants( chartName ) {
			var colors            = [
					'#004BFF',
					'#E6007A'
				],
				data              = [
					[ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '14', '15', '16', '17' ],
					[ '10', '12', '14', '26', '37', '33', '31', '43', '48', '29', '26', '21', '32', '36', '39', '39', '46' ],
					[ '10', '22', '36', '62', '99', '132', '163', '206', '254', '283', '309', '330', '362', '398', '437', '476', '522' ]
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
					yAxis: [
						{
							type: 'value',
							name: locate.grantsEachWave,
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							position: 'right',
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 200,
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
							name: locate.grantsCumulative,
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 10,
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
							name: locate.grantsEachWave,
							data: data[ 1 ],
							type: 'bar',
							yAxisIndex: 1,
							label: {
								show: false,
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

		function getChartOptionsChainWithMoreTokenHolders( chartName ) {
			var colors = [
					'#E6007A',
					'#736161'
				],
				data = [
					[ 'Polkadot', 'Moonbeam', 'Nodle', 'Shiden', 'Astar', 'Kusama', 'Moonriver', 'Acala', 'Bifrost Kusama', 'Karura', 'Quartz', 'Statemine', 'Parallel', 'Centrifuge', 'Calamari', 'Altair', 'Pioneer', 'Parallel Heiko', 'Unique', 'Hydradx', 'Khala', 'Spiritnet', 'Basilisk', 'Efinity', 'Kintsugi', 'Zeitgeist', 'Integritee', 'Interlay', 'Equilibrium', 'Turing', 'Bajun', 'Snow', 'Crab', 'Bifrost', 'Datahighway', 'Origintrail', 'Shadow', 'Phala', 'Robonomics', 'Picasso', 'Clv', 'Mangatax', 'Crust Parachain', 'Statemint', 'Encointer', 'Darwinia Parachain', 'Composable' ],
					[ '1091399', '1083071', '741542', '0', '499310', '0', '0', '157403', '0', '0', '0', '0', '46926', '45041', '0', '0', '0', '0', '24007', '23112', '0', '18288', '0', '16207', '0', '15634', '0', '11241', '9522', '0', '0', '0', '0', '3968', '0', '3538', '0', '3193', '0', '0', '2209', '0', '996', '617', '0', '22', '7' ],
					[ '0', '0', '0', '633785', '0', '287580', '247236', '0', '84579', '83918', '80111', '49325', '0', '0', '36565', '29563', '24839', '24060', '0', '0', '21391', '0', '16990', '0', '16016', '0', '13003', '0', '0', '7617', '6106', '5924', '5192', '0', '3746', '0', '3202', '0', '2978', '2841', '0', '1597', '0', '0', '65', '0', '0' ]
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
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#ccc'
						}
					},
					series: [
						{
							name: locate.polkadotChain,
							data: data[ 1 ],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 20,
							itemStyle: {
								borderRadius: [ 2, 2, 0, 0 ]
							}
						},
						{
							name: locate.kusamaChain,
							data: data[ 2 ],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 20,
							itemStyle: {
								borderRadius: [ 2, 2, 0, 0 ]
							}
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsChainWithMoreTokenHolders();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsChainWithMoreTokenHolders() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'series' ] = [
					{
						label: {
							fontSize: 12,
						},
					},
					{
						label: {
							fontSize: 12,
						},
					},
					{
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
					},
					{
						label: {
							fontSize: 16,
						},
					},
					{
						label: {
							fontSize: 16,
						},
					}
				]
			}

			return newOptions;
		}

		function getChartOptionsTopDotKsmChainFees( chartName ) {
			var colors   = [
					'#03FFFF',
					'#1B6AE0',
					'#FE0096',
					'#F42F44',
					'#22BFFE',
					'#F93F42',
					'#B1B1B1',
					'#40BAF8',
					'#53CBC9',
					'#F2B705'
				],
				dataName = [ 'Khala', 'Astar', 'Bit.Country Pioneer', 'Acala', 'Parallel', 'Karura', 'Heiko', 'Unique', 'Moonbeam', 'Moonriver' ],
				dataFee = [ '7669.36', '3780.87', '3134.86', '1431.81', '507.61', '231.68', '216.15', '143.68', '134.58', '99.04' ],
				datasets = [
					{
						value: dataFee[0],
						name: dataName[0],
						label: {
							color: colors[ 0 ],
							formatter: '{b} ${c}'
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
						value: dataFee[1],
						name: dataName[1],
						label: {
							color: colors[ 1 ],
							formatter: '{b} ${c}'
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,1)'
									}
								] )
							}
						}
					}, {
						value: dataFee[2],
						name: dataName[2],
						label: {
							color: colors[ 2 ],
							formatter: '{b} ${c}'
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,1)'
									}
								] )
							}
						}
					}, {
						value: dataFee[3],
						name: dataName[3],
						label: {
							color: colors[ 3 ],
							formatter: '{b} ${c}'
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,1)'
									}
								] )
							}
						}
					}, {
						value: dataFee[4],
						name: dataName[4],
						label: {
							color: colors[ 4 ],
							formatter: '{b} ${c}'
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,1)'
									}
								] )
							}
						}
					}, {
						value: dataFee[5],
						name: dataName[5],
						label: {
							color: colors[ 5 ],
							formatter: '{b} ${c}'
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,1)'
									}
								] )
							}
						}
					}, {
						value: dataFee[6],
						name: dataName[6],
						label: {
							color: colors[ 6 ],
							formatter: '{b} ${c}'
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: 'rgba(255,255,255,0)'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,1)'
									}
								] )
							}
						}
					}, {
						value: dataFee[7],
						name: dataName[7],
						label: {
							color: colors[ 7 ],
							formatter: '{b} ${c}'
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
						value: dataFee[8],
						name: dataName[8],
						label: {
							color: colors[ 8 ],
							formatter: '{b} ${c}'
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
						value: dataFee[9],
						name: dataName[9],
						label: {
							color: colors[ 9 ],
							formatter: '{b} ${c}'
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
				],
				baseOptions       = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function( value ) {
							return '$' + NumberUtil.formatWithCommas( value );
						}
					} ),
					legend: $.extend( true, {}, defaultLegendSettings, {
						show: false,
					} ),
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
							center: [ '50%', '45%' ],
							radius: [ '40%', '60%' ],
							label: {
								alignTo: 'edge',
								minMargin: 5,
								edgeDistance: 10,
								color: '#fff',
								fontFamily: fontFamily,
								fontWeight: 500,
								fontSize: 17,
								lineHeight: 30,
								formatter: '{b} ${c}'
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
				},
				responsiveOptions = getChartResponsiveOptionsTopDotKsmChainFees();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}
		function getChartResponsiveOptionsTopDotKsmChainFees() {
			var newOptions = {
				series: [ {}, {} ]
			};

			if ( window.innerWidth < 768 ) {
				newOptions[ 'legend' ] = defaultLegendSettings;
				newOptions[ 'series' ][ 0 ] = {
					label: {
						fontSize: 11,
						lineHeight: 24,
						formatter: function( params ) {
							return `${params.percent}%`;
						}
					},
					labelLine: {
						length: 5,
					}
				}
			} else {
				newOptions[ 'legend' ] = {
					show: false
				};
				newOptions[ 'series' ][ 0 ] = {
					label: {
						fontSize: 17,
						lineHeight: 30,
						formatter: function( params ) {
							return `${params.name} ${params.percent}%`;
						}
					}
				}
			}

			return newOptions;
		}

		function getChartOptionsDefiParachain( chartName, jsonData ) {
			var datasets          = [
					{
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(216,19,86,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(216,19,86,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'acala',
						label: 'Acala'
					}, {
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(34,191,254,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(34,191,254,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'parallel',
						label: 'Parallel'
					}, {
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(76,203,201,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(76,203,201,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'moonbeam',
						label: 'Moonbeam'
					}, {
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(27,106,224,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(27,106,224,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'astar',
						label: 'Astar'
					}, {
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(255,168,0,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(255,168,0,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'moonriver',
						label: 'Moonriver'
					}, {
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(218,69,32,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(218,69,32,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'karura',
						label: 'Karura'
					}, {
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(210,81,253,0.7)'
									},
									{
										offset: 1,
										color: 'rgba(210,81,253,0.1)'
									}
								] )
							},
							stack: 'Total'
						},
						name: 'others',
						label: locate.others
					}
				],
				colors            = [
					'#D81356',
					'#22BFFE',
					'#4CCBC9',
					'#1B6AE0',
					'#FFA800',
					'#DA4520',
					'#D251FD',
				],
				chartExtraOptions = {
					yAxis: {
						interval: 50000000,
					}
				};

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );

			return $.extend( true, {}, baseOptions, responsiveOptions );
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
				}

				// Used dataset.options instead of.
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
					case 'mf-daily-active-user':
						newOptions[ 'xAxis' ] = {
							splitNumber: 4
						};
						break;
					default:
						newOptions[ 'xAxis' ] = {
							splitNumber: 5
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
