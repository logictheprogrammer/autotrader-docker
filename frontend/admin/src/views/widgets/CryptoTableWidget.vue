<template>
  <div
    class="cryptohopper-web-widget"
    data-id="1"
    data-chart_color="#0d102d"
    data-numcoins="50"
    data-table_style="dark"
    data-realtime="on"
    data-table_length="10"
  >
    <div
      class="cryptoboxes mcw-tr mcw-table dark invert-act"
      id="mcw-1"
      data-realtime="on"
      data-dynamic="false"
    >
      <div class="title-bar">
        Crypto Market Capitalization<a
          href="https://www.cryptohopper.com/"
          title="Powered by Cryptohopper"
          target="_blank"
          rel="noreferrer noopener"
          class="pull-right"
          ><img
            src="https://static.cryptohopper.com/images/logo/logo-dark.svg"
            alt="Cryptohopper"
            style="height: 28px; width: auto; margin: -5px 0"
        /></a>
      </div>
      <div id="DataTables_Table_0_wrapper" class="dataTables_wrapper no-footer">
        <div
          id="DataTables_Table_0_processing"
          class="dataTables_processing"
          style="display: none"
        ></div>
        <div class="loader"></div>
        <div class="datatable-scroll">
          <table
            class="mcw-datatable dataTable display nowrap no-footer dtr-inline collapsed"
            style="width: 100%"
            data-length="10"
            data-total="50"
            data-chartcolor="13,16,45"
            id="DataTables_Table_0"
            role="grid"
          >
            <thead>
              <tr role="row">
                <th
                  class="col-rank text-left min-tablet-p sorting"
                  data-col="rank"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 20px"
                  aria-label="#: activate to sort column ascending"
                >
                  #
                </th>
                <th
                  class="col-name text-left ctrl all sorting"
                  data-col="name"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 129px"
                  aria-label="Coin: activate to sort column ascending"
                >
                  Coin
                </th>
                <th
                  class="col-price_usd all sorting"
                  data-col="price_usd"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 98px"
                  aria-label="Price: activate to sort column ascending"
                >
                  Price
                </th>
                <th
                  class="col-market_cap_usd sorting"
                  data-col="market_cap_usd"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 141px"
                  aria-label="Marketcap: activate to sort column ascending"
                >
                  Marketcap
                </th>
                <th
                  class="col-volume_usd_24h sorting"
                  data-col="volume_usd_24h"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 131px"
                  aria-label="Volume (24h): activate to sort column ascending"
                >
                  Volume (24h)
                </th>
                <th
                  class="col-available_supply sorting"
                  data-col="available_supply"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 126px"
                  aria-label="Supply: activate to sort column ascending"
                >
                  Supply
                </th>
                <th
                  class="col-percent_change_24h sorting"
                  data-col="percent_change_24h"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 80px"
                  aria-label="Change: activate to sort column ascending"
                >
                  Change
                </th>
                <th
                  class="col-weekly chart-wrapper sorting"
                  data-col="weekly"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 0px; display: none"
                  aria-label="Last 24h: activate to sort column ascending"
                >
                  Last 24h
                </th>
                <th
                  class="col-symbol sorting"
                  data-col="symbol"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 0px; display: none"
                  aria-label="Symbol: activate to sort column ascending"
                >
                  Symbol
                </th>
                <th
                  class="col-price_btc sorting"
                  data-col="price_btc"
                  tabindex="0"
                  aria-controls="DataTables_Table_0"
                  rowspan="1"
                  colspan="1"
                  style="width: 0px; display: none"
                  aria-label="Price (BTC): activate to sort column ascending"
                >
                  Price (BTC)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="odd" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">1</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579"
                        style="max-height: 35px"
                        alt="bitcoin"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=BTC"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Bitcoin</div>
                      <div class="coin-symbol">BTC</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="19166.44"
                    data-rate="1.000268"
                    data-live-price="bitcoin"
                    class="mcw-animated liveup"
                    >$ <span>19,171.58</span></span
                  >
                </td>
                <td>$ 366,890,430,291</td>
                <td>$ 13,229,337,000</td>
                <td>19,180,493</td>
                <td>
                  <span data-table-change="BTC" class="down">-0.42%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="19176.76,19178.46,19160.09,19149.38,19112.64,19154.02,19151.21,19190.96,19110.61,19155.58,19141.87,19135.92,19112.25,19131.21,19110.44,19095.86,19098.64,19092.89,19052.28,19124.78,19130.48,19135.36,19118.13,19123.19"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">BTC</td>
                <td style="display: none">Ƀ 1.00000000</td>
              </tr>
              <tr class="even" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">2</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
                        style="max-height: 35px"
                        alt="ethereum"
                        class="invertable"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=ETH"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Ethereum</div>
                      <div class="coin-symbol">ETH</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="1286.75"
                    data-rate="1.000268"
                    data-live-price="ethereum"
                    class="mcw-animated liveup"
                    >$ <span>1,287.09</span></span
                  >
                </td>
                <td>$ 155,276,763,023</td>
                <td>$ 5,881,423,500</td>
                <td>120,966,650</td>
                <td>
                  <span data-table-change="ETH" class="down">-1.32%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="1298.55,1295.8,1294.36,1292.61,1291.19,1282.84,1285.46,1285.19,1288.43,1282.84,1288.99,1287.48,1287.55,1284.18,1285.24,1282.8,1280.61,1278.34,1276.59,1274.32,1279.15,1282.31,1282.07,1282.41"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">ETH</td>
                <td style="display: none">Ƀ 0.06710648</td>
              </tr>
              <tr class="odd" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">3</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/325/small/Tether-logo.png?1598003707"
                        style="max-height: 35px"
                        alt="tether"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=USDT"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Tether</div>
                      <div class="coin-symbol">USDT</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="1.0000000000"
                    data-rate="1.000268"
                    data-live-price="tether"
                    >$ <span>1.00</span></span
                  >
                </td>
                <td>$ 68,457,498,694</td>
                <td>$ 19,574,158,000</td>
                <td>68,432,560,000</td>
                <td><span data-table-change="USDT" class="up">0.02%</span></td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="1,1,1,1,1,1.001,1,1.001,0.999183,1.001,1,0.999264,0.999983,1,1.001,1,1,1,0.997183,1,0.999076,1,1.001,1"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">USDT</td>
                <td style="display: none">Ƀ 0.00005229</td>
              </tr>
              <tr class="even" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">4</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389"
                        style="max-height: 35px"
                        alt="usd-coin"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=USDC"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">USD Coin</div>
                      <div class="coin-symbol">USDC</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="1.0010000000"
                    data-rate="1.000268"
                    data-live-price="usd-coin"
                    >$ <span>1.00</span></span
                  >
                </td>
                <td>$ 45,048,766,835</td>
                <td>$ 2,420,234,100</td>
                <td>45,012,173,000</td>
                <td><span data-table-change="USDC" class="up">0.10%</span></td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="1,1,0.999739,1,0.999401,0.999515,0.999743,1.001,0.99897,1.001,1,0.99905,1,1,1.001,1,1,1.001,0.996915,0.999449,0.998404,0.999663,1,1.001"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">USDC</td>
                <td style="display: none">Ƀ 0.00005234</td>
              </tr>
              <tr class="odd" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">5</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png?1644979850"
                        style="max-height: 35px"
                        alt="bnb"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=BNB"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">BNB</div>
                      <div class="coin-symbol">BNB</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="269.7500000000"
                    data-rate="1.000268"
                    data-live-price="bnb"
                    >$ <span>269.82</span></span
                  >
                </td>
                <td>$ 44,059,179,697</td>
                <td>$ 273,949,610</td>
                <td>163,276,970</td>
                <td>
                  <span data-table-change="BNB" class="down">-0.34%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="270.27,270.34,270.39,270.43,270.48,269.83,270.36,270.51,271.35,269.87,271,270.97,271.02,269.66,269.93,270.07,269.73,269.14,268.82,268.22,269.07,269.27,269.77,269.66"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">BNB</td>
                <td style="display: none">Ƀ 0.01410591</td>
              </tr>
              <tr class="even" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">6</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png?1605778731"
                        style="max-height: 35px"
                        alt="xrp"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=XRP"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">XRP</div>
                      <div class="coin-symbol">XRP</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="0.484776"
                    data-rate="1.000268"
                    data-live-price="xrp"
                    class=""
                    >$ <span>0.484906</span></span
                  >
                </td>
                <td>$ 24,198,483,456</td>
                <td>$ 753,446,080</td>
                <td>49,964,184,000</td>
                <td>
                  <span data-table-change="XRP" class="down">-0.81%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="0.487489,0.487066,0.486006,0.485862,0.484759,0.48256,0.484565,0.483778,0.485752,0.484518,0.486149,0.487181,0.487595,0.484454,0.484457,0.48387,0.482135,0.482408,0.48326,0.481434,0.483919,0.486132,0.485585,0.484083"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">XRP</td>
                <td style="display: none">Ƀ 0.00002532</td>
              </tr>
              <tr class="odd" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">7</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/9576/small/BUSD.png?1568947766"
                        style="max-height: 35px"
                        alt="binance-usd"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=BUSD"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Binance USD</div>
                      <div class="coin-symbol">BUSD</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="1.0000000000"
                    data-rate="1.000268"
                    data-live-price="binance-usd"
                    >$ <span>1.00</span></span
                  >
                </td>
                <td>$ 21,386,091,937</td>
                <td>$ 4,635,261,400</td>
                <td>21,374,559,000</td>
                <td>
                  <span data-table-change="BUSD" class="down">-0.01%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="0.999989,1,0.999526,1,1,1.001,1,1.001,0.99879,1,1,0.999476,0.999847,1,1,0.99992,1,1.001,1.001,1,0.999068,0.999744,1,1"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">BUSD</td>
                <td style="display: none">Ƀ 0.00005229</td>
              </tr>
              <tr class="even" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">8</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/975/small/cardano.png?1547034860"
                        style="max-height: 35px"
                        alt="cardano"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=ADA"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Cardano</div>
                      <div class="coin-symbol">ADA</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="0.367195"
                    data-rate="1.000268"
                    data-live-price="cardano"
                    class=""
                    >$ <span>0.367293</span></span
                  >
                </td>
                <td>$ 12,372,457,930</td>
                <td>$ 293,833,810</td>
                <td>33,820,263,000</td>
                <td>
                  <span data-table-change="ADA" class="down">-0.89%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="0.368419,0.369117,0.367809,0.367226,0.364892,0.363818,0.36537,0.366815,0.368882,0.366288,0.36791,0.367511,0.36644,0.364816,0.366521,0.366092,0.366409,0.365244,0.365016,0.36389,0.366491,0.36611,0.366362,0.365382"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">ADA</td>
                <td style="display: none">Ƀ 0.00001913</td>
              </tr>
              <tr class="odd" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">9</td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/4128/small/solana.png?1640133422"
                        style="max-height: 35px"
                        alt="solana"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=SOL"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Solana</div>
                      <div class="coin-symbol">SOL</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="29.89"
                    data-rate="1.000268"
                    data-live-price="solana"
                    class=""
                    >$ <span>29.90</span></span
                  >
                </td>
                <td>$ 10,668,314,342</td>
                <td>$ 541,613,270</td>
                <td>358,018,700</td>
                <td>
                  <span data-table-change="SOL" class="down">-1.09%</span>
                </td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="30.08,29.95,30,29.91,29.77,29.88,29.89,29.94,29.78,30.04,29.95,29.99,29.89,29.9,29.85,29.77,29.77,29.78,29.63,29.8,29.77,29.81,29.76,29.79"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">SOL</td>
                <td style="display: none">Ƀ 0.00155779</td>
              </tr>
              <tr class="even" role="row">
                <td class="text-left text-left min-tablet-p" tabindex="0">
                  10
                </td>
                <td class="text-left ctrl text-left all">
                  <div class="coin">
                    <div class="coin-image">
                      <img
                        src="https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256"
                        style="max-height: 35px"
                        alt="dogecoin"
                      />
                    </div>
                    <a
                      href="https://www.cryptohopper.com/currencies/detail?currency=DOGE"
                      target="_blank"
                      class="coin-title"
                    >
                      <div class="coin-name">Dogecoin</div>
                      <div class="coin-symbol">DOGE</div>
                    </a>
                  </div>
                </td>
                <td class="all">
                  <span
                    data-price="0.059167"
                    data-rate="1.000268"
                    data-live-price="dogecoin"
                    class=""
                    >$ <span>0.059183</span></span
                  >
                </td>
                <td>$ 8,050,498,656</td>
                <td>$ 178,293,070</td>
                <td>136,500,160,000</td>
                <td><span data-table-change="DOGE" class="up">0.01%</span></td>
                <td class="chart-wrapper" style="display: none">
                  <canvas
                    width="0"
                    height="0"
                    data-rate="1.000268"
                    data-fiat="$"
                    data-color="13,16,45"
                    data-gradient="50"
                    data-border="2"
                    data-points="0.058904,0.05874,0.058706,0.058627,0.058552,0.058164,0.058509,0.058709,0.059009,0.058615,0.058954,0.059372,0.059298,0.058661,0.058692,0.058932,0.058929,0.058909,0.058885,0.058656,0.05914,0.059153,0.059121,0.058984"
                    class="chartjs-render-monitor"
                    style="display: block; width: 0px; height: 0px"
                  ></canvas>
                </td>
                <td style="display: none">DOGE</td>
                <td style="display: none">Ƀ 0.00000308</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="loader"></div>
        <!-- <div class="dataTables-footer">
              <div class="dataTables_length" id="DataTables_Table_0_length"><label>Coins per page: <select
                          name="DataTables_Table_0_length" aria-controls="DataTables_Table_0" class="">
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                      </select></label></div>
              <div class="dataTables_paginate paging_info_buttons" id="DataTables_Table_0_paginate"><span
                      class="paginate_button previous disabled">Previous</span><span class="paginate_button info">1 -
                      10 of 50</span><span class="paginate_button next enabled">Next</span></div>
          </div> -->
        <div class="clear"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// onMounted(() => {
