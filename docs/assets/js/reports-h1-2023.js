(
	function ( $ ) {
		'use strict';

		var locate = window.dotinsights.Localization;
		var baseUrl = location.origin;
		var partname = location.pathname.split( '/' );

		for ( var i = 0; i < partname.length - 2; i ++ ) {
			if ( '' !== partname[i] ) {
				baseUrl += '/' + partname[i];
			}
		}

		var sourceBaseUrl = baseUrl + '/assets/data/q1-2023/';
		var tokenBaseUrl = baseUrl + '/assets/images/token/';

		var NumberUtil = dotinsights.NumberUtil,
			$allCharts = $( '.block-chart' ),
			dateFormatter = '{dd}/{MM}/{yyyy}',
			dateShortFormatter = '{MM}/{yyyy}',
			fontFamily = 'Plus Jakarta Sans',
			echarts = window.echarts,
			defaultDataZoom = {
				type: 'slider',
				backgroundColor: '#232323',
				borderColor: '#232323',
				dataBackground: {
					lineStyle: {
						color: '#777777'
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
						color: '#777777'
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
					color: '#cccccc'
				},
				handleStyle: {
					borderWidth: 0,
					borderCap: 'round',
					color: '#3c72ff'
				},
				moveHandleStyle: {
					borderWidth: 0,
					color: '#3c72ff',
				},
				start: 0,
				end: 10,
				height: 32,
				bottom: 45
			},
			defaultTooltipStyle = {
				padding: [
					15,
					20
				],
				backgroundColor: '#000000',
				borderWidth: 0,
				extraCssText: 'border-radius: 10px;box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);',
				textStyle: {
					fontFamily: fontFamily,
					color: '#ffffff',
					fontSize: 14,
					fontWeight: '500'
				}
			},
			defaultTooltipSettings = $.extend( true, {}, defaultTooltipStyle, {
				trigger: 'axis',
				axisPointer: {
					type: 'line',
					crossStyle: {
						color: 'rgba(255,255,255,0.3)'
					},
					lineStyle: {
						type: [
							4,
							4
						],
						color: 'rgba(255,255,255,0.3)'
					}
				}
			} ),
			defaultLegendSettings = {
				show: true,
				icon: 'roundRect',
				textStyle: {
					fontFamily: fontFamily,
					color: '#ffffff',
					fontSize: 15,
					fontWeight: '500',
					padding: [
						3,
						0,
						0,
						0
					]
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
					color: '#000000',
					backgroundColor: '#cccccc'
				}
			};

		$( document ).ready( function () {
			$allCharts.waypoint( function () {
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

			$( document.body ).on( 'click', '.bridge-list a', function ( evt ) {
				evt.preventDefault();

				var $thisButton = $( this );

				if ( $thisButton.hasClass( 'current' ) ) {
					return;
				}

				$thisButton.siblings().removeClass( 'current' );
				$thisButton.addClass( 'current' );

				$blockBridge.find( '.bridge-item' ).hide().removeClass( 'animate' );
				$blockBridge.find( '.bridge--' + $thisButton.data( 'filter' ) ).show( function () {
					$( this ).addClass( 'animate' );
				}, 0 );
			} );
		} );

		$( window ).on( 'hresize_one', function () {
			$allCharts.each( function () {
				var $chart = $( this ),
					chartInstance = echarts.getInstanceByDom( $chart.get( 0 ) ),
					chartName = $chart.data( 'chart-name' );

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
						case 'dot-holder-distribution':
						case 'ksm-holder-distribution':
							chartOptions = getChartResponsiveOptionsHolderDistribution( chartName );
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
						case 'tvl-dot-dex':
						case 'tvl-ksm-dex':
						case 'tvl-dot-liquid-staking':
						case 'tvl-ksm-liquid-staking':
							chartOptions = getChartLinesBaseResponsiveOptions( chartName );
							break;
						case 'usdt-on-statemine-ksm':
						case 'usdt-on-statemine-dot':
							chartOptions = getChartResponsiveOptionsUsdtOnStatemine( chartName );
							break;
						case 'nft-marketplace':
							chartOptions = getChartResponsiveOptionsNftMarketplace( chartName );
							break;
						case 'daily-new-smart-contracts':
							chartOptions = getChartResponsiveOptionsDailyNewSmartContracts( chartName );
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

			$tableOfContents.on( 'click', '.btn-close-panel', function ( e ) {
				e.preventDefault();
				e.stopPropagation();

				$tableOfContents.removeClass( 'open' );
			} );

			$tableOfContents.on( 'click', function ( e ) {
				if ( e.target !== this ) {
					return;
				}

				$tableOfContents.removeClass( 'open' );
			} );

			$tableOfContents.on( 'click', 'a', function ( e ) {
				$tableOfContents.removeClass( 'open' );
			} );

			$( document ).on( 'click', '#btn-open-panel', function ( e ) {
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
				},
				{
					code: 'pt',
					name: 'Português',
					flag: 'pt.svg',
					url: 'polkadot-report-q1-2023-pt',
					isActive: 1,
				},
				{
					code: 'vi',
					name: 'Tiếng Việt',
					flag: 'vn.svg',
					url: 'polkadot-report-q1-2023-vi',
					isActive: 1,
				},
				{
					code: 'zh',
					name: '中文',
					flag: 'cn.svg',
					url: 'polkadot-report-q1-2023-zh',
					isActive: 1,
				},
				{
					code: 'id_ID',
					name: 'Bahasa Indonesia',
					flag: 'id.svg',
					url: 'polkadot-report-q1-2023-id',
					isActive: 1,
				},
				{
					code: 'es',
					name: 'Español',
					flag: 'es.svg',
					url: 'polkadot-report-q1-2023-es',
					isActive: 1,
				},
				{
					code: 'kr',
					name: '한국어',
					flag: 'kr.svg',
					url: 'polkadot-report-q1-2023-kr',
					isActive: 1,
				},
				{
					code: 'ja',
					name: '日本語',
					flag: 'jp.svg',
					url: 'polkadot-report-q1-2023-ja',
					isActive: 1,
				},
				{
					code: 'fr',
					name: 'Français',
					flag: 'fr.svg',
					url: 'polkadot-report-q1-2023-fr',
					isActive: 1,
				}
			];

			var currentLang = $( 'html' ).attr( 'lang' );

			var currentLangOutput = '',
				subLangOutput = '';
			for ( var i = 0; i < languages.length; i ++ ) {
				var thisLang = languages[i];

				if ( !thisLang.isActive ) {
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
				output = `
				<div class="current-lang">${currentLangOutput}</div>
				<ul class="language-switcher-list">${subLangOutput}</ul>`;

			$switcher.html( output );

			$switcher.on( 'click', '.current-lang', function ( evt ) {
				evt.preventDefault();

				$switcher.addClass( 'show' );
			} );

			$( document.body ).on( 'click', function ( e ) {
				if ( $( e.target ).closest( $switcher ).length === 0 ) {
					$switcher.removeClass( 'show' );
				}
			} );
		}

		function setItemHighlight( $li ) {
			var $otherLi = $li.siblings( 'li' ),
				pieID = $li.data( 'id' );

			var $chart = $li.closest( 'ul' ).siblings( '.block-chart' );
			var chartInstance = echarts.getInstanceByDom( $chart.get( 0 ) );

			chartInstance.dispatchAction( {
				                              type: 'highlight',
				                              name: pieID
			                              } );

			$otherLi.each( function () {
				var name = $( this ).data( 'id' );

				chartInstance.dispatchAction( {
					                              type: 'downplay',
					                              name: name
				                              } );
			} );
		}

		function initCharts( $chart ) {
			var chartName = $chart.data( 'chart-name' ),
				chartSource = $chart.data( 'chart-source' ),
				chartInstance = echarts.init( $chart.get( 0 ), 'macarons' );

			chartInstance.showLoading( 'default', {
				text: 'loading',
				color: '#004bff',
				textColor: '#004bff', //maskColor: '#151515',
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

			if ( !chartName ) {
				return;
			}

			if ( 'inline' !== chartSource ) {
				var fileName = typeof chartSource !== 'undefined' ? chartSource : chartName;
				var url = sourceBaseUrl + fileName + '.json';

				fetch( url ).then( function ( response ) {
					return response.json();
				} ).then( function ( jsonData ) {
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
						case 'tvl-dot-dex':
							chartOptions = getChartOptionsTvlDotDex( chartName, jsonData );
							break;
						case 'tvl-ksm-dex':
							chartOptions = getChartOptionsTvlKsmDex( chartName, jsonData );
							break;
						case 'tvl-dot-liquid-staking':
							chartOptions = getChartOptionsTvlDotLiquidStaking( chartName, jsonData );
							break;
						case 'tvl-ksm-liquid-staking':
							chartOptions = getChartOptionsTvlKsmLiquidStaking( chartName, jsonData );
							break;
						case 'tvl-dot-lending':
							chartOptions = getChartOptionsTvlDotLending( chartName, jsonData );
							break;
						case 'usdt-on-statemine-ksm':
							chartOptions = getChartOptionsUsdtOnStatemineKsm( chartName, jsonData );
							break;
						case 'usdt-on-statemine-dot':
							chartOptions = getChartOptionsUsdtOnStatemineDot( chartName, jsonData );
							break;
						case 'nft-marketplace':
							chartOptions = getChartOptionsNftMarketplace( chartName, jsonData );
							break;
						case 'ajuna-season-1-stats':
							chartOptions = getChartOptionsAjunaSeason1Stats( chartName, jsonData );
							break;
						case 'total-tnkr-staked-in-tinkernet-ocif':
							chartOptions = getChartOptionsTotalTnkrStakedInTinkernetOcif( chartName, jsonData );
							break;
						case 'daily-new-smart-contracts':
							chartOptions = getChartOptionsDailyNewSmartContracts( chartName, jsonData );
							break;
					}
					chartInstance.hideLoading();
					chartInstance.setOption( chartOptions );
				} );
			} else { // Chart with inline source.
				var chartOptions = {};

				switch ( chartName ) {
					case 'dot-holder-distribution':
						chartOptions = getChartOptionsDotHolderDistribution( chartName );
						break;
					case 'ksm-holder-distribution':
						chartOptions = getChartOptionsKsmHolderDistribution( chartName );
						break;
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
					case 'xcm-activities-on-parachains':
						chartOptions = getChartOptionsXcmActivitiesOnParachains( chartName );
						break;
					case 'top-dot-ksm-chain-fees':
						chartOptions = getChartOptionsTopDotKsmChainFees( chartName );
						break;
					case 'moonfit-new-users':
						chartOptions = getChartOptionsMoonFitNewUsers( chartName );
						break;
				}

				chartInstance.hideLoading();
				chartInstance.setOption( chartOptions );

				var $customLegend = $chart.siblings( '.block-chart-legend' );
				if ( $customLegend.length > 0 ) {
					chartInstance.on( 'mouseover', 'series', function ( params ) {

						var $current = $customLegend.find( 'li[data-id="' + params.name + '"]' );

						setItemHighlight( $current );
					} );

					var $firstActive = $customLegend.children( 'li.active' );

					setItemHighlight( $firstActive );

					$customLegend.on( 'click', 'li', function () {
						var $li = $( this );
						setItemHighlight( $li );
					} );
				}
			}
		}

		function getChartOptionsPriceDevAct( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					kusama: [],
					polkadot: [],
					dev: []
				},
				colors = [
					'#66e1b6',
					'#e6007a',
					'#0091ff'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.kusama.push( [
					                  jsonData[i].date,
					                  jsonData[i].ksm
				                  ] );
				data.polkadot.push( [
					                    jsonData[i].date,
					                    jsonData[i].dot
				                    ] );
				data.dev.push( [
					               jsonData[i].date,
					               jsonData[i].dev
				               ] );
			}

			var baseOptions = {
				color: colors, //dataZoom: defaultDataZoom,
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				}, //				tooltip: defaultTooltipSettings,
				tooltip: $.extend( true, {}, defaultTooltipStyle, {
					trigger: 'axis',
					axisPointer: {
						type: 'line',
						crossStyle: {
							color: 'rgba(255,255,255,0.3)'
						},
						lineStyle: {
							type: [
								4,
								4
							],
							color: 'rgba(255,255,255,0.3)'
						}
					}
				} ),
				legend: defaultLegendSettings,
				grid: {
					left: '3%',
					right: 95,
					top: '3%', //bottom: 100, // DataZoom + Legend.
					containLabel: true
				},
				xAxis: {
					type: 'time',
					boundaryGap: false,
					splitLine: {
						show: false,
						lineStyle: {
							type: [
								4,
								4
							],
							color: ['#262626']
						}
					},
					axisTick: {
						show: false
					},
					axisLine: {
						show: false,
						lineStyle: {
							color: '#262626'
						}
					},
					axisPointer: defaultAxisPointerLabelSettings,
					axisLabel: {
						margin: 12,
						formatter: dateFormatter,
						color: '#cccccc'
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
								color: colors[0]
							}
						},
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#020722',
								backgroundColor: '#66e1b6'
							}
						},
						axisLabel: {
							color: '#cccccc'
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
								color: colors[1]
							}
						},
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisLabel: {
							color: '#cccccc'
						}
					},
					{
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisLine: {
							show: true,
							lineStyle: {
								color: colors[2]
							}
						},
						axisLabel: {
							color: '#cccccc'
						}
					}
				],
				series: [
					{
						name: locate.ksmPrice,
						data: data.kusama,
						itemStyle: {
							color: colors[0]
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
							color: colors[1]
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
							color: colors[2]
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
				data = {
					active_devs: [],
					code_commits: [],
				},
				colors = [
					'#66e1b6',
					'#004bff'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.active_devs.push( [
					                       jsonData[i].date,
					                       jsonData[i].active_devs
				                       ] );
				data.code_commits.push( [
					                        jsonData[i].date,
					                        jsonData[i].code_commits
				                        ] );
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
							type: [
								4,
								4
							],
							color: ['#262626']
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
						color: '#cccccc'
					}
				},
				yAxis: [
					{
						type: 'value',
						name: locate.activeDevelopers,
						nameGap: 35,
						nameTextStyle: {
							color: '#ffffff',
						},
						alignTicks: true,
						axisLine: {
							show: false,
						},
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#020722',
								backgroundColor: colors[0]
							}
						},
						axisLabel: {
							color: '#cccccc'
						}
					},
					{
						type: 'value',
						name: locate.codeCommits,
						nameGap: 35,
						nameTextStyle: {
							color: '#ffffff',
						},
						position: 'right',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#ffffff',
								backgroundColor: colors[1]
							}
						},
						axisLabel: {
							color: '#cccccc'
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
				data = [],
				cats = [],
				colors = [
					'#004bff'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				cats.push( jsonData[i].quarter );
				data.push( NumberUtil.validate( jsonData[i].new_repos ) );
			}

			var baseOptions = {
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
								type: [
									4,
									4
								],
								color: '#262626'
							}
						},
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							color: '#cccccc'
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						splitNumber: 3,
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							fontFamily: fontFamily,
							fontSize: 12,
							fontWeight: 500,
							color: '#cccccc'
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
								borderRadius: [
									2,
									2,
									0,
									0
								]
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
				newOptions['yAxis'] = {
					axisLabel: {
						formatter: "{value}"
					}
				};
			} else {
				newOptions['yAxis'] = {
					axisLabel: {
						formatter: function ( value ) {
							return NumberUtil.formatMoney( value );
						}
					}
				};
			}

			return newOptions;
		}

		function getChartOptionsDotHolderDistribution( chartName ) {
			var colors = [
					'#e10266',
					'#18234e',
					'#d0739d',
					'#de498c'
				],
				datasets = [
					{
						value: 871873088.53,
						name: 'Whale Account'
					},
					{
						value: 235373963.05,
						name: 'Dolphin Account'
					},
					{
						value: 190364757.93,
						name: 'Fish Account'
					},
					{
						value: 2041661.58,
						name: 'Shrimp Account'
					}
				],
				baseOptions = {
					color: colors,
					tooltip: false,
					legend: false,
					grid: {
						left: '0',
						right: '0',
						top: '0',
						containLabel: true
					},
					series: [
						{
							name: 'Polkadot Holder Distribution',
							type: 'pie',
							center: [
								'45%',
								'45%'
							],
							radius: [
								'68%',
								'85%'
							],
							avoidLabelOverlap: false,
							label: {
								show: false,
								position: 'center'
							},
							emphasis: {
								label: {
									show: true,
									fontFamily: fontFamily,
									color: '#ffffff',
									fontSize: 17,
									fontWeight: '500',
									formatter: function ( param ) {
										var value = NumberUtil.formatWithCommas( param.value );

										return '{per|' + param.percent + '%}\n{b|' + param.name + '}\n{c|' + value + '}';
									},
									rich: {
										per: {
											fontFamily: fontFamily,
											fontWeight: 700,
											color: '#e10266',
											fontSize: 32,
											align: 'center'
										},
										b: {
											fontFamily: fontFamily,
											fontWeight: 500,
											color: '#cccccc',
											fontSize: 17,
											align: 'center',
											padding: [
												10,
												0,
												10,
												0
											]
										},
										c: {
											fontFamily: fontFamily,
											fontWeight: 700,
											color: '#ffffff',
											fontSize: 17,
											formatter: function ( name ) {
												return '$ ' + name;
											},
											align: 'center'
										}
									}
								}
							},
							labelLine: {
								show: false
							},
							data: datasets
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsHolderDistribution();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsKsmHolderDistribution( chartName ) {
			var colors = [
					'#a1a1a1',
					'#18234e',
					'#777777',
					'#414141'
				],
				datasets = [
					{
						value: 9643808.85,
						name: 'Whale Account'
					},
					{
						value: 2125272.54,
						name: 'Dolphin Account'
					},
					{
						value: 1642203.46,
						name: 'Fish Account'
					},
					{
						value: 4112.33,
						name: 'Shrimp Account'
					}
				],
				baseOptions = {
					color: colors,
					tooltip: false,
					legend: false,
					grid: {
						left: '3%',
						right: '3%',
						top: '0',
						containLabel: true
					},
					series: [
						{
							name: 'Polkadot And Kusama Holder Distribution',
							type: 'pie',
							center: [
								'45%',
								'45%'
							],
							radius: [
								'68%',
								'85%'
							],
							avoidLabelOverlap: false,
							label: {
								show: false,
								position: 'center'
							},
							emphasis: {
								label: {
									show: true,
									fontFamily: fontFamily,
									color: '#ffffff',
									fontSize: 15,
									fontWeight: '500',
									formatter: function ( param ) {
										var value = NumberUtil.formatWithCommas( param.value );

										return '{per|' + param.percent + '%}\n{b|' + param.name + '}\n{c|' + value + '}';
									},
									rich: {
										per: {
											fontFamily: fontFamily,
											fontWeight: 700,
											color: '#ffffff',
											fontSize: 32,
											align: 'center'
										},
										b: {
											fontFamily: fontFamily,
											fontWeight: 500,
											color: '#cccccc',
											fontSize: 17,
											align: 'center',
											padding: [
												10,
												0,
												10,
												0
											]
										},
										c: {
											fontFamily: fontFamily,
											fontWeight: 700,
											color: '#ffffff',
											fontSize: 17,
											formatter: function ( name ) {
												return '$ ' + name;
											},
											align: 'center'
										}
									}
								}
							},
							labelLine: {
								show: false
							},
							data: datasets
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsHolderDistribution();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsHolderDistribution() {
			var newOptions = {
				series: [
					{},
					{}
				]
			};

			if ( window.innerWidth < 768 ) {
				newOptions['series'][0] = {
					center: [
						'50%',
						'50%'
					],
					radius: [
						'70%',
						'90%'
					],
					emphasis: {
						label: {
							rich: {
								per: {
									fontSize: 28
								},
								b: {
									fontSize: 17,
								},
								c: {
									fontSize: 17,
								}
							}
						}
					},
				}
			}

			return newOptions;
		}

		function getChartOptionsKuNetAlloca( chartName ) {
			var colors = [
					'#346df1',
					'#dc0067',
					'#d0c6e3',
					'#ca93af',
					'#3bb1ba',
					'#5100c7',
					'#f42f44',
					'#ea645f',
					'#fac83f'
				],
				datasets = [
					{
						value: 31.0,
						name: 'Infrastructure deployment and continued operation',
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'

									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: 12.2,
						name: 'Software development (wallets and wallet integration, clients and client upgrades)',
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'

									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: 8.5,
						name: 'Community events and outreach (meetups, hackerspaces)'
					},
					{
						value: 8.5,
						name: 'Marketing activities (advertising, paid features, collaborations)'
					},
					{
						value: 9.4,
						name: 'Bounties',
					},
					{
						value: 13.0,
						name: 'Others'
					},
					{
						value: 13.5,
						name: 'Liquidity provision '
					},
					{
						value: 2.1,
						name: 'Network security operations (monitoring services, anti-scam activities, continuous auditing)'
					},
					{
						value: 1.8,
						name: 'Ecosystem provisions (collaborations with friendly chains)',
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'

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
				baseOptions = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function ( value ) {
							return NumberUtil.formatWithCommas( value ) + '%';
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
							center: [
								'50%',
								'45%'
							],
							radius: [
								'45%',
								'65%'
							],
							label: {
								alignTo: 'edge',
								minMargin: 5,
								edgeDistance: 10,
								color: '#ffffff',
								fontFamily: fontFamily,
								fontWeight: 500,
								fontSize: 13,
								lineHeight: 28,
								formatter: function ( params ) {
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
											color: '#ffffff'
										}
									] )
								},
								maxSurfaceAngle: 80
							}, /*labelLayout: function( params ) {
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
				series: [
					{},
					{}
				]
			};

			if ( window.innerWidth < 768 ) {
				newOptions['legend'] = defaultLegendSettings;
				newOptions['series'][0] = {
					label: {
						fontSize: 11,
						lineHeight: 24,
						formatter: function ( params ) {
							return `${params.percent}%`;
						}
					},
					labelLine: {
						length: 5,
					}
				}
			} else {
				newOptions['legend'] = {
					show: false
				};
				newOptions['series'][0] = {
					label: {
						fontSize: 13,
						lineHeight: 30,
						formatter: function ( params ) {
							return `${params.name} ${params.percent}%`;
						}
					}
				}
			}

			return newOptions;
		}

		function getChartOptionsPolNetAlloca( chartName ) {
			var colors = [
					'#346df1',
					'#dc0067',
					'#d0c6e3',
					'#ca93af',
					'#3bb1ba',
					'#5100c7',
					'#f42f44',
					'#ea645f',
					'#fac83f'
				],
				datasets = [
					{
						value: 10.8,
						name: 'Public infrastructure deployment and continued operation',
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'

									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: 0.5,
						name: 'Software development (wallets and wallet integration, clients and client upgrades)',
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'

									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: 4.0,
						name: 'Community events and outreach (meetups, hackerspaces)'
					},
					{
						value: 2.0,
						name: 'Marketing activities (advertising, paid features, collaborations)'
					},
					{
						value: 73.2,
						name: 'Bounties'
					},
					{
						value: 0.9,
						name: 'Others'
					},
					{
						value: 0.0,
						name: 'Liquidity provision'
					},
					{
						value: 7.3,
						name: 'Network security operations (monitoring services, anti-scam activities, continuous auditing)'
					},
					{
						value: 1.4,
						name: 'Ecosystem provisions (collaborations with friendly chains)',
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'

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
				baseOptions = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function ( value ) {
							return NumberUtil.formatWithCommas( value ) + '%';
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
							center: [
								'50%',
								'45%'
							],
							radius: [
								'45%',
								'65%'
							],
							label: {
								alignTo: 'edge',
								minMargin: 5,
								edgeDistance: 10,
								color: '#ffffff',
								fontFamily: fontFamily,
								fontWeight: 500,
								fontSize: 13,
								lineHeight: 30,
								formatter: function ( params ) {
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
											color: '#ffffff'
										}
									] )
								},
								maxSurfaceAngle: 80
							}, /*labelLayout: function( params ) {
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
				series: [
					{},
					{}
				]
			};

			if ( window.innerWidth < 768 ) {
				newOptions['legend'] = defaultLegendSettings;
				newOptions['series'][0] = {
					label: {
						fontSize: 11,
						lineHeight: 24,
						formatter: function ( params ) {
							return `${params.percent}%`;
						}
					},
					labelLine: {
						length: 5,
					}
				}
			} else {
				newOptions['legend'] = {
					show: false
				};
				newOptions['series'][0] = {
					label: {
						fontSize: 13,
						lineHeight: 28,
						formatter: function ( params ) {
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
					},
					{
						name: 'rewards_ratio',
						label: 'Rewards Ratio'
					},
					{
						name: 'staking_ratio',
						label: 'Staking Ratio'
					},
				],
				colors = [
					'#004bff',
					'#e12c29',
					'#f8b00c'
				],
				chartExtraOptions = {
					legend: defaultLegendSettings,
					grid: {
						top: '5%',
						left: '3%',
						right: '3%',
						containLabel: true,
						height: '82%'
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						}
					},
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'axis',
						axisPointer: {
							type: 'line',
							crossStyle: {
								color: 'rgba(255,255,255,0.3)'
							},
							lineStyle: {
								type: [
									4,
									4
								],
								color: 'rgba(255,255,255,0.3)'
							}
						},
						valueFormatter: function ( value ) {
							return value + '%';
						}
					} )
				};

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsNominationPoolStaking( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					total_members: [],
					total_stake: [],
				},
				colors = [
					'#004bff',
					'#e6007a'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.total_members.push( [
					                         jsonData[i].date,
					                         jsonData[i].total_members
				                         ] );
				data.total_stake.push( [
					                       jsonData[i].date,
					                       jsonData[i].total_stake
				                       ] );
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
						color: '#cccccc'
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
						interval: 500000,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#ffffff',
								backgroundColor: colors[1]
							}
						},
						axisLabel: {
							color: '#cccccc'
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#ffffff',
								backgroundColor: colors[0]
							}
						},
						axisLabel: {
							color: '#cccccc'
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
						},
						{
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
								formatter: function ( value ) {
									return NumberUtil.formatMoney( value );
								}
							}
						},
						{
							offset: 5,
							axisLabel: {
								formatter: function ( value ) {
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
				'#004bff',
				'#e12c29',
				'#f8b00c'
			];
			var series = [
				{
					name: locate.Approved,
					data: [
						1,
						0,
						2,
						2,
						5,
						6,
						4,
						3,
						7,
						8,
						19,
						14,
						22
					]
				},
				{
					name: locate.notApproved,
					data: [
						0,
						2,
						0,
						1,
						0,
						0,
						4,
						4,
						3,
						2,
						7,
						11,
						6
					]
				},
				{
					name: locate.pending,
					data: [
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						2,
						0,
						0,
						1,
						4,
						4
					]
				}
			];

			function genFormatter( series ) {
				return ( param ) => {
					let sum = 0;
					series.forEach( item => {
						sum += item.data[param.dataIndex];
					} );
					return sum
				}
			}

			function isLastSeries( index ) {
				return index === series.length - 1
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
						top: '5%',
						left: '3%',
						right: '3%',
						containLabel: true
					},
					xAxis: {
						type: 'category',
						data: [
							'Lease Admin',
							'General Admin',
							'Staking Admin',
							'Big Tipper',
							'Auction Admin',
							'Referendum Canceller',
							'Root',
							'Small Spender',
							'Small Tipper',
							'Treasurer',
							'Whitelisted Caller',
							'Big Spender',
							'Medium Spender'
						],
						splitLine: {
							show: false,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							color: '#cccccc'
						}
					},
					yAxis: {
						type: 'value',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						interval: 10,
						splitNumber: 4,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#cccccc'
						}
					},
					series: series.map( ( item, index ) => Object.assign( item, {
						type: 'bar',
						stack: true,
						label: {
							show: isLastSeries( index ) ? true : false,
							formatter: genFormatter( series ),
							fontSize: 16,
							color: '#ffffff',
							position: 'top'
						},
						barMaxWidth: 40
					} ) )
				},
				responsiveOptions = getChartResponsiveOptionsSpendingDominatedKusama();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsSpendingDominatedKusama() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions['series'] = [
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
				newOptions['series'] = [
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
					'#fb560a'
				],
				data = [
					[
						'Lease Admin',
						'General Admin',
						'Staking Admin',
						'Big Tipper',
						'Auction Admin',
						'Referendum Canceller',
						'Root',
						'Small Spender',
						'Small Tipper',
						'Treasurer',
						'Whitelisted Caller',
						'Big Spender',
						'Medium Spender'
					],
					[
						0.16,
						1.26,
						0.17,
						0.06,
						0.78,
						0.33,
						0.18,
						0.75,
						0.30,
						0.08,
						0.33,
						0.19,
						0.18
					]
				],
				baseOptions = {
					color: colors,
					textStyle: {
						fontFamily: fontFamily,
						fontWeight: 500
					},
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function ( value ) {
							return value + '%';
						}
					} ),
					legend: {
						show: false
					},
					grid: {
						top: '5%',
						left: '3%',
						right: '3%',
						bottom: '3%',
						containLabel: true
					},
					xAxis: {
						type: 'category',
						data: data[0],
						splitLine: {
							show: false,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							color: '#cccccc'
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#cccccc'
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
								color: '#fb560a',
								formatter: '{c}%'
							},
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [
									5,
									5,
									0,
									0
								]
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
				newOptions['series'] = [
					{
						label: {
							fontSize: 10,
							rotate: 90,
							position: "outside",
							offset: [
								15,
								5
							]
						},
					}
				]
			} else {
				newOptions['series'] = [
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
			var colors = [
					'#004bff',
					'#e12c29'
				],
				data = [
					[
						'1',
						'2',
						'3',
						'4',
						'5',
						'6',
						'7',
						'8',
						'9',
						'10',
						'11',
						'12',
						'14',
						'14',
						'15',
						'16',
						'17'
					],
					[
						'10',
						'12',
						'14',
						'26',
						'37',
						'33',
						'31',
						'43',
						'48',
						'29',
						'26',
						'21',
						'32',
						'36',
						'39',
						'39',
						'46'
					],
					[
						'10',
						'22',
						'36',
						'62',
						'99',
						'132',
						'163',
						'206',
						'254',
						'283',
						'309',
						'330',
						'362',
						'398',
						'437',
						'476',
						'522'
					]
				],
				baseOptions = {
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
						data: data[0],
						splitLine: {
							show: false,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							color: '#cccccc'
						}
					},
					yAxis: [
						{
							type: 'value',
							name: '',
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							position: 'right',
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 120,
							splitLine: {
								lineStyle: {
									type: [
										4,
										4
									],
									color: ['#262626']
								}
							},
							axisPointer: {
								label: {
									color: '#ffffff',
									backgroundColor: colors[1]
								}
							},
							axisLabel: {
								color: '#cccccc'
							}
						},
						{
							type: 'value',
							name: '',
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
									type: [
										4,
										4
									],
									color: ['#262626']
								}
							},
							axisPointer: {
								label: {
									color: '#ffffff',
									backgroundColor: colors[0]
								}
							},
							axisLabel: {
								color: '#cccccc'
							}
						}

					],
					series: [
						{
							name: locate.grantsEachWave,
							data: data[1],
							type: 'bar',
							yAxisIndex: 1,
							label: {
								show: false,
							},
							barMaxWidth: 102,
							itemStyle: {
								borderRadius: [
									5,
									5,
									0,
									0
								]
							}
						},
						{
							name: locate.grantsCumulative,
							data: data[2],
							type: 'line',
							label: {
								show: true,
								fontFamily: fontFamily,
								fontWeight: 700,
								fontSize: 16,
								position: 'top',
								color: '#ffffff',
							},
							smooth: true,
							showSymbol: true,
							symbolSize: 16, //symbol: 'path://M11 8C11 9.65685 9.65685 11 8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8 M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z',
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
				newOptions['grid'] = {
					top: '5%',
					left: '10%',
					right: '10%',
					containLabel: true
				};
				newOptions['series'] = [
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
				newOptions['grid'] = {
					top: '5%',
					left: '3%',
					right: '3%',
					containLabel: true
				};
				newOptions['series'] = [
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

		function getChartOptionsChainWithMoreTokenHolders( chartName ) {
			var colors = [
					'#e6007a',
					'#736161'
				],
				data = [
					[
						'Moonbeam',
						'Polkadot',
						'Nodle',
						'Shiden',
						'Astar',
						'Kusama',
						'Moonriver',
						'Acala',
						'Bifrost Kusama',
						'Karura',
						'Quartz',
						'Statemine',
						'Parallel',
						'Centrifuge',
						'Calamari',
						'Altair',
						'Pioneer',
						'Parallel Heiko',
						'Unique',
						'Hydradx',
						'Khala'
					],
					[
						'1091399',
						'1083071',
						'741542',
						'0',
						'499310',
						'0',
						'0',
						'157403',
						'0',
						'0',
						'0',
						'0',
						'46926',
						'45041',
						'0',
						'0',
						'0',
						'0',
						'24007',
						'23112',
						'0'
					],
					[
						'0',
						'0',
						'0',
						'633785',
						'0',
						'287580',
						'247236',
						'0',
						'84579',
						'83918',
						'80111',
						'49325',
						'0',
						'0',
						'36565',
						'29563',
						'24839',
						'24060',
						'0',
						'0',
						'21391'
					]
				],
				baseOptions = {
					color: colors,
					textStyle: {
						fontFamily: fontFamily,
						fontWeight: 500
					},
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item'
					} ),
					legend: defaultLegendSettings,
					grid: {
						top: '5%',
						left: '3%',
						right: '3%',
						containLabel: true
					},
					xAxis: {
						type: 'category',
						data: data[0],
						splitLine: {
							show: false,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							color: '#cccccc'
						}
					},
					yAxis: {
						type: 'value',
						alignTicks: true,
						axisLine: {
							show: false,
						},
						interval: 300000,
						splitNumber: 4,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#cccccc'
						}
					},
					series: [
						{
							name: locate.polkadotChain,
							data: data[1],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [
									4,
									4,
									0,
									0
								]
							}
						},
						{
							name: locate.kusamaChain,
							data: data[2],
							type: 'bar',
							stack: 'Total',
							barMaxWidth: 40,
							itemStyle: {
								borderRadius: [
									4,
									4,
									0,
									0
								]
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
				newOptions['yAxis'] = {
					axisPointer: {
						label: {
							formatter: "{value}"
						}
					},
					axisLabel: {
						formatter: function ( value ) {
							return value ? NumberUtil.formatMoney( value ) : '-';
						}
					}
				};
				newOptions['series'] = [
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
				newOptions['yAxis'] = {
					axisPointer: {
						label: {
							formatter: "{value}"
						}
					},
					axisLabel: {
						formatter: "{value}"
					}
				};
				newOptions['series'] = [
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
			var colors = [
					'#03ffff',
					'#1b6ae0',
					'#fe0096',
					'#f42f44',
					'#22bffe',
					'#f93f42',
					'#b1b1b1',
					'#40baf8',
					'#53cbc9',
					'#f2b705'
				],
				dataName = [
					'Khala',
					'Astar',
					'Bit.Country Pioneer',
					'Acala',
					'Parallel',
					'Karura',
					'Heiko',
					'Unique',
					'Moonbeam',
					'Moonriver'
				],
				dataFee = [
					'7669.36',
					'3780.87',
					'3134.86',
					'1431.81',
					'507.61',
					'231.68',
					'216.15',
					'143.68',
					'134.58',
					'99.04'
				],
				datasets = [
					{
						value: dataFee[0],
						name: dataName[0],
						label: {
							color: colors[0],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: dataFee[1],
						name: dataName[1],
						label: {
							color: colors[1],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
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
					},
					{
						value: dataFee[2],
						name: dataName[2],
						label: {
							color: colors[2],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
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
					},
					{
						value: dataFee[3],
						name: dataName[3],
						label: {
							color: colors[3],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
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
					},
					{
						value: dataFee[4],
						name: dataName[4],
						label: {
							color: colors[4],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
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
					},
					{
						value: dataFee[5],
						name: dataName[5],
						label: {
							color: colors[5],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
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
					},
					{
						value: dataFee[6],
						name: dataName[6],
						label: {
							color: colors[6],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
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
					},
					{
						value: dataFee[7],
						name: dataName[7],
						label: {
							color: colors[7],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: dataFee[8],
						name: dataName[8],
						label: {
							color: colors[8],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'
									},
									{
										offset: 1,
										color: 'rgba(255,255,255,0)'
									}
								] )
							}
						}
					},
					{
						value: dataFee[9],
						name: dataName[9],
						label: {
							color: colors[9],
							formatter: function ( params ) {
								return params.name + ' $' + NumberUtil.formatWithCommas( params.value );
							}
						},
						labelLine: {
							lineStyle: {
								color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
									{
										offset: 0,
										color: '#ffffff'
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
				baseOptions = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item',
						valueFormatter: function ( value ) {
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
							center: [
								'50%',
								'50%'
							],
							radius: [
								'55%',
								'70%'
							],
							label: {
								alignTo: 'edge',
								minMargin: 5,
								edgeDistance: 10,
								color: '#ffffff',
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
											color: '#ffffff'
										}
									] )
								},
								maxSurfaceAngle: 80
							}, /*labelLayout: function( params ) {
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
				series: [
					{},
					{}
				]
			};

			if ( window.innerWidth < 768 ) {
				newOptions['legend'] = defaultLegendSettings;
				newOptions['series'][0] = {
					label: {
						fontSize: 11,
						lineHeight: 24,
						formatter: function ( params ) {
							return `${params.percent}%`;
						}
					},
					labelLine: {
						length: 5,
					}
				}
			} else {
				newOptions['legend'] = {
					show: false
				};
				newOptions['series'][0] = {
					label: {
						fontSize: 17,
						lineHeight: 30,
						formatter: function ( params ) {
							return `${params.name} ${params.percent}%`;
						}
					}
				}
			}

			return newOptions;
		}

		function getChartOptionsDefiParachain( chartName, jsonData ) {
			var datasets = [
					{
						name: 'acala',
						label: 'Acala'
					},
					{
						name: 'parallel',
						label: 'Parallel'
					},
					{
						name: 'moonbeam',
						label: 'Moonbeam'
					},
					{
						name: 'astar',
						label: 'Astar'
					},
					{
						name: 'moonriver',
						label: 'Moonriver'
					},
					{
						name: 'karura',
						label: 'Karura'
					},
					{
						name: 'others',
						label: locate.others
					}
				],
				colors = [
					'#d81356',
					'#22bffe',
					'#4ccbc9',
					'#1b6ae0',
					'#ffa800',
					'#da4520',
					'#d251fd',
				],
				chartExtraOptions = {
					yAxis: {
						interval: 25000000,
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
					},
					{
						name: 'curve_moonbeam',
						label: 'Curve on Moonbeam'
					},
					{
						name: 'stellaswap',
						label: 'StellaSwap'
					},
					{
						name: 'zenlink_astar',
						label: 'Zenlink on Astar'
					},
					{
						name: 'zenlink_moonbeam',
						label: 'Zenlink Moonbeam'
					},
					{
						name: 'avault',
						label: 'Avault'
					},
					{
						name: 'beamswap',
						label: 'Beamswap'
					},
					{
						name: 'beefy_moonbeam',
						label: 'Beefy on Moonbeam'
					},
					{
						name: 'solarflare',
						label: 'Solarflare'
					},
					{
						name: 'parallel',
						label: 'Parallel'
					}
				],
				colors = [
					'#66e1b6',
					'#c30d00',
					'#774eed',
					'#e4560a',
					'#89c900',
					'#d251fd',
					'#22bffe',
					'#ffb800',
					'#ff806c',
					'#2a42f1'
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
					},
					{
						name: 'karura',
						label: 'Karura'
					},
					{
						name: 'zenlink_moonriver',
						label: 'Zenlink on Moonriver'
					},
					{
						name: 'beefy_moonriver',
						label: 'Beefy on Moonriver'
					},
					{
						name: 'polkaswap',
						label: 'Polkaswap'
					},
					{
						name: 'heiko',
						label: 'Heiko'
					},
					{
						name: 'bifrost',
						label: 'Bifrost Kusama'
					},
				],
				colors = [
					'#ff806c',
					'#c30d00',
					'#e4a30d',
					'#66e1b6',
					'#22bffe',
					'#b1b1b1',
					'#0049f1'
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
					},
					{
						name: 'acala',
						label: 'Acala'
					},
					{
						name: 'bifrost_dot',
						label: 'Bifrost Polkadot'
					},
					{
						name: 'parallel',
						label: 'Parallel'
					},
					{
						name: 'tapio',
						label: 'Tapio'
					}
				],
				colors = [
					'#118af5',
					'#d81356',
					'#ffb800',
					'#2a42f1',
					'#25df96'
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
					},
					{
						name: 'karura',
						label: 'Karura'
					},
					{
						name: 'bifrost_ksm',
						label: 'Bifrost Kusama'
					},
					{
						name: 'heiko',
						label: 'Heiko'
					},
					{
						name: 'taiga',
						label: 'Taiga'
					}
				],
				colors = [
					'#118af5',
					'#c30d00',
					'#ffb800',
					'#ea5474',
					'#960db9'
				];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTvlDotLending( chartName, jsonData ) {
			var datasets = [
					{
						name: 'acala',
						label: 'Acala (aUSD)'
					},
					{
						name: 'moonwell_apollo',
						label: 'Moonwell Apollo'
					},
					{
						name: 'astriddao',
						label: 'AstridDAO (BAI)'
					},
					{
						name: 'moonwell_artemis',
						label: 'Moonwell Artemis'
					},
					{
						name: 'parallel',
						label: 'Parallel'
					},
					{
						name: 'starlay_finance',
						label: 'Starlay'
					},
					{
						name: 'karura',
						label: 'Karura (aUSD)'
					}
				],
				colors = [
					'#d81356',
					'#5c42fb',
					'#66e1b6',
					'#b8e94a',
					'#2a42f1',
					'#ed148b',
					'#c30d00'
				];

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsUsdtOnStatemineKsm( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					transferCount: [],
					amount: [],
					holderCount: []
				},
				colors = [
					'#004bff',
					'#e12c29',
					'#ffb800'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.transferCount.push( [
					                         jsonData[i].date,
					                         jsonData[i].transfer_count
				                         ] );
				data.amount.push( [
					                  jsonData[i].date,
					                  jsonData[i].amount
				                  ] );
				data.holderCount.push( [
					                       jsonData[i].date,
					                       jsonData[i].holder_count
				                       ] );
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
					top: '3%', //bottom: 100, // DataZoom + Legend.
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
							type: [
								4,
								4
							],
							color: ['#262626']
						}
					},
					axisPointer: defaultAxisPointerLabelSettings,
					axisLabel: {
						hideOverlap: false,
						showMaxLabel: true,
						overflow: 'breakAll', //						rotate: 45,
						align: 'center',
						fontFamily: fontFamily,
						fontSize: 10,
						fontWeight: 500,
						formatter: dateFormatter,
						color: '#cccccc',
					}
				},
				yAxis: [
					{
						type: 'value',
						name: locate.transferAmount,
						position: 'left',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 500000,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#000000',
								backgroundColor: '#cccccc',
								formatter: "${value}"
							}
						},
						axisLabel: {
							formatter: "${value}",
							color: '#cccccc'
						}
					},
					{
						type: 'value',
						name: locate.count,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 125,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#cccccc'
						}
					}
				],
				series: [
					{
						name: locate.transferCount,
						data: data.transferCount,
						itemStyle: {
							color: colors[0]
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
						name: locate.transferAmount,
						data: data.amount,
						itemStyle: {
							color: colors[1]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.holderCount,
						data: data.holderCount,
						itemStyle: {
							color: colors[2]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						yAxisIndex: 1,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsUsdtOnStatemine();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartOptionsUsdtOnStatemineDot( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					transferCount: [],
					amount: [],
					holderCount: []
				},
				colors = [
					'#004bff',
					'#e12c29',
					'#ffb800'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.transferCount.push( [
					                         jsonData[i].date,
					                         jsonData[i].transfer_count
				                         ] );
				data.amount.push( [
					                  jsonData[i].date,
					                  jsonData[i].amount
				                  ] );
				data.holderCount.push( [
					                       jsonData[i].date,
					                       jsonData[i].holder_count
				                       ] );
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
					top: '3%', //bottom: 100, // DataZoom + Legend.
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
							type: [
								4,
								4
							],
							color: ['#262626']
						}
					},
					axisPointer: defaultAxisPointerLabelSettings,
					axisLabel: {
						hideOverlap: false,
						showMaxLabel: true,
						overflow: 'breakAll', //						rotate: 45,
						align: 'center',
						fontFamily: fontFamily,
						fontSize: 10,
						fontWeight: 500,
						formatter: dateFormatter,
						color: '#cccccc',
					}
				},
				yAxis: [
					{
						type: 'value',
						name: locate.transferAmount,
						position: 'left',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 250000,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: {
							label: {
								color: '#000000',
								backgroundColor: '#cccccc',
								formatter: "${value}"
							}
						},
						axisLabel: {
							formatter: "${value}",
							color: '#cccccc'
						}
					},
					{
						type: 'value',
						name: locate.count,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 100,
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#cccccc'
						}
					}
				],
				series: [
					{
						name: locate.transferCount,
						data: data.transferCount,
						itemStyle: {
							color: colors[0]
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
						name: locate.transferAmount,
						data: data.amount,
						itemStyle: {
							color: colors[1]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					},
					{
						name: locate.holderCount,
						data: data.holderCount,
						itemStyle: {
							color: colors[2]
						},
						type: 'line',
						smooth: true,
						showSymbol: false,
						yAxisIndex: 1,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsUsdtOnStatemine();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsUsdtOnStatemine() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 3
					}
				};
			} else {
				newOptions = {
					tooltip: {
						trigger: 'axis'
					},
					xAxis: {
						splitNumber: 2
					}
				};

				if ( window.innerWidth < 460 ) {
					$.extend( newOptions, {
						xAxis: {
							splitNumber: 2
						},
						yAxis: [
							{
								axisPointer: {
									label: {
										formatter: "${value}"
									}
								},
								axisLabel: {
									formatter: function ( value ) {
										return value ? '$' + NumberUtil.formatMoney( value ) : '-';
									}
								}
							},
							{
								axisPointer: {
									label: {
										formatter: "{value}"
									}
								},
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '-';
									}
								}
							}
						]
					} )
				}
			}

			return newOptions;
		}

		function getChartOptionsNftMarketplace( chartName, jsonData ) {
			var datasets = [
					{
						name: 'singular_ksm',
						label: 'Singular KSM'
					},
					{
						name: 'nft_trade_glmr',
						label: 'NFTrade GLMR'
					},
					{
						name: 'moonbeans_movr',
						label: 'Moonbeans MOVR'
					},
					{
						name: 'moonbeans_glmr',
						label: 'MoonBeans GLMR'
					},
					{
						name: 'tofu_sdn',
						label: 'tofu SDN'
					},
					{
						name: 'tofu_astr',
						label: 'tofu ASTR'
					},
					{
						name: 'tofu_movr',
						label: 'tofu MOVR'
					},
					{
						name: 'tofu_glmr',
						label: 'tofu GLMR'
					}
				],
				colors = [
					'#e6007a',
					'#429df4',
					'#9ee542',
					'#4ccbc9',
					'#f0a08c',
					'#ff6b00',
					'#004bff',
					'#ffb800'
				],
				totalItems = jsonData.length,
				data = [],
				chartSeries = [];

			datasets.forEach( function ( dataset ) {
				data[dataset.name] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function ( dataset ) {
					var value = jsonData[i][dataset.name] ? NumberUtil.validate( jsonData[i][dataset.name] ) : '';
					data[dataset.name].push( [
						                         jsonData[i].date,
						                         value
					                         ] );
				} );
			}

			datasets.forEach( function ( dataset, index ) {
				var dataSetOptions = {
					name: dataset.label,
					data: data[dataset.name],
					itemStyle: {
						color: colors[index]
					},
					type: 'bar',
					stack: 'total',
					emphasis: {
						focus: 'series'
					}
				};

				if ( dataset.hasOwnProperty( 'options' ) ) {
					$.extend( true, dataSetOptions, dataset.options );
				}

				chartSeries.push( dataSetOptions );
			} );

			var baseOptions = {
					color: colors,
					textStyle: {
						fontFamily: fontFamily,
						fontWeight: 500
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							type: 'line',
							crossStyle: {
								color: 'rgba(255,255,255,0.3)'
							},
							lineStyle: {
								type: [
									4,
									4
								],
								color: 'rgba(255,255,255,0.3)'
							}
						},
						valueFormatter: function ( value ) {
							return '$' + value;
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
							color: '#cccccc',
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							color: '#cccccc'
						}
					},
					series: chartSeries
				},
				responsiveOptions = getChartResponsiveOptionsNftMarketplace( chartName );

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsNftMarketplace() {
			var newOptions = {};

			if ( window.innerWidth < 767 ) {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: function ( value ) {
								return '$' + NumberUtil.formatMoney( value );
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
			} else {
				newOptions = {
					yAxis: {
						axisLabel: {
							formatter: function ( value ) {
								return '$' + NumberUtil.formatWithCommas( value );
							}
						}
					},
					xAxis: {
						splitNumber: 5,
						axisLabel: {
							formatter: dateFormatter
						}
					}
				};
			}

			return newOptions;
		}

		function getChartOptionsAjunaSeason1Stats( chartName, jsonData ) {
			var datasets = [
					{
						name: 'forged',
						label: 'Forged'
					},
					{
						name: 'minted',
						label: 'Minted'
					},
					{
						name: 'players',
						label: 'Players'
					},
					{
						name: 'trades',
						label: 'Trades'
					},
					{
						name: 'avatars',
						label: 'Avatars'
					}
				],
				colors = [
					'#004bff',
					'#e12c29',
					'#f8b00c',
					'#6ce542',
					'#ff6b00'
				],
				chartExtraOptions = {
					legend: {
						show: true,
					},
					grid: {
						bottom: '13%'
					},
					yAxis: {
						type: 'log'
					},
					xAxis: {
						axisLine: {
							show: false,
						},
						splitLine: {
							show: true,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						}
					},
					tooltip: {
						valueFormatter: function ( value ) {
							return value + '%';
						}
					}
				};

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsTotalTnkrStakedInTinkernetOcif( chartName, jsonData ) {
			var datasets = [
					{
						name: 'youdle_dao',
						label: 'YoudleDAO',
						options: {
							areaStyle: {
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(0,75,255,0.6)'
									},
									{
										offset: 1,
										color: 'rgba(0,75,255,0)'
									}
								] )
							}
						}
					},
					{
						name: 'wag_media',
						label: 'WAGmedia',
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
					},
					{
						name: 'chaos_dao',
						label: 'ChaosDAO',
						options: {
							areaStyle: {
								opacity: 1,
								color: new echarts.graphic.LinearGradient( 0.5, 0, 0.5, 1, [
									{
										offset: 0,
										color: 'rgba(255,184,0,0.8)'
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
				colors = [
					'#004bff',
					'#e12c29',
					'#f8b00c'
				],
				chartExtraOptions = {
					legend: {
						show: true,
					},
					grid: {
						bottom: '13%'
					},
					yAxis: {
						interval: 200000,
						splitNumber: 4
					},
					xAxis: {
						axisLine: {
							show: false,
						},
						splitLine: {
							show: true,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						}
					}
				};

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartLinesBaseResponsiveOptions( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartOptionsDailyNewSmartContracts( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = [],
				cats = [],
				colors = [
					'#004bff'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				cats.push( jsonData[i].date );
				data.push( NumberUtil.validate( jsonData[i].number_contracts ) );
			}

			var baseOptions = {
					color: colors,
					tooltip: $.extend( true, {}, defaultTooltipStyle, {
						trigger: 'item'
					} ),
					textStyle: {
						fontFamily: fontFamily,
						fontWeight: 500
					},
					grid: {
						left: '3%',
						right: '3%',
						top: '3%',
						bottom: '5%',
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
								type: [
									4,
									4
								],
								color: '#262626'
							}
						},
						splitLine: {
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							fontFamily: fontFamily,
							fontSize: 10,
							fontWeight: 500,
							color: '#cccccc',
							lineHeight: 25
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
								type: [
									4,
									4
								],
								color: ['#262626']
							}
						},
						splitNumber: 3,
						axisPointer: defaultAxisPointerLabelSettings,
						axisLabel: {
							fontFamily: fontFamily,
							fontSize: 12,
							fontWeight: 500,
							color: '#cccccc'
						},
					},
					series: [
						{
							type: 'bar',
							data: data,
							name: '',
							label: {
								show: true,
								position: 'top',
								fontFamily: fontFamily,
								fontSize: 16,
								fontWeight: 500,
								color: '#ffffff'
							},
							barMaxWidth: 60,
							itemStyle: {
								borderRadius: [
									5,
									5,
									0,
									0
								]
							}
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsDailyNewSmartContracts();

			return $.extend( true, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsDailyNewSmartContracts() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions['yAxis'] = {
					axisLabel: {
						formatter: "{value}"
					}
				};
			} else {
				newOptions['yAxis'] = {
					axisLabel: {
						formatter: function ( value ) {
							return NumberUtil.formatMoney( value );
						}
					}
				};
			}

			return newOptions;
		}

		function getChartOptionsXcmActivitiesOnParachains( chartName ) {
			var colors = [
					'#004bff',
					'#e12c29',
					'#f8b00c'
				],
				data = [
					[
						'Karura',
						'Bifrost-Kusama',
						'Acala',
						'Moonbeam',
						'Parallel',
						'Moonriver',
						'Parallel Heiko',
						'Statemine',
						'Kintsugi',
						'Astar',
						'Interlay',
						'Basilisk',
						'Mangatax',
						'InvArch Tinkernet',
						'Khala',
						'HydraDX',
						'Bifrost-Polkadot',
						'Statemint',
						'Turing',
						'Phala'
					],
					[
						'76669',
						'36704',
						'51083',
						'48431',
						'41733',
						'27557',
						'22703',
						'13987',
						'7450',
						'9960',
						'5728',
						'9371',
						'2022',
						'676',
						'3813',
						'4436',
						'5805',
						'2181',
						'1046',
						'883'
					],
					[
						'80753',
						'36986',
						'36626',
						'35772',
						'25333',
						'24392',
						'17080',
						'8994',
						'8725',
						'7695',
						'7013',
						'6136',
						'4807',
						'3891',
						'3763',
						'3375',
						'2404',
						'1565',
						'1402',
						'1372'
					],
					[
						'44',
						'24',
						'20',
						'20',
						'16',
						'26',
						'16',
						'20',
						'13',
						'19',
						'14',
						'11',
						'6',
						'2',
						'22',
						'11',
						'12',
						'27',
						'14',
						'17'
					]
				],
				baseOptions = {
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
						data: data[0],
						splitLine: {
							show: false,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							fontSize: 11,
							fontWeight: 500,
							color: '#cccccc'
						}
					},
					yAxis: [
						{
							type: 'value',
							name: 'Transfer count',
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							position: 'right',
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 10,
							splitLine: {
								lineStyle: {
									type: [
										4,
										4
									],
									color: ['#262626']
								}
							},
							axisPointer: {
								label: {
									color: '#ffffff',
									backgroundColor: colors[1]
								}
							},
							axisLabel: {
								color: '#cccccc'
							}
						},
						{
							type: 'value',
							name: 'Channel count',
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 20000,
							splitLine: {
								lineStyle: {
									type: [
										4,
										4
									],
									color: ['#262626']
								}
							},
							axisPointer: {
								label: {
									color: '#ffffff',
									backgroundColor: colors[0]
								}
							},
							axisLabel: {
								color: '#cccccc'
							}
						}
					],
					series: [
						{
							name: locate.transferIn,
							data: data[1],
							type: 'bar',
							yAxisIndex: 1,
							label: {
								show: false,
							},
							barMaxWidth: 102,
							itemStyle: {
								borderRadius: [
									2,
									2,
									0,
									0
								]
							}
						},
						{
							name: locate.transferOut,
							data: data[2],
							type: 'bar',
							yAxisIndex: 1,
							label: {
								show: false,
							},
							barMaxWidth: 102,
							itemStyle: {
								borderRadius: [
									2,
									2,
									0,
									0
								]
							}
						},
						{
							name: locate.xcmChannelCount,
							data: data[3],
							type: 'line',
							label: {
								show: true,
								fontFamily: fontFamily,
								fontWeight: 700,
								fontSize: 16,
								position: 'top',
								color: colors[2],
							},
							smooth: false,
							showSymbol: true,
							symbolSize: 16,
							symbol: 'image://data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABdUExURQAAAP+qANuSJP+qAOuxFPWtCv+tCvauCfauDfuuCfuzDfKwDfawDfevDPmuCfyuDPavDPmvDPatDPavC/mvC/ivDP7ouvznufzouf7sxv7txfzrxf/9+f/++f///0T4C/MAAAAedFJOUwAGBwwNGRk5OTk5OjpAUlJTU1RZWWays7O8vL319RU/hDMAAAB0SURBVBgZVcGBFkJAEAXQN0hot1a8Usz+/2eaORyHe+FuYSBTLLGRhrtOYKTnIQmAhicdUPKiRqSbVP90D7xo5mwmmhF0ms1CBzrNZqHDSPPN5kfT4043q37oImpeVEDLkwBAEg/vAkZa7kKBTRWf5BBqmBU2SxFbD9KnZQAAAABJRU5ErkJggg==',
							emphasis: {
								focus: 'series'
							}
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsXcmActivitiesOnParachains();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsXcmActivitiesOnParachains() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions['series'] = [
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
				];
				newOptions['yAxis'] = [
					{
						axisLabel: {
							formatter: function ( value ) {
								return NumberUtil.formatMoney( value );
							}
						}
					},
					{
						axisLabel: {
							formatter: function ( value ) {
								return NumberUtil.formatMoney( value );
							}
						}
					}
				];
				newOptions['grid'] = {
					top: '7%',
					left: '7%',
					right: '7%',
					containLabel: true
				};
			} else {
				newOptions['series'] = [
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
				];
				newOptions['yAxis'] = [
					{
						axisLabel: {
							formatter: '{value}'
						}
					},
					{
						axisLabel: {
							formatter: '{value}'
						}
					}
				];
				newOptions['grid'] = {
					top: '5%',
					left: '3%',
					right: '3%',
					containLabel: true
				};
			}

			return newOptions;
		}

		function getChartOptionsMoonFitNewUsers( chartName ) {
			var colors = [
					'#004bff',
					'#f8b00c',
					'#e12c29',
					'#6ce542'
				],
				data = [
					[
						'Dec\nW1',
						'Dec\nW2',
						'Dec\nW3',
						'Dec\nW4',
						'Jan\nW1',
						'Jan\nW2',
						'Jan\nW3',
						'Jan\nW4',
						'Jan\nW5',
						'Feb\nW1',
						'Feb\nW2',
						'Feb\nW3',
						'Feb\nW4',
						'Mar\nW1',
						'Mar\nW2',
						'Mar\nW3',
						'Mar\nW4',
						'Apr\nW1'
					],
					[
						'184',
						'172',
						'105',
						'68',
						'57',
						'78',
						'39',
						'23',
						'36',
						'36',
						'51',
						'134',
						'76',
						'77',
						'40',
						'27',
						'54',
						'10'
					],
					[
						'345',
						'96',
						'68',
						'185',
						'187',
						'140',
						'75',
						'47',
						'44',
						'52',
						'60',
						'136',
						'72',
						'58',
						'42',
						'28',
						'49',
						'7'
					],
					[
						'6179',
						'6351',
						'6456',
						'6524',
						'6581',
						'6659',
						'6698',
						'6721',
						'6757',
						'6793',
						'6844',
						'6978',
						'7054',
						'7131',
						'7171',
						'7198',
						'7252',
						'7262'
					],
					[
						'350',
						'446',
						'514',
						'699',
						'886',
						'1026',
						'1101',
						'1148',
						'1192',
						'1244',
						'1304',
						'1440',
						'1512',
						'1570',
						'1612',
						'1640',
						'1689',
						'1696'
					]
				],
				baseOptions = {
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
						data: data[0],
						splitLine: {
							show: false,
							lineStyle: {
								type: [
									4,
									4
								],
								color: ['#262626']
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
							fontFamily: fontFamily,
							fontSize: 11,
							fontWeight: 500,
							lineHeight: 15,
							color: '#cccccc'
						}
					},
					yAxis: [
						{
							type: 'value',
							name: 'Total Users',
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							position: 'right',
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 2000,
							splitNumber: 4,
							splitLine: {
								lineStyle: {
									type: [
										4,
										4
									],
									color: ['#262626']
								}
							},
							axisPointer: {
								label: {
									color: '#ffffff',
									backgroundColor: colors[1]
								}
							},
							axisLabel: {
								color: '#cccccc'
							}
						},
						{
							type: 'value',
							name: 'New Users',
							nameTextStyle: {
								fontSize: 0
							},
							offset: 20,
							alignTicks: true,
							axisLine: {
								show: false,
							},
							interval: 100,
							splitNumber: 4,
							splitLine: {
								lineStyle: {
									type: [
										4,
										4
									],
									color: ['#262626']
								}
							},
							axisPointer: {
								label: {
									color: '#ffffff',
									backgroundColor: colors[0]
								}
							},
							axisLabel: {
								color: '#cccccc'
							}
						}
					],
					series: [
						{
							name: locate.weeklyNewUsersBeta,
							data: data[1],
							type: 'bar',
							yAxisIndex: 1,
							label: {
								show: false,
							},
							barMaxWidth: 102,
							itemStyle: {
								borderRadius: [
									2,
									2,
									0,
									0
								]
							}
						},
						{
							name: locate.weeklyNewUsersIncentivized,
							data: data[2],
							type: 'bar',
							yAxisIndex: 1,
							label: {
								show: false,
							},
							barMaxWidth: 102,
							itemStyle: {
								borderRadius: [
									2,
									2,
									0,
									0
								]
							}
						},
						{
							name: locate.totalUsersBeta,
							data: data[3],
							type: 'line',
							smooth: true,
							showSymbol: false,
							emphasis: {
								focus: 'series'
							}
						},
						{
							name: locate.totalUsersIncentivized,
							data: data[4],
							type: 'line',
							smooth: true,
							showSymbol: false,
							emphasis: {
								focus: 'series'
							}
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsMoonFitNewUsers();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsMoonFitNewUsers() {
			var newOptions = {};

			if ( window.innerWidth < 768 ) {
				newOptions['series'] = [
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
				];
				newOptions['yAxis'] = [
					{
						axisLabel: {
							formatter: function ( value ) {
								return NumberUtil.formatMoney( value );
							}
						}
					},
					{
						axisLabel: {
							formatter: function ( value ) {
								return NumberUtil.formatMoney( value );
							}
						}
					}
				];
				newOptions['grid'] = {
					top: '7%',
					left: '7%',
					right: '7%',
					containLabel: true
				};
			} else {
				newOptions['series'] = [
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
				];
				newOptions['yAxis'] = [
					{
						axisLabel: {
							formatter: '{value}'
						}
					},
					{
						axisLabel: {
							formatter: '{value}'
						}
					}
				];
				newOptions['grid'] = {
					top: '5%',
					left: '3%',
					right: '3%',
					containLabel: true
				};
			}

			return newOptions;
		}


		function getChartLinesBaseOptions( jsonData, datasets, colors, areaBackground, seriesOptions, chartExtraOptions ) {
			var totalItems = jsonData.length,
				data = [];

			datasets.forEach( function ( dataset ) {
				data[dataset.name] = [];
			} );

			for ( var i = 0; i < totalItems; i ++ ) {
				datasets.forEach( function ( dataset ) {
					var value = jsonData[i][dataset.name] ? NumberUtil.validate( jsonData[i][dataset.name] ) : '';
					data[dataset.name].push( [
						                         jsonData[i].date,
						                         value
					                         ] );
				} );
			}

			var chartSeries = [];

			datasets.forEach( function ( dataset, index ) {
				var options = {
					name: dataset.label,
					data: data[dataset.name],
					itemStyle: {
						color: colors[index]
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
				if ( areaBackground && areaBackground[index] ) {
					options.areaStyle = {
						color: new echarts.graphic.LinearGradient( 0, 0, 1, 1, [
							{
								offset: 0,
								color: areaBackground[index][0]
							},
							{
								offset: 1,
								color: areaBackground[index][1]
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
						type: 'line',
						crossStyle: {
							color: 'rgba(255,255,255,0.3)'
						},
						lineStyle: {
							type: [
								4,
								4
							],
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
							type: [
								4,
								4
							],
							color: ['#262626']
						}
					},
					axisPointer: defaultAxisPointerLabelSettings,
					axisLabel: {
						margin: 12,
						formatter: dateFormatter,
						color: '#cccccc'
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
							type: [
								4,
								4
							],
							color: ['#262626']
						}
					},
					axisPointer: defaultAxisPointerLabelSettings,
					axisLabel: {
						color: '#cccccc'
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
						newOptions['xAxis'] = {
							splitNumber: 4
						};
						break;
					default:
						newOptions['xAxis'] = {
							splitNumber: 5
						};
						break;
				}
			} else {
				newOptions['xAxis'] = {
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
				case 'tvl-dot-liquid-staking':
				case 'tvl-ksm-liquid-staking':
				case 'stablecoin-issuance':
				case 'tvl-dot-lending':
					newOptions.tooltip = {
						valueFormatter: function ( value ) {
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
								formatter: function ( value ) {
									return value ? '$' + NumberUtil.formatMoney( value ) : '-';
								}
							}
						};
					}
					newOptions.yAxis = yAxis;

					break;
				case 'ajuna-season-1-stats':
				case 'total-tnkr-staked-in-tinkernet-ocif':
					newOptions.tooltip = {
						valueFormatter: function ( value ) {
							return value ? NumberUtil.formatWithCommas( value ) : '-';
						}
					};

					if ( window.innerWidth > 767 ) {
						yAxis = {
							axisPointer: {
								label: {
									formatter: "{value}"
								}
							},
							axisLabel: {
								formatter: "{value}"
							}
						};
					} else {
						yAxis = {
							axisPointer: {
								label: {
									formatter: "{value}"
								}
							},
							axisLabel: {
								formatter: function ( value ) {
									return value ? NumberUtil.formatMoney( value ) : '-';
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
