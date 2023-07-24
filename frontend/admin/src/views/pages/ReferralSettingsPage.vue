<template>
  <div class="card mb-5">
    <div class="card-body">
      <div class="pt-3">
        <div class="settings-form">
          <form>
            <div class="row">
              <div class="mb-3 col-md-6">
                <label class="form-label">Deposit Percent (%)</label>
                <input
                  type="text"
                  placeholder="Deposit Percent"
                  class="form-control"
                  value="15"
                />
              </div>
              <div class="mb-3 col-md-6">
                <label class="form-label">Trade Stake Percent (%)</label>
                <input
                  type="text"
                  placeholder="Trade Stake Percent"
                  class="form-control"
                  value="7"
                />
              </div>
              <div class="mb-3 col-md-6">
                <label class="form-label">Trade Won Percent (%)</label>
                <input
                  type="text"
                  placeholder="Trade Won Percent"
                  class="form-control"
                  value="10"
                />
              </div>
            </div>
            <div class="text-center mt-2">
              <button class="btn btn-primary" type="button">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
