<template>
  <div class="block">
    <div class="box">
      <p class="number mb-0">
        <span class="num">80</span>
        <span class="sub">%</span>
      </p>
      <h1 class="digital-7 timer">12 : 05 : 16</h1>
      <p class="title">TRADING...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// onMounted(() => {
//   const block = document.querySelectorAll(".block")!;
//   block.forEach((item) => {
//     let numElement = item.querySelector(".num")!;
//     let num = parseInt(numElement.innerText);
//     let count = 0;
//     let time = 2000 / num;
//     let circle = item.querySelector(".circle");
//     setInterval(() => {
//       if (count == num) {
//         clearInterval();
//       } else {
//         count += 1;
//         numElement.innerText = count;
//       }
//     }, time);
//     circle.style.strokeDashoffset = 503 - 503 * (num / 100);
//     let dots = item.querySelector(".dots");
//     dots.style.transform = `rotate(${360 * (num / 100)}deg)`;
//     if (num == 100) {
//       dots.style.opacity = 0;
//     }
//   });
// });
</script>

<style scoped>
.timer {
  color: #fcdcfd !important;
}
.block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: calc(100% - 50px);
  height: calc(100% - 50px);
  border-radius: 50%;
  background: rgba(20, 26, 42, 1);
  background: radial-gradient(
    circle,
    rgb(25, 34, 55) 0%,
    rgba(20, 26, 42, 1) 50%
  );
  box-shadow: 0 0 5px 3px #c291e1;
}

.box::before {
  position: absolute;
  content: "";
  width: calc(100% + 28px);
  height: calc(100% + 28px);
  border-radius: 50%;
  border: 1px solid #141a2a;
}

.box .number span {
  color: #e9e9e9;
}

.box .number .num {
  font-size: 35px;
  font-weight: bold;
}

.box .number .sub {
  font-size: 20px;
}

.box .title {
  font-size: 15px;
  color: #9b9b9b;
}

.svg {
  position: absolute;
  width: 100%;
  height: 100%;
  fill: none;
  transform: rotate(-90deg);
}
</style>
