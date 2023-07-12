<template>
  <!-- tokenomics -->
  <section class="section" id="tokenomics">
    <div class="container">
      <div class="row no-gutters">
        <!-- section title -->
        <div
          class="col-12 col-md-10 offset-md-1 col-lg-6 order-lg-2 offset-lg-0 align-self-center"
        >
          <div class="section__title section__title--grid-left">
            <strong>Token & economics</strong>
            <h2>Tokenomics</h2>
            <p>
              The point of using Lorem Ipsum is that it has a more-or-less
              normal distribution of letters, as opposed to using 'Content here,
              content here', making it look like readable English.
            </p>
            <p>
              There are many variations of passages of Lorem Ipsum available,
              but the majority have suffered alteration in some form.
            </p>
          </div>

          <ul class="section__tokenomics">
            <li class="clr1">Liquidity – 10%</li>
            <li class="clr2">Public Sale – 6%</li>
            <li class="clr3">Strategic – 9%</li>
            <li class="clr4">Private – 12%</li>
            <li class="clr5">Seed – 9%</li>
            <li class="clr6">Team – 10%</li>
            <li class="clr7">Strategic Reserve – 19%</li>
            <li class="clr8">Advisors – 5%</li>
            <li class="clr9">Community – 20%</li>
          </ul>
        </div>
        <!-- end section title -->

        <!-- chart -->
        <div class="col-12 col-lg-6 order-lg-1 align-self-center">
          <div class="section__chart">
            <canvas id="myChart"></canvas>
          </div>
        </div>
        <!-- end chart -->
      </div>
    </div>
  </section>
  <!-- end tokenomics -->
</template>

<script setup lang="ts">
const data = {
  labels: [
    'Liquidity',
    'Public Sale',
    'Strategic',
    'Private',
    'Seed',
    'Team',
    'Strategic Reserve',
    'Advisors',
    'Community',
  ],
  datasets: [
    {
      data: [10, 6, 9, 12, 9, 10, 19, 5, 20],
      backgroundColor: [
        'rgba(232, 193, 137, 0.9)',
        'rgba(140, 122, 209, 0.9)',
        'rgba(243, 239, 189, 0.9)',
        'rgba(34, 127, 158, 0.9)',
        'rgba(99, 120, 214, 0.9)',
        'rgba(224, 118, 182, 0.9)',
        'rgba(232, 209, 137, 0.9)',
        'rgba(121, 220, 155, 0.9)',
        'rgba(170, 114, 206, 0.9)',
      ],
      borderWidth: 0,
    },
  ],
}

const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div')

  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.style.background = 'rgba(20, 26, 42, 0.7)'
    tooltipEl.style.borderRadius = '12px'
    tooltipEl.style.color = 'white'
    tooltipEl.style.opacity = 1
    tooltipEl.style.pointerEvents = 'none'
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.transform = 'translate(-50%, 0)'
    tooltipEl.style.transition = 'all .4s ease'

    const table = document.createElement('table')
    table.style.margin = '0px'

    tooltipEl.appendChild(table)
    chart.canvas.parentNode.appendChild(tooltipEl)
  }

  return tooltipEl
}

const externalTooltipHandler = (context: any) => {
  // Tooltip Element
  const { chart, tooltip } = context
  const tooltipEl = getOrCreateTooltip(chart)

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0
    return
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || []
    const bodyLines = tooltip.body.map((b: any) => b.lines)

    const tableHead = document.createElement('thead')

    titleLines.forEach((title: any) => {
      const tr: any = document.createElement('tr')
      tr.style.borderWidth = 0

      const th: any = document.createElement('th')
      th.style.borderWidth = 0
      const text = document.createTextNode(title)

      th.appendChild(text)
      tr.appendChild(th)
      tableHead.appendChild(tr)
    })

    const tableBody = document.createElement('tbody')
    bodyLines.forEach((body: any, i: number) => {
      const colors = tooltip.labelColors[i]

      const span = document.createElement('span')
      span.style.background = colors.backgroundColor
      span.style.borderColor = colors.borderColor
      span.style.borderWidth = '0px'
      span.style.marginRight = '6px'
      span.style.height = '12px'
      span.style.width = '12px'
      span.style.borderRadius = '50%'
      span.style.display = 'inline-block'
      span.style.lineHeight = '100%'

      const tr: any = document.createElement('tr')
      tr.style.backgroundColor = 'inherit'
      tr.style.borderWidth = 0

      const td: any = document.createElement('td')
      td.style.borderWidth = 0

      const text = document.createTextNode(body)

      td.appendChild(span)
      td.appendChild(text)
      tr.appendChild(td)
      tableBody.appendChild(tr)
    })

    const tableRoot = tooltipEl.querySelector('table')

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove()
    }

    // Add new children
    tableRoot.appendChild(tableHead)
    tableRoot.appendChild(tableBody)
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1
  tooltipEl.style.left = positionX + tooltip.caretX + 'px'
  tooltipEl.style.top = positionY + tooltip.caretY + 'px'
  tooltipEl.style.font = tooltip.options.bodyFont.string
  tooltipEl.style.padding =
    tooltip.options.padding + 'px ' + tooltip.options.padding + 'px'
}

const config = {
  type: 'doughnut',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: false,
      tooltip: {
        enabled: false,
        position: 'nearest',
        external: externalTooltipHandler,
      },
    },
  },
}

const myChart = ref()

onMounted(() => {
  myChart.value = new window.Chart(document.getElementById('myChart'), config)
})

onBeforeUnmount(() => {
  myChart.value.destroy()
})
</script>

<style scoped></style>
