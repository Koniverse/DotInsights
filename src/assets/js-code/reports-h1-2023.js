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

		var sourceBaseUrl = baseUrl + '/assets/data/h1-2023/';
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
					fontSize: 14,
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
					fontSize: 14,
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
						case 'total-dot-staked-locked':
							chartOptions = getChartLinesBaseResponsiveOptions( chartName );
							break;
						case 'total-nominator-count-total-validator-count':
							chartOptions = getChartResponsiveOptionsTotalNominatorCountTotalValidatorCount( chartName );
							break;
						case 'dot-staking-ratio-inflation-rate-price':
						case 'staking-ratio-daily-dot-rewards':
							chartOptions = getChartResponsiveOptionsDotStakingRatio( chartName );
							break;
						case 'total-unique-active-validator-new-active-validators':
							chartOptions = getChartResponsiveOptionsTotalUniqueActiveValidatorNewActiveValidators( chartName );
							break;
						case 'validator-with-changes-versus-with-no-changes-in-total-stake':
							chartOptions = getChartResponsiveOptionsValidatorWithChangesVersusWithNoChangesInTotalStake( chartName );
							break;
						case 'total-stake-distribution-among-active-validators':
							chartOptions = getChartResponsiveOptionsTotalStakeDistributionAmongActiveValidators( chartName );
							break;
						case 'active-validators-nominator-counts-versus-self-stakes':
						case 'active-validators-nominator-counts-versus-self-stakes-less-than-10k':
							chartOptions = getChartResponsiveOptionsActiveValidatorsNominatorCountsVersusSelfStakes( chartName );
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
					url: 'polkadot-staking-report-h1-2023-en',
					isActive: 1,
				},
				{
					code: 'pt',
					name: 'Português',
					flag: 'pt.svg',
					url: 'polkadot-staking-report-h1-2023-pt',
					isActive: 1,
				},
				{
					code: 'vi',
					name: 'Tiếng Việt',
					flag: 'vn.svg',
					url: 'polkadot-staking-report-h1-2023-vi',
					isActive: 1,
				},
				{
					code: 'zh',
					name: '中文',
					flag: 'cn.svg',
					url: 'polkadot-staking-report-h1-2023-zh',
					isActive: 1,
				},
				{
					code: 'id_ID',
					name: 'Bahasa Indonesia',
					flag: 'id.svg',
					url: 'polkadot-staking-report-h1-2023-id',
					isActive: 1,
				},
				{
					code: 'es',
					name: 'Español',
					flag: 'es.svg',
					url: 'polkadot-staking-report-h1-2023-es',
					isActive: 1,
				},
				{
					code: 'kr',
					name: '한국어',
					flag: 'kr.svg',
					url: 'polkadot-staking-report-h1-2023-kr',
					isActive: 1,
				},
				{
					code: 'ja',
					name: '日本語',
					flag: 'jp.svg',
					url: 'polkadot-staking-report-h1-2023-ja',
					isActive: 1,
				},
				{
					code: 'fr',
					name: 'Français',
					flag: 'fr.svg',
					url: 'polkadot-staking-report-h1-2023-fr',
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
						case 'total-dot-staked-locked':
							chartOptions = getChartOptionsTotalDotStakedLocked( chartName, jsonData );
							break;
						case 'total-nominator-count-total-validator-count':
							chartOptions = getChartOptionsTotalNominatorCountTotalValidatorCount( chartName, jsonData );
							break;
						case 'nominator-stake-validator-stake':
							chartOptions = getChartOptionsNominatorStakeValidatorStake( chartName, jsonData );
							break;
						case 'dot-staking-ratio-inflation-rate-price':
							chartOptions = getChartOptionsDotStakingRatioInflationRatePrice( chartName, jsonData );
							break;
						case 'staking-ratio-daily-dot-rewards':
							chartOptions = getChartOptionsStakingRatioDailyDotRewards( chartName, jsonData );
							break;
						case 'total-unique-active-validator-new-active-validators':
							chartOptions = getChartOptionsTotalUniqueActiveValidatorNewActiveValidators( chartName, jsonData );
							break;
						case 'validator-with-changes-versus-with-no-changes-in-total-stake':
							chartOptions = getChartOptionsValidatorWithChangesVersusWithNoChangesInTotalStake( chartName, jsonData );
							break;
						case 'total-stake-distribution-among-active-validators':
							chartOptions = getChartOptionsTotalStakeDistributionAmongActiveValidators( chartName, jsonData );
							break;
						case 'active-validators-nominator-counts-versus-self-stakes':
							chartOptions = getChartOptionsActiveValidatorsNominatorCountsVersusSelfStakes( chartName, jsonData );
							break;
						case 'active-validators-nominator-counts-versus-self-stakes-less-than-10k':
							chartOptions = getChartOptionsActiveValidatorsNominatorCountsVersusSelfStakesLessThan10k( chartName, jsonData );
							break;
					}
					chartInstance.hideLoading();
					chartInstance.setOption( chartOptions );
				} );
			} else { // Chart with inline source.
				var chartOptions = {};

				switch ( chartName ) {
					/* New */
					case 'total-stake-distribution':
						chartOptions = getChartOptionsTotalStakeDistribution( chartName );
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

		/* New */
		function getChartOptionsTotalDotStakedLocked( chartName, jsonData ) {
			var datasets = [
					{
						name: 'supply',
						label: 'DOT Supply'
					},
					{
						name: 'staked',
						label: 'DOT Staked'
					},
					{
						name: 'locked_in_prachain',
						label: 'DOT Locked In Prachain'
					},
				],
				colors = [
					'#66e1b6',
					'#f13221',
					'#5c42fb'
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
						max: 1500000000,
						interval: 500000000
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

		/* New */
		function getChartOptionsTotalNominatorCountTotalValidatorCount( chartName, jsonData ) {
			var datasets = [
					{
						name: 'total_nominators',
						label: 'Nominators'
					},
					{
						name: 'total_validators',
						label: 'Validators'
					}
				],
				colors = [
					'#00e7e7',
					'#df146a'
				],
				chartExtraOptions = {
					legend: defaultLegendSettings,
					grid: {
						top: '5%',
						left: '3%',
						right: '3%',
						containLabel: true
					},
					yAxis: {
						min: 0,
						max: 50000,
						interval: 10000,
						axisLabel: {
							color: '#cccccc',
							fontSize: 10
						}
					},
					xAxis: {
						type: 'time',
						splitNumber: 3,
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
						},
						axisLabel: {
							color: '#cccccc',
							fontSize: 10
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
						}
					} )
				};

			var baseOptions = getChartLinesBaseOptions( jsonData, datasets, colors, null, null, chartExtraOptions );
			var responsiveOptions = getChartResponsiveOptionsTotalNominatorCountTotalValidatorCount( chartName );
			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsTotalNominatorCountTotalValidatorCount() {
			var newOptions = {};

			if ( window.innerWidth < 460 ) {
				$.extend( newOptions, {
					xAxis: {
						splitNumber: 2
					},
					yAxis: {
						axisLabel: {
							formatter: function ( value ) {
								return value ? NumberUtil.formatMoney( value ) : '0';
							}
						}
					}
				} )
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsNominatorStakeValidatorStake( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					nominatorStake: [],
					validatorStake: []
				},
				colors = [
					'#004dff',
					'#e4560a'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.nominatorStake.push( [
					                          jsonData[i].date,
					                          jsonData[i].nominator_stake
				                          ] );
				data.validatorStake.push( [
					                          jsonData[i].date,
					                          jsonData[i].validator_stake
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
						overflow: 'breakAll',
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
						name: locate.nominatorStake,
						position: 'left',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 200000000,
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
							}
						},
						axisLabel: {
							color: '#cccccc',
							fontSize: 10
						}
					},
					{
						type: 'value',
						name: locate.validatorStake,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						min: 1000000,
						max: 3000000,
						interval: 500000,
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
							color: '#cccccc',
							fontSize: 10
						}
					}
				],
				series: [
					{
						name: locate.nominatorStake,
						data: data.nominatorStake,
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
						name: locate.validatorStake,
						data: data.validatorStake,
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
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsNominatorStakeValidatorStake();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsNominatorStakeValidatorStake() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 3
					}
				};
			} else {
				newOptions = {
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
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '0';
									}
								}
							},
							{
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '0';
									}
								}
							}
						],
					} )
				}
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsTotalStakeDistributionAmongActiveValidators( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					minTotalStake: [],
					zeroSelfStakeCount: []
				},
				colors = [
					'#004dff',
					'#ea5474'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.minTotalStake.push( [
					                         jsonData[i].date,
					                         jsonData[i].min_total_stake
				                         ] );
				data.zeroSelfStakeCount.push( [
					                              jsonData[i].date,
					                              jsonData[i].zero_self_stake_count
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
						overflow: 'breakAll',
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
						name: locate.minTotalStake,
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
							}
						},
						axisLabel: {
							color: '#cccccc',
							fontSize: 10
						}
					},
					{
						type: 'value',
						name: locate.zeroSelfStakeCount,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 50,
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
							color: '#cccccc',
							fontSize: 10
						}
					}
				],
				series: [
					{
						name: locate.minTotalStake,
						data: data.minTotalStake,
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
						name: locate.zeroSelfStakeCount,
						data: data.zeroSelfStakeCount,
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
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsTotalStakeDistributionAmongActiveValidators();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsTotalStakeDistributionAmongActiveValidators() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 3
					}
				};
			} else {
				newOptions = {
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
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '0';
									}
								}
							},
							{
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '0';
									}
								}
							}
						],
					} )
				}
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsDotStakingRatioInflationRatePrice( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					stakingRate: [],
					inflationRate: [],
					dotPrice: []
				},
				colors = [
					'#004dff',
					'#66e1b6',
					'#e6007a'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.stakingRate.push( [
					                       jsonData[i].date,
					                       jsonData[i].staking_rate
				                       ] );
				data.inflationRate.push( [
					                         jsonData[i].date,
					                         jsonData[i].inflation_rate
				                         ] );
				data.dotPrice.push( [
					                    jsonData[i].date,
					                    jsonData[i].price
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
						name: locate.rate,
						position: 'left',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 15,
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
								formatter: "{value}%"
							}
						},
						axisLabel: {
							formatter: "{value}%",
							color: '#cccccc',
							fontSize: 10
						}
					},
					{
						type: 'value',
						name: locate.price,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 2,
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
							color: '#cccccc',
							fontSize: 10
						}
					}
				],
				series: [
					{
						name: locate.stakingRate,
						data: data.stakingRate,
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
						name: locate.inflationRate,
						data: data.inflationRate,
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
						name: locate.dotPrice,
						data: data.dotPrice,
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
			var responsiveOptions = getChartResponsiveOptionsDotStakingRatio();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartOptionsStakingRatioDailyDotRewards( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					stakingRate: [],
					dotReward: []
				},
				colors = [
					'#004dff',
					'#e4560a'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.stakingRate.push( [
					                       jsonData[i].date,
					                       jsonData[i].staking_rate
				                       ] );
				data.dotReward.push( [
					                     jsonData[i].date,
					                     jsonData[i].reward
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
						overflow: 'breakAll',
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
						name: locate.rate,
						position: 'left',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 15,
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
								formatter: "{value}%"
							}
						},
						axisLabel: {
							formatter: "{value}%",
							color: '#cccccc',
							fontSize: 10
						}
					},
					{
						type: 'value',
						name: locate.dotReward,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 500000,
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
							color: '#cccccc',
							fontSize: 10
						}
					}
				],
				series: [
					{
						name: locate.stakingRate,
						data: data.stakingRate,
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
						name: locate.dotReward,
						data: data.dotReward,
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
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsDotStakingRatio();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsDotStakingRatio() {
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
						}
					} )
				}

				if ( window.innerWidth < 460 ) {
					$.extend( newOptions, {
						xAxis: {
							splitNumber: 2
						},
						yAxis: [
							{
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) + '%' : '0';
									}
								}
							},
							{
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '0';
									}
								}
							}
						]
					} )
				}
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsTotalStakeDistribution( chartName ) {
			var colors = [
					'#004dff',
					'#df146a',
					'#f4c54a'
				],
				data = [
					[
						'1.41-1.71',
						'1.71-2.01',
						'2.01-2.31',
						'2.31-2.61',
						'2.61-2.91',
						'> 2.91'
					],
					[
						'0',
						'92',
						'182',
						'13',
						'2',
						'8'
					],
					[
						'53',
						'200',
						'39',
						'5',
						'0',
						'0'
					],
					[
						'45',
						'200',
						'47',
						'5',
						'0',
						'0'
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
						left: '5%',
						right: '5%',
						bottom: '20%',
						containLabel: true
					},
					xAxis: {
						type: 'category',
						data: data[0],
						name: 'Total Stake (MDOT)',
						nameLocation: 'center',
						nameTextStyle: {
							fontFamily: fontFamily,
							fontSize: 13,
							fontWeight: 500,
							color: '#ffffff',
							lineHeight: 80
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
					yAxis: {
						type: 'value',
						name: 'Validators count',
						nameLocation: 'center',
						nameTextStyle: {
							fontFamily: fontFamily,
							fontSize: 13,
							fontWeight: 500,
							color: '#ffffff',
							lineHeight: 80
						},
						offset: 0,
						alignTicks: true,
						axisLine: {
							show: false,
						},
						interval: 50,
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
					},
					series: [
						{
							name: locate.may3,
							data: data[1],
							type: 'bar',
							label: {
								show: true,
								position: 'top',
								fontFamily: fontFamily,
								fontSize: 12,
								fontWeight: 600,
								color: colors[0]
							},
							barMaxWidth: 28,
							itemStyle: {
								borderRadius: [
									3,
									3,
									0,
									0
								]
							}
						},
						{
							name: locate.may4,
							data: data[2],
							type: 'bar',
							label: {
								show: true,
								position: 'top',
								fontFamily: fontFamily,
								fontSize: 12,
								fontWeight: 600,
								color: colors[1]
							},
							barMaxWidth: 28,
							itemStyle: {
								borderRadius: [
									3,
									3,
									0,
									0
								]
							}
						},
						{
							name: locate.may31,
							data: data[3],
							type: 'bar',
							label: {
								show: true,
								position: 'top',
								fontFamily: fontFamily,
								fontSize: 12,
								fontWeight: 600,
								color: colors[2]
							},
							barMaxWidth: 28,
							itemStyle: {
								borderRadius: [
									3,
									3,
									0,
									0
								]
							}
						}
					]
				},
				responsiveOptions = getChartResponsiveOptionsTotalStakeDistribution();

			return $.extend( true, {}, baseOptions, responsiveOptions );
		}

		function getChartResponsiveOptionsTotalStakeDistribution() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions['series'] = [
					{
						label: {
							fontSize: 13,
						},
					},
					{
						label: {
							fontSize: 13,
						},
					},
					{
						label: {
							fontSize: 13,
						},
					}
				];
			} else {
				newOptions['series'] = [
					{
						label: {
							fontSize: 8,
						},
					},
					{
						label: {
							fontSize: 8,
						},
					},
					{
						label: {
							fontSize: 8,
						},
					}
				];
				newOptions['xAxis'] = {
					nameTextStyle: {
						fontSize: 0
					}
				};
				newOptions['yAxis'] = {
					nameTextStyle: {
						fontSize: 0
					}
				};
			}

			if ( window.innerWidth < 768 ) {
				newOptions['series'] = [
					{
						label: {
							fontSize: 8,
						},
					},
					{
						label: {
							fontSize: 8,
						},
					},
					{
						label: {
							fontSize: 8,
						},
					}
				];
			} else {
				newOptions['series'] = [
					{
						label: {
							fontSize: 13,
						},
					},
					{
						label: {
							fontSize: 13,
						},
					},
					{
						label: {
							fontSize: 13,
						},
					}
				];
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsTotalUniqueActiveValidatorNewActiveValidators( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					cumulativeUniqueValidators: [],
					newActiveValidators: []
				},
				colors = [
					'#004dff',
					'#e6007a'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.cumulativeUniqueValidators.push( [
					                                      jsonData[i].date,
					                                      jsonData[i].cumulative_unique_validators
				                                      ] );
				data.newActiveValidators.push( [
					                               jsonData[i].date,
					                               jsonData[i].new_active_validators
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
						name: locate.cumulativeUniqueValidators,
						position: 'left',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 200,
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
							}
						},
						axisLabel: {
							color: '#cccccc',
							fontSize: 10
						}
					},
					{
						type: 'value',
						name: locate.newActiveValidators,
						position: 'right',
						axisLine: {
							show: false
						},
						splitNumber: 4,
						interval: 10,
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
							color: '#cccccc',
							fontSize: 10
						}
					}
				],
				series: [
					{
						name: locate.cumulativeUniqueValidators,
						data: data.cumulativeUniqueValidators,
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
						name: locate.newActiveValidators,
						data: data.newActiveValidators,
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
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsTotalUniqueActiveValidatorNewActiveValidators();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsTotalUniqueActiveValidatorNewActiveValidators() {
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
						}
					} )
				}

				if ( window.innerWidth < 460 ) {
					$.extend( newOptions, {
						xAxis: {
							splitNumber: 2
						},
						yAxis: [
							{
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) + '%' : '0';
									}
								}
							},
							{
								axisLabel: {
									formatter: function ( value ) {
										return value ? NumberUtil.formatMoney( value ) : '0';
									}
								}
							}
						]
					} )
				}
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsValidatorWithChangesVersusWithNoChangesInTotalStake( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					stakeGainValidators: [],
					stakeDropValidators: [],
					stakeUnchangedValidators: []
				},
				colors = [
					'#00e7e7',
					'#e6007a',
					'#f4c54a'
				];

			for ( var i = 0; i < totalItems; i ++ ) {
				data.stakeGainValidators.push( [
					                               jsonData[i].date,
					                               jsonData[i].stake_gain_validators
				                               ] );
				data.stakeDropValidators.push( [
					                               jsonData[i].date,
					                               jsonData[i].stake_drop_validators
				                               ] );
				data.stakeUnchangedValidators.push( [
					                                    jsonData[i].date,
					                                    jsonData[i].stake_unchanged_validators
				                                    ] );
			}

			var baseOptions = {
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
					},
					valueFormatter: function ( value ) {
						return value + '%';
					}
				} ),
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
						name: locate.cumulativeUniqueValidators,
						position: 'left',
						axisLine: {
							show: false
						},
						max: 100,
						splitNumber: 4,
						interval: 25,
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
								backgroundColor: '#cccccc'
							}
						},
						axisLabel: {
							color: '#cccccc',
							fontSize: 10,
							formatter: "{value}%"
						}
					}
				],
				series: [
					{
						name: locate.stakeGainValidators,
						data: data.stakeGainValidators,
						itemStyle: {
							color: colors[0]
						},
						type: 'bar',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						},
						stack: '1'
					},
					{
						name: locate.stakeDropValidators,
						data: data.stakeDropValidators,
						itemStyle: {
							color: colors[1]
						},
						type: 'bar',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						},
						stack: '1'
					},
					{
						name: locate.stakeUnchangedValidators,
						data: data.stakeUnchangedValidators,
						itemStyle: {
							color: colors[2]
						},
						type: 'bar',
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						},
						stack: '1'
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsTotalUniqueActiveValidatorNewActiveValidators();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsValidatorWithChangesVersusWithNoChangesInTotalStake() {
			var newOptions = {};

			if ( window.innerWidth > 767 ) {
				newOptions = {
					xAxis: {
						splitNumber: 3
					}
				};
			} else {
				newOptions = {
					xAxis: {
						splitNumber: 2
					}
				};
			}

			return newOptions;
		}

		/* New */
		function getChartOptionsActiveValidatorsNominatorCountsVersusSelfStakes( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					activeValidators: []
				};

			for ( var i = 0; i < totalItems; i ++ ) {
				data.activeValidators.push( [
					                            jsonData[i].validator_stake,
					                            jsonData[i].nominator_count
				                            ] );
			}

			var baseOptions = {
				color: '#66E1B6',
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: defaultTooltipSettings,
				legend: {
					show: false
				},
				grid: {
					left: '8%',
					right: '5%',
					top: '3%', //bottom: 100, // DataZoom + Legend.
					containLabel: true
				},
				xAxis: {
					type: 'value',
					name: locate.validatorStake,
					nameLocation: 'middle',
					nameTextStyle: {
						fontFamily: fontFamily,
						fontSize: 13,
						fontWeight: 500,
						color: '#ffffff',
						lineHeight: 80
					},
					axisLine: {
						show: false
					},
					splitNumber: 4,
					interval: 200000,
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
						}
					},
					axisLabel: {
						color: '#cccccc',
						fontSize: 10
					}
				},
				yAxis: {
					type: 'value',
					name: locate.nominatorCount,
					nameLocation: 'center',
					nameTextStyle: {
						fontFamily: fontFamily,
						fontSize: 13,
						fontWeight: 500,
						color: '#ffffff',
						lineHeight: 80
					},
					axisLine: {
						show: false
					},
					splitNumber: 4,
					interval: 200,
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
						}
					},
					axisLabel: {
						color: '#cccccc',
						fontSize: 10
					}
				},
				series: [
					{
						data: data.activeValidators,
						itemStyle: {
							color: 'rgba(102,225,182,0.7)'
						},
						type: 'scatter',
						symbolSize: 6,
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsActiveValidatorsNominatorCountsVersusSelfStakes();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartOptionsActiveValidatorsNominatorCountsVersusSelfStakesLessThan10k( chartName, jsonData ) {
			var totalItems = jsonData.length,
				data = {
					activeValidators: []
				};

			for ( var i = 0; i < totalItems; i ++ ) {
				data.activeValidators.push( [
					                            jsonData[i].validator_stake,
					                            jsonData[i].nominator_count
				                            ] );
			}

			var baseOptions = {
				color: 'rgba(223,20,106,0.7)',
				textStyle: {
					fontFamily: fontFamily,
					fontWeight: 500
				},
				tooltip: defaultTooltipSettings,
				legend: {
					show: false
				},
				grid: {
					left: '8%',
					right: '5%',
					top: '3%', //bottom: 100, // DataZoom + Legend.
					containLabel: true
				},
				xAxis: {
					type: 'value',
					name: locate.validatorStake,
					nameLocation: 'middle',
					nameTextStyle: {
						fontFamily: fontFamily,
						fontSize: 13,
						fontWeight: 500,
						color: '#ffffff',
						lineHeight: 80
					},
					axisLine: {
						show: false
					},
					max: 10000,
					splitNumber: 4,
					interval: 2500,
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
						}
					},
					axisLabel: {
						color: '#cccccc',
						fontSize: 10
					}
				},
				yAxis: {
					type: 'value',
					name: locate.nominatorCount,
					nameLocation: 'center',
					nameTextStyle: {
						fontFamily: fontFamily,
						fontSize: 13,
						fontWeight: 500,
						color: '#ffffff',
						lineHeight: 80
					},
					axisLine: {
						show: false
					},
					splitNumber: 4,
					interval: 200,
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
						}
					},
					axisLabel: {
						color: '#cccccc',
						fontSize: 10
					}
				},
				series: [
					{
						data: data.activeValidators,
						itemStyle: {
							color: 'rgba(223,20,106,0.7)'
						},
						type: 'scatter',
						symbolSize: 6,
						smooth: true,
						showSymbol: false,
						emphasis: {
							focus: 'series'
						}
					}
				]
			};
			var responsiveOptions = getChartResponsiveOptionsActiveValidatorsNominatorCountsVersusSelfStakes();

			$.extend( true, baseOptions, responsiveOptions );

			return baseOptions;
		}

		function getChartResponsiveOptionsActiveValidatorsNominatorCountsVersusSelfStakes() {
			var newOptions = {};

			if ( window.innerWidth < 460 ) {
				$.extend( newOptions, {
					grid: {
						left: '15%',
						right: '5%',
						top: '3%', //bottom: 100, // DataZoom + Legend.
						containLabel: true
					},
					xAxis: {
						axisLabel: {
							formatter: function ( value ) {
								return value ? NumberUtil.formatMoney( value ) : '0';
							}
						}
					},
					yAxis: {
						axisLabel: {
							formatter: function ( value ) {
								return value ? NumberUtil.formatMoney( value ) : '0';
							}
						}
					}
				} )
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
					case 'total-nominator-count-total-validator-count':
						newOptions['xAxis'] = {
							splitNumber: 3
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
				case 'total-dot-staked-locked':
					if ( window.innerWidth < 768 ) {
						yAxis = {
							axisLabel: {
								formatter: function ( value ) {
									return NumberUtil.formatMoney( value );
								},
								fontSize: 10
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