//   window.cryptohopper()
// })
</script>

<!-- <style scoped></style> -->
<style>
.mcw-table.dark
  table.dataTable.dtr-column.collapsed
  > tbody
  > tr
  > td.ctrl:before,
.mcw-table.dark
  table.dataTable.dtr-column.collapsed
  > tbody
  > tr
  > th.ctrl:before,
.mcw-table.dark
  table.dataTable.dtr-inline.collapsed
  > tbody
  > tr[role='row']
  > td:first-child:before,
.mcw-table.dark
  table.dataTable.dtr-inline.collapsed
  > tbody
  > tr[role='row']
  > th:first-child:before {
  background-color: #141a2a !important;
}

.mcw-table.dark table.dataTable tbody .coin .coin-title .coin-name,
.mcw-table.dark table.dataTable tbody td {
  color: rgba(255, 255, 255, 0.8) !important;
}

.mcw-table.dark table.dataTable thead th {
  color: rgba(255, 255, 255, 0.8) !important;
  background-color: #141a2a !important;
  border: none !important;
}

.title-bar {
  display: none;
}

.mcw-table.dark {
  color: #fff;
  background: #1d263b;
  border: none !important;
}
.mcw-table.dark table.dataTable.display tbody tr.odd {
  background-color: #1d263b !important;
}

.mcw-table.dark table.dataTable.display tbody tr.even {
  background-color: #141a2a !important;
}
</style>
