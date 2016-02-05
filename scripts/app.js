/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
angular.module("int_comp",["chart.js"]);
angular.module("int_comp").controller("interestController",function($http,$scope) {
    
    //defaults
    this.result = false;
    this.effective_rate_one=1;
    this.effective_rate_two=2;
    this.months=[];
    this.data1=[];
    this.data2=[];
    
    //Console at https://developer.yahoo.com/yql/console/
    //YQL query is -----> Select * from  yahoo.finance.xchange where pair in ('USDINR','INRUSD')
    //Select show community tables if doing from browser
    
    var exchg_rate_url="https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22USDINR%22%2C%20%22INRUSD%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
    
    
    //to access the view model later inside functions
    var vm = this;
    
    
    //defaults in case YQL query doesn't work
    vm.current_USDINR = 65;
    vm.current_INRUSD = 0.0147;
    
    
    $http({
        method: 'GET',
        url: exchg_rate_url,
        headers: {
            'Content-type': 'application/json'
        }
    })
    .success(function(data, status, headers, config)  {
        vm.rates = data;

        //results returned in the order we requested, so not using filter
        vm.current_USDINR = Number(vm.rates.query.results.rate[0].Rate);
        vm.current_INRUSD = Number(vm.rates.query.results.rate[1].Rate);
    });
    
    
    //select options
    this.frequency_config = [{'name': 'Daily','value': 365},
                        {'name': 'Monthly','value': 12},
                        {'name': 'Quarterly','value': 4},
                        {'name': 'Half Yearly','value': 2},
                        {'name': 'Yearly','value': 1}
                    ];
                    
    this.out_frequency_config = [{'name': 'Monthly','value': 12},
                        {'name': 'Quarterly','value': 4},
                        {'name': 'Half Yearly','value': 2},
                        {'name': 'Yearly','value': 1}
                    ];
    
    
    //default values for load
    function init() {
        vm.amount=1000;

        vm.percentage_one=1;
        vm.type_one='2';
        vm.frequency_one=365;
        
        vm.percentage_two=7.5;
        vm.type_two='2';
        vm.frequency_two=4;
        
        vm.num_years=6;
        vm.out_frequency=12;
        
        vm.recalculate();

    }

    //recalculate and redraw when data changes
    this.recalculate=function() {
        vm.months=[];
        for(var i=1;i<= vm.num_years*vm.out_frequency;i++ ) {
            vm.months.push(i);
        }
        
        if(vm.type_one==='1') {
            vm.effective_rate_one=1+vm.percentage_one/100;
        }
        else {
            vm.effective_rate_one=1+Math.round((vm.percentage_one/vm.frequency_one)*1000)/100000;
        }
        
        if(vm.type_two==='1') {
            vm.effective_rate_two=1+vm.percentage_two/100;
        }
        else {
            vm.effective_rate_two=1+Math.round((vm.percentage_two/vm.frequency_two)*1000)/100000;
        }
        
        //reset
        vm.data1=[];
        vm.data2=[];
      
        for(var i=1;i<= vm.num_years*vm.out_frequency;i++) {
            vm.data1.push(vm.getAmount("one",i));
            vm.data2.push(vm.getAmount("two",i));
        }


        //chart parameters
        $scope.labels = vm.months;
        $scope.series = ['US', 'IN'];
        $scope.data = [
            vm.data1,
            vm.data2
        ];
        $scope.colours = [
            { // grey
              fillColor: 'rgba(148,159,177,0.2)',
              strokeColor: 'rgba(148,159,177,1)',
              pointColor: 'rgba(148,159,177,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(148,159,177,0.8)'
            },
            { // dark grey
              fillColor: 'rgba(77,83,96,0.2)',
              strokeColor: 'rgba(77,83,96,1)',
              pointColor: 'rgba(77,83,96,1)',
              pointStrokeColor: '#fff',
              pointHighlightFill: '#fff',
              pointHighlightStroke: 'rgba(77,83,96,1)'
            }
        ];
    
        
    };
    
    
    //get for a period
    this.getAmount = function(country,period) {
        if(country==="one") {
            if(vm.type_one==='1') {
                var num=Math.floor(period/12);
                return vm.amount * (1+(vm.percentage_one*num)/100);
            }
            else {
                var num=Math.floor(period/(vm.out_frequency/vm.frequency_one));
                return vm.amount * Math.pow(vm.effective_rate_one,num);                
            }
        }
        else {
            if(vm.type_two==='1') {
                var num=Math.floor(period/12);
                return vm.amount * (1+(vm.percentage_two*num)/100);
            }
            else {
                var num=Math.floor(period/(vm.out_frequency/vm.frequency_two));
                return vm.amount * Math.pow(vm.effective_rate_two,num);
            }

        }
        
        
    };
    
  
    init();
});

