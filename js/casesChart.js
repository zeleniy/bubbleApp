/**
 * Legal cases chart.
 */
function CasesChart(application) {

    var self = this;
    /**
     * Application object.
     * @member {Application}
     */
    this.application = application;
    /**
     * Bubbles motion time.
     */
    this.animationTime = 1500;
    /**
     * Bubbles selection.
     * @member {Selection}
     */
    this.bubbles;
    /**
     * Chart container.
     * @member {Selection}
     */
    this.container = d3.select("#legalCasesChart");
    /**
     * Single bubble canvas.
     * @member {Selection}
     */
    this.singleGroupCanvas;
    /**
     * Multiple bubbles canvas.
     * @member {Selection}
     */
    this.multiGroupCanvas;
    /**
     * Chart margins.
     * @member {Object}
     */
    this.margin = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };
    /**
     * Container dimension.
     * @member {Object}
     */
    this.dimension = this.container.node().getBoundingClientRect();
    /**
     * Chart width.
     * @member {Integer}
     */
    this.width = this.dimension.width - this.margin.left - this.margin.right;
    /**
     * Chart height.
     * @member {Integer}
     */
    this.height = this.dimension.height - this.margin.top - this.margin.bottom;
    /*
     * Calculate top level bubble diameter.
     */
    if (this.width > this.height) {
        this.diameter = this.height;
    } else {
        this.diameter = this.width;
    }
    /**
     * Data set minimum value.
     * @member {Integer}
     */
    this.min = d3.min(this.application.getData().filter(function(d) {
        if (d.Total_amount != 0) {
            return true;
        }}).map(function(d) {
            return d.Total_amount;
        }));
    /**
     * Data set maximum value.
     * @member {Integer}
     */
    this.max = d3.max(this.application.getData(), function(d) {
        return d.Total_amount;
    });
    /**
     * Bubbles radius scale.
     * @member {Function}
     */
     this.rScale = d3.scale.linear()
         .domain([0, this.min, this.max])
         .range([5, 10, this.diameter / 10]);
    /**
     * Bubbles pack layout.
     * @member {Object}
     */
    this.packLayout = d3.layout.pack()
        .size([this.diameter, this.diameter])
        .padding(2)
        .value(function(d) {
            return d.Total_amount;
        }).radius(function(r) {
            return self.rScale(r);
        })
    if (this.getParameterByName("sort") == "a") {
        this.packLayout.sort(function(a, b) {
            if (a.Total_amount > b.Total_amount) {
                return -1;
            } else if (a.Total_amount < b.Total_amount) {
                return 1;
            } else {
                return 0;
            }
        })
    } else if (this.getParameterByName("sort") == "b") {
        
    } else {
        this.packLayout.sort(function(a, b) {
            return Math.round(Math.random());
        })
    }
    /*
     * Initialize tooltip.
     */
    this.format = this.application.getFormat();
    this.tip = d3.tip().attr("class", "d3-tip").html(function(d) {
        return "<table cellpadding='7em'>" +
            "<tr><td>Amount</td><td>" + (d["Is_na"] ? "NA" : ("$" + self.format(d["Total_amount"]))) + "</td></tr>" +
            "<tr><td>Judge</td><td>" + d["Judge"] + "</td></tr>" +
            "<tr><td>County</td><td>" + d["County"] + "</td></tr>" +
        "</table>";
    });

    /*
     * Render chart.
     */
    this.render();
}


/**
 * Retrieve GET parameter.
 * @param {String} name
 * @return {String}
 */
