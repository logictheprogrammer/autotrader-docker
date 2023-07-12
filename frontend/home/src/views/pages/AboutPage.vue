<template>
  <div>
    <AboutHeaderComponent>
      <template #default>
        <BreadcrumbComponent title="About Us"></BreadcrumbComponent>
      </template>
      <template #steps>
        <StepsComponent></StepsComponent>
      </template>
    </AboutHeaderComponent>
    <TeamsWidget></TeamsWidget>
    <RoadmapsWidget></RoadmapsWidget>
    <TokenomicsWidget></TokenomicsWidget>
    <ResourcesWidget></ResourcesWidget>
    <SponsorsWidget></SponsorsWidget>
    <TestimoniesWidget></TestimoniesWidget>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
