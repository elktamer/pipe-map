<template>
  <div id='map-component-container'>
    <div id='map-container'>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import $ from 'jquery'

export default {
  name: 'd3-app',

  props: {
    siteData: {}
  },

  data() {
    return {
      currentYear: 2000,
      currentSiteData: [],
      shiftTypes:[]
    }
  },

  created() {
    window.eventBus.$on('updateCurrentYear', d => {
      this.currentYear = d
      console.log( this.currentYear)
      this.drawSites(this.currentSiteData)
    })
  },

  mounted() {
    this.loadCSV("../data/pipe-data.csv")
    this.loadJson("../data/shiftTypes.json")
    this.createContainer()

    // create scale
    this.radiusFunc = d3.scaleSqrt()
                                .domain([0, 1e6])
                                .range([5, 50])
    this.enterRadius = "0" // size to transition from to actual radius
    this.exitRadius = "1" // size to transition to before disappearing
    this.radialUnits = "em"
    this.radialModifer = 0.075
    this.width = $("#map-container").width()
    this.height = $("#map-container").height()
    this.drawMap()
    d3.select(window).on('resize', this.resizeMap)
    this.resizeMap()
  },

  methods: {
    createContainer() {
      this.svg = d3.select("#map-container")
                      .append("svg")
                      .append("g")
    },
    drawMap() {
      let x = this.width / 2,
          y = this.height / 2
      this.projection = d3.geoAlbersUsa()
      this.projection.scale(this.width)
      this.projection.translate([x, y])
      let path = d3.geoPath().projection(this.projection)
      d3.json("../data/us.json", (error, json) => {
        if (error) return console.log(error)
        this.svg.append("path")
              .datum(topojson.feature(json, json.objects.land))
              .attr("d", path)
              .attr("class", "land-boundary")
        this.svg.append("path")
              .datum(topojson.mesh(json, json.objects.states, function(a, b) {return a !== b; }))
              .attr("d", path)
              .attr("class", "state-boundary")
      })
    },
    drawSites(data) {
      var shiftdata = this.shift2Data(this.shiftTypes);
      var shiftColour = d3.scaleOrdinal(d3.schemeCategory20c);
      var column = this.svg.selectAll(".square")
      	.data(shiftdata)
      	.enter().append("rect")
      	.attr("class","square")
      	.attr("y", function(d, i) {
      		console.log( d.key);
      		return d.key*10;
      	})
      	.attr("x", function(d) {
      		return d.time*10;
      	})
      	.attr("width", function(d) { return 10; })
      	.attr("height", function(d) {
      		return 10;
      	})
      	.style("fill", function(d,i){
      		if( d.value > 0) return shiftColour(d.key);
      		return "#fff";
      	}
      	)
      	.style("stroke", "#fff");

      let sites = this.svg.selectAll('.site, .site-unhighlighted, .site-highlighted')
                            .data(data.filter(d=> {
                               return this.currentYear == d.date.getFullYear();
                             }), d => {
                              return d['uuid']
                            })
      // enter
      sites.enter()
              .append('circle')
              .attr("class", d => {
                return this.setSiteClass(d.date.getFullYear())
              })
              .attr("cx", d => {
                return this.projection([d.lng, d.lat])[0]
              })
              .attr("cy", d => {
                return this.projection([d.lng, d.lat])[1] //can this be shortened?
              })
              .attr("r", d => {
                return (this.enterRadius)*this.radialModifer + this.radialUnits
              })

              .transition().duration(750)
                .attr("r", d => {
                  d.gallons = parseInt(d.gallons) ?
                              parseInt(d.gallons) :
                              0
                  return this.radiusFunc(d.gallons)*this.radialModifer + this.radialUnits
                })
      //update
      sites.attr("class", d => {
        return this.setSiteClass(d.date.getFullYear())
      })
      // below are to ensure responsiveness of sites
      .attr("cx", d => {
        return this.projection([d.lng, d.lat])[0]
      })
      .attr("cy", d => {
        return this.projection([d.lng, d.lat])[1] //can this be shortened?
      })

      sites.exit()
        .transition().duration(200)
          .attr("r", (this.exitRadius)*this.radialModifer + this.radialUnits)
          .remove()
    },
    drawLegend() {
      let x = this.width - this.width / 10,
          y = this.height - this.height / 10
          this.svg.select(".legend").remove();
        this.legend = this.svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${x}, ${y})`)
          .selectAll("g")
            .data([1e6, 5e5, 1e5])
          .enter().append("g");
        this.legend.append("circle")
            .attr("cy", d => { return -this.radiusFunc(d)*this.radialModifer + this.radialUnits})
            .attr("r", d => { return this.radiusFunc(d)*this.radialModifer + this.radialUnits});

        this.legend.append("text")
            .attr("y", d => { return  -2.4*this.radiusFunc(d)*this.radialModifer + this.radialUnits; })
            .attr("dy", "2.5" + this.radialUnits)
            .text(d3.format(".1s"));
    },
    setSiteClass(year) {
      if (year == parseInt(this.currentYear)) {
        return 'site site-highlighted'
      }
      return 'site site-unhighlighted'
    },
    resizeMap() {
      this.width = $("#map-container").width()
      this.height = $("#map-container").height()
      this.svg
            .style("width", this.width + 'px')
            .style("height", this.height + 'px')

      let x = this.width / 2,
          y = this.height / 2
      this.projection
            .translate([x, y])
            .scale(this.width)
      let path = d3.geoPath().projection(this.projection)
      this.svg.select('.land-boundary').attr('d', path)
      this.svg.select('.state-boundary').attr('d', path)
      this.drawLegend()
      this.drawSites(this.currentSiteData)
    },
    loadCSV(f) { //could be moved to utils
      d3.csv(f)
          .row( d => {
            return {
              uuid: d.uuid,
              description: d.description,
              lat: d.latitude,
              lng: d.longitude,
              city: d.city,
              state: d.state,
              refLink: d['ref_link'],
              gallons: d.gallons,
              date: new Date(d.date),
              accidentType: d['accident_type']
            }
          })
          .get( (err, rows) => {
            if (err) return console.error(err)
            this.currentSiteData = rows
          })
    },
    loadJson(f){
      d3.json(f, data =>{
        this.shiftTypes = data;
      })
    },
    shift2Data(shifts) {
			var timeParse = d3.timeParse("%Y-%m-%dT%H:%M:%S.000Z");

			var radialData = [];
			for (var hour = 0; hour < 24; hour++) {
				shifts.forEach(function (d) {
					var start = timeParse(d.startTimeString).getHours() - 6
						if (start < 0)
							start = start + 23;
						var end = timeParse(d.endTimeString).getHours() - 6;
					if (end < 0)
						end = end + 24;
					if ((hour > start && hour <= end) ||
						(end < start && ((hour > start && hour >= end) || (hour < start && hour <= end)))) {
						radialData.push({
							key: d.code,
							value: 1,
							time: hour
						});
					} else {
						radialData.push({
							key: d.code,
							value: 0,
							time: hour
						});
					}
				});
			}
			return radialData;
		}

  }
}
</script>

<style>
  svg {
    width: 100%;
    height: 100%;
  }
  #map-component-container {
    position: fixed;
    height: 100%;
    width: 100%;
  	display: flex;

  	align-items: center;
    justify-content: center;
  }

  #map-container {
    width: 100%;
    height: 100vh;
  }

  path {
    fill: none;
    stroke: #AAAAAA;
    stroke-width: .5px;
  }
  .land-boundary {
    stroke-width: 1px;
  }
  .county-boundary {
    stroke: #ddd;
  }
  .site {
    opacity: 0;
  }
  .site-unhighlighted {
    stroke-width: 1px;
    opacity: 0.5;
    fill: #363636;
  }

  .site-highlighted {
    stroke-width: 1px;
    stroke: black;
    fill: #E9D542;
    opacity: 0.7;
  }
  .site:hover, .site-highlighted:hover {
    opacity: 1.0;
    stroke: black;
    fill: #85BBDD;
    cursor: pointer;
  }
  .legend circle {
    fill: #E9D542;
    stroke: black;
    opacity: 0.5;
  }

  .legend text {
    fill: black;
    font-family: "Courier New", Courier, monospace;
    font-size: 1em;
    text-anchor: middle;
  }
  .hidden {
    position: absolute !important;
    top: -9999px !important;
    left: -9999px !important;
  }
  .tooltip {
    position: absolute;
    padding: 1%;
    font: 2.5vh sans-serif;
    background: #141E1E;
    color: white;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
  }
  .gallons-label {
    font-size: 1.8vh;
  }
  @media only screen and (max-width: 622px) {
    svg {
      margin-left: 1%; /* Temporary hack to center map */
    }
    .legend text {
      font-size: 3em;
    }
  }
</style>
