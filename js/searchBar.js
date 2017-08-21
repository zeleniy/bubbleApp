/**
 * Search bar constructor.
 * @constructor
 */
function SearchBar(application) {
    /**
     * Application object.
     * @member {Application}
     */
    this.application = application;
    /**
     * @member {Selection}
     */
    this.injurySelection = d3.select("#textSearch");
    /**
     * @member {String}
     */
    this.searchPlaceholder = "Search by injury...";
    /**
     * Search filters configuration.
     * @member {Object[]}
     */
    this.filters = [{
        head: "County",
        property : "County",
        selection : d3.select("#counties"),
        filterFunction : "filterBy",
        valueFunction : "getSelectBoxValue",
        activateFunction : "isFilterActive"
    }, {
        head: "State",
        property : "State",
        selection : d3.select("#states"),
        filterFunction : "filterBy",
        valueFunction : "getSelectBoxValue",
        activateFunction : "isFilterActive"
    }, {
        head: "Case type",
        property : "Case_type",
        selection : d3.select("#caseTypes"),
        filterFunction : "filterBy",
        valueFunction : "getSelectBoxValue",
        activateFunction : "isFilterActive"
    }, {
        property : "Injury",
        selection : this.injurySelection,
        filterFunction : "searchBy",
        valueFunction : "getTextBoxValue",
        activateFunction : "isSearchActive"
    }];
    /*
     * Initialize search bar.
     */
    this.init();
}


/**
 * Initialize search bar.
 */
SearchBar.prototype.init = function() {

    this.initTextSearch();
    this.initGrouping();
    this.initSelectBoxes();
}


/**
 * Initialize select boxes.
 */
SearchBar.prototype.initSelectBoxes = function() {

    var self = this;

    this.filters.forEach(function(filter) {

        if (filter.valueFunction != "getSelectBoxValue") {
            return;
        }

        var options = _.chain(this.application.getData())
            .pluck(filter.property)
            .unique()
            .value()
        .sort();

        options = this._appendHeadValue(options, filter.head);

        filter.selection.on("change", function() {
                self.update();
            }).selectAll("option")
            .data(options)
            .enter()
            .append("option")
            .property("value", String)
        .text(String);

    }, this)
}


/**
 * Initialize text search field.
 */
SearchBar.prototype.initTextSearch = function() {

    var self = this;

    this.injurySelection.property("value", "Search by injury...")
        .style("color", "lightgray")
        .on("focus", function() {
            var currentString = d3.select(this).property("value");
            if (currentString == self.searchPlaceholder) {
                d3.select(this).property("value", "")
                    .style("color", null)
            }
        }).on("blur", function() {
            var currentString = d3.select(this).property("value");
            if (/^\s*$/.test(currentString) || currentString == self.searchPlaceholder) {
                d3.select(this).property("value", self.searchPlaceholder)
                    .style("color", "lightgray")
            }
        }).on("input", function() {
            self.update(this, "Injury");
        });
}


SearchBar.prototype.initGrouping = function() {

    var self = this;

    var sortButtons = d3.selectAll(".sortButton")
        .on("mouseenter", function() {
            /*
             * Highlight tab.
             */
            d3.select(this).style("background-color", "lightgray")
        }).on("mouseout", function() {
            /*
             * Remove highlighting.
             */
            d3.select(this).style("background-color", null)
        }).on("click", function() {
            /*
             * Deselect all tabs.
             */
            d3.selectAll(".sortButton").classed("activeSortButton", false);
            /*
             * Get tab selection and value.
             */
            var selection = d3.select(this);
            var value = selection.text();
            /*
             * Highlight tab.
             */
            selection.classed("activeSortButton", true);
            /*
             * Run grouping.
             */
            if (value == "Judge" || value == "County") {
                self.application.getCasesChart().groupBy(value);
            } else {
                self.update();
            }
        })
}


/**
 * Update application using filters.
 * @param element
 * @param property
 */
SearchBar.prototype.update = function() {
    /*
     * Update application chart.
     */
    this.application.update(
        this.filter(this.application.getDataSet())
    );
}


SearchBar.prototype.isFilterActive = function(value, stopValue) {

    return value != stopValue;
}


SearchBar.prototype.isSearchActive = function(value) {

    return value.length > 0 && value != this.searchPlaceholder;
}


/**
 * Filter data set.
 * @param {DataSet} dataSet
 * @returns {DataSet}
 */
SearchBar.prototype.filter = function(dataSet) {
    /*
     * Loop over filters.
     */
    for (var i = 0; i < this.filters.length; i ++) {

        var filter = this.filters[i];
        /*
         * Get input value.
         */
        var value  = this[filter.valueFunction].call(this, filter.selection);
        /*
         * Filter data.
         */
        if (this[filter.activateFunction].call(this, value, filter.head)) {
            dataSet = dataSet[filter.filterFunction].call(
              dataSet, filter.property, value
            );
        }
    }

    return dataSet;
}


/**
 * Get text box current value.
 * @param {Selection} selection
 * @returns {String}
 */
SearchBar.prototype.getTextBoxValue = function(selection) {

    return selection.property("value").trim();
}


/**
 * Get select box current value.
 * @param {Selection} selection
 * @returns {String}
 */
SearchBar.prototype.getSelectBoxValue = function(selection) {
  /*
   * Select options.
   */
  var options = selection.selectAll("option");
  /*
   * Retrieve selected option.
   */
  return options.filter(function () {
      return this.selected; 
  }).text();  
}


/**
 * Append default value to options set.
 */
SearchBar.prototype._appendHeadValue = function(options, headValue) {

    var index = options.indexOf("");
    if (index > -1) {
        options[index] = headValue;
    } else {
        options.unshift(headValue);
    }

    return options;
}