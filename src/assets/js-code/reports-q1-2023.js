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
							chartOptions = getChartResponsiveOptionsPriceDevAct();
							break;
						case 'newly-created-repo':
							chartOptions = getChartResponsiveOptionsNewlyCreatedRepo();
							break;
						case 'ku-net-alloca':
							chartOptions = getChartResponsiveOptionsKuNetAlloca();
							break;
						case 'pol-net-alloca':
							chartOptions = getChartResponsiveOptionsPolNetAlloca();
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
