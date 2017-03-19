/**
 * Created by Lijingjing on 17/3/18.
 */
'use strict';

angular.module('myApp.dashboard', ['ngRoute', 'ui.bootstrap', 'chart.js'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'dashboard/dashboard.html',
            controller: 'DashboardCtrl'
        });
    }])

    .factory('DataService', ['$http', function ($http) {
        var BaseUrl = "http://172.16.1.47:9090";

        var getInfoByDayRequest = function (keyword) {
            return $http({
                method: 'GET',
                url: BaseUrl + "/periodfrequency?keyword=" + keyword + "&type=day"
            });
        };
        var getInfoByMonthRequest = function (keyword) {
            return $http({
                method: 'GET',
                url: BaseUrl + "/periodfrequency?keyword=" + keyword + "&type=month"
            });
        };
        var getInfoByYearRequest = function (keyword) {
            return $http({
                method: 'GET',
                url: BaseUrl + "/periodfrequency?keyword=" + keyword + "&type=year"
            });
        };

        var getInfoByDateRequest = function (start, end) {
            return $http({
                methods: 'GET',
                url: BaseUrl + "/frequency?keyword=google&start=" + start + "&end=" + end
            });

        };

        var getEmotionRequest = function (keyword) {
            return $http({
                method: 'GET',
                url: BaseUrl + '/emotion/' + keyword
            });
        };

        var getMixEmotionRequest = function () {
            return $http({
                method: 'GET',
                //url: BaseUrl + '/emotion/'
                url: "dashboard/mix.json"
            });
        };

        return {
            getDayInfo: function (keyword) {
                return getInfoByDayRequest(keyword);
            },
            getMonthInfo: function (keyword) {
                return getInfoByMonthRequest(keyword)
            },
            getYearInfo: function (keyword) {
                return getInfoByYearRequest(keyword)
            },
            getDateInfo: function (start, end) {
                return getInfoByDateRequest(start, end)
            },
            getEmotion: function (keyword) {
                return getEmotionRequest(keyword)
            },
            getMixEmotion: function () {
                return getMixEmotionRequest()
            }
        }

    }])

    .controller('DashboardCtrl', ['$scope', 'DataService', function ($scope, DataService) {

        $scope.showContent = false;
        $scope.searchWord = "";
        $scope.isNegative = false;
        $scope.isPositive = false;
        $scope.isNeutral = false;
        $("#searchWord").focus(function () {
            $(".home-page").css("top", "-51%");

        });

        $scope.searchByKeyword = function () {
            DataService.getDayInfo($scope.searchWord)
                .then(function (data) {
                    $scope.showContent = true;
                    $scope.labels = [];
                    $scope.tempData = [];
                    $scope.data = [];
                    for (var i = 6; i >= 0; i--) {
                        $scope.labels.push(formatDate($scope.getStartDate(i)));
                        $scope.tempData.push(data.data[i].freq);
                    }

                    $scope.data.push($scope.tempData);


                });

            DataService.getEmotion($scope.searchWord)
                .then(function (data) {
                    $scope.positive = data.data.positive;
                    $scope.negative = data.data.negative;

                    if ($scope.positive > $scope.negative) {
                        $scope.isPositive = true;
                    }
                    else if ($scope.negative > $scope.positive) {
                        $scope.isNegative = true;
                    }
                    else {
                        $scope.isNeutral = true;
                    }

                    //$scope.$apply();


                    $scope.pieOption = {
                        //backgroundColor: "#2c343c",
                        title: {
                            text: 'Sentimental Analysis',
                            //subtext: 'When people talk about ' + $scope.searchWord + "...",
                            x: 'center'

                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} %"
                        },
                        legend: {
                            x: 'center',
                            y: 'bottom',
                            data: ['negative', 'neutral', 'positive']
                            //textStyle: {
                            //    color: "#FFF"
                            //}
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                mark: {show: true},
                                dataView: {show: true, readOnly: false},
                                magicType: {
                                    show: true,
                                    type: ['pie', 'funnel']
                                }
                            }
                        },
                        calculable: true,
                        color: ['#c23531', '#EDC455', '#08afaf'],
                        series: [
                            {
                                name: 'Proportion',
                                type: 'pie',
                                radius: [0, 110],
                                center: ['50%', '50%'],
                                roseType: 'radius',
                                label: {
                                    normal: {
                                        show: false
                                    },
                                    emphasis: {
                                        show: false
                                    }
                                },
                                data: [
                                    {value: parseFloat(0.0162 * 100).toFixed(2), name: 'negative'},
                                    {value: parseFloat(0.2356 * 100).toFixed(2), name: 'neutral'},
                                    {value: parseFloat(0.7482 * 100).toFixed(2), name: 'positive'}
                                ]
                            }
                        ]
                    };
                    $scope.myPieChart.setOption($scope.pieOption, true);
                    $scope.xLabels = [];
                    for (var i = 6; i >= 0; i--) {
                        $scope.xLabels.push(formatDate($scope.getStartDate(i)));
                    }
                    console.log($scope.xLabels);

                    $scope.gridOption = {
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        legend: {
                            data: ['Negative', 'Neutral', 'Positive']
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: $scope.xLabels
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value'
                            }
                        ],
                        color: ['#c23531', '#EDC455', '#08afaf'],
                        series: [

                            {
                                name: 'Negative',
                                type: 'bar',
                                stack: 'sentimental',
                                data: [62, 82, 91, 84, 109, 110, 120]
                            },
                            {
                                name: 'Neutral',
                                type: 'bar',
                                stack: 'sentimental',
                                data: [60, 72, 71, 74, 190, 130, 110]
                            },
                            {
                                name: 'Positive',
                                type: 'bar',
                                stack: 'sentimental',
                                data: [120, 132, 101, 134, 290, 230, 220]
                            }
                        ]
                    };
                    $scope.myGridChart.setOption($scope.gridOption, true);


                });
        };

        //***********日期开始**********

        $scope.getStartDate = function (num) {
            //var startDate = new Date(); //获取今天日期
            var startDate = new Date('2015-01-08');
            startDate.setDate(startDate.getDate() - num);
            return startDate;
        };

        function formatDate(date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            if (month < 10)
                month = '0' + month;
            if (day < 10)
                day = '0' + day;
            var formatDate = year + '-' + month + '-' + day;
            return formatDate;
        }

        $scope.startDate = $scope.getStartDate(6);
        $scope.endDate = $scope.getStartDate(0);


        $scope.open1 = function () {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function () {
            $scope.popup2.opened = true;
        };

        $scope.popup1 = {
            opened: false
        };

        $scope.popup2 = {
            opened: false
        };

        function compareTime(startDate, endDate) {
            var start = new Date(startDate);
            var end = new Date(endDate);
            var startTime = start.getTime();
            var endTime = end.getTime();

            if (startTime - endTime > 0) {
                return false;
            }

            return true;
        }


        $scope.changeDate = function () {
            var tempStart = $scope.startDate;
            var tempEnd = $scope.endDate;
            if (!compareTime($scope.startDate, $scope.endDate)) {
                alert("Please select the proper date!");
                $scope.startDate = tempStart;
                $scope.endDate = tempEnd;
                return false;
            }
            else {
                console.log($scope.startDate);
                console.log($scope.endDate);
                DataService.getDateInfo(formatDate($scope.startDate), formatDate($scope.endDate))
                    .then(function (data) {
                        $scope.showContent = true;
                        $scope.labels = [];
                        $scope.tempData = [];
                        $scope.data = [];
                        for (var i = 0; i < 7; i++) {
                            $scope.labels.push(formatDate($scope.getStartDate(i)));
                            $scope.tempData.push(data.data[i].freq);
                        }

                        $scope.data.push($scope.tempData);
                    });
            }

        };

        //*******    日期结束    ***********


        //******折线图开始*******

        $scope.series = ['popularity'];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{yAxisID: 'y-axis-1'}];
        $scope.options = {
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left'
                    }
                ]
            }
        };

        //******  折线结束 ********

        //    *****PieChart开始********

        $scope.myPieChart = echarts.init(document.getElementById('pieChart'));
        $scope.myGridChart = echarts.init(document.getElementById('gridChart'));


