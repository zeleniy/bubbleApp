/**
 * Main application class.
 */
function Application() {

    /**
     * Depicted data set.
     * @member {DataSet}
     */
    this.dataSet;
    /**
     * Chart search bar.
     */
    this.searchBar;
    /**
     * Legal cases chart.
     */
    this.casesChart;
    /**
     * Cases list.
     */
    this.casesList;
    /**
     * Details screen object.
     */
    this.details = new Details();

    var self = this;
    d3.select(window).on('keyup', function() {
        if (d3.event.keyCode == 27) {
            self.hideDetails();
        }
    })
}


/**
 * Get data.
 * @returns {Object[]}
 */
Application.prototype.getData = function() {

    return this.dataSet.getData();
}


/**
 * Get format function.
 */
Application.prototype.getFormat = function() {

    return this.details.format;
}


/**
 * Get data set.
 * @returns {DataSet}
 */
Application.prototype.getDataSet = function() {

    return this.dataSet;
}


Application.prototype.getListData = function() {

    return this.casesList.getData();
}


/**
 * Update application.
 * @param {DataSet}
 */
Application.prototype.update = function(dataSet) {

    this.casesChart.update(dataSet);
    this.casesList.update(dataSet);
}


/**
 * Show details screen.
 */
Application.prototype.showDetails = function(data) {

    window.scroll(0, 0);

    this.details.update(data);

    d3.select("#legalCasesChartContainer").style("display", "none");
    d3.select("#legalCasesListContainer").style("display", "none");
    d3.select("#legalCasesDetailsContainer").style("display", "table-row");
}


/**
 * Hide details screen.
 */
Application.prototype.hideDetails = function() {

    d3.select("#legalCasesDetailsContainer").style("display", "none");
    d3.select("#legalCasesChartContainer").style("display", "table-row");
    d3.select("#legalCasesListContainer").style("display", "table-row");
}


/**
 * Get cases list object.
 * @returns {CasesList}
 */
Application.prototype.getCasesList = function() {

    return this.casesList;
}


/**
 * Get cases chart object.
 * @returns {CasesChart}
 */
Application.prototype.getCasesChart = function() {

    return this.casesChart;
}


/**
 * Application start point.
 */
Application.prototype.run = function() {

    var self = this;

    /*
     * Load data.
     */
    d3.csv("data/CaseData.csv", function(error, dataSet) {

        if (error) {
            return console.error(error);
        }

        self.dataSet = new DataSet(dataSet);

        self.searchBar = new SearchBar(self);
        self.casesChart = new CasesChart(self);
        self.casesList = new CasesList(self);
    })
}