CasesChart.prototype.getParameterByName = function(name) {

    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


/**
 * Get random value within range.
 */
CasesChart.prototype.getRandomArbitrary = function(min, max) {

    return Math.random() * (max - min) + min;
}


/**
 * Get chart canvas.
 * @returns {Selection}
 */
CasesChart.prototype.getCanvas = function() {

    return this.singleGroupCanvas;
}


/**
 * Group chart.
 * @param {String[]} groups
 */
CasesChart.prototype.groupBy = function(value) {

    var self = this;
    /*
     * Remove old groups labels.
     */
    this.removeLabels();
    /*
     * Calculate columns amount, their width and rows height.
     */
    var columns;
    var colWidth  = 300;

    var quotient = this.width / colWidth;
    if (quotient < 1) {
        columns = 1;
        colWidth = this.width;
    } else {
        columns = Math.round(quotient);
        colWidth = this.width / columns;
    }

    var colHeight = colWidth;
    /*
     * Make groups.
     */
    var unsortedGroups = _.groupBy(this.application.getData(), function(d) {
        return d[value];
    });
    /*
     * Sort groups names.
     */
    var groupNames = _.chain(unsortedGroups)
        .keys()
        .sort()
        .value();
    /*
     * Sort groups by names.
     */
    var groups = groupNames.map(function(groupName) {
        return unsortedGroups[groupName];
    })
    /*
     * Resize chart.
     */
    this.resize(Math.ceil(Object.keys(groups).length / columns) * colHeight);
    /*
     * Loop over groups.
     */
    _.each(_.values(groups), function(groupData, i) {
        /*
         * Calculate x shift for group.
         */
        var colNumber = i % columns;
        var xShift = colWidth * colNumber + this.bubblesXShift;
        /*
         * Calculate y shift for group.
         */
        var rowNumber = Math.floor(i / columns);
        var yShift = colHeight * rowNumber + 20;
        /*
         * Get nodes from pack layout.
         */
        var nodes = this.packLayout
            .size([colWidth, colHeight])
            .nodes({ "children" : groupData })
            .filter(function(node) {
                return node.parent;
            })
        /*
         * Update bubbles.
         */
        var bubbles = this.bubbles.data(nodes, function(d) {
            return d.Id;
        });
        /*
         * Update bubbles selection.
         */
        bubbles.transition()
            .duration(this.animationTime)
            .attr("r", function(d) {
                return d.r;
            }).attr("cx", function(d) {
                return d.x;
            }).attr("cy", function(d) {
                return d.y;
            }).attr("transform", "translate(" + xShift + ", " + yShift + ")")
        /*
         * Append statistics.
         */
    this.multiGroupCanvas.selectAll(".statistics")
        .data(["Count", "Average", "Median",])
        .enter()
        .append("text")
        .attr("x", function(d, i) {
            return colWidth * colNumber;
        }).attr("y", function(d, i) {
            return rowNumber * colWidth + 40 + i * 10;
        }).attr("text-anchor", "start")
        .attr("class", "statistics-label")
        .text(function(d) {
            if (d == "Count") {
                return "Count: " + nodes.length;
            } else if (d == "Average") {
                return "Average: $" + self.format(Math.round(d3.mean(nodes, function(node) {
                    return node.Total_amount;
                })));
            } else {
                return "Median: $" + self.format(Math.round(d3.median(nodes, function(node) {
                    return node.Total_amount;
                })));
            }
        })

    }, this);
    /*
     * Append new groups labels.
     */
    this.multiGroupCanvas.selectAll(".group-lables")
        .data(groupNames)
        .enter()
        .append("text")
        .attr("x", function(d, i) {
            var colNumber = i % columns;
            return colWidth * colNumber + colWidth / 2;
        }).attr("y", function(d, i) {
            var rowNumber = Math.floor(i / columns);
            return colHeight * rowNumber + 20;
        }).attr("text-anchor", "middle")
        .text(String)
}


/**
 * Resize chart.
 * @param {Number} height
 */
CasesChart.prototype.resize = function(height) {
    /*
     * Update SVG element height.
     */
    this.svg
        .transition()
        .duration(this.animationTime)
        .attr("height", height);
}


/**
 * Update chart.
 * @param {DataSet} dataSet
 */
CasesChart.prototype.update = function(dataSet) {
    /*
     * Remove groups labels.
     */
    this.removeLabels();
    /*
     * Resize chart.
     */
    this.resize(this.height);
    /*
     * Update pack layout with new size and get nodes.
     */
    var nodes = this.packLayout
        .size([this.diameter, this.diameter])
        .nodes({"children": dataSet.getData()})
        .filter(function(d) {
            return ! d.children;
        });
    /*
     * Update bubbles.
     */
    var bubbles = this.bubbles.data(nodes, function(d) {
        return d.Id;
    });
    /*
     * Hide absent bubbles.
     */
    bubbles.exit()
        .transition()
        .duration(500)
        .attr("r", 0)
   /*
    * Update selection.
    */
    bubbles.transition()
        .duration(this.animationTime)
        .attr("r", function(d) {
            return d.r;
        }).attr("cx", function(d) {
            return d.x;
        }).attr("cy", function(d) {
            return d.y;
        }).attr("transform", "translate(0, 0)");
    /*
     * Show statistics.
     */
    this.appendMainStatistics(nodes);
}


/**
 * Remove groups labels.
 */
CasesChart.prototype.removeLabels = function() {

    this.svg.selectAll("text").remove();
}


/**
 * Append statistics to main view.
 * @param {Object[]} nodes
 */
CasesChart.prototype.appendMainStatistics = function(nodes) {

    var self = this;

    this.singleGroupCanvas.selectAll(".statistics")
        .data(["Count", "Average", "Median",])
        .enter()
        .append("text")
        .attr("x", function(d, i) {
            return 20;
        }).attr("y", function(d, i) {
            return 20 + i * 10;
        }).attr("text-anchor", "start")
        .attr("class", "statistics-label")
        .text(function(d) {
            if (d == "Count") {
                return "Count: " + nodes.length;
            } else if (d == "Average") {
                return "Average: $" + self.format(Math.round(d3.mean(nodes, function(node) {
                    return node.Total_amount;
                })));
            } else {
                return "Median: $" + self.format(Math.round(d3.median(nodes, function(node) {
                    return node.Total_amount;
                })));
            }
        })
}


/**
 * Initialize chart.
 */
CasesChart.prototype.render = function() {

    var self = this;
    /*
     * Create main SVG element.
     */
    this.svg = this.container.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom);
    /*
     * Create nodes.
     */
    var packLayout = this.packLayout.nodes({"children": this.application.getData()})
    /*
     * Retrieve top level node.
     */
    var topNode = packLayout.filter(function(d) {
        return ! d.parent;
    })[0];
    /*
     * Resize chart if top level node node diameter more than SVG height.
     */
    if (topNode.r * 2 > this.height + this.margin.top + this.margin.bottom) {
        this.resize(topNode.r * 2);
    }
    /*
     * Retrieve children.
     */
    var nodes = packLayout.filter(function(d) {
        return ! d.children;
    });
    /*
     * Create chart canvas.
     */
    this.bubblesXShift = topNode.x - this.width / 2;
    this.singleGroupCanvas = this.svg.append("g")
        .attr("transform", "translate(" + (- this.bubblesXShift) + ", " + this.margin.top + ")")
    this.multiGroupCanvas = this.svg.append("g");
    /*
     * Invoke the tip in the context of visualization.
     */
    this.singleGroupCanvas.call(this.tip)
    /*
     * Append circles to the chart.
     */
    this.bubbles = this.singleGroupCanvas.selectAll(".legalCaseBubble")
        .data(nodes, function(d) {
            return d.Id;
        }).enter()
        .append("circle")
        .attr("class", function(d) {
            return "legalCaseBubble" + d.Id
        }).attr("opacity", .5)
        .attr("r", 0)
        .attr("cx", function(d) {
            return self.getRandomArbitrary(0, self.diameter);
        }).attr("cy", function() {
            return self.getRandomArbitrary(0, self.diameter);
        }).attr("fill", function(d) {
            if (d["Is_na"] == 1) {
                return "gray";
            } else {
                return d.Color;
            }
        })
    /*
     * Run initial animation.
     */
    this.bubbles.transition()
        .duration(this.animationTime)
        .attr("r", function(d) {
            return d.r;
        }).attr("cx", function(d) {
            return d.x;
        }).attr("cy", function(d) {
            return d.y;
        }).each("end", function() {
            /*
             * Append mouseover and mouseout event handlers on each
             * bubble at the end of animation.
             */
            d3.select(this).on("mouseover", function(d) {
                /*
                 * Increase bubble opacity.
                 */
                d3.select(this).transition()
                    .duration(500)
                    .attr("opacity", .8)
                /*
                 * Show tooltip.
                 */
                self.tip.show(d);
                /*
                 * Highlight corresponding cases list row.
                 */
                application.getCasesList().highlight(d);
            }).on("mouseout", function(d) {
                /*
                 * Decrease bubble opacity.
                 */
                d3.select(this).transition()
                    .duration(500)
                    .attr("opacity", .5)
                /*
                 * Hide tooltip.
                 */
                self.tip.hide(d);
                /*
                 * Remove row highlight.
                 */
                application.getCasesList().removeHighlight();
            }).on("click", function(d) {
                application.showDetails(d);
            })
    })

    this.appendMainStatistics(nodes);
}