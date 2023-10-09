(
    function($) {
      'use strict';

      var locate = window.dotinsights.Localization;
      var baseUrl = location.origin;
      var partname = location.pathname.split('/');

      for (var i = 0; i < partname.length - 2; i++) {
        if ('' !== partname[i]) {
          baseUrl += '/' + partname[i];
        }
      }

      var sourceBaseUrl = baseUrl + '/assets/data/q3-2023/';
      var tokenBaseUrl = baseUrl + '/assets/images/token/';

      var NumberUtil = dotinsights.NumberUtil,
          $allCharts = $('.block-chart'),
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
                color: '#777777',
              },
              areaStyle: {
                opacity: 0.6,
                color: new echarts.graphic.LinearGradient(0.5, 0, 0.5, 1, [
                  {
                    offset: 0,
                    color: 'rgba(88, 88, 88,0)',
                  }, {
                    offset: 1,
                    color: 'rgba(140, 140, 140,1)',
                  },
                ]),
              },
            },
            selectedDataBackground: {
              lineStyle: {
                color: '#777777',
              },
              areaStyle: {
                opacity: 0.6,
                color: new echarts.graphic.LinearGradient(0.5, 0, 0.5, 1, [
                  {
                    offset: 0,
                    color: 'rgba(88, 88, 88,0)',
                  }, {
                    offset: 1,
                    color: 'rgba(140, 140, 140,1)',
                  },
                ]),
              },
            },
            fillerColor: 'rgba(0, 75, 255, 0.38)',
            textStyle: {
              color: '#cccccc',
            },
            handleStyle: {
              borderWidth: 0,
              borderCap: 'round',
              color: '#3c72ff',
            },
            moveHandleStyle: {
              borderWidth: 0,
              color: '#3c72ff',
            },
            start: 0,
            end: 10,
            height: 32,
            bottom: 45,
          },
          defaultTooltipStyle = {
            padding: [
              15, 20,
            ],
            backgroundColor: '#000000',
            borderWidth: 0,
            extraCssText: 'border-radius: 10px;box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);',
            textStyle: {
              fontFamily: fontFamily,
              color: '#ffffff',
              fontSize: 14,
              fontWeight: '500',
            },
          },
          defaultTooltipSettings = $.extend(true, {}, defaultTooltipStyle, {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              crossStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: 'rgba(255,255,255,0.3)',
              },
            },
          }),
          defaultLegendSettings = {
            show: true,
            icon: 'roundRect',
            textStyle: {
              fontFamily: fontFamily,
              color: '#ffffff',
              fontSize: 13,
              fontWeight: '500',
              padding: [
                3, 0, 0, 0,
              ],
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
              fontSize: 13,
              fontWeight: '500',
            },
          },
          defaultAxisPointerLabelSettings = {
            label: {
              color: '#000000',
              backgroundColor: '#cccccc',
            },
          };

      $(document).ready(function() {
        $allCharts.waypoint(function() {
          // Fix for different ver of waypoints plugin.
          var _self = this.element ? this.element : this;
          var $self = $(_self);

          initCharts($self);

          this.destroy(); // trigger once.
        }, {
          offset: '90%',
        });

        /*$( '.js-data-table' ).DataTable( {
          info: false,
          paging: false,
          searching: false
        } );*/

        initTableOfContents();
        //initLanguageSwitcher();

        var $readmore = $('.block-dao .description');

        new Readmore($readmore, {
          moreLink: '<a href="#" class="btn btn-flat btn-small">' + locate.readMore + '</a>',
          lessLink: '<a href="#" class="btn btn-flat btn-small">' + locate.readLess + '</a>',
        });

        var $blockBridge = $('.block-bridge');

        $(document.body).on('click', '.bridge-list a', function(evt) {
          evt.preventDefault();

          var $thisButton = $(this);

          if ($thisButton.hasClass('current')) {
            return;
          }

          $thisButton.siblings().removeClass('current');
          $thisButton.addClass('current');

          $blockBridge.find('.bridge-item').hide().removeClass('animate');
          $blockBridge.find('.bridge--' + $thisButton.data('filter')).
              show(function() {
                $(this).addClass('animate');
              }, 0);
        });
      });

      $(window).on('hresize_one', function() {
        $allCharts.each(function() {
          var $chart = $(this),
              chartInstance = echarts.getInstanceByDom($chart.get(0)),
              chartName = $chart.data('chart-name');

          if (typeof chartInstance !== 'undefined') {
            chartInstance.resize({
              width: 'auto',
              height: 'auto',
            });

            var chartOptions = false;

            // Chart Responsive
            switch (chartName) {

              case 'price-dev-act':
                chartOptions = getChartResponsiveOptionsPriceDevAct(chartName);
                break;
              case 'active-devs-commits':
                chartOptions = getChartResponsiveOptionsActiveDevsCommits(chartName);
                break;
              case 'dev-activity-developers':
                chartOptions = getChartOptionsResponsiveDevActivityDevelopers(chartName);
                break;
              case 'fast-unstake-on-polkadot':
                chartOptions = getChartResponsiveOptionsFastUnstakeOnPolkadot(chartName);
                break;
              case 'staking-rewards-by-nominator-type':
                chartOptions = getChartResponsiveOptionsStakingRewardsByNominatorType(chartName);
                break;
              case 'active-validators-nominator-counts-versus-self-stakes':
              case 'active-validators-nominator-counts-versus-commission':
                chartOptions = getChartResponsiveOptionsActiveValidatorsNominatorCounts(chartName);
                break;
              case 'dot-holder-distribution':
              case 'ksm-holder-distribution':
                chartOptions = getChartResponsiveOptionsHolderDistribution(chartName);
                break;
              case 'polkadot-opengov-referenda':
              case 'kusama-opengov-referenda':
                chartOptions = getChartResponsiveOptionsPolkadotOpenGovReferenda(chartName);
                break;
              case 'opengov-support-by-track':
                chartOptions = getChartResponsiveOptionsOpenGovSupportByTrack(chartName);
                break;
              case 'governance-opengov-spend-polkadot':
              case 'governance-opengov-spend-kusama':
                chartOptions = getChartResponsiveOptionsGovernanceOpenGovSpend(chartName);
                break;
              case 'governance-web3-foundation-grants':
                chartOptions = getChartResponsiveOptionsGovernanceWeb3FoundationGrants(chartName);
                break;
              case 'parachain-xcm-transfers':
              case 'parachain-xcm-channels':
                chartOptions = getChartResponsiveOptionsParachainXcm(chartName);
                break;
              case 'parachain-xcm-v3':
              case 'parachain-chain-fees':
                chartOptions = getChartResponsiveOptionsParachain(chartName);
                break;
              case 'total-stake-total-members-in-polkadot-nomination-pools':
                chartOptions = getChartResponsiveOptionsTotalStakeTotalMembersInPolkadotNominationPools( chartName );
                break;
              case 'tvl-defi-parachain':
              case 'defi-dex-polkadot':
              case 'defi-dex-kusama':
              case 'defi-lending':
              case 'defi-liquid-staking':
              case 'defi-usdt-supply':
                chartOptions = getChartLinesBaseResponsiveOptions(chartName);
                break;
              case 'defi-usdt-polkadot':
              case 'defi-usdt-kusama':
                chartOptions = getChartResponsiveOptionsDefiUsdt(chartName);
                break;
              case 'nft-marketplace':
                chartOptions = getChartResponsiveOptionsNftMarketplace(chartName);
                break;
              case 'nft-metaverse-bitcountry':
                chartOptions = getChartResponsiveOptionsNftMetaverseBitcountry(chartName);
                break;
              case 'web3-wasm-alephzero':
              case 'web3-wasm-astar':
                chartOptions = getChartResponsiveOptionsWeb3Wasm(chartName);
                break;
            }

            if (chartOptions) {
              chartInstance.setOption(chartOptions);
            }
          }
        });
      });

      function initTableOfContents() {
        var $tableOfContents = $('#table-of-contents');

        $tableOfContents.on('click', '.btn-close-panel', function(e) {
          e.preventDefault();
          e.stopPropagation();

          $tableOfContents.removeClass('open');
        });

        $tableOfContents.on('click', function(e) {
          if (e.target !== this) {
            return;
          }

          $tableOfContents.removeClass('open');
        });

        $tableOfContents.on('click', 'a', function(e) {
          $tableOfContents.removeClass('open');
        });

        $(document).on('click', '#btn-open-panel', function(e) {
          e.preventDefault();
          e.stopPropagation();

          $tableOfContents.addClass('open');
        });
      }

      function initLanguageSwitcher() {
        var languages = [
          {
            code: 'en',
            name: 'English',
            flag: 'us.svg',
            url: 'polkadot-report-q3-2023-en',
            isActive: 1,
          }, {
            code: 'pt',
            name: 'Português',
            flag: 'pt.svg',
            url: 'polkadot-report-q3-2023-pt',
            isActive: 1,
          }, {
            code: 'vi',
            name: 'Tiếng Việt',
            flag: 'vn.svg',
            url: 'polkadot-report-q3-2023-vi',
            isActive: 1,
          }, {
            code: 'zh',
            name: '中文',
            flag: 'cn.svg',
            url: 'polkadot-report-q3-2023-zh',
            isActive: 1,
          }, {
            code: 'id_ID',
            name: 'Bahasa Indonesia',
            flag: 'id.svg',
            url: 'polkadot-report-q3-2023-id',
            isActive: 1,
          }, {
            code: 'es',
            name: 'Español',
            flag: 'es.svg',
            url: 'polkadot-report-q3-2023-es',
            isActive: 1,
          }, {
            code: 'kr',
            name: '한국어',
            flag: 'kr.svg',
            url: 'polkadot-report-q3-2023-kr',
            isActive: 1,
          }, {
            code: 'ja',
            name: '日本語',
            flag: 'jp.svg',
            url: 'polkadot-report-q3-2023-ja',
            isActive: 1,
          }, {
            code: 'fr',
            name: 'Français',
            flag: 'fr.svg',
            url: 'polkadot-report-q3-2023-fr',
            isActive: 1,
          },
        ];

        var currentLang = $('html').attr('lang');

        var currentLangOutput = '',
            subLangOutput = '';
        for (var i = 0; i < languages.length; i++) {
          var thisLang = languages[i];

          if (!thisLang.isActive) {
            continue;
          }

          if (thisLang.code === currentLang) {
            currentLangOutput = `
					<img src="../assets/flags/4x3/${thisLang.flag}" alt="${thisLang.name}" width="25" height="19"/>
					<span class="lang-label">${thisLang.name}</span><svg class="lang-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M360.5 217.5l-152 143.1C203.9 365.8 197.9 368 192 368s-11.88-2.188-16.5-6.562L23.5 217.5C13.87 208.3 13.47 193.1 22.56 183.5C31.69 173.8 46.94 173.5 56.5 182.6L192 310.9l135.5-128.4c9.562-9.094 24.75-8.75 33.94 .9375C370.5 193.1 370.1 208.3 360.5 217.5z"/></svg>`;
          } else {
            subLangOutput += `
						<li>
							<a href="/${thisLang.url}/">
								<img src="../assets/flags/4x3/${thisLang.flag}" alt="${thisLang.name}" width="25" height="19"/>
								${thisLang.name}
							</a>
						</li>
					`;
          }
        }

        var $switcher = $('#language-switcher'),
            output = `
				<div class="current-lang">${currentLangOutput}</div>
				<ul class="language-switcher-list">${subLangOutput}</ul>`;

        $switcher.html(output);

        $switcher.on('click', '.current-lang', function(evt) {
          evt.preventDefault();

          $switcher.addClass('show');
        });

        $(document.body).on('click', function(e) {
          if ($(e.target).closest($switcher).length === 0) {
            $switcher.removeClass('show');
          }
        });
      }

      function setItemHighlight($li) {
        var $otherLi = $li.siblings('li'),
            pieID = $li.data('id');

        var $chart = $li.closest('ul').siblings('.block-chart');
        var chartInstance = echarts.getInstanceByDom($chart.get(0));

        chartInstance.dispatchAction({
          type: 'highlight',
          name: pieID,
        });

        $otherLi.each(function() {
          var name = $(this).data('id');

          chartInstance.dispatchAction({
            type: 'downplay',
            name: name,
          });
        });
      }

      /*
      * INIT CHART
      * */

      function initCharts($chart) {
        var chartName = $chart.data('chart-name'),
            chartSource = $chart.data('chart-source'),
            chartInstance = echarts.init($chart.get(0), 'macarons');

        chartInstance.showLoading('default', {
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
          fontFamily: fontFamily,
        });

        if (!chartName) {
          return;
        }

        if ('inline' !== chartSource) { // Chart with jSON source.
          var fileName = typeof chartSource !== 'undefined' ? chartSource : chartName;
          var url = sourceBaseUrl + fileName + '.json';

          fetch(url).then(function(response) {
            return response.json();
          }).then(function(jsonData) {
            var chartOptions = {};

            switch (chartName) {
              case 'price-dev-act':
                chartOptions = getChartOptionsPriceDevAct(chartName, jsonData);
                break;
              case 'active-devs-commits':
                chartOptions = getChartOptionsActiveDevsCommits(chartName, jsonData);
                break;
              case 'dev-activity-developers':
                chartOptions = getChartOptionsDevActivityDevelopers(chartName, jsonData);
                break;
              case 'fast-unstake-on-polkadot':
                chartOptions = getChartOptionsFastUnstakeOnPolkadot(chartName, jsonData);
                break;
              case 'staking-rewards-by-nominator-type':
                chartOptions = getChartOptionsStakingRewardsByNominatorType(chartName, jsonData);
                break;
              case 'active-validators-nominator-counts-versus-self-stakes':
                chartOptions = getChartOptionsActiveValidatorsNominatorCountsVersusSelfStakes(chartName, jsonData);
                break;
              case 'active-validators-nominator-counts-versus-commission':
                chartOptions = getChartOptionsActiveValidatorsNominatorCountsVersusCommission(chartName, jsonData);
                break;
              case 'tvl-defi-parachain':
                chartOptions = getChartOptionsDefiParachain(chartName, jsonData);
                break;
              case 'nominator-stake-validator-stake':
                chartOptions = getChartOptionsNominatorStakeValidatorStake( chartName, jsonData );
                break;
              case 'total-stake-total-members-in-polkadot-nomination-pools':
                chartOptions = getChartOptionsTotalStakeTotalMembersInPolkadotNominationPools( chartName, jsonData );
                break;
              case 'defi-dex-polkadot':
                chartOptions = getChartOptionsDefiDexPolkadot(chartName, jsonData);
                break;
              case 'defi-dex-kusama':
                chartOptions = getChartOptionsDefiDexKusama(chartName, jsonData);
                break;
              case 'defi-lending':
                chartOptions = getChartOptionsDefiLending(chartName, jsonData);
                break;
              case 'defi-liquid-staking':
                chartOptions = getChartOptionsDefiLiquidStaking(chartName, jsonData);
                break;
              case 'defi-usdt-supply':
                chartOptions = getChartOptionsDefiUsdtSupply(chartName, jsonData);
                break;
              case 'defi-usdt-polkadot':
                chartOptions = getChartOptionsDefiUsdtPolkadot(chartName, jsonData);
                break;
              case 'defi-usdt-kusama':
                chartOptions = getChartOptionsDefiUsdtKusama(chartName, jsonData);
                break;
              case 'nft-marketplace':
                chartOptions = getChartOptionsNftMarketplace(chartName, jsonData);
                break;
              case 'nft-metaverse-bitcountry':
                chartOptions = getChartOptionsNftMetaverseBitcountry(chartName, jsonData);
                break;
              case 'web3-wasm-alephzero':
                chartOptions = getChartOptionsWeb3WasmAlephzero(chartName, jsonData);
                break;
              case 'web3-wasm-astar':
                chartOptions = getChartOptionsWeb3WasmAstar(chartName, jsonData);
                break;
            }
            chartInstance.hideLoading();
            chartInstance.setOption(chartOptions);
          });
        } else { // Chart with inline source.
          var chartOptions = {};

          switch (chartName) {
            case 'dot-holder-distribution':
              chartOptions = getChartOptionsDotHolderDistribution(chartName);
              break;
            case 'ksm-holder-distribution':
              chartOptions = getChartOptionsKsmHolderDistribution(chartName);
              break;
            case 'polkadot-opengov-referenda':
              chartOptions = getChartOptionsPolkadotOpenGovReferenda(chartName);
              break;
            case 'kusama-opengov-referenda':
              chartOptions = getChartOptionsKusamaOpenGovReferenda(chartName);
              break;
            case 'opengov-support-by-track':
              chartOptions = getChartOptionsOpenGovSupportByTrack(chartName);
              break;
            case 'governance-opengov-spend-polkadot':
              chartOptions = getChartOptionsGovernanceOpenGovSpendPolkadot(chartName);
              break;
            case 'governance-opengov-spend-kusama':
              chartOptions = getChartOptionsGovernanceOpenGovSpendKusama(chartName);
              break;
            case 'governance-web3-foundation-grants':
              chartOptions = getChartOptionsGovernanceWeb3FoundationGrants(chartName);
              break;
            case 'parachain-xcm-transfers':
              chartOptions = getChartOptionsParachainXcmTransfers(chartName);
              break;
            case 'parachain-xcm-channels':
              chartOptions = getChartOptionsParachainXcmChannels(chartName);
              break;
            case 'parachain-xcm-v3':
              chartOptions = getChartOptionsParachainXcmV3(chartName);
              break;
            case 'parachain-chain-fees':
              chartOptions = getChartOptionsParachainChainFees(chartName);
              break;
          }

          chartInstance.hideLoading();
          chartInstance.setOption(chartOptions);

          var $customLegend = $chart.siblings('.block-chart-legend');
          if ($customLegend.length > 0) {
            chartInstance.on('mouseover', 'series', function(params) {

              var $current = $customLegend.find('li[data-id="' + params.name + '"]');

              setItemHighlight($current);
            });

            var $firstActive = $customLegend.children('li.active');

            setItemHighlight($firstActive);

            $customLegend.on('click', 'li', function() {
              var $li = $(this);
              setItemHighlight($li);
            });
          }
        }
      }

      /*
      * CHART FUNCTION
      * */
      function getChartOptionsPriceDevAct(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              polkadot: [],
              kusama: [],
              dev: [],
            },
            colors = [
              '#66e1b6', '#e6007a', '#0091ff',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.polkadot.push([
            jsonData[i].date, jsonData[i].dot,
          ]);
          data.kusama.push([
            jsonData[i].date, jsonData[i].ksm,
          ]);
          data.dev.push([
            jsonData[i].date, jsonData[i].dev,
          ]);
        }

        var baseOptions = {
          color: colors, //dataZoom: defaultDataZoom,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          }, //				tooltip: defaultTooltipSettings,
          tooltip: $.extend(true, {}, defaultTooltipStyle, {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              crossStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: 'rgba(255,255,255,0.3)',
              },
            },
          }),
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: 110,
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            splitLine: {
              show: false,
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#262626',
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              margin: 12,
              formatter: dateFormatter,
              color: '#cccccc',
              fontSize: 10,
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.ksmPrice,
              nameTextStyle: {
                fontSize: 0,
              },
              position: 'right',
              alignTicks: true,
              axisLine: {
                show: true,
                lineStyle: {
                  color: colors[0],
                },
              },
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#020722',
                  backgroundColor: '#66e1b6',
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
                formatter: '${value}',
              },
            }, {
              type: 'value',
              name: locate.dotPrice,
              nameTextStyle: {
                fontSize: 0,
              },
              position: 'right',
              alignTicks: true,
              offset: 70,
              axisLine: {
                show: true,
                lineStyle: {
                  color: colors[1],
                },
              },
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
                formatter: '${value}',
              },
            }, {
              type: 'value',
              name: locate.developmentActivity,
              nameTextStyle: {
                fontSize: 0,
              },
              position: 'right',
              alignTicks: true,
              offset: 140,
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: colors[2],
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
          ],
          series: [
            {
              name: locate.ksmPrice,
              data: data.kusama,
              itemStyle: {
                color: colors[0],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            }, {
              name: locate.dotPrice,
              data: data.polkadot,
              itemStyle: {
                color: colors[1],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            }, {
              name: locate.developmentActivity,
              data: data.dev,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  {
                    offset: 0,
                    color: 'rgba(0, 145, 255,0.5)',
                  }, {
                    offset: 1,
                    color: 'rgba(7, 14, 48,0)',
                  },
                ]),
              },
              itemStyle: {
                color: colors[2],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 2,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsPriceDevAct();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsPriceDevAct() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions = {
            xAxis: {
              splitNumber: 5,
            },
          };
        } else {
          newOptions = {
            grid: {
              left: '3%',
              right: 100,
              top: '3%', //bottom: 100, // DataZoom + Legend.
              containLabel: true,
            },
            xAxis: {
              splitNumber: 2,
              axisLabel: {
                hideOverlap: false,
                showMaxLabel: true,
                overflow: 'breakAll',
                rotate: -45,
                align: 'left',
                fontFamily: fontFamily,
                fontSize: 9,
                fontWeight: 500,
                color: '#cccccc',
              },
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsActiveDevsCommits(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              active_devs: [],
              code_commits: [],
            },
            colors = [
              '#e6007a', '#004bff',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.active_devs.push([
            jsonData[i].date, jsonData[i].active_devs,
          ]);
          data.code_commits.push([
            jsonData[i].date, jsonData[i].code_commits,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            top: '3%',
            left: '3%',
            right: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            splitLine: {
              show: false,
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              margin: 12,
              formatter: dateFormatter,
              color: '#cccccc',
              fontSize: 10,
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.activeDevelopers,
              nameTextStyle: {
                fontSize: 0,
                lineHeight: 0,
              },
              alignTicks: true,
              axisLine: {
                show: false,
              },
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              interval: 50,
              min: 0,
              max: 200,
              axisPointer: {
                label: {
                  color: '#020722',
                  backgroundColor: colors[0],
                },
              },
              axisLabel: {
                color: '#cccccc',
              },
            }, {
              type: 'value',
              name: locate.codeCommits,
              nameTextStyle: {
                fontSize: 0,
                lineHeight: 0,
              },
              position: 'right',
              alignTicks: true,
              axisLine: {
                show: false,
              },
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              interval: 20,
              min: 0,
              max: 80,
              axisPointer: {
                label: {
                  color: '#ffffff',
                  backgroundColor: colors[1],
                },
              },
              axisLabel: {
                color: '#cccccc',
              },
            },
          ],
          series: [
            {
              name: locate.activeDevelopers,
              data: data.active_devs,
              type: 'line',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            }, {
              name: locate.codeCommits,
              data: data.code_commits,
              type: 'bar',
              smooth: true,
              yAxisIndex: 1,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsActiveDevsCommits();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsActiveDevsCommits() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions = {
            xAxis: {
              splitNumber: 4,
              axisLabel: {
                showMaxLabel: true,
                align: 'center',
                fontFamily: fontFamily,
                fontSize: 10,
                fontWeight: 500,
                color: '#cccccc',
              },
            },
          };
        } else {
          newOptions = {
            grid: {
              left: '3%',
              right: '3%',
              top: '3%', //bottom: 100, // DataZoom + Legend.
              containLabel: true,
            },
            xAxis: {
              splitNumber: 2,
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsDevActivityDevelopers(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              fullTime: [],
              partTime: [],
              oneTime: [],
            },
            colors = [
              '#004dff', '#ffc93f', '#ff035e',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.fullTime.push([
            jsonData[i].date, jsonData[i].full_time,
          ]);
          data.partTime.push([
            jsonData[i].date, jsonData[i].part_time,
          ]);
          data.oneTime.push([
            jsonData[i].date, jsonData[i].one_time,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: $.extend(true, {}, defaultTooltipStyle, {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              crossStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: 'rgba(255,255,255,0.3)',
              },
            },
            valueFormatter: function(value) {
              return value + '%';
            },
          }),
          legend: defaultLegendSettings,
          grid: {
            left: '5%',
            right: '6%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              align: 'center',
              fontFamily: fontFamily,
              fontSize: 10,
              fontWeight: 500,
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: [
            {
              type: 'value',
              position: 'left',
              axisLine: {
                show: false,
              },
              max: 100,
              splitNumber: 4,
              interval: 25,
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#000000',
                  backgroundColor: '#cccccc',
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
                formatter: '{value}%',
              },
            },
          ],
          series: [
            {
              name: locate.fullTime,
              data: data.fullTime,
              itemStyle: {
                color: colors[0],
              },
              type: 'bar',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              stack: '1',
            }, {
              name: locate.partTime,
              data: data.partTime,
              itemStyle: {
                color: colors[1],
              },
              type: 'bar',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              stack: '1',
            }, {
              name: locate.oneTime,
              data: data.oneTime,
              itemStyle: {
                color: colors[2],
              },
              type: 'bar',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              stack: '1',
            },
          ],
        };
        var responsiveOptions = getChartOptionsResponsiveDevActivityDevelopers();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartOptionsResponsiveDevActivityDevelopers() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions = {
            xAxis: {
              splitNumber: 3,
            },
          };
        } else {
          newOptions = {
            xAxis: {
              splitNumber: 2,
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsFastUnstakeOnPolkadot(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              unique_users: [],
              amount: [],
            },
            colors = [
              '#004bff', '#e6007a',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.unique_users.push([
            jsonData[i].date, jsonData[i].unique_users,
          ]);
          data.amount.push([
            jsonData[i].date, jsonData[i].amount,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            top: '3%',
            left: '40px',
            right: '40px',
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.amountTotal,
              nameTextStyle: {
                fontSize: 0,
              },
              position: 'right',
              interval: 10000,
              offset: 20,
              alignTicks: true,
              axisLine: {
                show: false,
              },
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#ffffff',
                  backgroundColor: colors[0],
                },
              },
              axisLabel: {
                color: '#cccccc',
              },
            }, {
              type: 'value',
              name: locate.uniqueUsers,
              nameTextStyle: {
                fontSize: 0,
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
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#ffffff',
                  backgroundColor: colors[1],
                },
              },
              axisLabel: {
                color: '#cccccc',
              },
            },
          ],
          series: [
            {
              name: locate.uniqueUsers,
              data: data.unique_users,
              type: 'bar',
              smooth: true,
              yAxisIndex: 1,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              barMaxWidth: 10,
              itemStyle: {
                borderRadius: [
                  4, 4, 0, 0,
                ],
              },
            }, {
              name: locate.amountTotal,
              data: data.amount,
              type: 'line',
              smooth: false,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              lineStyle: {
                width: 3,
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsFastUnstakeOnPolkadot();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsFastUnstakeOnPolkadot() {
        var newOptions = {};/**/

        if (window.innerWidth > 767) {
          newOptions = {
            grid: {
              left: '40px',
              right: '40px',
            },
            yAxis: [
              {
                offset: 20,
                axisLabel: {
                  formatter: '{value}',
                },
              }, {
                offset: 20,
                axisLabel: {
                  formatter: '{value}',
                },
              },
            ],
            xAxis: {
              splitNumber: 4,
            },
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
                  formatter: function(value) {
                    return NumberUtil.formatMoney(value);
                  },
                },
              }, {
                offset: 5,
                axisLabel: {
                  formatter: function(value) {
                    return NumberUtil.formatMoney(value);
                  },
                },
              },
            ],
            xAxis: {
              splitNumber: 2,
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsStakingRewardsByNominatorType(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              individual: [],
              pool: [],
            },
            colors = [
              '#437af0', '#df3f32',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.individual.push([
            jsonData[i].date, jsonData[i].individual,
          ]);
          data.pool.push([
            jsonData[i].date, jsonData[i].pool,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          }, //				tooltip: defaultTooltipSettings,
          tooltip: $.extend(true, {}, defaultTooltipStyle, {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              crossStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: 'rgba(255,255,255,0.3)',
              },
            },
            valueFormatter: function(value) {
              return value + ' DOT';
            },
          }),
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: '3%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              fontFamily: fontFamily,
              fontSize: 10,
              fontWeight: 500,
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.individual,
              position: 'left',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 100000,
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#000000',
                  backgroundColor: '#cccccc',
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            }, {
              type: 'value',
              name: locate.pool,
              position: 'right',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 1500,
              max: 4500,
              splitLine: {
                show: false,
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: defaultAxisPointerLabelSettings,
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
          ],
          series: [
            {
              name: locate.individual,
              data: data.individual,
              itemStyle: {
                color: colors[0],
              },
              type: 'line',
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            }, {
              name: locate.pool,
              data: data.pool,
              itemStyle: {
                color: colors[1],
              },
              type: 'line',
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsStakingRewardsByNominatorType();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsStakingRewardsByNominatorType() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions = {
            xAxis: {
              splitNumber: 5,
            },
          };
        } else {
          newOptions = {
            xAxis: {
              splitNumber: 3,
            },
          };

          if (window.innerWidth < 460) {
            $.extend(newOptions, {
              xAxis: {
                splitNumber: 2,
              },
              yAxis: [
                {
                  axisLabel: {
                    formatter: function(value) {
                      return value ? NumberUtil.formatMoney(value) : '0';
                    },
                  },
                }, {
                  axisLabel: {
                    formatter: function(value) {
                      return value ? NumberUtil.formatMoney(value) : '0';
                    },
                  },
                },
              ],
            });
          }
        }

        return newOptions;
      }

      function getChartOptionsActiveValidatorsNominatorCountsVersusSelfStakes(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              activeValidators: [],
            };

        for (var i = 0; i < totalItems; i++) {
          data.activeValidators.push([
            jsonData[i].validator_stake, jsonData[i].nominator_count,
          ]);
        }

        var baseOptions = {
          color: '#66e1b6',
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          }, //				tooltip: defaultTooltipSettings,
          tooltip: $.extend(true, {}, defaultTooltipSettings, {
            trigger: 'item',
            formatter: function(params) {
              return (
                  'Validator Self-Stake: ' + NumberUtil.formatWithCommas(params.value[params.encode.x[0]]) +
                  '<br /><div style="display: inline-block; width: 10px; height: 10px; background-color: rgba(102,225,182,0.7); margin-right: 8px; border-radius: 50%;"></div>' + params.value[params.encode.y[0]] + ' Nominators'
              );
            },
          }),
          legend: {
            show: false,
          },
          grid: {
            left: '8%',
            right: '8%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            name: locate.validatorSelfStake,
            nameLocation: 'middle',
            nameTextStyle: {
              fontFamily: fontFamily,
              fontSize: 13,
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 80,
            },
            axisLine: {
              show: false,
            },
            splitNumber: 4,
            interval: 200000,
            splitLine: {
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: {
              label: {
                color: '#000000',
                backgroundColor: '#cccccc',
              },
            },
            axisLabel: {
              color: '#cccccc',
              fontSize: 10,
            },
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
              lineHeight: 80,
            },
            axisLine: {
              show: false,
            },
            splitNumber: 4,
            interval: 100,
            splitLine: {
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: {
              label: {
                color: '#000000',
                backgroundColor: '#cccccc',
              },
            },
            axisLabel: {
              color: '#cccccc',
              fontSize: 10,
            },
          },
          series: [
            {
              data: data.activeValidators,
              itemStyle: {
                color: 'rgba(102,225,182,0.7)',
              },
              type: 'scatter',
              symbolSize: 6,
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsActiveValidatorsNominatorCounts();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartOptionsActiveValidatorsNominatorCountsVersusCommission(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              activeValidators: [],
            };

        for (var i = 0; i < totalItems; i++) {
          data.activeValidators.push([
            jsonData[i].validator_commission, jsonData[i].nominator_count,
          ]);
        }

        var baseOptions = {
          color: 'rgba(223,20,106,0.7)',
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: $.extend(true, {}, defaultTooltipSettings, {
            trigger: 'item',
            formatter: function(params) {
              return (
                  'Validator Commission: ' + NumberUtil.formatWithCommas(params.value[params.encode.x[0]]) + '%' +
                  '<br /><div style="display: inline-block; width: 10px; height: 10px; background-color: rgba(230,0,122,0.7); margin-right: 8px; border-radius: 50%;"></div>' + params.value[params.encode.y[0]] + ' Nominators'
              );
            },
          }),
          legend: {
            show: false,
          },
          grid: {
            left: '8%',
            right: '8%',
            top: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            name: locate.validatorCommission + ' (%)',
            nameLocation: 'middle',
            nameTextStyle: {
              fontFamily: fontFamily,
              fontSize: 13,
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 80,
            },
            axisLine: {
              show: false,
            },
            max: 100,
            splitNumber: 4,
            interval: 25,
            splitLine: {
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: {
              label: {
                color: '#000000',
                backgroundColor: '#cccccc',
                formatter: '{value}%',
              },
            },
            axisLabel: {
              formatter: '{value}%',
              color: '#cccccc',
              fontSize: 10,
            },
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
              lineHeight: 80,
            },
            axisLine: {
              show: false,
            },
            splitNumber: 4,
            interval: 100,
            splitLine: {
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: {
              label: {
                color: '#000000',
                backgroundColor: '#cccccc',
              },
            },
            axisLabel: {
              color: '#cccccc',
              fontSize: 10,
            },
          },
          series: [
            {
              data: data.activeValidators,
              itemStyle: {
                color: 'rgba(230,0,122,0.7)',
              },
              type: 'scatter',
              symbolSize: 6,
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsActiveValidatorsNominatorCounts();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsActiveValidatorsNominatorCounts() {
        var newOptions = {};

        if (window.innerWidth < 460) {
          $.extend(newOptions, {
            grid: {
              left: '15%',
              right: '5%',
              top: '3%', //bottom: 100, // DataZoom + Legend.
              containLabel: true,
            },
            xAxis: {
              axisLabel: {
                formatter: function(value) {
                  return value ? NumberUtil.formatMoney(value) : '0';
                },
              },
            },
            yAxis: {
              axisLabel: {
                formatter: function(value) {
                  return value ? NumberUtil.formatMoney(value) : '0';
                },
              },
            },
          });
        }

        return newOptions;
      }

      function getChartOptionsDotHolderDistribution(chartName) {
        var colors = [
              '#e6007a', '#ea5474', '#dfada5', '#8b93af',
            ],
            datasets = [
              {
                value: 882100431.73,
                name: 'Whale Account',
              }, {
                value: 262761103.82,
                name: 'Dolphin Account',
              }, {
                value: 216019833.44,
                name: 'Fish Account',
              }, {
                value: 2199443.81,
                name: 'Shrimp Account',
              },
            ],
            baseOptions = {
              color: colors,
              tooltip: false,
              legend: false,
              grid: {
                left: '0',
                right: '0',
                top: '0',
                containLabel: true,
              },
              series: [
                {
                  name: 'Polkadot Holder Distribution',
                  type: 'pie',
                  center: [
                    '45%', '45%',
                  ],
                  radius: [
                    '68%', '85%',
                  ],
                  avoidLabelOverlap: false,
                  label: {
                    show: false,
                    position: 'center',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontFamily: fontFamily,
                      color: '#ffffff',
                      fontSize: 17,
                      fontWeight: '500',
                      formatter: function(param) {
                        var value = NumberUtil.formatWithCommas(param.value);

                        return '{per|' + param.percent + '%}\n{b|' + param.name + '}\n{c|' + value + ' DOT' + '}';
                      },
                      rich: {
                        per: {
                          fontFamily: fontFamily,
                          fontWeight: 700,
                          fontSize: 27,
                          align: 'center',
                        },
                        b: {
                          fontFamily: fontFamily,
                          fontWeight: 500,
                          color: '#b1b1b1',
                          fontSize: 14,
                          align: 'center',
                          padding: [
                            10, 0, 10, 0,
                          ],
                        },
                        c: {
                          fontFamily: fontFamily,
                          fontWeight: 700,
                          color: '#ffffff',
                          fontSize: 15,
                          lineHeight: 26,
                          align: 'center',
                        },
                      },
                    },
                  },
                  labelLine: {
                    show: false,
                  },
                  data: datasets,
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsHolderDistribution();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsKsmHolderDistribution(chartName) {
        var colors = [
              '#004bff', '#118af5', '#22bffe', '#8b93af',
            ],
            datasets = [
              {
                value: 10098820.33,
                name: 'Whale Account',
              }, {
                value: 2187276.93,
                name: 'Dolphin Account',
              }, {
                value: 1763449.16,
                name: 'Fish Account',
              }, {
                value: 4295.64,
                name: 'Shrimp Account',
              },
            ],
            baseOptions = {
              color: colors,
              tooltip: false,
              legend: false,
              grid: {
                left: '0',
                right: '0',
                top: '0',
                containLabel: true,
              },
              series: [
                {
                  name: 'Polkadot And Kusama Holder Distribution',
                  type: 'pie',
                  center: [
                    '45%', '45%',
                  ],
                  radius: [
                    '68%', '85%',
                  ],
                  avoidLabelOverlap: false,
                  label: {
                    show: false,
                    position: 'center',
                  },
                  emphasis: {
                    label: {
                      show: true,
                      fontFamily: fontFamily,
                      color: '#ffffff',
                      fontSize: 17,
                      fontWeight: '500',
                      formatter: function(param) {
                        var value = NumberUtil.formatWithCommas(param.value);

                        return '{per|' + param.percent + '%}\n{b|' + param.name + '}\n{c|' + value + ' KSM' + '}';
                      },
                      rich: {
                        per: {
                          fontFamily: fontFamily,
                          fontWeight: 700,
                          color: '#ffffff',
                          fontSize: 27,
                          align: 'center',
                        },
                        b: {
                          fontFamily: fontFamily,
                          fontWeight: 500,
                          color: '#b1b1b1',
                          fontSize: 14,
                          align: 'center',
                          padding: [
                            10, 0, 10, 0,
                          ],
                        },
                        c: {
                          fontFamily: fontFamily,
                          fontWeight: 700,
                          color: '#ffffff',
                          fontSize: 15,
                          lineHeight: 26,
                          align: 'center',
                        },
                      },
                    },
                  },
                  labelLine: {
                    show: false,
                  },
                  data: datasets,
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsHolderDistribution();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsHolderDistribution() {
        var newOptions = {
          series: [
            {}, {},
          ],
        };

        if (window.innerWidth < 768) {
          newOptions['series'][0] = {
            center: [
              '50%', '50%',
            ],
            radius: [
              '70%', '90%',
            ],
            emphasis: {
              label: {
                rich: {
                  per: {
                    fontSize: 28,
                  },
                  b: {
                    fontSize: 17,
                  },
                  c: {
                    fontSize: 17,
                  },
                },
              },
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsPolkadotOpenGovReferenda(chartName) {
        var colors = [
          '#004bff', '#e12c29', '#f8b00c',
        ];
        var series = [
          {
            name: locate.approved,
            data: [
              2,
              9,
              1,
              2,
              1,
              2,
              12,
              3,
              3,
              31,
              8,
            ],
          }, {
            name: locate.notApproved,
            data: [
              4,
              1,
              0,
              1,
              0,
              0,
              9,
              13,
              12,
              28,
              5,
            ],
          }, {
            name: locate.pending,
            data: [
              1,
              0,
              0,
              0,
              0,
              0,
              0,
              0,
              1,
              7,
              3,
            ],
          },
        ];

        function genFormatter(series) {
          return (param) => {
            let sum = 0;
            series.forEach(item => {
              sum += item.data[param.dataIndex];
            });
            return sum;
          };
        }

        function isLastSeries(index) {
          return index === series.length - 1;
        }

        var baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '3%',
                right: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: [
                  'Root', 'Whitelisted Caller', 'Staking Admin', 'Treasurer', 'General Admin', 'Auction Admin', 'Small Tipper', 'Big Tipper', 'Small Spender', 'Medium Spender', 'Big Spender',
                ],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
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
                  color: '#cccccc',
                },
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
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  color: '#cccccc',
                },
              },
              series: series.map((item, index) => Object.assign(item, {
                type: 'bar',
                stack: true,
                label: {
                  show: isLastSeries(index) ? true : false,
                  formatter: genFormatter(series),
                  fontSize: 10,
                  color: '#ffffff',
                  position: 'top',
                },
                barMaxWidth: 20,
              })),
            },
            responsiveOptions = getChartResponsiveOptionsPolkadotOpenGovReferenda();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsKusamaOpenGovReferenda(chartName) {
        var colors = [
          '#004bff', '#e12c29', '#f8b00c',
        ];
        var series = [
          {
            name: locate.approved,
            data: [
              7, 29, 5, 11, 1, 0, 5, 6, 20, 8, 9, 38, 16,
            ],
          }, {
            name: locate.notApproved,
            data: [
              11, 9, 0, 4, 0, 2, 0, 1, 5, 2, 6, 25, 19,
            ],
          }, {
            name: locate.pending,
            data: [
              1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 5, 0,
            ],
          },
        ];

        function genFormatter(series) {
          return (param) => {
            let sum = 0;
            series.forEach(item => {
              sum += item.data[param.dataIndex];
            });
            return sum;
          };
        }

        function isLastSeries(index) {
          return index === series.length - 1;
        }

        var baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '3%',
                right: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: [
                  'Root', 'Whitelisted Caller', 'Staking Admin', 'Treasurer', 'Lease Admin', 'General Admin', 'Auction Admin', 'Referendum Canceller', 'Small Tipper', 'Big Tipper', 'Small Spender', 'Medium Spender', 'Big Spender',
                ],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
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
                  color: '#cccccc',
                },
              },
              yAxis: {
                type: 'value',
                alignTicks: true,
                axisLine: {
                  show: false,
                },
                interval: 20,
                splitNumber: 3,
                splitLine: {
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  color: '#cccccc',
                },
              },
              series: series.map((item, index) => Object.assign(item, {
                type: 'bar',
                stack: true,
                label: {
                  show: isLastSeries(index) ? true : false,
                  formatter: genFormatter(series),
                  fontSize: 10,
                  color: '#ffffff',
                  position: 'top',
                },
                barMaxWidth: 20,
              })),
            },
            responsiveOptions = getChartResponsiveOptionsPolkadotOpenGovReferenda();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsPolkadotOpenGovReferenda() {
        var newOptions = {};

        if (window.innerWidth < 768) {
          newOptions['series'] = [
            {
              label: {
                fontSize: 10,
              },
            }, {
              label: {
                fontSize: 10,
              },
            }, {
              label: {
                fontSize: 10,
              },
            },
          ];
        } else {
          newOptions['series'] = [
            {
              label: {
                fontSize: 10,
              },
            }, {
              label: {
                fontSize: 10,
              },
            }, {
              label: {
                fontSize: 10,
              },
            },
          ];
        }

        return newOptions;
      }

      function getChartOptionsOpenGovSupportByTrack(chartName) {
        var colors = [
              '#004dff',
              '#ffb800',
            ],
            data = [
              [
                'Root',
                'Whitelisted Caller',
                'Staking Admin',
                'Treasurer',
                'Lease Admin',
                'General Admin',
                'Auction Admin',
                'Referendum Canceller',
                'Small Tipper',
                'Big Tipper',
                'Small Spender',
                'Medium Spender',
                'Big Spender',
              ],
              [
                3.14,
                5.36,
                0.17,
                1.61,
                0.00,
                0.14,
                9.43,
                0.00,
                0.06,
                0.15,
                0.08,
                0.22,
                0.44,
              ],
              [
                2.91,
                6.30,
                4.40,
                1.05,
                12.19,
                0.20,
                11.04,
                3.96,
                0.11,
                0.19,
                0.31,
                0.26,
                0.42,
              ],
            ],
            baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: $.extend(true, {}, defaultTooltipSettings, {
                valueFormatter: function(value) {
                  return value + '%';
                },
                axisPointer: {
                  type: 'shadow',
                },
              }),
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '5%',
                right: '5%',
                bottom: '8%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: data[0],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
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
                  color: '#cccccc',
                },
              },
              yAxis: {
                type: 'value',
                offset: 0,
                alignTicks: true,
                axisLine: {
                  show: false,
                },
                max: 12.5,
                interval: 2.5,
                splitNumber: 4,
                splitLine: {
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: {
                  label: {
                    color: '#ffffff',
                    backgroundColor: colors[0],
                  },
                },
                axisLabel: {
                  fontSize: 10,
                  color: '#cccccc',
                  formatter: '{value}%',
                },
              },
              series: [
                {
                  name: locate.onDot,
                  data: data[1],
                  type: 'bar',
                  label: {
                    //                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors[0],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
                {
                  name: locate.onKsm,
                  data: data[2],
                  type: 'bar',
                  label: {
                    //                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[1],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsOpenGovSupportByTrack();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsOpenGovSupportByTrack() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions['series'] = [
            {
              label: {
                fontSize: 10,
              },
            },
            {
              label: {
                fontSize: 10,
              },
            },
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
          ];
        }

        return newOptions;
      }

      function getChartOptionsGovernanceOpenGovSpendPolkadot(chartName) {
        var colors = [
              '#df146a',
              '#ffb800',
            ],
            data = [
              [
                '47',
                '21',
                '8',
                '22',
                '6',
                '36',
                '5',
                '15',
                '20',
                '13',
              ],
              [
                540000.00,
                175419.00,
                120026.26,
                77500.00,
                75435.00,
                69786.00,
                61477.00,
                49880.00,
                41867.70,
                36969.00,
              ],
              [
                0.33,
                0.17,
                1.28,
                0.14,
                0.11,
                0.11,
                0.31,
                0.12,
                0.12,
                0.58,
              ],
            ],
            baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '5%',
                right: '5%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: data[0],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
                },
                axisLine: {
                  show: false,
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  fontFamily: fontFamily,
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#cccccc',
                },
              },
              yAxis: [
                {
                  type: 'value',
                  name: locate.supportRate,
                  nameTextStyle: {
                    fontSize: 0,
                  },
                  offset: 20,
                  position: 'right',
                  alignTicks: true,
                  axisLine: {
                    show: false,
                  },
                  interval: 0.5,
                  splitLine: {
                    lineStyle: {
                      type: [
                        4,
                        4,
                      ],
                      color: ['#262626'],
                    },
                  },
                  axisPointer: {
                    label: {
                      color: '#ffffff',
                      backgroundColor: colors[1],
                    },
                  },
                  axisLabel: {
                    fontFamily: fontFamily,
                    fontSize: 10,
                    color: '#cccccc',
                    formatter: '{value}%',
                  },
                },
                {
                  type: 'value',
                  name: locate.amountDot,
                  nameTextStyle: {
                    fontSize: 0,
                  },
                  offset: 20,
                  alignTicks: true,
                  axisLine: {
                    show: false,
                  },
                  interval: 200000,
                  splitLine: {
                    lineStyle: {
                      type: [
                        4,
                        4,
                      ],
                      color: ['#262626'],
                    },
                  },
                  axisPointer: {
                    label: {
                      color: '#ffffff',
                      backgroundColor: colors[0],
                    },
                  },
                  axisLabel: {
                    fontFamily: fontFamily,
                    fontSize: 10,
                    color: '#cccccc',
                  },
                },
              ],
              series: [
                {
                  name: locate.amountDot,
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
                      0,
                    ],
                  },
                },
                {
                  name: locate.supportRate,
                  data: data[2],
                  type: 'line',
                  label: {
                    show: true,
                    fontFamily: fontFamily,
                    fontWeight: 700,
                    fontSize: 10,
                    position: 'top',
                    color: colors[1],
                    formatter: '{c}%',
                  },
                  smooth: false,
                  showSymbol: true,
                  symbolSize: 16,
                  symbol: 'image://data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABdUExURQAAAP+qANuSJP+qAOuxFPWtCv+tCvauCfauDfuuCfuzDfKwDfawDfevDPmuCfyuDPavDPmvDPatDPavC/mvC/ivDP7ouvznufzouf7sxv7txfzrxf/9+f/++f///0T4C/MAAAAedFJOUwAGBwwNGRk5OTk5OjpAUlJTU1RZWWays7O8vL319RU/hDMAAAB0SURBVBgZVcGBFkJAEAXQN0hot1a8Usz+/2eaORyHe+FuYSBTLLGRhrtOYKTnIQmAhicdUPKiRqSbVP90D7xo5mwmmhF0ms1CBzrNZqHDSPPN5kfT4043q37oImpeVEDLkwBAEg/vAkZa7kKBTRWf5BBqmBU2SxFbD9KnZQAAAABJRU5ErkJggg==',
                  emphasis: {
                    focus: 'series',
                  },
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsGovernanceOpenGovSpend();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsGovernanceOpenGovSpendKusama(chartName) {
        var colors = [
              '#0056fe',
              '#ffb800',
            ],
            data = [
              [
                '51',
                '236',
                '21',
                '22',
                '77',
                '212',
                '109',
                '124',
                '107',
                '29',
              ],
              [
                52000.00,
                50000.00,
                25132.66,
                22089.00,
                9373.05,
                9078.70,
                6918.88,
                6533.71,
                6443.00,
                5956.88,
              ],
              [
                1.81,
                0.31,
                4.49,
                2.08,
                0.23,
                0.62,
                0.32,
                0.31,
                0.19,
                0.20,
              ],
            ],
            baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '5%',
                right: '5%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: data[0],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
                },
                axisLine: {
                  show: false,
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  fontFamily: fontFamily,
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#cccccc',
                },
              },
              yAxis: [
                {
                  type: 'value',
                  name: locate.supportRate,
                  nameTextStyle: {
                    fontSize: 0,
                  },
                  offset: 20,
                  position: 'right',
                  alignTicks: true,
                  axisLine: {
                    show: false,
                  },
                  interval: 2,
                  max: 6,
                  splitLine: {
                    lineStyle: {
                      type: [
                        4,
                        4,
                      ],
                      color: ['#262626'],
                    },
                  },
                  axisPointer: {
                    label: {
                      color: '#ffffff',
                      backgroundColor: colors[1],
                    },
                  },
                  axisLabel: {
                    fontFamily: fontFamily,
                    fontSize: 10,
                    color: '#cccccc',
                    formatter: '{value}%',
                  },
                },
                {
                  type: 'value',
                  name: locate.amountKsm,
                  nameTextStyle: {
                    fontSize: 0,
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
                        4,
                      ],
                      color: ['#262626'],
                    },
                  },
                  axisPointer: {
                    label: {
                      color: '#ffffff',
                      backgroundColor: colors[0],
                    },
                  },
                  axisLabel: {
                    fontFamily: fontFamily,
                    fontSize: 10,
                    color: '#cccccc',
                  },
                },
              ],
              series: [
                {
                  name: locate.amountKsm,
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
                      0,
                    ],
                  },
                },
                {
                  name: locate.supportRate,
                  data: data[2],
                  type: 'line',
                  label: {
                    show: true,
                    fontFamily: fontFamily,
                    fontWeight: 700,
                    fontSize: 10,
                    position: 'top',
                    color: colors[1],
                    formatter: '{c}%',
                  },
                  smooth: false,
                  showSymbol: true,
                  symbolSize: 16,
                  symbol: 'image://data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABdUExURQAAAP+qANuSJP+qAOuxFPWtCv+tCvauCfauDfuuCfuzDfKwDfawDfevDPmuCfyuDPavDPmvDPatDPavC/mvC/ivDP7ouvznufzouf7sxv7txfzrxf/9+f/++f///0T4C/MAAAAedFJOUwAGBwwNGRk5OTk5OjpAUlJTU1RZWWays7O8vL319RU/hDMAAAB0SURBVBgZVcGBFkJAEAXQN0hot1a8Usz+/2eaORyHe+FuYSBTLLGRhrtOYKTnIQmAhicdUPKiRqSbVP90D7xo5mwmmhF0ms1CBzrNZqHDSPPN5kfT4043q37oImpeVEDLkwBAEg/vAkZa7kKBTRWf5BBqmBU2SxFbD9KnZQAAAABJRU5ErkJggg==',
                  emphasis: {
                    focus: 'series',
                  },
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsGovernanceOpenGovSpend();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsGovernanceOpenGovSpend() {
        var newOptions = {};

        if (window.innerWidth < 768) {
          newOptions['series'] = [
            {
              label: {
                fontSize: 10,
              },
            },
            {
              label: {
                fontSize: 10,
              },
            },
          ];
          newOptions['yAxis'] = [
            {
              axisLabel: {
                formatter: '{value}%',
              },
            },
            {
              axisLabel: {
                formatter: function(value) {
                  return NumberUtil.formatMoney(value);
                },
              },
            },
          ];
        } else {
          newOptions['series'] = [
            {
              label: {
                fontSize: 10,
              },
            },
            {
              label: {
                fontSize: 10,
              },
            },
          ];
          newOptions['yAxis'] = [
            {
              axisLabel: {
                formatter: '{value}%',
              },
            },
            {
              axisLabel: {
                formatter: '{value}',
              },
            },
          ];
        }

        return newOptions;
      }

      function getChartOptionsGovernanceWeb3FoundationGrants(chartName) {
        var colors = [
              '#0056fe',
              '#f82613',
              '#ffb800',
              '#24f483',
              '#e4560a',
              '#00e7e7',
            ],
            data = [
              [
                'Chains & Pallets',
                'Smart Contracts',
                'Tools, APIs, & \nLanguages',
                'User Interface',
                'Research',
                'Wallets',
              ],
              [
                20,
                1,
                4,
                3,
                1,
                0,
              ],
              [
                12,
                6,
                3,
                6,
                1,
                3,
              ],
              [
                14,
                8,
                8,
                6,
                2,
                1,
              ],
              [
                12,
                0,
                16,
                6,
                3,
                1,
              ],
              [
                15,
                7,
                10,
                7,
                4,
                1,
              ],
              [
                7,
                12,
                6,
                8,
                1,
                1,
              ],
            ],
            baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '5%',
                right: '5%',
                bottom: '8%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: data[0],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
                },
                axisLine: {
                  show: false,
                },
                axisPointer: defaultAxisPointerLabelSettings,
              },
              yAxis: {
                type: 'value',
                offset: 0,
                alignTicks: true,
                axisLine: {
                  show: false,
                },
                max: 25,
                interval: 5,
                splitNumber: 4,
                splitLine: {
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: {
                  label: {
                    color: '#ffffff',
                    backgroundColor: colors[0],
                  },
                },
                axisLabel: {
                  fontSize: 10,
                  color: '#cccccc',
                },
              },
              series: [
                {
                  name: locate.q12022,
                  data: data[1],
                  type: 'bar',
                  label: {
                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[0],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
                {
                  name: locate.q22022,
                  data: data[2],
                  type: 'bar',
                  label: {
                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[1],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
                {
                  name: locate.q32022,
                  data: data[3],
                  type: 'bar',
                  label: {
                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[2],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
                {
                  name: locate.q42022,
                  data: data[4],
                  type: 'bar',
                  label: {
                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[3],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
                {
                  name: locate.q12023,
                  data: data[5],
                  type: 'bar',
                  label: {
                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[4],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
                {
                  name: locate.q22023,
                  data: data[6],
                  type: 'bar',
                  label: {
                    show: true,
                    position: 'top',
                    fontFamily: fontFamily,
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors[5],
                  },
                  barMaxWidth: 28,
                  itemStyle: {
                    borderRadius: [
                      3,
                      3,
                      0,
                      0,
                    ],
                  },
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsGovernanceWeb3FoundationGrants();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsGovernanceWeb3FoundationGrants() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions['xAxis'] = {
            axisLabel: {
              hideOverlap: false,
              showMaxLabel: true,
              overflow: 'breakAll',
              fontFamily: fontFamily,
              fontSize: 12,
              lineHeight: 16,
              fontWeight: 500,
              color: '#cccccc',
            },
          };
        } else {
          newOptions['xAxis'] = {
            axisLabel: {
              hideOverlap: false,
              showMaxLabel: true,
              overflow: 'breakAll',
              rotate: -45,
              align: 'left',
              fontFamily: fontFamily,
              fontSize: 10,
              fontWeight: 500,
              color: '#cccccc',
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsParachainXcmTransfers(chartName) {
        var colors = [
          '#0056fe',
          '#24f483',
          '#ffb800',
          '#f82613',
        ];
        var series = [
          {
            name: locate.pre2023,
            data: [
              23,
              2230,
              38,
              5395,
              4335,
              1469,
              3408,
              697,
              3213,
              2064,
              884,
              2427,
              1544,
              2320,
              2182,
              769,
            ],
          }, {
            name: locate.q12023,
            data: [
              33,
              2789,
              24,
              1643,
              1846,
              2143,
              1637,
              1293,
              1296,
              1117,
              3052,
              1037,
              1048,
              887,
              641,
              1327,
            ],
          }, {
            name: locate.q22023,
            data: [
              332,
              1446,
              115,
              724,
              751,
              1245,
              627,
              1200,
              406,
              1061,
              663,
              733,
              760,
              797,
              530,
              1158,
            ],
          },
          {
            name: locate.q32023,
            data: [
              9512,
              2547,
              8394,
              364,
              258,
              2120,
              356,
              1985,
              251,
              574,
              249,
              405,
              680,
              508,
              890,
              982,
            ],
          },
        ];

        function genFormatter(series) {
          return (param) => {
            let sum = 0;
            series.forEach(item => {
              sum += item.data[param.dataIndex];
            });

            sum = NumberUtil.formatWithCommas(sum);

            return sum;
          };
        }

        function isLastSeries(index) {
          return index === series.length - 1;
        }

        var baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '3%',
                right: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: [
                  'Karura -> Calamari',
                  'Bifrost-Kusama -> Moonriver',
                  'Calamari -> Karura',
                  'Moonbeam -> Acala',
                  'Acala -> Moonbeam',
                  'Moonriver -> Bifrost-Kusama',
                  'Bifrost-Kusama -> Karura',
                  'Bifrost-Polkadot -> Moonbeam',
                  'Karura -> Bifrost-Kusama',
                  'Acala -> Parallel',
                  'Invarch tinkernet -> Basilisk',
                  'Interlay -> Moonbeam',
                  'Parallel -> Acala',
                  'Moonbeam -> Interlay',
                  'Kintsugi -> Karura',
                  'Moonbeam -> Bifrost-Polkadot',
                ],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
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
                  color: '#cccccc',
                },
              },
              yAxis: {
                type: 'value',
                alignTicks: true,
                axisLine: {
                  show: false,
                },
                interval: 2500,
                splitNumber: 4,
                splitLine: {
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  color: '#cccccc',
                },
              },
              series: series.map((item, index) => Object.assign(item, {
                type: 'bar',
                stack: true,
                label: {
                  show: isLastSeries(index) ? true : false,
                  formatter: genFormatter(series),
                  color: '#ffffff',
                  position: 'top',
                  lineHeight: 16,
                },
                barMaxWidth: 32,
                itemStyle: {
                  borderRadius: isLastSeries(index) ? [
                    4,
                    4,
                    0,
                    0,
                  ] : [
                    0,
                    0,
                    0,
                    0,
                  ],
                },
              })),
            },
            responsiveOptions = getChartResponsiveOptionsParachainXcm();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsParachainXcmChannels(chartName) {
        var colors = [
          '#5c42fb',
          '#00fefe',
          '#faff00',
          '#df146a',
        ];
        var series = [
          {
            name: locate.pre2023,
            data: [
              21627,
              15958,
              19,
              6418,
              5396,
              1443,
              2514,
              1900,
              816,
              2805,
              2457,
              3116,
              754,
            ],
          }, {
            name: locate.q12023,
            data: [
              2327,
              2167,
              21,
              1851,
              2136,
              2514,
              1585,
              1390,
              3051,
              704,
              1187,
              812,
              1325,
            ],
          }, {
            name: locate.q22023,
            data: [
              256,
              534,
              90,
              574,
              1001,
              1205,
              1252,
              922,
              651,
              508,
              653,
              256,
              1089,
            ],
          },
          {
            name: locate.q32023,
            data: [
              124,
              197,
              9739,
              205,
              176,
              1588,
              310,
              692,
              251,
              401,
              29,
              72,
              942,
            ],
          },
        ];

        function genFormatter(series) {
          return (param) => {
            let sum = 0;
            series.forEach(item => {
              sum += item.data[param.dataIndex];
            });

            sum = NumberUtil.formatWithCommas(sum);

            return sum;
          };
        }

        function isLastSeries(index) {
          return index === series.length - 1;
        }

        var baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: defaultTooltipSettings,
              legend: defaultLegendSettings,
              grid: {
                top: '5%',
                left: '3%',
                right: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'category',
                data: [
                  'Bifrost-Kusama -> Karura',
                  'Karura -> Bifrost-Kusama',
                  'Calamari -> Karura',
                  'Moonbeam -> Acala',
                  'Acala -> Moonbeam',
                  'Moonriver -> Bifrost-Kusama',
                  'Acala -> Parallel',
                  'Parallel -> Acala',
                  'Invarch Tinkernet -> Basilisk',
                  'Karura -> Statemine',
                  'Interlay -> Moonbeam',
                  'Kintsugi -> Moonriver',
                  'Moonbeam -> Bifrost-Polkadot',
                ],
                splitLine: {
                  show: false,
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisTick: {
                  show: false,
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
                  color: '#cccccc',
                },
              },
              yAxis: {
                type: 'value',
                alignTicks: true,
                axisLine: {
                  show: false,
                },
                interval: 5000,
                splitNumber: 4,
                splitLine: {
                  lineStyle: {
                    type: [
                      4, 4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  color: '#cccccc',
                },
              },
              series: series.map((item, index) => Object.assign(item, {
                type: 'bar',
                stack: true,
                label: {
                  show: isLastSeries(index) ? true : false,
                  formatter: genFormatter(series),
                  color: '#ffffff',
                  position: 'top',
                  lineHeight: 16,
                },
                barMaxWidth: 32,
                itemStyle: {
                  borderRadius: isLastSeries(index) ? [
                    4,
                    4,
                    0,
                    0,
                  ] : [
                    0,
                    0,
                    0,
                    0,
                  ],
                },
              })),
            },
            responsiveOptions = getChartResponsiveOptionsParachainXcm();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsParachainXcm() {
        var newOptions = {};

        if (window.innerWidth < 768) {
          newOptions['series'] = [
            {
              label: {
                fontSize: 0,
              },
            },
            {
              label: {
                fontSize: 0,
              },
            },
            {
              label: {
                fontSize: 0,
              },
            },
          ];
        } else if (window.innerWidth < 992) {
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
            },
          ];
        } else {
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
            },
          ];
        }

        return newOptions;
      }

      function getChartOptionsParachainXcmV3(chartName) {
        var colors = [
              '#ffb800',
              '#00e7e7',
              '#8b93af',
              '#960db9',
              '#f13221',
              '#5c42fb',
              '#ff279a',
              '#118af5',
              '#ea5474',
              '#ec66ef',
              '#8247e5',
              '#dfada5',
              '#cccccc',
            ],
            datasets = [
              {
                value: 6042,
                name: 'Moonriver',
                label: {
                  color: colors[0],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 4743,
                name: 'Bifrost-Kusama',
                label: {
                  color: colors[1],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 3155,
                name: 'Asset Hub-Kusama',
                label: {
                  color: colors[2],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 3113,
                name: 'Moonbeam',
                label: {
                  color: colors[3],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 2265,
                name: 'Karura',
                label: {
                  color: colors[4],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1878,
                name: 'Kintsugi',
                label: {
                  color: colors[5],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1855,
                name: 'Asset Hub-Polkadot',
                label: {
                  color: colors[6],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1772,
                name: 'Astar',
                label: {
                  color: colors[7],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1658,
                name: 'HydraDX',
                label: {
                  color: colors[8],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1578,
                name: 'Turing',
                label: {
                  color: colors[9],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1396,
                name: 'Interlay',
                label: {
                  color: colors[10],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1250,
                name: 'Bifrost-Polkadot',
                label: {
                  color: colors[11],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 4355,
                name: 'Others',
                label: {
                  color: colors[12],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
            ],
            baseOptions = {
              color: colors,
              tooltip: $.extend(true, {}, defaultTooltipStyle, {
                trigger: 'item',
                valueFormatter: function(value) {
                  return NumberUtil.formatWithCommas(value);
                },
              }),
              legend: $.extend(true, {}, defaultLegendSettings, {
                show: false,
              }),
              grid: {
                left: '3%',
                right: '3%',
                top: '0',
                containLabel: true,
              },
              series: [
                {
                  startAngle: 80,
                  name: '',
                  type: 'pie',
                  center: [
                    '50%',
                    '45%',
                  ],
                  radius: [
                    '45%',
                    '65%',
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
                    formatter: function(params) {
                      return `${params.name} ${params.percent}%`;
                    },
                  },
                  labelLine: {
                    showAbove: false,
                    length: 30,
                    length2: 0,
                    lineStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                        {
                          offset: 0,
                          color: 'rgba(255,255,255,0)',

                        },
                        {
                          offset: 1,
                          color: '#ffffff',
                        },
                      ]),
                    },
                    maxSurfaceAngle: 80,
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
                    borderWidth: 2,
                  },
                  emphasis: {
                    scaleSize: 5,
                  },
                  data: datasets,
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsParachain();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsParachainChainFees(chartName) {
        var colors = [
              '#004dff',
              '#8247e5',
              '#00e7e7',
              '#89c900',
              '#dfada5',
              '#118af5',
              '#f13221',
              '#e6007a',
              '#b1b1b1',
            ],
            datasets = [
              {
                value: 123842.92,
                name: 'Encointer',
                label: {
                  color: colors[0],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 21986.35,
                name: 'Calamari',
                label: {
                  color: colors[1],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 6139.35,
                name: 'Khala',
                label: {
                  color: colors[2],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 4418.19,
                name: 'Phala',
                label: {
                  color: colors[3],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                      {
                        offset: 0,
                        color: '#ffffff',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1444.98,
                name: 'Bifrost Kusama',
                label: {
                  color: colors[4],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1204.55,
                name: 'Astar',
                label: {
                  color: colors[5],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 548.48,
                name: 'Acala',
                label: {
                  color: colors[6],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 400.55,
                name: 'Pioneer',
                label: {
                  color: colors[7],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
              {
                value: 1040.19,
                name: 'Others',
                label: {
                  color: colors[8],
                },
                labelLine: {
                  lineStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                      {
                        offset: 0,
                        color: '#ffffff',

                      },
                      {
                        offset: 1,
                        color: 'rgba(255,255,255,0)',
                      },
                    ]),
                  },
                },
              },
            ],
            baseOptions = {
              color: colors,
              tooltip: $.extend(true, {}, defaultTooltipStyle, {
                trigger: 'item',
                valueFormatter: function(value) {
                  return '$' + NumberUtil.formatWithCommas(value);
                },
              }),
              legend: $.extend(true, {}, defaultLegendSettings, {
                show: false,
              }),
              grid: {
                left: '3%',
                right: '3%',
                top: '0',
                containLabel: true,
              },
              series: [
                {
                  startAngle: 80,
                  name: '',
                  type: 'pie',
                  center: [
                    '50%',
                    '45%',
                  ],
                  radius: [
                    '45%',
                    '65%',
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
                    formatter: function(params) {
                      return `${params.name} ${params.percent}%`;
                    },
                  },
                  labelLine: {
                    showAbove: false,
                    length: 30,
                    length2: 0,
                    lineStyle: {
                      color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                        {
                          offset: 0,
                          color: 'rgba(255,255,255,0)',

                        },
                        {
                          offset: 1,
                          color: '#ffffff',
                        },
                      ]),
                    },
                    maxSurfaceAngle: 80,
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
                    borderWidth: 2,
                  },
                  emphasis: {
                    scaleSize: 5,
                  },
                  data: datasets,
                },
              ],
            },
            responsiveOptions = getChartResponsiveOptionsParachain();

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsParachain() {
        var newOptions = {
          series: [
            {},
            {},
          ],
        };

        if (window.innerWidth < 768) {
          newOptions['legend'] = defaultLegendSettings;
          newOptions['series'][0] = {
            label: {
              fontSize: 11,
              lineHeight: 24,
              formatter: function(params) {
                return `${params.percent}%`;
              },
            },
            labelLine: {
              length: 5,
            },
          };
        } else {
          newOptions['legend'] = {
            show: false,
          };
          newOptions['series'][0] = {
            label: {
              fontSize: 16,
              lineHeight: 30,
              formatter: function(params) {
                return `${params.name} ${params.percent}%`;
              },
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsDefiParachain(chartName, jsonData) {
        var datasets = [
              {
                name: 'acala',
                label: 'Acala',
              },
              {
                name: 'astar',
                label: 'Astar',
              },
              {
                name: 'moonbeam',
                label: 'Moonbeam',
              },
              {
                name: 'parallel',
                label: 'Parallel',
              },
              {
                name: 'hydradx',
                label: 'HydraDX',
              },
            ],
            colors = [
              '#89c900',
              '#ffb800',
              '#004bff',
              '#f82613',
              '#00e7e7',
            ],
            chartExtraOptions = {
              yAxis: {
                interval: 20000000,
              },
            };

        var baseOptions = getChartLinesBaseOptions(jsonData, datasets, colors, null, null, chartExtraOptions);
        var responsiveOptions = getChartLinesBaseResponsiveOptions(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

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

      function getChartOptionsTotalStakeTotalMembersInPolkadotNominationPools( chartName, jsonData ) {
        var totalItems = jsonData.length,
            data = {
              total_members: [],
              total_stake: [],
            },
            colors = [
              '#004dff',
              '#ff279a'
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
              alignTicks: true,
              axisLine: {
                show: false,
              },
              interval: 5000,
              max: 20000,
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
            {
              type: 'value',
              name: locate.totalPoolsMembers,
              nameTextStyle: {
                fontSize: 0
              },
              position: 'right',
              interval: 2000000,
              max: 8000000,
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
              name: locate.totalPoolsMembers,
              data: data.total_members,
              type: 'bar',
              showSymbol: false,
              emphasis: {
                focus: 'series'
              }
            },
            {
              name: locate.totalPoolsStake,
              data: data.total_stake,
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
        var responsiveOptions = getChartResponsiveOptionsTotalStakeTotalMembersInPolkadotNominationPools();

        $.extend( true, baseOptions, responsiveOptions );

        return baseOptions;
      }

      function getChartResponsiveOptionsTotalStakeTotalMembersInPolkadotNominationPools() {
        var newOptions = {};

        if ( window.innerWidth > 767 ) {
          newOptions = {
            grid: {
              left: '40px',
              right: '40px',
            },
            yAxis: [
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
            ],
            xAxis: {
              splitNumber: 3,
              axisLabel: {
                formatter: dateShortFormatter
              }
            }
          };
        }

        return newOptions;
      }

      function getChartOptionsDefiDexPolkadot(chartName, jsonData) {
        var datasets = [
              {
                name: 'arthswap',
                label: 'Arthswap',
              },
              {
                name: 'avault',
                label: 'Avault',
              },
              {
                name: 'beamswap',
                label: 'Beamswap',
              },
              {
                name: 'parallel',
                label: 'Parallel',
              },
              {
                name: 'stellaswap',
                label: 'Stellaswap',
              },
              {
                name: 'hydradx',
                label: 'HydraDX',
              },
            ],
            colors = [
              '#004bff',
              '#f82613',
              '#ffb800',
              '#89c900',
              '#ff279a',
              '#dfada5',
            ],
            chartExtraOptions = {
              yAxis: {
                interval: 5000000,
              },
            };

        var baseOptions = getChartLinesBaseOptions(jsonData, datasets, colors, null, null, chartExtraOptions);
        var responsiveOptions = getChartLinesBaseResponsiveOptions(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsDefiDexKusama(chartName, jsonData) {
        var datasets = [
              {
                name: 'solarbeam',
                label: 'Solarbeam',
              },
              {
                name: 'bifrost',
                label: 'Bifrost',
              },
              {
                name: 'karura_swap',
                label: 'Karura Swap',
              },
              {
                name: 'sushiswap',
                label: 'SushiSwap On Moonriver',
              },
              {
                name: 'zenlink',
                label: 'Zenlink On Moonriver',
              },
              {
                name: 'moonswap',
                label: 'Moonswap',
              },
            ],
            colors = [
              '#004bff',
              '#f82613',
              '#ffb800',
              '#89c900',
              '#e4560a',
              '#66e1b6',
            ],
            chartExtraOptions = {
              yAxis: {
                interval: 2000000,
              },
            };

        var baseOptions = getChartLinesBaseOptions(jsonData, datasets, colors, null, null, chartExtraOptions);
        var responsiveOptions = getChartLinesBaseResponsiveOptions(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsDefiLending(chartName, jsonData) {
        var datasets = [
              {
                name: 'acala',
                label: 'Acala',
              },
              {
                name: 'astriddao',
                label: 'Astriddao',
              },
              {
                name: 'moonwell',
                label: 'Moonwell',
              },
              {
                name: 'parallel',
                label: 'Parallel',
              },
              {
                name: 'starlay',
                label: 'Starlay',
              },
            ],
            colors = [
              '#004bff',
              '#f82613',
              '#ffb800',
              '#89c900',
              '#66e1b6',
            ],
            chartExtraOptions = {
              yAxis: {
                interval: 10000000,
              },
            };

        var baseOptions = getChartLinesBaseOptions(jsonData, datasets, colors, null, null, chartExtraOptions);
        var responsiveOptions = getChartLinesBaseResponsiveOptions(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsDefiLiquidStaking(chartName, jsonData) {
        var datasets = [
              {
                name: 'acala',
                label: 'Acala',
              },
              {
                name: 'bifrost',
                label: 'Bifrost',
              },
              {
                name: 'parallel',
                label: 'Parallel',
              },
            ],
            colors = [
              '#004bff',
              '#f82613',
              '#ffb800',
            ],
            chartExtraOptions = {
              yAxis: {
                interval: 5000000,
              },
            };

        var baseOptions = getChartLinesBaseOptions(jsonData, datasets, colors, null, null, chartExtraOptions);
        var responsiveOptions = getChartLinesBaseResponsiveOptions(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsDefiUsdtSupply(chartName, jsonData) {
        var datasets = [
              {
                name: 'asset_hub_ksm',
                label: 'Asset Hub-Kusama',
              },
              {
                name: 'asset_hub_dot',
                label: 'Asset Hub-Polkadot',
              },
            ],
            colors = [
              '#004bff',
              '#ff279a',
            ],
            chartExtraOptions = {
              yAxis: {
                interval: 5000000,
              },
            };

        var baseOptions = getChartLinesBaseOptions(jsonData, datasets, colors, null, null, chartExtraOptions);
        var responsiveOptions = getChartLinesBaseResponsiveOptions(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartOptionsDefiUsdtPolkadot(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              transferCount: [],
              transferAmount: [],
              holderCount: [],
            },
            colors = [
              '#004bff',
              '#e12c29',
              '#ffb800',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.transferCount.push([
            jsonData[i].date,
            jsonData[i].transfer_count,
          ]);
          data.transferAmount.push([
            jsonData[i].date,
            jsonData[i].transfer_amount,
          ]);
          data.holderCount.push([
            jsonData[i].date,
            jsonData[i].holder_count,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: '3%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: [
                  4,
                  4,
                ],
                color: ['#262626'],
              },
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
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.transferAmount,
              position: 'left',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 5000000,
              splitLine: {
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#000000',
                  backgroundColor: '#cccccc',
                  formatter: '${value}',
                },
              },
              axisLabel: {
                formatter: '${value}',
                color: '#cccccc',
                fontSize: 10,
              },
            },
            {
              type: 'value',
              name: locate.count,
              position: 'right',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 200,
              splitLine: {
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: defaultAxisPointerLabelSettings,
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
          ],
          series: [
            {
              name: locate.transferCount,
              data: data.transferCount,
              itemStyle: {
                color: colors[0],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
            {
              name: locate.transferAmount,
              data: data.transferAmount,
              itemStyle: {
                color: colors[1],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
            {
              name: locate.holderCount,
              data: data.holderCount,
              itemStyle: {
                color: colors[2],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsDefiUsdt();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartOptionsDefiUsdtKusama(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              transferCount: [],
              transferAmount: [],
              holderCount: [],
            },
            colors = [
              '#004bff',
              '#e12c29',
              '#ffb800',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.transferCount.push([
            jsonData[i].date,
            jsonData[i].transfer_count,
          ]);
          data.transferAmount.push([
            jsonData[i].date,
            jsonData[i].transfer_amount,
          ]);
          data.holderCount.push([
            jsonData[i].date,
            jsonData[i].holder_count,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: '3%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: [
                  4,
                  4,
                ],
                color: ['#262626'],
              },
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
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.transferAmount,
              position: 'left',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 500000,
              max: 2500000,
              splitLine: {
                show: false,
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#000000',
                  backgroundColor: '#cccccc',
                  formatter: '${value}',
                },
              },
              axisLabel: {
                formatter: '${value}',
                color: '#cccccc',
                fontSize: 10,
              },
            },
            {
              type: 'value',
              name: locate.count,
              position: 'right',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 150,
              splitLine: {
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: defaultAxisPointerLabelSettings,
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
          ],
          series: [
            {
              name: locate.transferCount,
              data: data.transferCount,
              itemStyle: {
                color: colors[0],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
            {
              name: locate.transferAmount,
              data: data.transferAmount,
              itemStyle: {
                color: colors[1],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
            {
              name: locate.holderCount,
              data: data.holderCount,
              itemStyle: {
                color: colors[2],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsDefiUsdt();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsDefiUsdt() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions = {
            xAxis: {
              splitNumber: 3,
            },
          };
        } else {
          newOptions = {
            tooltip: {
              trigger: 'axis',
            },
            xAxis: {
              splitNumber: 2,
            },
          };

          if (window.innerWidth < 660) {
            $.extend(newOptions, {
              xAxis: {
                splitNumber: 2,
              },
              yAxis: [
                {
                  axisPointer: {
                    label: {
                      formatter: '${value}',
                    },
                  },
                  axisLabel: {
                    formatter: function(value) {
                      return value ? '$' + NumberUtil.formatMoney(value) : '-';
                    },
                  },
                },
                {
                  axisPointer: {
                    label: {
                      formatter: '{value}',
                    },
                  },
                  axisLabel: {
                    formatter: function(value) {
                      return value ? NumberUtil.formatMoney(value) : '-';
                    },
                  },
                },
              ],
            });
          }
        }

        return newOptions;
      }

      function getChartOptionsNftMarketplace(chartName, jsonData) {
        var datasets = [
              {
                name: 'sdn_on_tofu',
                label: 'SDN On tofuNFT',
              },
              {
                name: 'glmr_on_tofu',
                label: 'GLMR On tofuNFT',
              },
              {
                name: 'astr_on_tofu',
                label: 'ASTR On tofuNFT',
              },
              {
                name: 'glmr_on_nftrade',
                label: 'GLMR On NFTrade',
              },
              {
                name: 'movr_on_moonbeans',
                label: 'MOVR On Moonbeans',
              },
              {
                name: 'glmr_on_moonbeans',
                label: 'GLMR On Moonbeans',
              },
              {
                name: 'ksm_on_singular',
                label: 'KSM On Singular',
              },
            ],
            colors = [
              '#429df4',
              '#4ccbc9',
              '#ff6b00',
              '#9ee542',
              '#ffb800',
              '#f13221',
              '#004bff',
            ],
            totalItems = jsonData.length,
            data = [],
            chartSeries = [];

        datasets.forEach(function(dataset) {
          data[dataset.name] = [];
        });

        for (var i = 0; i < totalItems; i++) {
          datasets.forEach(function(dataset) {
            var value = jsonData[i][dataset.name] ? NumberUtil.validate(jsonData[i][dataset.name]) : '';
            data[dataset.name].push([
              jsonData[i].date,
              value,
            ]);
          });
        }

        datasets.forEach(function(dataset, index) {
          var dataSetOptions = {
            name: dataset.label,
            data: data[dataset.name],
            itemStyle: {
              color: colors[index],
            },
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series',
            },
          };

          if (dataset.hasOwnProperty('options')) {
            $.extend(true, dataSetOptions, dataset.options);
          }

          chartSeries.push(dataSetOptions);
        });

        var baseOptions = {
              color: colors,
              textStyle: {
                fontFamily: fontFamily,
                fontWeight: 500,
              },
              tooltip: $.extend(true, {}, defaultTooltipSettings, {
                valueFormatter: function(value) {
                  return '$' + value;
                },
              }),
              legend: $.extend(true, {}, defaultLegendSettings, {
                textStyle: {
                  fontFamily: fontFamily,
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: '500',
                  padding: [
                    3, 0, 0, 0,
                  ],
                },
              }),
              grid: {
                left: '3%',
                right: '3%',
                top: '3%',
                containLabel: true,
              },
              xAxis: {
                type: 'time',
                boundaryGap: false,
                axisTick: {
                  show: false,
                },
                axisLine: {
                  show: false,
                },
                splitLine: {
                  show: false,
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  margin: 12,
                  color: '#cccccc',
                  formatter: dateFormatter,
                },
              },
              yAxis: {
                type: 'value',
                axisLine: {
                  show: false,
                },
                splitNumber: 4,
                interval: 2500,
                max: 12500,
                splitLine: {
                  show: true,
                  lineStyle: {
                    type: [
                      4,
                      4,
                    ],
                    color: ['#262626'],
                  },
                },
                axisPointer: defaultAxisPointerLabelSettings,
                axisLabel: {
                  color: '#cccccc',
                  fontSize: 12,
                },
              },
              series: chartSeries,
            },
            responsiveOptions = getChartResponsiveOptionsNftMarketplace(chartName);

        return $.extend(true, {}, baseOptions, responsiveOptions);
      }

      function getChartResponsiveOptionsNftMarketplace() {
        var newOptions = {};

        if (window.innerWidth < 767) {
          newOptions = {
            yAxis: {
              axisLabel: {
                fontSize: 10,
                formatter: function(value) {
                  return '$' + NumberUtil.formatMoney(value);
                },
              },
            },
            xAxis: {
              splitNumber: 3,
              axisLabel: {
                fontSize: 10,
                formatter: dateShortFormatter,
              },
            },
          };
        } else {
          newOptions = {
            yAxis: {
              axisLabel: {
                formatter: function(value) {
                  return '$' + NumberUtil.formatWithCommas(value);
                },
              },
            },
            xAxis: {
              splitNumber: 5,
              axisLabel: {
                formatter: dateFormatter,
              },
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsNftMetaverseBitcountry(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              vol_usd: [],
              traded_nfts: [],
              minted_nfts: [],
            },
            colors = [
              '#004bff',
              '#e6007a',
              '#24f483',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.vol_usd.push([
            jsonData[i].date, jsonData[i].vol_usd,
          ]);
          data.traded_nfts.push([
            jsonData[i].date, jsonData[i].traded_nfts,
          ]);
          data.minted_nfts.push([
            jsonData[i].date, jsonData[i].minted_nfts,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            top: '3%',
            left: '40px',
            right: '40px',
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.nftTradingVolume,
              nameTextStyle: {
                fontSize: 0,
              },
              position: 'right',
              interval: 250,
              offset: 20,
              alignTicks: true,
              axisLine: {
                show: false,
              },
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#ffffff',
                  backgroundColor: colors[0],
                },
              },
              axisLabel: {
                color: '#cccccc',
              },
            },
            {
              type: 'value',
              name: locate.tradedNfts,
              nameTextStyle: {
                fontSize: 0,
              },
              offset: 20,
              alignTicks: true,
              axisLine: {
                show: false,
              },
              interval: 500,
              max: 2000,
              splitLine: {
                lineStyle: {
                  type: [
                    4, 4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#ffffff',
                  backgroundColor: colors[1],
                },
              },
              axisLabel: {
                color: '#cccccc',
              },
            },
          ],
          series: [
            {
              name: locate.nftTradingVolume,
              data: data.vol_usd,
              type: 'bar',
              smooth: true,
              yAxisIndex: 1,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              barMaxWidth: 10,
              itemStyle: {
                borderRadius: [
                  4, 4, 0, 0,
                ],
              },
            },
            {
              name: locate.tradedNfts,
              data: data.traded_nfts,
              type: 'line',
              smooth: false,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              lineStyle: {
                width: 3,
              },
            },
            {
              name: locate.mintedNfts,
              data: data.minted_nfts,
              type: 'line',
              smooth: false,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
              lineStyle: {
                width: 3,
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsFastUnstakeOnPolkadot();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsNftMetaverseBitcountry() {
        var newOptions = {};/**/

        if (window.innerWidth > 767) {
          newOptions = {
            grid: {
              left: '40px',
              right: '40px',
            },
            yAxis: [
              {
                offset: 20,
                axisLabel: {
                  formatter: '{value}',
                },
              }, {
                offset: 20,
                axisLabel: {
                  formatter: '{value}',
                },
              },
            ],
            xAxis: {
              splitNumber: 4,
            },
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
                  formatter: function(value) {
                    return NumberUtil.formatMoney(value);
                  },
                },
              }, {
                offset: 5,
                axisLabel: {
                  formatter: function(value) {
                    return NumberUtil.formatMoney(value);
                  },
                },
              },
            ],
            xAxis: {
              splitNumber: 2,
            },
          };
        }

        return newOptions;
      }

      function getChartOptionsWeb3WasmAlephzero(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              contracts: [],
              active_users: [],
            },
            colors = [
              '#004dff',
              '#f82613',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.contracts.push([
            jsonData[i].date,
            jsonData[i].contracts,
          ]);
          data.active_users.push([
            jsonData[i].date,
            jsonData[i].active_users,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: '3%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: [
                  4,
                  4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              align: 'center',
              fontFamily: fontFamily,
              fontSize: 10,
              fontWeight: 500,
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.contractsCumulative,
              position: 'left',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 100,
              splitLine: {
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#000000',
                  backgroundColor: '#cccccc',
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
            {
              type: 'value',
              name: locate.activeUsersCumulative,
              position: 'right',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 20000,
              splitLine: {
                show: false,
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: defaultAxisPointerLabelSettings,
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
          ],
          series: [
            {
              name: locate.contractsCumulative,
              data: data.contracts,
              itemStyle: {
                color: colors[0],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
            {
              name: locate.activeUsersCumulative,
              data: data.active_users,
              itemStyle: {
                color: colors[1],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsWeb3Wasm();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartOptionsWeb3WasmAstar(chartName, jsonData) {
        var totalItems = jsonData.length,
            data = {
              contracts: [],
              active_users: [],
            },
            colors = [
              '#004dff',
              '#f82613',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.contracts.push([
            jsonData[i].date,
            jsonData[i].contracts,
          ]);
          data.active_users.push([
            jsonData[i].date,
            jsonData[i].active_users,
          ]);
        }

        var baseOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: defaultTooltipSettings,
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: '3%',
            top: '3%', //bottom: 100, // DataZoom + Legend.
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: [
                  4,
                  4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              align: 'center',
              fontFamily: fontFamily,
              fontSize: 10,
              fontWeight: 500,
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: [
            {
              type: 'value',
              name: locate.contractsCumulative,
              position: 'left',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 10,
              splitLine: {
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: {
                label: {
                  color: '#000000',
                  backgroundColor: '#cccccc',
                },
              },
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
            {
              type: 'value',
              name: locate.activeUsersCumulative,
              position: 'right',
              axisLine: {
                show: false,
              },
              splitNumber: 4,
              interval: 120000,
              splitLine: {
                show: false,
                lineStyle: {
                  type: [
                    4,
                    4,
                  ],
                  color: ['#262626'],
                },
              },
              axisPointer: defaultAxisPointerLabelSettings,
              axisLabel: {
                color: '#cccccc',
                fontSize: 10,
              },
            },
          ],
          series: [
            {
              name: locate.contractsCumulative,
              data: data.contracts,
              itemStyle: {
                color: colors[0],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              emphasis: {
                focus: 'series',
              },
            },
            {
              name: locate.activeUsersCumulative,
              data: data.active_users,
              itemStyle: {
                color: colors[1],
              },
              type: 'line',
              smooth: true,
              showSymbol: false,
              yAxisIndex: 1,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };
        var responsiveOptions = getChartResponsiveOptionsWeb3Wasm();

        $.extend(true, baseOptions, responsiveOptions);

        return baseOptions;
      }

      function getChartResponsiveOptionsWeb3Wasm() {
        var newOptions = {};

        if (window.innerWidth > 767) {
          newOptions = {
            xAxis: {
              splitNumber: 4,
            },
          };
        } else {
          newOptions = {
            xAxis: {
              splitNumber: 3,
            },
          };

          if (window.innerWidth < 560) {
            $.extend(newOptions, {
              xAxis: {
                splitNumber: 2,
              },
              yAxis: [
                {
                  axisLabel: {
                    formatter: function(value) {
                      return value ? NumberUtil.formatMoney(value) : '0';
                    },
                  },
                },
                {
                  axisLabel: {
                    formatter: function(value) {
                      return value ? NumberUtil.formatMoney(value) : '0';
                    },
                  },
                },
              ],
            });
          }
        }

        return newOptions;
      }

      /*
      * CHART BASE FUNCTION
      * */
      function getChartLinesBaseOptions(jsonData, datasets, colors, areaBackground, seriesOptions, chartExtraOptions) {
        var totalItems = jsonData.length,
            data = [];

        datasets.forEach(function(dataset) {
          data[dataset.name] = [];
        });

        for (var i = 0; i < totalItems; i++) {
          datasets.forEach(function(dataset) {
            var value = jsonData[i][dataset.name] ? NumberUtil.validate(jsonData[i][dataset.name]) : '';
            data[dataset.name].push([
              jsonData[i].date, value,
            ]);
          });
        }

        var chartSeries = [];

        datasets.forEach(function(dataset, index) {
          var options = {
            name: dataset.label,
            data: data[dataset.name],
            itemStyle: {
              color: colors[index],
            },
            type: 'line',
            smooth: false,
            showSymbol: false,
            connectNulls: true, // used for dotsama dex.
            emphasis: {
              focus: 'series',
            },
          };

          if (dataset.hasOwnProperty('options')) {
            options = $.extend(true, {}, options, dataset.options);
          }

          // Used dataset.options instead of.
          if (areaBackground && areaBackground[index]) {
            options.areaStyle = {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                {
                  offset: 0,
                  color: areaBackground[index][0],
                }, {
                  offset: 1,
                  color: areaBackground[index][1],
                },
              ]),
            };
          }

          if (typeof seriesOptions !== 'undefined') {
            options = $.extend(true, {}, options, seriesOptions);
          }

          chartSeries.push(options);
        });

        var chartOptions = {
          color: colors,
          textStyle: {
            fontFamily: fontFamily,
            fontWeight: 500,
          },
          tooltip: $.extend(true, {}, defaultTooltipStyle, {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              crossStyle: {
                color: 'rgba(255,255,255,0.3)',
              },
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: 'rgba(255,255,255,0.3)',
              },
            },
          }),
          legend: defaultLegendSettings,
          grid: {
            left: '3%',
            right: '3%',
            top: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#262626',
              },
            },
            splitLine: {
              show: false,
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              margin: 12,
              formatter: dateFormatter,
              color: '#cccccc',
            },
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false,
            },
            splitNumber: 4,
            splitLine: {
              lineStyle: {
                type: [
                  4, 4,
                ],
                color: ['#262626'],
              },
            },
            axisPointer: defaultAxisPointerLabelSettings,
            axisLabel: {
              color: '#cccccc',
            },
          },
          series: chartSeries,
        };

        if (chartExtraOptions) {
          return $.extend(true, {}, chartOptions, chartExtraOptions);
        }

        return chartOptions;
      }

      function getChartLinesBaseResponsiveOptions(chartName) {
        var newOptions = {};

        if (window.innerWidth > 767) {
          switch (chartName) {
            case 'total-nominator-count-total-validator-count':
              newOptions['xAxis'] = {
                splitNumber: 3,
              };
              break;
            default:
              newOptions['xAxis'] = {
                splitNumber: 5,
              };
              break;
          }
        } else {
          newOptions['xAxis'] = {
            splitNumber: 3,
            axisLabel: {
              formatter: dateShortFormatter,
            },
          };

          if (window.innerWidth < 460) {
            $.extend(true, newOptions, {
              xAxis: {
                splitNumber: 2,
                axisLabel: {
                  fontSize: 10,
                },
              },
              yAxis: {
                axisLabel: {
                  fontSize: 10,
                },
              },
            });
          }
        }

        var yAxis = {};
        switch (chartName) {
          case 'tvl-defi-parachain':
          case 'defi-dex-polkadot':
          case 'defi-dex-kusama':
          case 'defi-lending':
          case 'defi-liquid-staking':
          case 'defi-usdt-supply':
            newOptions.tooltip = {
              valueFormatter: function(value) {
                return value ? '$' + NumberUtil.formatWithCommas(value) : '-';
              },
            };

            if (window.innerWidth > 767) {
              yAxis = {
                axisPointer: {
                  label: {
                    formatter: '${value}',
                  },
                },
                axisLabel: {
                  formatter: '${value}',
                },
              };
            } else {
              yAxis = {
                axisPointer: {
                  label: {
                    formatter: '${value}',
                  },
                },
                axisLabel: {
                  formatter: function(value) {
                    return value ? '$' + NumberUtil.formatMoney(value) : '-';
                  },
                  fontSize: 10,
                },
              };
            }
            newOptions.yAxis = yAxis;

            break;
        }

        return newOptions;
      }

      function getTokenIcon(name) {
        var icon = '';

        switch (name) {
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

        return '' !== icon ? tokenBaseUrl + icon : '';
      }
    }(jQuery)
);
