/**
 * DataSet constructor.
 * @constructor
 */
function DataSet(data) {
    /**
     * Data set array.
     * @member {Object[]}
     */
    this.data = data.map(function(d) {
        /*
         * Convert into Number data type.
         */
        d["Total_amount"] = Number(d["Total_amount"]);
        d["Is_na"] = Number(d["Is_na"]);
        /*
         * Trim white spaces.
         */
        d["County"] = d["County"].trim();
        d["State"] = d["State"].trim();
        d["Case_type"] = d["Case_type"].trim();

        return d;
    });
    /**
     * Current position.
     * @member {Integer}
     */
    this.counter = 0;
}


/**
 * Get data set array.
 * @returns {Object[]}
 */
DataSet.prototype.getData = function() {

    return this.data;
}



DataSet.prototype.isFinished = function() {

    if (this.counter >= this.data.length) {
        return true;
    } else {
        return false;
    }
}


/**
 * Get next data array.
 * @returns {Object[]}
 */
DataSet.prototype.next = function() {

    from = this.counter;
    to   = from + 5;

    this.counter = to;

    return this.getData().slice(0, to);
}


/**
 * Filter data set by substring search.
 * @param {String} key
 * @param {String} value
 * @returns {DataSet}
 */
DataSet.prototype.searchBy = function(key, value) {

    return value.split(/\s+/).reduce(function(dataSet, word) {
        return new DataSet(dataSet.getData().filter(function(d) {
            if (d[key].toLowerCase().indexOf(word.toLowerCase()) > -1) {
                return true;
            }
        }))
    }, this)
}


/**
 * Filter data set by criteria.
 * @param {String} key
 * @param {String} value
 * @returns {DataSet}
 */
DataSet.prototype.filterBy = function(key, value) {

    var filteredData = this.data.filter(function(d) {
        if (d[key] == value) {
            return true;
        }
    })

    return new DataSet(filteredData);
}