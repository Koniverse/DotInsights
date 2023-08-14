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

      var sourceBaseUrl = baseUrl + '/assets/data/q2-2023/';
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
          moreLink: '<a href="#" class="btn btn-flat btn-small">' +
                    locate.readMore + '</a>',
          lessLink: '<a href="#" class="btn btn-flat btn-small">' +
                    locate.readLess + '</a>',
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
            url: 'polkadot-report-q2-2023-en',
            isActive: 1,
          }, {
            code: 'pt',
            name: 'Português',
            flag: 'pt.svg',
            url: 'polkadot-report-q2-2023-pt',
            isActive: 1,
          }, {
            code: 'vi',
            name: 'Tiếng Việt',
            flag: 'vn.svg',
            url: 'polkadot-report-q2-2023-vi',
            isActive: 1,
          }, {
            code: 'zh',
            name: '中文',
            flag: 'cn.svg',
            url: 'polkadot-report-q2-2023-zh',
            isActive: 1,
          }, {
            code: 'id_ID',
            name: 'Bahasa Indonesia',
            flag: 'id.svg',
            url: 'polkadot-report-q2-2023-id',
            isActive: 1,
          }, {
            code: 'es',
            name: 'Español',
            flag: 'es.svg',
            url: 'polkadot-report-q2-2023-es',
            isActive: 1,
          }, {
            code: 'kr',
            name: '한국어',
            flag: 'kr.svg',
            url: 'polkadot-report-q2-2023-kr',
            isActive: 1,
          }, {
            code: 'ja',
            name: '日本語',
            flag: 'jp.svg',
            url: 'polkadot-report-q2-2023-ja',
            isActive: 1,
          }, {
            code: 'fr',
            name: 'Français',
            flag: 'fr.svg',
            url: 'polkadot-report-q2-2023-fr',
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
          var fileName = typeof chartSource !== 'undefined'
              ? chartSource
              : chartName;
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

            }
            chartInstance.hideLoading();
            chartInstance.setOption(chartOptions);
          });
        } else { // Chart with inline source.
          var chartOptions = {};

          switch (chartName) {
            case 'total-stake-distribution':
              chartOptions = getChartOptionsTotalStakeDistribution(chartName);
              break;
          }

          chartInstance.hideLoading();
          chartInstance.setOption(chartOptions);

          var $customLegend = $chart.siblings('.block-chart-legend');
          if ($customLegend.length > 0) {
            chartInstance.on('mouseover', 'series', function(params) {

              var $current = $customLegend.find(
                  'li[data-id="' + params.name + '"]');

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
            },
            {
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
              '#004dff',
              '#ffc93f',
              '#ff035e',
            ];

        for (var i = 0; i < totalItems; i++) {
          data.fullTime.push([
            jsonData[i].date,
            jsonData[i].full_time,
          ]);
          data.partTime.push([
            jsonData[i].date,
            jsonData[i].part_time,
          ]);
          data.oneTime.push([
            jsonData[i].date,
            jsonData[i].one_time,
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
                  4,
                  4,
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
            },
            {
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
            },
            {
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

      /*
      * CHART BASE FUNCTION
      * */
      function getChartLinesBaseOptions(jsonData, datasets, colors,
          areaBackground, seriesOptions, chartExtraOptions,
      ) {
        var totalItems = jsonData.length,
            data = [];

        datasets.forEach(function(dataset) {
          data[dataset.name] = [];
        });

        for (var i = 0; i < totalItems; i++) {
          datasets.forEach(function(dataset) {
            var value = jsonData[i][dataset.name] ? NumberUtil.validate(
                jsonData[i][dataset.name]) : '';
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
            smooth: true,
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
              },
            });
          }
        }

        var yAxis = {};
        switch (chartName) {
          case 'total-dot-staked-locked':
            if (window.innerWidth < 768) {
              yAxis = {
                axisLabel: {
                  formatter: function(value) {
                    return NumberUtil.formatMoney(value);
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
