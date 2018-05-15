"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_1 = require("./canvas");
var series_manager_1 = require("./series_manager");
var legend_manager_1 = require("./legend_manager");
var axes_manager_1 = require("./axes_manager");
var state_handler_1 = require("../utils/state_handler");
var event_bus_1 = require("../utils/event_bus");
var utils_1 = require("@operational/utils");
var theme_1 = require("@operational/theme");
var fp_1 = require("lodash/fp");
var defaultConfig = {
    duration: 1e3,
    height: 500,
    hidden: false,
    innerBarPadding: 2,
    innerBarPaddingCategorical: 0.2,
    legend: true,
    maxBarWidthRatio: 1 / 3,
    minBarWidth: 3,
    numberFormatter: function (x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); },
    outerBarPadding: 10,
    palette: theme_1.operational.colors.visualizationPalette,
    timeAxisPriority: ["x1", "x2", "y1", "y2"],
    visualizationName: "chart",
    width: 500,
};
var defaultDataAccessors = {
    series: function (d) { return d.series; },
    axes: function (d) { return d.axes; },
};
var defaultColorAssigner = function (palette) {
    return utils_1.colorAssigner(palette);
};
var initialColorAssigner = defaultColorAssigner(defaultConfig.palette);
var defaultSeriesAccessors = {
    data: function (d) { return d.data; },
    hide: function (d) { return d.hide || false; },
    hideInLegend: function (d) { return d.hideInLegend || false; },
    key: function (d) { return d.key || fp_1.uniqueId("key"); },
    legendColor: function (d) { return initialColorAssigner(d.key); },
    legendName: function (d) { return d.name || d.key || ""; },
    renderAs: function (d) { return d.renderAs; },
    axis: function (d) { return d.axis || "x1"; },
    xAttribute: function (d) { return d.xAttribute || "x"; },
    yAttribute: function (d) { return d.yAttribute || "y"; },
    xAxis: function (d) { return d.xAxis || "x1"; },
    yAxis: function (d) { return d.yAxis || "y1"; },
};
var initialComputed = {
    axes: {},
    canvas: {},
    focus: {},
    series: {},
};
var ChartFacade = /** @class */ (function () {
    function ChartFacade(context) {
        this.__disposed = false;
        this.context = context;
        this.events = new event_bus_1.default();
        this.state = this.insertState();
        this.canvas = this.insertCanvas();
        this.components = this.insertComponents();
        this.series = this.insertSeries();
    }
    ChartFacade.prototype.insertState = function () {
        return new state_handler_1.default({
            data: {},
            config: fp_1.defaults({ uid: fp_1.uniqueId("chart") })(defaultConfig),
            accessors: { data: defaultDataAccessors, series: defaultSeriesAccessors },
            computed: initialComputed,
        });
    };
    ChartFacade.prototype.insertCanvas = function () {
        return new canvas_1.default(this.state.readOnly(), this.state.computedWriter(["canvas"]), this.events, this.context);
    };
    ChartFacade.prototype.insertComponents = function () {
        return {
            legends: new legend_manager_1.default(this.state.readOnly(), this.state.computedWriter(["legend"]), this.events, {
                top: {
                    left: this.canvas.elementFor("legend-top-left"),
                    right: this.canvas.elementFor("legend-top-right"),
                },
                bottom: {
                    left: this.canvas.elementFor("legend-bottom-left"),
                },
            }),
            axes: new axes_manager_1.default(this.state.readOnly(), this.state.computedWriter("axes"), this.events, {
                xAxes: this.canvas.elementFor("xAxes"),
                xRules: this.canvas.elementFor("xRules"),
                yAxes: this.canvas.elementFor("yAxes"),
                yRules: this.canvas.elementFor("yRules"),
            }),
        };
    };
    ChartFacade.prototype.insertSeries = function () {
        return new series_manager_1.default(this.state.readOnly(), this.state.computedWriter(["series"]), this.events, this.canvas.elementFor("series"));
    };
    ChartFacade.prototype.data = function (data) {
        return this.state.data(data);
    };
    ChartFacade.prototype.config = function (config) {
        if (config.palette && !this.customColorAccessor) {
            var assignColors_1 = defaultColorAssigner(config.palette);
            this.accessors("series", {
                legendColor: function (d) { return assignColors_1(d.key); },
            });
        }
        return this.state.config(config);
    };
    ChartFacade.prototype.accessors = function (type, accessors) {
        if (type === "series" && fp_1.has("legendColor")(accessors)) {
            this.customColorAccessor = true;
        }
        return this.state.accessors(type, accessors);
    };
    ChartFacade.prototype.on = function (event, handler) {
        this.events.on(event, handler);
    };
    ChartFacade.prototype.off = function (event, handler) {
        this.events.removeListener(event, handler);
    };
    ChartFacade.prototype.draw = function () {
        this.state.captureState();
        this.series.assignData();
        this.components.legends.draw();
        this.components.axes.updateMargins();
        this.canvas.draw();
        this.components.axes.draw();
        this.series.draw();
        return this.canvas.elementFor("series").node();
    };
    ChartFacade.prototype.close = function () {
        if (this.__disposed) {
            return;
        }
        this.__disposed = true;
        this.events.removeAll();
        this.context.innerHTML = "";
    };
    return ChartFacade;
}());
exports.default = ChartFacade;
//# sourceMappingURL=facade.js.map