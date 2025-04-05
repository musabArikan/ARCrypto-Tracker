$(() => {
   const coinId = window.location.search.split("=")[1];
   const coinChart = $("#coinChart")
      .dxChart({
         dataSource: [],
         series: [
            {
               valueField: "price",
               name: "xx",
               argumentField: "date",
               type: "line",
               point: {
                  visible: false,
               },
            },
         ],
         legend: {
            visible: false,
         },
         argumentAxis: {
            argumentType: "datetime",
         },
         valueAxis: {
            position: "right",
         },
      })
      .dxChart("instance");

   const fetchDetailData = (coinId) => {
      return fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
      })
         .then((response) => response.json())
         .catch((error) => {
            console.error("Error fetching coin data:", error);
         });
   };

   const fetchChartData = (coinId) => {
      return fetch(
         `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`,

         {
            method: "GET",
            headers: { "Content-Type": "application/json" },
         }
      )
         .then((response) => response.json())
         .catch((error) => {
            console.error("Error fetching coin data:", error);
         });
   };

   if (coinId) {
      fetchDetailData(coinId)
         .then((_data) => {
            if (_data) {
              
               const upperCaseSymbol = _data.symbol.toUpperCase();
               const symbol = _data.symbol;
               $("#coin_image").attr("src", _data.image.small);
               $("#coinName").text(_data.name);
               $("#coinSymbol").text(upperCaseSymbol);
               $("#coinRank").text("#" + _data.market_cap_rank);
               const formattedPrice = `$${_data.market_data.current_price.usd.toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
               )}`;
               $("#coinPrice").text(formattedPrice);

               $("#coinRangeLow").text(_data.market_data.low_24h[symbol]);
               $("#coinRangeHigh").text(_data.market_data.high_24h[symbol]);
               const formattedHoldings = `$${_data.watchlist_portfolio_users.toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
               )}`;
               $("#holdingsValue").text(formattedHoldings);
               $("#descriptionCryptoName").text(_data.name);
               $("#descriptionCryptoSymbol").text("(" + upperCaseSymbol + ")");
               $("#cryptoDescription").html(_data.description.en);
             
            }
            return fetchChartData(coinId);
         })
         .then((_chartData) => {
          
            const prices = [];
            _chartData.prices.forEach((_item) =>
               prices.push({ date: _item[0], price: _item[1] })
            );
            coinChart.option("dataSource", prices);
         });
   }
});
