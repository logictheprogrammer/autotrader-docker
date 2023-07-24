<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header d-flex justify-content-center">
          <h4 class="card-title text-center">Trade History</h4>
        </div>
        <div class="card-body pt-0 px-0">
          <MyDataTable :ordering="true" :searching="true">
            <thead class="bg-background">
              <tr>
                <th class="text-sharp"></th>
                <th class="text-sharp">Student Name</th>
                <th class="text-sharp">Invoice number</th>
                <th class="text-sharp">Fees Type</th>
                <th class="text-sharp">Payment Type</th>
                <th class="text-sharp">Status</th>
                <th class="text-sharp">Date</th>
                <th class="text-sharp">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div class="dropdown">
                    <a
                      href="javascript:void(0);"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path></svg
                    ></a>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li class="dropdown-item">
                        <i class="fa fa-user-circle text-primary me-2"></i> View
                        profile
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-users text-primary me-2"></i> Add to
                        btn-close friends
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-plus text-primary me-2"></i> Add to
                        group
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-ban text-primary me-2"></i> Block
                      </li>
                    </ul>
                  </div>
                </td>
                <td>Tiger Nixon</td>
                <td>#54605</td>
                <td>Library</td>
                <td>Cash</td>
                <td><span class="badge light badge-success">Paid</span></td>
                <td>2011/04/25</td>
                <td><strong>120$</strong></td>
              </tr>
              <tr>
                <td>
                  <div class="dropdown">
                    <a
                      href="javascript:void(0);"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path></svg
                    ></a>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li class="dropdown-item">
                        <i class="fa fa-user-circle text-primary me-2"></i> View
                        profile
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-users text-primary me-2"></i> Add to
                        btn-close friends
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-plus text-primary me-2"></i> Add to
                        group
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-ban text-primary me-2"></i> Block
                      </li>
                    </ul>
                  </div>
                </td>
                <td>Tiger Nixon</td>
                <td>#54605</td>
                <td>Library</td>
                <td>Cash</td>
                <td><span class="badge light badge-success">Paid</span></td>
                <td>2011/04/25</td>
                <td><strong>120$</strong></td>
              </tr>
              <tr>
                <td>
                  <div class="dropdown">
                    <a
                      href="javascript:void(0);"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <path
                          d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                          stroke="#575757"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path></svg
                    ></a>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li class="dropdown-item">
                        <i class="fa fa-user-circle text-primary me-2"></i> View
                        profile
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-users text-primary me-2"></i> Add to
                        btn-close friends
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-plus text-primary me-2"></i> Add to
                        group
                      </li>
                      <li class="dropdown-item">
                        <i class="fa fa-ban text-primary me-2"></i> Block
                      </li>
                    </ul>
                  </div>
                </td>
                <td>Tiger Nixon</td>
                <td>#54605</td>
                <td>Library</td>
                <td>Cash</td>
                <td><span class="badge light badge-success">Paid</span></td>
                <td>2011/04/25</td>
                <td><strong>120$</strong></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th class="text-dull"></th>
                <th class="text-dull">Student Name</th>
                <th class="text-dull">Invoice number</th>
                <th class="text-dull">Fees Type</th>
                <th class="text-dull">Payment Type</th>
                <th class="text-dull">Status</th>
                <th class="text-dull">Date</th>
                <th class="text-dull">Amount</th>
              </tr>
            </tfoot>
          </MyDataTable>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style scoped></style>
