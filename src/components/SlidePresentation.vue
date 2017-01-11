<template>
  <div>
    <div id='presentation-container'>
      <pipe-map></pipe-map>
      <slide :isIntro='true' :id='introId'></slide>
      <!-- we forgo the use of a v-for directive to easily interrupt year cards with infoCards -->
      <slide :isYear='true' :year="'2000'" :accidents="years[2000]['accidents']"></slide>
      <slide :isYear='true' :year="'2001'" :accidents="years[2001]['accidents']"></slide>
      <!-- 2001 alaskan accident
      <slide :isInfo='true'
             :id="infoCardInfo['2001'].idName"
             :location="infoCardInfo['2001'].location"
             :description="infoCardInfo['2001'].description">
      </slide>-->
      <slide :isYear='true' :year="'2002'" :accidents="years[2002]['accidents']"></slide>
      <slide :isOutro='true' :id='outroId'></slide>
    </div>
  </div>
</template>

<script>
import PipeMap from 'components/Map.vue'

import Slide from 'components/Slide.vue'
import filter from 'lodash.filter'
import sortby from 'lodash.sortby'
import debounce from 'lodash.debounce'
import utils from 'utils'
import Vue from 'vue'
import $ from 'jquery'

export default {
  props: {
  },

  data() {
    let dateRange = Array.from(new Array(17), (x, i) => 2000 + i)

    return {
      presContainer: $(window),
      yearsRange: dateRange,
      // the below (`year`) is like python dict comprehension
      years: dateRange.reduce((obj, x) => Object.assign(obj, { [x]: {'accidents': 0} }), {}),
      currentYear: 2000,
      introId: 'intro-card',
      outroId: 'outro-card',
      infoCardInfo: {
        '2000': {
          idName: 'info2000',
          location: 'Township, Michigan',
          description: "On June 7, a stopple fitting weld failed on a Wolverine Pipeline Company line, causing a rupture releasing 75,000 US gallons (280,000 L) of gasoline into the environment, and causing the evacuation of more than 500 houses..."
        },
        '2001': {
          idName: 'info2001',
          location: 'Alaska',
          description: "On October 4th, Daniel Lewis shot a .338 caliber rifle in the Trans-Alaska Pipeline. The pressure caused the oil to spew about 75 feet over a nearby road. Crews cleaned up over 260,000 gallons. Lewis was charged with a DWI, felony assault, weapons misconduct and criminal mischief."
        }
      }
    }
  },

  components: {
    'slide': Slide,
    'pipe-map': PipeMap
  },

  mounted() {
    this.presContainer.on('scroll.scroller', debounce(this.trackSlide, 10))
  },

  updated() { // ensure we render sites on reload of page
    this.trackSlide()
  },

  methods: {

    trackSlide() {
      for (let year of this.yearsRange) { // this block is a good candidate for
        let cardId = '#' + year + '-card' // performance centric refactor
        let el = $(cardId)
        if (el && utils.isElementInViewport(el)) {
          if( this.currentYear != year){
            this.currentYear = year
            let currentYear = this.currentYear.toString()
            window.eventBus.$emit('updateCurrentYear', currentYear)
          }
         }
      }
    }
  }
}
</script>

<style scoped>
  #presentation-container {
    position: absolute;
    background: transparent;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
  }
</style>
