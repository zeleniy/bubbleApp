/**
 * @param {Application} application
 * @constructor
 */
function CasesList(application) {
    /**
     * Application object.
     * @member {Application}
     */
    this.application = application;
    /**
     * Current data set.
     * @member {DataSet}
     */
    this.dataSet = this.application.getDataSet();
    /**
     * Cases table.
     * @member {Selection}
     */
    this.table = d3.select("#legalCasesList");
    /**
     * Show more button.
     * @member {Selection}
     */
    this.button = d3.select("#showMore");
    /**
     * Highlighted row.
     * @member {Selection}
     */
    this.highlightedRow;
    /*
     * Initialize list.
     */
    this.init();
    /*
     * Show first rows.
     */
    this.update();
}


/**
 * Highlight row.
 */
CasesList.prototype.highlight = function(d) {

    this.highlightedRow = this.table.select(".legalCaseRow" + d.Id)
        .classed("caseListActiveItem", true);
}


/**
 * Remove row highlight.
 */
CasesList.prototype.removeHighlight = function() {

    if (this.highlightedRow) {
        this.highlightedRow.classed("caseListActiveItem", null);
    }
}


/**
 * Initialize cases list.
 */
CasesList.prototype.init = function() {

    var self = this;
    this.button.on("click", function() {
        self.update();
    })
}


/**
 * Create new mouse event.
 * @param type
 * @returns
 */
CasesList.prototype.getEvent = function(type) {

    var event = document.createEvent("MouseEvents");
    event.initMouseEvent(
        type, /* type */
        true, /* canBubble */
        true, /* cancelable */
        window, /* view */
        0, /* detail */
        0, /* screenX */
        0, /* screenY */
        0, /* clientX */
        0, /* clientY */
        false, /* ctrlKey */
        false, /* altKey */
        false, /* shiftKey */
        false, /* metaKey */
        0, /* button */
        null); /* relatedTarget */

    return event;
}


/**
 * Update list.
 * @param {DataSet} dataSet
 */
CasesList.prototype.update = function(dataSet) {

    var self = this;

    if (dataSet != undefined) {
        this.dataSet = dataSet;
        this.button.attr("class", "activeButton").on("click", function() {
            self.update();
        })
    }

    var table = this.table.selectAll("tr").data(this.dataSet.next(), function(d) {
        return d.Id;
    });

    table.exit().style("display", "none");
    table.style("display", "table-row");
    table.enter()
        .append("tr")
        .attr("class", function(d) {
            return "legalCaseRow" + d.Id
        }).on("mouseover", function(d) {
            /*
             * Highlight row.
             */
            d3.select(this).classed("caseListActiveItem", true)
            /*
             * Find corresponding bubble.
             */
            var canvas = application.getCasesChart().getCanvas();
            var bubble = canvas.select(".legalCaseBubble" + d.Id);
            /*
             * Simulate mouse over event.
             */
            var event = self.getEvent("mouseover");
            bubble.node().dispatchEvent(event);
        }).on("mouseout", function(d) {
            /*
             * Remove highlight.
             */
            d3.select(this).classed("caseListActiveItem", false)
            /*
             * Find corresponding bubble.
             */
            var canvas = application.getCasesChart().getCanvas();
            var bubble = canvas.select(".legalCaseBubble" + d.Id);
            /*
             * Simulate mouse over event.
             */
            var event = self.getEvent("mouseout");
            bubble.node().dispatchEvent(event);
        }).on("click", function(d) {
           application.showDetails(d); 
        }).each(function(d) {
            /*
             * Insert first column.
             */
            var td = d3.select(this).append("td")
                .attr("valign", "top")
                .attr("width", "20%");
            td.insert("div")
                .text(d["Case_name"])
                .style("font-weight", "bold")
            td.insert("div").text(d["Judge"])
            td.insert("div").text(d["State"])
            td.insert("div").text(d["County"])
            td.insert("div").text(d["Start_year"])

            /*
             * Insert second column.
             */
            td = d3.select(this).append("td")
                .attr("valign", "top")
                .attr("width", "65%");
            td.insert("div")
                .text("Case Summary")
                .style("font-weight", "bold")
            td.insert("div").text(d["Case.summary"])
            var div = td.insert("div");
            div.insert("span").text("Injuries: ")
                .style("font-weight", "bold")
            div.insert("span").text(d["Injury"])

            /*
             * Insert third column.
             */
            td = d3.select(this).append("td")
                .attr("valign", "top")
                .attr("align", "right")
                .attr("width", "15%");
            td.insert("div")
                .text("$" + d["Total_amount"])
                .style("font-weight", "bold")
        })

    if (this.dataSet.isFinished()) {
        this.button.attr("class", "inactiveButton").on("click", null)
    }
}