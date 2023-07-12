<template>
  <div class="card">
    <div class="card-body">
      <div class="d-flex">
        <div class="row" style="flex: 1">
          <div class="col-md-6 col-lg-4">
            <div
              class="py-3 text-center rounded border-bottom border-left border-3 border-dark"
            >
              <span class="fs-20 text-sharp font-w500 d-block mb-2"
                >Main Balance</span
              >
              <span class="text-num text-black fs-36 font-w500"
                >$63,644.98</span
              >
            </div>
          </div>
          <div class="col-md-6 col-lg-4 d-none d-md-block">
            <div
              class="py-3 text-center rounded border-bottom border-left border-3 border-danger"
            >
              <span class="fs-20 text-sharp font-w500 d-block mb-2"
                >Unsettled Balance</span
              >
              <span class="text-num text-black fs-36 font-w500">$7,412.66</span>
            </div>
          </div>
          <div class="col-md-6 col-lg-4 d-none d-lg-block">
            <div
              class="py-3 text-center rounded border-bottom border-left border-3 border-dark"
            >
              <span class="fs-20 text-sharp font-w500 d-block mb-2"
                >Affiliate Balance</span
              >
              <span class="text-num text-black fs-36 font-w500">$7,412.66</span>
            </div>
          </div>
        </div>
        <div class="dropdown mb-auto d-lg-none">
          <a
            href="javascript:void(0);"
            class="btn-link position-absolute"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style="right: 2px"
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
              ></path>
            </svg>
          </a>
          <div class="dropdown-menu dropdown-menu-left" style="">
            <div class="m-3">
              <span class="fs-18 text-sharp font-w500 d-block"
                >Unsettled Balance</span
              >
              <span class="text-num text-black fs-24 font-w500"
                >$63,644.98</span
              >
            </div>
            <div class="m-3">
              <span class="fs-18 text-sharp font-w500 d-block"
                >Affiliate Balance</span
              >
              <span class="text-num text-black fs-24 font-w500"
                >$63,644.98</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="d-flex justify-content-center gap-3">
    <RouterLink :to="{ name: 'deposit' }" class="btn btn-success-2"
      >Deposit</RouterLink
    >
    <RouterLink :to="{ name: 'withdraw' }" class="btn btn-secondary"
      >Withdraw</RouterLink
    >
    <RouterLink :to="{ name: 'transfer' }" class="btn btn-primary"
      >Transfer</RouterLink
    >
  </div>
  <div class="card mt-4 mb-5">
    <div class="card-header">
      <h4 class="card-title">Transaction History</h4>
    </div>
    <div class="card-body">
      <MyDataTable :ordering="true">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Invoice number</th>
            <th>Fees Type</th>
            <th>Payment Type</th>
            <th>Status</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>01</td>
            <td>Tiger Nixon</td>
            <td>#54605</td>
            <td>Library</td>
            <td>Cash</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2011/04/25</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>02</td>
            <td>Garrett Winters</td>
            <td>#54687</td>
            <td>Library</td>
            <td>Credit Card</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2011/07/25</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>03</td>
            <td>Ashton Cox</td>
            <td>#35672</td>
            <td>Tuition</td>
            <td>Cash</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2009/01/12</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>04</td>
            <td>Cedric Kelly</td>
            <td>#57984</td>
            <td>Annual</td>
            <td>Credit Card</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2012/03/29</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>05</td>
            <td>Airi Satou</td>
            <td>#12453</td>
            <td>Library</td>
            <td>Cheque</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2008/11/28</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>06</td>
            <td>Brielle Williamson</td>
            <td>#59723</td>
            <td>Tuition</td>
            <td>Cash</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2012/12/02</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>07</td>
            <td>Herrod Chandler</td>
            <td>#98726</td>
            <td>Tuition</td>
            <td>Credit Card</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2012/08/06</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>08</td>
            <td>Rhona Davidson</td>
            <td>#98721</td>
            <td>Library</td>
            <td>Cheque</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2010/10/14</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>09</td>
            <td>Colleen Hurst</td>
            <td>#54605</td>
            <td>Annual</td>
            <td>Cheque</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2009/09/15</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>10</td>
            <td>Sonya Frost</td>
            <td>#98734</td>
            <td>Tuition</td>
            <td>Credit Card</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2008/12/13</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>11</td>
            <td>Jena Gaines</td>
            <td>#12457</td>
            <td>Tuition</td>
            <td>Cash</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2008/12/19</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>12</td>
            <td>Quinn Flynn</td>
            <td>#36987</td>
            <td>Library</td>
            <td>Cheque</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2013/03/03</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>13</td>
            <td>Charde Marshall</td>
            <td>#98756</td>
            <td>Tuition</td>
            <td>Cheque</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2008/10/16</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>14</td>
            <td>Haley Kennedy</td>
            <td>#98754</td>
            <td>Library</td>
            <td>Cash</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2012/12/18</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>15</td>
            <td>Tatyana Fitzpatrick</td>
            <td>#65248</td>
            <td>Annual</td>
            <td>Cheque</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2010/03/17</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>16</td>
            <td>Michael Silva</td>
            <td>#75943</td>
            <td>Tuition</td>
            <td>Credit Card</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2012/11/27</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>17</td>
            <td>Paul Byrd</td>
            <td>#87954</td>
            <td>Library</td>
            <td>Cheque</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2010/06/09</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>18</td>
            <td>Gloria Little</td>
            <td>#98746</td>
            <td>Tuition</td>
            <td>Cheque</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2009/04/10</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>19</td>
            <td>Bradley Greer</td>
            <td>#98674</td>
            <td>Annual</td>
            <td>Cash</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2012/10/13</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>20</td>
            <td>Dai Rios</td>
            <td>#69875</td>
            <td>Tuition</td>
            <td>Cheque</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2012/09/26</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>21</td>
            <td>Jenette Caldwell</td>
            <td>#54678</td>
            <td>Library</td>
            <td>Cheque</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2011/09/03</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>22</td>
            <td>Yuri Berry</td>
            <td>#98756</td>
            <td>Tuition</td>
            <td>Credit Card</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2009/06/25</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>23</td>
            <td>Caesar Vance</td>
            <td>#86754</td>
            <td>Tuition</td>
            <td>Cheque</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2011/12/12</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>24</td>
            <td>Doris Wilder</td>
            <td>#34251</td>
            <td>Annual</td>
            <td>Cash</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2010/09/20</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>25</td>
            <td>Angelica Ramos</td>
            <td>#65874</td>
            <td>Tuition</td>
            <td>Cheque</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2009/10/09</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>26</td>
            <td>Gavin Joyce</td>
            <td>#54605</td>
            <td>Female</td>
            <td>Credit Card</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2010/12/22</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>27</td>
            <td>Jennifer Chang</td>
            <td>#54605</td>
            <td>Tuition</td>
            <td>Cheque</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2010/11/14</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>28</td>
            <td>Brenden Wagner</td>
            <td>#45687</td>
            <td>Library</td>
            <td>Cheque</td>
            <td><span class="badge light badge-danger">Udpaid</span></td>
            <td>2011/06/07</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>29</td>
            <td>Fiona Green</td>
            <td>#23456</td>
            <td>Tuition</td>
            <td>Cash</td>
            <td><span class="badge light badge-success">Paid</span></td>
            <td>2010/03/11</td>
            <td><strong>120$</strong></td>
          </tr>
          <tr>
            <td>30</td>
            <td>Shou Itou</td>
            <td>#54605</td>
            <td>Annual</td>
            <td>Credit Card</td>
            <td>
              <span class="badge light badge-warning">Panding</span>
            </td>
            <td>2011/08/14</td>
            <td><strong>120$</strong></td>
          </tr>
        </tbody>
      </MyDataTable>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