//    *****PieChart结束********
        function toDecimal(x) {
            var f = parseFloat(x);
            if (isNaN(f)) {
                return;
            }
            f = Math.round(x * 100) / 100;
            return f;
        }

//    ******* keyword analysis start
        $scope.myAnalysisChart = echarts.init(document.getElementById('analysisChart'));
        var indices = {
            group: 0
        };

        $scope.groupColorMap = {};
        $scope.showLinks = false;

        $scope.showTrending = function () {
            $scope.showLinks = false;
        };
        $scope.hideTrending = function () {
            $scope.showLinks = true;
        };

        var groupCategories = [];
        var groupColors = [];
        var schema = [];
        var handledData = [];


        DataService.getMixEmotion().then(function (data) {
            $scope.myData = data.data;
            $scope.activeCategory($scope.myData[0].theme);
            //schema.push({name: 'name', index: 0});

            //for (var i = 0; i < 6; i++) {
            //    schema.push({name: formatDate($scope.getStartDate(i)), index: i + 1});
            //
            //}
            //
            for (var k = 0; k < $scope.myData.length; k++) {
                var tempItem = [];
                tempItem.push($scope.myData[k].theme);
                //console.log($scope.myData[k]["frequencies"].length);
                for (var j = 0; j < $scope.myData[k]["frequencies"].length; j++) {
                    tempItem.push($scope.myData[k]["frequencies"][j].freq);
                }
                console.log(tempItem);
                handledData.push(tempItem);

            }
            //console.log(handledData);
            //
            ////$.get('dashboard/nutrients.json', function (data) {
            //normalizeData(handledData);
            //var option = getOption(handledData);
            //
            //$scope.myAnalysisChart.setOption(option);

            $scope.positiveData = [];
            $scope.negativeData = [];
            for (var i = 0; i < $scope.myData.length; i++) {
                schema.push($scope.myData.theme);
                var tempItem1 = {
                    name: $scope.myData[i].theme,
                    value: (parseFloat($scope.myData[i].positive + ($scope.myData[i].neural / 2)) * 100).toFixed(2)
                };
                var tempItem2 = {
                    name: $scope.myData[i].theme,
                    value: (parseFloat($scope.myData[i].negative + ($scope.myData[i].neural / 2)) * 100).toFixed(2)
                };
                $scope.positiveData.push(tempItem1);
                $scope.negativeData.push(tempItem2);
            }


            $scope.funnelOption = {
                title: {
                    text: 'Positive vs Negative',
                    //subtext: '纯属虚构',
                    left: '42%',
                    top: 'top'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c}%"
                },
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    top: 'center',
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: ['产品A', '产品B', '产品C', '产品D', '产品E']
                },
                calculable: true,
                series: [
                    {
                        name: 'Positive',
                        type: 'funnel',
                        width: '30%',
                        height: '80%',
                        left: '5%',
                        top: '5%',
                        sort: 'ascending',
                        funnelAlign: 'right',

                        center: ['25%', '75%'],  // for pie

                        data: $scope.positiveData
                    },
                    {
                        name: 'Negative',
                        type: 'funnel',
                        width: '30%',
                        height: '80%',
                        left: '55%',
                        top: '5%',
                        funnelAlign: 'left',

                        center: ['75%', '25%'],  // for pie

                        data: $scope.negativeData
                    }
                ]
            };

            $scope.myAnalysisChart.setOption($scope.funnelOption);
            normalizeData(handledData);

            //$scope.$apply();
            //});


        });


        //var schema = [
        //    {name: 'name', index: 0},
        //    {name: 'group', index: 1},
        //    {name: 'protein', index: 2},
        //    {name: 'calcium', index: 3},
        //    {name: 'sodium', index: 4},
        //    {name: 'fiber', index: 5},
        //    {name: 'vitaminc', index: 6},
        //    {name: 'potassium', index: 7},
        //    {name: 'carbohydrate', index: 8},
        //    {name: 'sugars', index: 9},
        //    {name: 'fat', index: 10},
        //    {name: 'water', index: 11},
        //    {name: 'calories', index: 12},
        //    {name: 'saturated', index: 13},
        //    {name: 'monounsat', index: 14},
        //    {name: 'polyunsat', index: 15},
        //    {name: 'id', index: 16}
        //];


        function normalizeData(originData) {
            var groupMap = {};
            console.log(originData);
            originData.forEach(function (row) {
                var groupName = row[0];
                if (!groupMap.hasOwnProperty(groupName)) {
                    groupMap[groupName] = 1;
                }
            });

            console.log(groupMap);

            //originData.forEach(function (row) {//处理数据
            //    console.log(row);
            //    row.forEach(function (item, index) {
            //        if (index !== indices.group
            //        ) {
            //            // Convert null to zero, as all of them under unit "g".
            //            row[index] = parseFloat(item) || 0;
            //        }
            //    });
            //});

            for (var groupName in groupMap) {
                if (groupMap.hasOwnProperty(groupName)) {
                    groupCategories.push(groupName);
                }
            }
            console.log("groupCategories");
            console.log(groupCategories);
            var hStep = Math.round(200 / (groupCategories.length - 1));//颜色配置
            for (var i = 0; i < groupCategories.length; i++) {
                if (i == 0) {
                    $scope.showCategory = groupCategories[0];
                }
                var myColor = echarts.color.modifyHSL('#D559E5', hStep * i);
                groupColors.push(myColor);
                console.log(myColor);
                console.log(groupCategories[i]);
                $scope.groupColorMap[groupCategories[i]] = myColor;
            }
            console.log($scope.groupColorMap);
        }

        //function getOption(data) {
        //
        //    var lineStyle = {
        //        normal: {
        //            width: 0.5,
        //            opacity: 0.05
        //        }
        //    };
        //    return {
        //        backgroundColor: '#2C343C',
        //        tooltip: {
        //            padding: 10,
        //            backgroundColor: '#222',
        //            borderColor: '#777',
        //            borderWidth: 1,
        //            formatter: function (obj) {
        //                var value = obj[0].value;
        //                return '<div style="border-bottom: 1px solid rgba(255,255,255,.3); font-size: 18px;padding-bottom: 7px;margin-bottom: 7px">'
        //                    + schema[1].name + '：' + value[1] + '<br>'
        //                    + schema[2].name + '：' + value[2] + '<br>'
        //                    + schema[3].name + '：' + value[3] + '<br>'
        //                    + schema[4].name + '：' + value[4] + '<br>'
        //                    + schema[5].name + '：' + value[5] + '<br>'
        //                    + schema[6].name + '：' + value[6] + '<br>';
        //            }
        //        },
        //        //title: [
        //        //    {
        //        //        text: 'Keywords',
        //        //        top: 0,
        //        //        left: 0,
        //        //        textStyle: {
        //        //            color: '#fff'
        //        //        }
        //        //    }
        //        //],
        //        visualMap: {
        //            show: true,
        //            type: 'piecewise',
        //            categories: groupCategories,
        //            dimension: indices.group,
        //            inRange: {
        //                color: groupColors //['#d94e5d','#eac736','#50a3ba']
        //            },
        //            outOfRange: {
        //                color: ['#ccc'] //['#d94e5d','#eac736','#50a3ba']
        //            },
        //            top: 40,
        //            left: 50,
        //            textStyle: {
        //                color: '#fff'
        //            },
        //            realtime: false
        //        },
        //        parallelAxis: [
        //            {dim: 1, name: schema[1].name, nameLocation: 'end'},
        //            {dim: 2, name: schema[2].name, nameLocation: 'end'},
        //            {dim: 3, name: schema[3].name, nameLocation: 'end'},
        //            {dim: 4, name: schema[4].name, nameLocation: 'end'},
        //            {dim: 5, name: schema[5].name, nameLocation: 'end'},
        //            {dim: 6, name: schema[6].name, nameLocation: 'end'},
        //            //{dim: 6, name: schema[6].name, nameLocation: 'end'}
        //
        //
        //        ],
        //        parallel: {
        //            left: 440,
        //            top: 40,
        //            // top: 150,
        //            // height: 300,
        //            width: 400,
        //            layout: 'vertical',
        //            parallelAxisDefault: {
        //                type: 'value',
        //                name: 'popularity',
        //                nameLocation: 'end',
        //                nameGap: 20,
        //                nameTextStyle: {
        //                    color: '#fff',
        //                    fontSize: 14
        //                },
        //                axisLine: {
        //                    lineStyle: {
        //                        color: '#aaa'
        //                    }
        //                },
        //                axisTick: {
        //                    lineStyle: {
        //                        color: '#777'
        //                    }
        //                },
        //                splitLine: {
        //                    show: false
        //                },
        //                axisLabel: {
        //                    textStyle: {
        //                        color: '#fff'
        //                    }
        //                },
        //                realtime: false
        //            }
        //        },
        //        animation: true,
        //        series: [
        //            {
        //                name: 'Popularity',
        //                type: 'parallel',
        //                lineStyle: lineStyle,
        //                inactiveOpacity: 0,
        //                activeOpacity: 0.01,
        //                progressive: 500,
        //                smooth: true,
        //                data: data//每个坐标的对应的数据集
        //            }
        //        ]
        //    };
        //}

// ****** keyword analysis end*******


//******* detail links start***********

        function HTMLDecode(text) {
            var temp = document.createElement("div");
            temp.innerHTML = text;
            var output = temp.innerText || temp.textContent;
            temp = null;
            return output;
        }

        $scope.descriptions = [];
        //console.log(schema[0].name);

        $scope.activeCategory = function (key) {
            console.log(key);
            $scope.showCategory = key;
            for (var i = 0; i < $scope.myData.length; i++) {
                if ($scope.myData[i].theme == key) {
                    $scope.descriptions = $scope.myData[i].frequencies[0].topComments;
                    console.log($scope.descriptions);
                    break;
                }
            }

            for (var j = 0; j < $scope.descriptions.length; j++) {
                $scope.descriptions[j] = HTMLDecode($scope.descriptions[j]);
            }

        };

        $scope.myDetailPage = "-1";
        $scope.showMeDetail = function (key) {
            $scope.myDetailPage = key;

        };

//******* detail links end*************


    }])
;