<template>
  <div id='main-container'>
    <modal></modal>
    <slide-pres ></slide-pres>
  </div>
</template>

<script>
import SlidePresentation from 'components/SlidePresentation.vue'
import Modal from 'components/Modal.vue'
import moment from 'moment'
import Vue from'vue'
import utils from 'utils'
import jQuery from 'jquery'

export default {
  name: 'main-app',

  data() {
      return {
      }
  },

  components: {
    'modal': Modal,
    'slide-pres': SlidePresentation,
  },

  mounted() {
  },

  methods: {
  }
}
</script>

<style>
  /* commandeer the em unit here */
  html, body {
    font-family: georgia, "times new roman", times, serif;
    margin: 0;
    font-size: 12px;
  }
  @media only screen and (max-width: 768px) {
    body {
      font-size: 8px;
    }
  }
  @media only screen and (min-width: 768px)
         and (max-width: 1400px){
    body {
      font-size: 16px;
    }
  }
  @media only screen and (min-width: 1400px)
         and (max-width: 2880px) {
    body {
      font-size: 24px;
    }
  }
</style>
