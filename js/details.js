/**
 * Details screen representation.
 * @constructor
 */
function Details() {
    /*
     * Selectors set.
     */
    this.title   = d3.select("#caseDetailsTitle");
    this.amount  = d3.select("#caseDetailsAmount");
    this.state   = d3.select("#caseDetailsState");
    this.court   = d3.select("#caseDetailsCourt");
    this.judge   = d3.select("#caseDetailsJudge");
    this.year    = d3.select("#caseDetailsYear");
    this.type    = d3.select("#caseDetailsType");
    this.injury  = d3.select("#caseDetailsInjury");
    this.summary = d3.select("#caseDetailsSummary");
    /**
     * Amount format function.
     */
    this.format = d3.format(",");
    /*
     * Add handler for "back" button click.
     */
    d3.select("#caseDetailsBack").on("click", function() {
        application.hideDetails();
    })
}


/**
 * Update details screen.
 * @param {String[]} d
 */
Details.prototype.update = function(d) {

    this.title.text(d["Case_name"]);
    this.amount.text(d["Is_na"] ? "NA" : ("$" + this.format(d["Total_amount"])));
    this.state.text(d["State"]);
    this.court.text(d["Court"]);
    this.judge.text(d["Judge"]);
    this.year.text(d["Start_year"]);
    this.type.text(d["Case_type"]);
    this.injury.text(d["Injury"]);
    this.summary.text(d["Case.summary"]);
}